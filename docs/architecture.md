---
layout: default
title: アーキテクチャ
nav_order: 2
description: "テトリスWebゲームのモジュール構成とアーキテクチャ"
permalink: /architecture
mermaid: true
---

# アーキテクチャ
{: .no_toc }

モジュール構成、クラス設計、ゲーム状態の遷移を図解で解説します。
{: .fs-6 .fw-300 }

## 目次
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## モジュール依存関係

システムは7つのモジュールで構成され、各モジュールが明確な責務を持っています。

```mermaid
flowchart TB
    subgraph Entry["エントリーポイント"]
        Main["main.js<br/>初期化・ループ開始"]
    end

    subgraph Core["コアロジック"]
        Game["game.js<br/>ゲームループ<br/>状態管理"]
    end

    subgraph Logic["ゲームロジック"]
        Board["board.js<br/>グリッド管理<br/>衝突判定"]
        Tetromino["tetromino.js<br/>ピース定義<br/>7-bag"]
        SRS["srs.js<br/>回転システム<br/>Wall Kick"]
        Scoring["scoring.js<br/>スコア計算<br/>レベル管理"]
    end

    subgraph IO["入出力"]
        Input["input.js<br/>キー入力<br/>DAS処理"]
        Renderer["renderer.js<br/>Canvas描画"]
    end

    Main --> Game
    Game --> Board
    Game --> Tetromino
    Game --> SRS
    Game --> Scoring
    Game --> Input
    Game --> Renderer
    Renderer -.-> Board
    Renderer -.-> Tetromino
    SRS -.-> Board
    SRS -.-> Tetromino

    style Main fill:#4a9eff,color:#fff
    style Game fill:#ff6b6b,color:#fff
    style Board fill:#51cf66,color:#fff
    style Tetromino fill:#ffd43b,color:#000
    style SRS fill:#be4bdb,color:#fff
    style Scoring fill:#20c997,color:#fff
    style Input fill:#ff922b,color:#fff
    style Renderer fill:#748ffc,color:#fff
```

### モジュール一覧

| モジュール | ファイル | 行数 | 主な責務 |
|:-----------|:---------|-----:|:---------|
| **Entry** | `main.js` | 19 | Canvas取得、Game初期化、ループ開始 |
| **Game** | `game.js` | 376 | ゲームループ、状態管理、ピース制御 |
| **Board** | `board.js` | 171 | グリッド管理、衝突判定、ライン消去 |
| **Tetromino** | `tetromino.js` | 172 | ピース定義、7-bag Randomizer |
| **SRS** | `srs.js` | 67 | 回転システム、Wall Kickデータ |
| **Input** | `input.js` | 145 | キー入力、DAS/ARR処理 |
| **Renderer** | `renderer.js` | 200+ | Canvas描画、UI表示 |
| **Scoring** | `scoring.js` | 182 | スコア、レベル、重力計算 |

---

## クラス構造

各モジュールの主要クラスとその関係を示します。

```mermaid
classDiagram
    class Game {
        -state: GameState
        -currentPiece: Tetromino
        -holdPiece: string
        -nextPieces: Tetromino[]
        -canHold: boolean
        -lockTimer: number
        -lockMoves: number
        +start()
        +update(deltaTime)
        +render()
        +moveHorizontal(dx)
        +rotate(direction)
        +softDrop()
        +hardDrop()
        +hold()
        +lockPiece()
    }

    class Board {
        -grid: Color[][]
        -width: number
        -height: number
        +isValidPosition(piece, x, y, rot)
        +lock(piece)
        +clearLines()
        +getGhostY(piece)
        +isTSpin(piece, lastMove, kick)
        +isGameOver(piece)
    }

    class Tetromino {
        -type: string
        -rotation: number
        -x: number
        -y: number
        +getBlocks()
        +getBlocksAt(x, y, rotation)
        +clone()
    }

    class TetrominoBag {
        -bag: string[]
        +next()
        -refill()
        -shuffle()
    }

    class SRS {
        +getKickData(type, from, to)$
        +tryRotate(piece, board, dir)$
    }

    class ScoreManager {
        -score: number
        -level: number
        -lines: number
        -combo: number
        -backToBack: boolean
        +addLineClear(count, tSpinInfo)
        +addSoftDrop(cells)
        +addHardDrop(cells)
        +getGravity()
        +getHighScore()
        +saveHighScore()
    }

    class InputHandler {
        -keys: Map
        -justPressed: Map
        -dasTimer: Map
        +update()
        +isActionJustPressed(action)
        +isActionHeld(action)
        +shouldRepeat(action)
        +getMovement()
    }

    class Renderer {
        -canvas: HTMLCanvasElement
        -ctx: CanvasRenderingContext2D
        +clear()
        +drawBoard(board)
        +drawPiece(piece)
        +drawGhost(piece, ghostY)
        +drawUI(stats, hold, next)
        +drawPause()
        +drawGameOver()
    }

    Game --> Board : uses
    Game --> Tetromino : controls
    Game --> TetrominoBag : generates from
    Game --> SRS : rotates with
    Game --> ScoreManager : updates
    Game --> InputHandler : reads
    Game --> Renderer : draws with
    Board --> Tetromino : validates
    SRS --> Tetromino : transforms
    Renderer --> Board : draws
    Renderer --> Tetromino : draws
```

