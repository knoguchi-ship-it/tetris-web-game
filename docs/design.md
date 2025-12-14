# テトリス ゲーム設計書

## 1. 概要

Webブラウザで動作する一人用テトリスゲーム。
Tetris Guideline (2009) に準拠した仕様で実装する。

---

## 2. 技術スタック

| 項目 | 技術 |
|------|------|
| 言語 | HTML5 / CSS3 / JavaScript (ES6+) |
| 描画 | Canvas API |
| データ保存 | LocalStorage |
| 依存関係 | なし（Vanilla JS） |

---

## 3. ゲーム仕様

### 3.1 プレイフィールド

- **サイズ**: 10列 × 20行（可視領域）
- **バッファ**: 上部に2行の非表示領域（計22行）
- **セルサイズ**: 30px × 30px（調整可能）

### 3.2 テトリミノ

7種類のテトリミノを使用：

| 名前 | 形状 | カラー | カラーコード |
|------|------|--------|--------------|
| I | 棒状 | シアン | #00FFFF |
| O | 四角 | 黄色 | #FFFF00 |
| T | T字 | 紫 | #800080 |
| S | S字 | 緑 | #00FF00 |
| Z | Z字 | 赤 | #FF0000 |
| J | J字 | 青 | #0000FF |
| L | L字 | オレンジ | #FFA500 |

#### テトリミノ形状定義（回転状態0）

```
I: ....    O: ..    T: ...    S: ...    Z: ...    J: ...    L: ...
   IIII       OO       TTT       .SS       ZZ.       J..       ..L
   ....       OO       .T.       SS.       .ZZ       JJJ       LLL
   ....
```

### 3.3 回転システム (SRS: Super Rotation System)

#### 回転状態
- 0: 初期状態（spawn状態）
- R: 時計回り90度
- 2: 180度
- L: 反時計回り90度

#### Wall Kick データ

**J, L, S, T, Z テトリミノ:**

| 回転 | Test 1 | Test 2 | Test 3 | Test 4 | Test 5 |
|------|--------|--------|--------|--------|--------|
| 0→R | (0,0) | (-1,0) | (-1,+1) | (0,-2) | (-1,-2) |
| R→0 | (0,0) | (+1,0) | (+1,-1) | (0,+2) | (+1,+2) |
| R→2 | (0,0) | (+1,0) | (+1,-1) | (0,+2) | (+1,+2) |
| 2→R | (0,0) | (-1,0) | (-1,+1) | (0,-2) | (-1,-2) |
| 2→L | (0,0) | (+1,0) | (+1,+1) | (0,-2) | (+1,-2) |
| L→2 | (0,0) | (-1,0) | (-1,-1) | (0,+2) | (-1,+2) |
| L→0 | (0,0) | (-1,0) | (-1,-1) | (0,+2) | (-1,+2) |
| 0→L | (0,0) | (+1,0) | (+1,+1) | (0,-2) | (+1,-2) |

**I テトリミノ:**

| 回転 | Test 1 | Test 2 | Test 3 | Test 4 | Test 5 |
|------|--------|--------|--------|--------|--------|
| 0→R | (0,0) | (-2,0) | (+1,0) | (-2,-1) | (+1,+2) |
| R→0 | (0,0) | (+2,0) | (-1,0) | (+2,+1) | (-1,-2) |
| R→2 | (0,0) | (-1,0) | (+2,0) | (-1,+2) | (+2,-1) |
| 2→R | (0,0) | (+1,0) | (-2,0) | (+1,-2) | (-2,+1) |
| 2→L | (0,0) | (+2,0) | (-1,0) | (+2,+1) | (-1,-2) |
| L→2 | (0,0) | (-2,0) | (+1,0) | (-2,-1) | (+1,+2) |
| L→0 | (0,0) | (+1,0) | (-2,0) | (+1,-2) | (-2,+1) |
| 0→L | (0,0) | (-1,0) | (+2,0) | (-1,+2) | (+2,-1) |

**O テトリミノ:** Wall Kick なし

### 3.4 ピース生成 (7-bag Randomizer)

- 7種類のテトリミノを1セット（バッグ）とする
- バッグ内の全ピースが使用されるまで重複なし
- バッグが空になったら新しいバッグを生成

```javascript
function generateBag() {
    const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    // Fisher-Yates shuffle
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    return pieces;
}
```

### 3.5 スコアリングシステム

#### ライン消去

| アクション | スコア |
|-----------|--------|
| Single (1ライン) | 100 × level |
| Double (2ライン) | 300 × level |
| Triple (3ライン) | 500 × level |
| Tetris (4ライン) | 800 × level |

#### T-Spin

| アクション | スコア |
|-----------|--------|
| T-Spin (ライン消去なし) | 400 × level |
| T-Spin Mini (ライン消去なし) | 100 × level |
| T-Spin Single | 800 × level |
| T-Spin Double | 1200 × level |
| T-Spin Triple | 1600 × level |
| T-Spin Mini Single | 200 × level |
| T-Spin Mini Double | 400 × level |

#### T-Spin判定条件
1. ロックしたピースがTテトリミノである
2. 最後の操作が回転である
3. Tの4隅のうち3つ以上がブロックまたは壁で埋まっている
4. 「前面」の2隅が埋まっている場合はフルT-Spin、そうでなければMini

#### ドロップボーナス

| アクション | スコア |
|-----------|--------|
| Soft Drop | 1 × 落下セル数 |
| Hard Drop | 2 × 落下セル数 |

#### コンボ

連続してライン消去を行うとコンボボーナス：
- **コンボボーナス**: 50 × コンボ数 × level

