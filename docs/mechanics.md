---
layout: default
title: ゲームメカニクス
nav_order: 3
description: "ゲームループ、重力システム、ロックダウンの詳細"
permalink: /mechanics
mermaid: true
---

# ゲームメカニクス
{: .no_toc }

ゲームループの処理フロー、重力システム、ロックダウンの仕組みを解説します。
{: .fs-6 .fw-300 }

## 目次
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## ゲームループ

毎フレーム（約60FPS）で実行される処理フローです。

```mermaid
flowchart TD
    Start([requestAnimationFrame]) --> DeltaTime["deltaTime計算<br/>(前フレームからの経過時間)"]

    DeltaTime --> StateCheck{ゲーム状態}

    StateCheck -->|PAUSED| DrawPause["ポーズ画面描画"]
    StateCheck -->|GAME_OVER| DrawGameOver["ゲームオーバー画面描画"]
    StateCheck -->|PLAYING| UpdateInput["Input更新<br/>(キー状態読み取り)"]

    DrawPause --> NextFrame
    DrawGameOver --> NextFrame

    UpdateInput --> CheckHold{ホールド<br/>操作?}
    CheckHold -->|Yes| DoHold["ホールド実行"]
    CheckHold -->|No| CheckRotate

    DoHold --> CheckRotate{回転<br/>操作?}
    CheckRotate -->|Yes| DoRotate["SRS回転処理<br/>(Wall Kick試行)"]
    CheckRotate -->|No| CheckMove

    DoRotate --> CheckMove{移動<br/>操作?}
    CheckMove -->|Yes| DoMove["水平移動<br/>(DAS処理)"]
    CheckMove -->|No| CheckDrop

    DoMove --> CheckDrop{ドロップ<br/>操作?}
    CheckDrop -->|Hard| DoHardDrop["ハードドロップ<br/>(即座にロック)"]
    CheckDrop -->|Soft| DoSoftDrop["ソフトドロップ<br/>(高速落下)"]
    CheckDrop -->|No| ApplyGravity

    DoHardDrop --> LineClear
    DoSoftDrop --> ApplyGravity

    ApplyGravity["重力適用<br/>(gravityAccumulator += gravity)"] --> CheckFall{1セル以上<br/>蓄積?}

    CheckFall -->|Yes| Fall["1セル落下"]
    CheckFall -->|No| CheckLock

    Fall --> CheckLanding{着地?}
    CheckLanding -->|Yes| CheckLock
    CheckLanding -->|No| CheckLock

    CheckLock{ロック条件<br/>判定}
    CheckLock -->|タイマー超過| LockPiece["ピースロック"]
    CheckLock -->|移動回数超過| LockPiece
    CheckLock -->|条件未達| Render

    LockPiece --> LineClear["ライン消去判定"]
    LineClear --> ScoreCalc["スコア計算"]
    ScoreCalc --> SpawnNext["次ピーススポーン"]
    SpawnNext --> CheckGameOver{ゲームオーバー<br/>判定}

    CheckGameOver -->|Yes| SetGameOver["状態をGAME_OVERに"]
    CheckGameOver -->|No| Render

    SetGameOver --> DrawGameOver

    Render["画面描画<br/>(Board, Piece, UI)"] --> NextFrame([次フレーム])

    style Start fill:#4a9eff,color:#fff
    style NextFrame fill:#4a9eff,color:#fff
    style LockPiece fill:#ff6b6b,color:#fff
    style DoHardDrop fill:#ff6b6b,color:#fff
    style LineClear fill:#51cf66,color:#fff
    style SetGameOver fill:#868e96,color:#fff
```

---

## 重力システム

レベルに応じて落下速度が変化します。

### 重力テーブル

| レベル | 重力値 (G) | 落下速度 | 1セル落下時間 |
|-------:|----------:|:---------|:--------------|
| 1 | 0.01667 | 1/60 G | 1.0秒 |
| 2 | 0.021017 | 約1/48 G | 0.79秒 |
| 3 | 0.026977 | 約1/37 G | 0.62秒 |
| 4 | 0.035256 | 約1/28 G | 0.47秒 |
| 5 | 0.04693 | 約1/21 G | 0.36秒 |
| 6 | 0.06361 | 約1/16 G | 0.26秒 |
| 7 | 0.0879 | 約1/11 G | 0.19秒 |
| 8 | 0.1236 | 約1/8 G | 0.13秒 |
| 9 | 0.1775 | 約1/6 G | 0.09秒 |
| 10 | 0.2598 | 約1/4 G | 0.064秒 |
| 11 | 0.388 | 約1/3 G | 0.043秒 |
| 12 | 0.59 | 約1/2 G | 0.028秒 |
| 13 | 0.92 | 約1 G | 0.018秒 |
| 14 | 1.46 | 約1.5 G | 0.011秒 |
| 15+ | 20.0 | 20 G | 即座 |

### 重力計算式

```javascript
// 重力の蓄積
gravityAccumulator += getGravity(level) * deltaTime / 1000;

// 1セル以上蓄積したら落下
while (gravityAccumulator >= 1) {
    gravityAccumulator -= 1;
    if (canMoveDown()) {
        piece.y += 1;
    }
}
```

### レベルアップ条件