### 責務の分離

| レイヤー | クラス | 責務 |
|:---------|:-------|:-----|
| **Controller** | Game | ゲームフロー制御、イベント処理 |
| **Model** | Board, Tetromino, ScoreManager | データ管理、ビジネスロジック |
| **View** | Renderer | 描画処理、UI表示 |
| **Input** | InputHandler | ユーザー入力の抽象化 |
| **Utility** | SRS, TetrominoBag | 専門アルゴリズム |

---

## ゲーム状態遷移

ゲームは3つの状態を持ち、ユーザー入力により遷移します。

```mermaid
stateDiagram-v2
    [*] --> PLAYING : ゲーム開始

    PLAYING --> PAUSED : Spaceキー
    PAUSED --> PLAYING : Spaceキー

    PLAYING --> GAME_OVER : ブロックが<br/>スポーン位置に<br/>衝突

    GAME_OVER --> PLAYING : Rキー<br/>(リスタート)
    GAME_OVER --> [*] : ページ離脱

    state PLAYING {
        [*] --> InputProcessing
        InputProcessing --> GravityUpdate
        GravityUpdate --> LockCheck
        LockCheck --> LineClear
        LineClear --> SpawnNext
        SpawnNext --> Render
        Render --> [*]
    }

    state PAUSED {
        [*] --> WaitResume
        WaitResume --> DrawPauseOverlay
        DrawPauseOverlay --> [*]
    }

    state GAME_OVER {
        [*] --> SaveHighScore
        SaveHighScore --> DrawGameOverScreen
        DrawGameOverScreen --> WaitRestart
        WaitRestart --> [*]
    }
```

### 状態詳細

#### PLAYING状態
{: .text-green-300 }

| フェーズ | 処理内容 |
|:---------|:---------|
| InputProcessing | キー入力の読み取り、移動・回転の実行 |
| GravityUpdate | 落下タイマー更新、自動落下の適用 |
| LockCheck | 着地判定、ロックダウンタイマー管理 |
| LineClear | 完成ラインの消去、スコア計算 |
| SpawnNext | 次のピースのスポーン、ゲームオーバー判定 |
| Render | 画面描画 |

#### PAUSED状態
{: .text-yellow-300 }

- ゲームロジックの更新を停止
- 現在の画面上にポーズオーバーレイを表示
- Spaceキーで再開

#### GAME_OVER状態
{: .text-red-300 }

- ハイスコアをLocalStorageに保存
- 最終スコアとハイスコアを表示
- Rキーでゲームをリスタート

---

## データフロー

```
┌──────────────────────────────────────────────────────────────┐
│                        Game Loop                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  Input  │───▶│  Game   │───▶│  Board  │───▶│Renderer │  │
│  │ Handler │    │ (Logic) │    │ (State) │    │ (View)  │  │
│  └─────────┘    └────┬────┘    └─────────┘    └─────────┘  │
│                      │                                       │
│                      ▼                                       │
│               ┌─────────────┐                               │
│               │   Scoring   │                               │
│               │   Manager   │                               │
│               └─────────────┘                               │
│                      │                                       │
│                      ▼                                       │
│               ┌─────────────┐                               │
│               │LocalStorage │                               │
│               │ (HighScore) │                               │
│               └─────────────┘                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 次のページ

- [ゲームメカニクス]({{ site.baseurl }}/mechanics) - ゲームループとロックダウンの詳細
- [スコアシステム]({{ site.baseurl }}/scoring) - スコア計算とT-Spin判定
