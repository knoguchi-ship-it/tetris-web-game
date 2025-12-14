---
layout: default
title: ホーム
nav_order: 1
description: "Tetris Guideline (2009) 準拠のWebテトリスゲーム技術ドキュメント"
permalink: /
---

# Tetris Web Game
{: .fs-9 }

Tetris Guideline (2009) に準拠したWebブラウザで遊べる一人用テトリスゲーム
{: .fs-6 .fw-300 }

[ゲームをプレイ](https://tetris-web-game.web.app){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[GitHubで見る](https://github.com/knoguchi-ship-it/tetris-web-game){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## プロジェクト概要

本プロジェクトは、公式Tetris Guideline (2009)に準拠したWebベースのテトリスゲームです。
外部ライブラリに依存せず、Vanilla JavaScript と Canvas API のみで実装されています。

### 主な特徴

| 機能 | 説明 |
|:-----|:-----|
| **SRS回転システム** | Super Rotation System + Wall Kick対応 |
| **7-bag Randomizer** | 公平なピース生成アルゴリズム |
| **T-Spin判定** | Full T-Spin / T-Spin Mini の判定 |
| **DAS対応** | 長押し自動リピート（Delayed Auto Shift） |
| **ゴーストピース** | 着地位置の半透明プレビュー |
| **ホールド機能** | ピースの一時保留 |
| **Back-to-Back** | 難易度クリアボーナス |

---

## 技術スタック

```
┌─────────────────────────────────────────┐
│  Frontend                               │
│  ├── HTML5                              │
│  ├── CSS3                               │
│  └── JavaScript (ES6+)                  │
├─────────────────────────────────────────┤
│  Graphics                               │
│  └── Canvas API                         │
├─────────────────────────────────────────┤
│  Storage                                │
│  └── LocalStorage (ハイスコア)           │
├─────────────────────────────────────────┤
│  Hosting                                │
│  └── Firebase Hosting                   │
└─────────────────────────────────────────┘
```

**依存関係: なし** - 純粋なVanilla JavaScriptで実装

---

## ドキュメント構成

<div class="card-grid" markdown="1">

### [アーキテクチャ]({{ site.baseurl }}/architecture)
{: .text-purple-300 }

モジュール構成、クラス設計、状態遷移を図解で解説

### [ゲームメカニクス]({{ site.baseurl }}/mechanics)
{: .text-blue-300 }

ゲームループ、ロックダウン、重力システムの詳細

### [スコアシステム]({{ site.baseurl }}/scoring)
{: .text-green-300 }

スコア計算、T-Spin判定、コンボ・Back-to-Backの仕組み

### [操作方法]({{ site.baseurl }}/controls)
{: .text-yellow-300 }

キーバインド、DAS/ARR設定、操作一覧

</div>

---

## クイックスタート

### ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/knoguchi-ship-it/tetris-web-game.git
cd tetris-web-game

# ローカルサーバーを起動
cd src
python -m http.server 8080

# ブラウザでアクセス
# http://localhost:8080
```

### 対応ブラウザ

| ブラウザ | 対応状況 |
|:---------|:---------|
| Chrome | 推奨 |
| Firefox | 対応 |
| Edge | 対応 |
| Safari | 対応 |

---

## プロジェクト構造

```
tetris-web-game/
├── src/
│   ├── index.html         # メインHTML
│   ├── style.css          # スタイルシート
│   └── js/
│       ├── main.js        # エントリーポイント
│       ├── game.js        # ゲームループ・状態管理
│       ├── board.js       # ボード（10x20グリッド）
│       ├── tetromino.js   # テトリミノ定義・7-bag
│       ├── srs.js         # SRS回転・Wall Kick
│       ├── input.js       # キーボード入力・DAS
│       ├── renderer.js    # Canvas描画
│       └── scoring.js     # スコア・レベル計算
├── docs/                  # ドキュメント（このサイト）
├── firebase.json          # Firebase設定
└── README.md
```

---

## リンク

- [ゲームをプレイ](https://tetris-web-game.web.app)
- [GitHubリポジトリ](https://github.com/knoguchi-ship-it/tetris-web-game)
- [Firebase Console](https://console.firebase.google.com/project/tetris-web-game/overview)

---

## ライセンス

このプロジェクトは教育・学習目的で作成されています。