```
レベル = floor(消去ライン数 / 10) + 1
```

- 10ライン消去ごとにレベル1アップ
- レベル上限なし（15以上は最高速度固定）

---

## ロックダウンシステム

ピースが着地してからロックされるまでの猶予時間を管理します。

```mermaid
flowchart TD
    subgraph LockDown["ロックダウン判定"]
        Start([ピース着地]) --> StartTimer["lockTimer = 0<br/>lockMoves = 0"]

        StartTimer --> FrameLoop{毎フレーム}

        FrameLoop --> CheckGround{地面に<br/>接触中?}

        CheckGround -->|No| ResetTimer["lockTimer = 0"]
        CheckGround -->|Yes| IncrementTimer["lockTimer += deltaTime"]

        ResetTimer --> FrameLoop
        IncrementTimer --> CheckMove{移動/回転<br/>操作?}

        CheckMove -->|Yes| IncrementMoves["lockMoves++"]
        CheckMove -->|No| CheckConditions

        IncrementMoves --> ResetTimerPartial["lockTimer = 0<br/>(猶予リセット)"]
        ResetTimerPartial --> CheckConditions

        CheckConditions --> CheckTimeout{lockTimer<br/>>= 500ms?}
        CheckTimeout -->|Yes| Lock([ロック実行])
        CheckTimeout -->|No| CheckMaxMoves

        CheckMaxMoves{lockMoves<br/>>= 15?}
        CheckMaxMoves -->|Yes| Lock
        CheckMaxMoves -->|No| FrameLoop
    end

    style Start fill:#4a9eff,color:#fff
    style Lock fill:#ff6b6b,color:#fff
    style CheckTimeout fill:#ffd43b,color:#000
    style CheckMaxMoves fill:#ffd43b,color:#000
```

### ロックダウンパラメータ

| パラメータ | 値 | 説明 |
|:-----------|:---|:-----|
| **Lock Delay** | 500ms | 着地後のロック猶予時間 |
| **Max Moves** | 15回 | ロック前の最大移動/回転回数 |
| **リセット条件** | 移動/回転成功時 | タイマーを0にリセット |

### 無限スピン防止

```
移動/回転でタイマーリセット
    ↓
ただし15回を超えると強制ロック
    ↓
無限にT-Spinを続けることを防止
```

---

## 7-bag Randomizer

公平なピース生成アルゴリズムです。

### アルゴリズム

```
1. 7種類のピース [I, O, T, S, Z, J, L] をバッグに入れる
2. Fisher-Yatesアルゴリズムでシャッフル
3. バッグから順番に取り出す
4. バッグが空になったら手順1に戻る
```

### 実装コード概要

```javascript
class TetrominoBag {
    constructor() {
        this.bag = [];
        this.refill();
    }

    next() {
        if (this.bag.length === 0) {
            this.refill();
        }
        return this.bag.pop();
    }

    refill() {
        this.bag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        this.shuffle();
    }

    shuffle() {
        // Fisher-Yates shuffle
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }
}
```

### 特徴

| 項目 | 説明 |
|:-----|:-----|
| **公平性** | 7手以内に必ず全ピースが1回ずつ出現 |
| **最大間隔** | 同じピースが出るまで最大12手 |
| **予測可能性** | 次の3ピースを表示可能 |

---

## SRS回転システム

Super Rotation System（SRS）はTetris Guidelineの標準回転システムです。

### 回転状態

```
状態 0: スポーン時の向き
状態 1: 時計回りに90度
状態 2: 180度回転
状態 3: 反時計回りに90度（270度）
```

### Wall Kick

壁や他のブロックと衝突した場合、5つのテスト位置を順番に試します。

| テスト | 説明 |
|:-------|:-----|
| Test 1 | 移動なし（基本位置） |
| Test 2 | 横方向にずらす |
| Test 3 | 斜め方向にずらす |
| Test 4 | 大きく横にずらす |
| Test 5 | 斜め反対方向にずらす |

### Wall Kickデータ（JLSTZ）

| 回転 | Test 1 | Test 2 | Test 3 | Test 4 | Test 5 |
|:-----|:-------|:-------|:-------|:-------|:-------|
| 0→1 | (0,0) | (-1,0) | (-1,+1) | (0,-2) | (-1,-2) |
| 1→0 | (0,0) | (+1,0) | (+1,-1) | (0,+2) | (+1,+2) |
| 1→2 | (0,0) | (+1,0) | (+1,-1) | (0,+2) | (+1,+2) |
| 2→1 | (0,0) | (-1,0) | (-1,+1) | (0,-2) | (-1,-2) |
| 2→3 | (0,0) | (+1,0) | (+1,+1) | (0,-2) | (+1,-2) |
| 3→2 | (0,0) | (-1,0) | (-1,-1) | (0,+2) | (-1,+2) |
| 3→0 | (0,0) | (-1,0) | (-1,-1) | (0,+2) | (-1,+2) |
| 0→3 | (0,0) | (+1,0) | (+1,+1) | (0,-2) | (+1,-2) |

---

## 次のページ

- [スコアシステム]({{ site.baseurl }}/scoring) - スコア計算とT-Spin判定
- [操作方法]({{ site.baseurl }}/controls) - キーバインドとDAS設定