#### Back-to-Back

Tetrisまたは任意のT-Spinを連続で達成（通常のライン消去を挟まない）：
- **Back-to-Back倍率**: 1.5倍

### 3.6 レベルシステム

- **初期レベル**: 1
- **レベルアップ条件**: 10ライン消去ごと
- **落下速度**: レベルに応じて増加

#### 落下速度テーブル

| レベル | 落下間隔 (ms) | 落下速度 (G) |
|--------|---------------|--------------|
| 1 | 1000 | 0.01667 |
| 2 | 793 | 0.021 |
| 3 | 618 | 0.027 |
| 4 | 473 | 0.035 |
| 5 | 355 | 0.047 |
| 6 | 262 | 0.064 |
| 7 | 190 | 0.088 |
| 8 | 135 | 0.123 |
| 9 | 94 | 0.177 |
| 10 | 64 | 0.260 |
| 11-12 | 43 | 0.388 |
| 13-15 | 28 | 0.595 |
| 16-18 | 18 | 0.926 |
| 19-28 | 11 | 1.515 |
| 29+ | 6 | 2.778 |

### 3.7 ロックダウン

- **ロックディレイ**: 500ms（着地後）
- **ムーブリセット**: 移動/回転で15回までリセット可能
- **強制ロック**: 15回リセット後は即座にロック

### 3.8 ホールド機能

- 現在のピースを保留エリアに保存
- 保留中のピースと交換可能
- 1ピースにつき1回のみ使用可能

### 3.9 ネクスト表示

- 次の3つのピースを表示

### 3.10 ゴーストピース

- 現在のピースが着地する位置を半透明で表示

### 3.11 ゲームオーバー条件

以下のいずれかでゲームオーバー：
1. 新しいピースが既存ブロックと重なって出現
2. ピースが完全に可視領域の上でロック

---

## 4. 操作方法

| キー | アクション |
|------|----------|
| ← / A | 左移動 |
| → / D | 右移動 |
| ↓ / S | ソフトドロップ |
| ↑ / W | ハードドロップ |
| Z / Q | 反時計回り回転 |
| X / E | 時計回り回転 |
| C / Shift | ホールド |
| Space | 一時停止 |
| R | リスタート |

### DAS (Delayed Auto Shift)
- **初期遅延**: 170ms
- **リピート間隔**: 50ms

---

## 5. UI構成

```
+------------------------------------------+
|              TETRIS                       |
+------------------------------------------+
|  HOLD  |     PLAYFIELD     |    NEXT    |
|  [  ]  |                   |    [  ]    |
|        |                   |    [  ]    |
|        |                   |    [  ]    |
|  SCORE |                   |            |
|  00000 |                   |            |
|        |                   |            |
|  LEVEL |                   |            |
|    1   |                   |            |
|        |                   |            |
|  LINES |                   |            |
|   000  |                   |            |
+--------+-------------------+------------+
|           [PAUSE] [RESTART]              |
+------------------------------------------+
```

---

## 6. ファイル構成

```
src/
├── index.html         # メインHTML
├── style.css          # スタイルシート
└── js/
    ├── main.js        # エントリーポイント
    ├── game.js        # ゲームループ・状態管理
    ├── board.js       # ボード（マトリクス）管理
    ├── tetromino.js   # テトリミノ定義・回転
    ├── srs.js         # SRS Wall Kick実装
    ├── input.js       # キーボード入力処理
    ├── renderer.js    # Canvas描画
    └── scoring.js     # スコア計算
```

---

## 7. クラス設計

### 7.1 Game クラス
```javascript
class Game {
    constructor(canvas)
    start()
    pause()
    resume()
    reset()
    update(deltaTime)
    render()
}
```

### 7.2 Board クラス
```javascript
class Board {
    constructor(width, height)
    isValidPosition(tetromino, x, y, rotation)
    lock(tetromino)
    clearLines()
    isTSpin(tetromino, lastAction)
}
```

### 7.3 Tetromino クラス
```javascript
class Tetromino {
    constructor(type)
    rotate(direction)
    getBlocks()
    getGhostY(board)
}
```

### 7.4 SRS クラス
```javascript
class SRS {
    static getKickData(type, fromRotation, toRotation)
    static tryRotate(tetromino, board, direction)
}
```

### 7.5 InputHandler クラス
```javascript
class InputHandler {
    constructor()
    isPressed(key)
    update()
}
```

### 7.6 Renderer クラス
```javascript
class Renderer {
    constructor(canvas)
    clear()
    drawBoard(board)
    drawTetromino(tetromino)
    drawGhost(tetromino, ghostY)
    drawUI(score, level, lines, hold, next)
}
```

### 7.7 ScoreManager クラス
```javascript
class ScoreManager {
    constructor()
    addLineClear(lines, level, isTSpin, isBackToBack)
    addSoftDrop(cells)
    addHardDrop(cells)
    getScore()
    getHighScore()
    saveHighScore()
}
```

---

## 8. ゲームループ

```javascript
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 入力処理
    handleInput();

    // ゲーム状態更新
    update(deltaTime);

    // 描画
    render();

    requestAnimationFrame(gameLoop);
}
```

---

## 9. 参考資料

- [Tetris Guideline - TetrisWiki](https://tetris.wiki/Tetris_Guideline)
- [Super Rotation System - TetrisWiki](https://tetris.wiki/Super_Rotation_System)
- [Scoring - TetrisWiki](https://tetris.wiki/Scoring)
- [T-Spin - TetrisWiki](https://tetris.wiki/T-Spin)
