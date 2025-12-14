# テトリスWebゲーム 引き継ぎドキュメント

作成日: 2024-12-14

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | Tetris Web Game |
| 概要 | Webブラウザで遊べる一人用テトリスゲーム |
| 仕様準拠 | Tetris Guideline (2009) |
| 公開URL | https://tetris-web-game.web.app |
| GitHubリポジトリ | https://github.com/knoguchi-ship-it/tetris-web-game |
| Firebase Console | https://console.firebase.google.com/project/tetris-web-game/overview |

---

## 2. 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | HTML5 / CSS3 / JavaScript (ES6+) |
| 描画 | Canvas API |
| データ保存 | LocalStorage (ハイスコア) |
| ホスティング | Firebase Hosting |
| バージョン管理 | Git / GitHub |
| 依存関係 | なし (Vanilla JS) |

---

## 3. ディレクトリ構造

```
C:\AIプロジェクト\
├── docs/
│   ├── design.md          # ゲーム設計書（詳細仕様）
│   ├── deploy.md          # デプロイ手順書
│   └── handover.md        # 本ドキュメント
├── src/
│   ├── index.html         # メインHTML
│   ├── style.css          # スタイルシート
│   └── js/
│       ├── main.js        # エントリーポイント
│       ├── game.js        # ゲームループ・状態管理
│       ├── board.js       # ボード（10x20グリッド）管理
│       ├── tetromino.js   # テトリミノ定義・7-bag randomizer
│       ├── srs.js         # SRS回転システム・Wall Kick
│       ├── input.js       # キーボード入力・DAS処理
│       ├── renderer.js    # Canvas描画
│       └── scoring.js     # スコア・レベル計算
├── .firebaserc            # Firebaseプロジェクト設定
├── firebase.json          # Firebase Hosting設定
└── README.md              # プロジェクト説明
```

---

## 4. 実装機能一覧

### ゲーム機能

| 機能 | 実装ファイル | 説明 |
|------|-------------|------|
| SRS回転 | `srs.js` | Super Rotation System + Wall Kick |
| 7-bag | `tetromino.js` | 公平なピース生成 |
| ゴースト | `renderer.js` | 着地位置プレビュー |
| ホールド | `game.js` | ピース一時保留 |
| ネクスト | `game.js` | 次の3ピース表示 |
| T-Spin | `board.js` | T-Spin判定・Mini判定 |
| コンボ | `scoring.js` | 連続消去ボーナス |
| Back-to-Back | `scoring.js` | 難易度クリアボーナス |
| レベル | `scoring.js` | 10ライン毎にレベルアップ |
| DAS | `input.js` | 長押し自動リピート |
| ハイスコア | `scoring.js` | LocalStorage保存 |

### 操作方法

| キー | アクション |
|------|----------|
| ← → / A D | 左右移動 |
| ↓ / S | ソフトドロップ |
| ↑ / W | ハードドロップ |
| Z Q / X E | 回転 |
| C / Shift | ホールド |
| Space | 一時停止 |
| R | リスタート |

---

## 5. 環境構築

### 必要なツール

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Node.js | v18以上 | Firebase CLI実行 |
| Firebase CLI | v15.0.0 | デプロイ |
| Git | 最新 | バージョン管理 |

### インストール手順

```bash
# Firebase CLIインストール
npm install -g firebase-tools

# Firebaseログイン
firebase login

# リポジトリクローン
git clone https://github.com/knoguchi-ship-it/tetris-web-game.git
cd tetris-web-game
```

---

## 6. ローカル開発

### 開発サーバー起動

```bash
# 方法1: Firebase Hosting エミュレータ
firebase serve --only hosting

# 方法2: Python簡易サーバー
cd src
python -m http.server 8080

# 方法3: VS Code Live Server拡張機能
# src/index.html を右クリック → Open with Live Server
```

ブラウザで http://localhost:8080 または http://localhost:5000 にアクセス

---

## 7. デプロイ手順

### 本番デプロイ

```bash
cd C:\AIプロジェクト
firebase deploy --only hosting
```

### デプロイ確認

```bash
# デプロイ履歴
firebase hosting:channel:list

# 現在のサイト情報
firebase hosting:sites:list
```

### デプロイ先

| 環境 | URL |
|------|-----|
| 本番 | https://tetris-web-game.web.app |
| 代替 | https://tetris-web-game.firebaseapp.com |

---

## 8. アカウント情報

### GCP/Firebase

| 項目 | 値 |
|------|-----|
| GCPプロジェクトID | tetris-web-game |
| GCPプロジェクト番号 | 885743025900 |
| 組織 | care-dx-platform.com |
| オーナー | k.noguchi@care-dx-platform.com |

### GitHub

| 項目 | 値 |
|------|-----|
| リポジトリ | knoguchi-ship-it/tetris-web-game |
| ブランチ | master |

---

## 9. 関連ドキュメント

| ドキュメント | パス | 内容 |
|-------------|------|------|
| ゲーム設計書 | `docs/design.md` | Tetris Guideline準拠の詳細仕様 |
| デプロイ手順 | `docs/deploy.md` | Firebase Hostingデプロイ計画 |
| README | `README.md` | プロジェクト概要 |

---

## 10. 更新履歴

| 日付 | 内容 |
|------|------|
| 2024-12-14 | 初回リリース - ゲーム実装・Firebase Hostingデプロイ完了 |

---

## 11. トラブルシューティング

### Firebase CLIでPermission Deniedエラー

**原因**: 組織ポリシーでFirebase操作が制限されている

**対処法**:
1. Firebase Console (https://console.firebase.google.com/) で直接操作
2. GCPコンソールでFirebase Admin IAMロールを付与
3. `firebase login --reauth` でトークン更新

### ローカルでゲームが動かない

**原因**: ES Modulesはfile://プロトコルで動作しない

**対処法**: ローカルサーバーを起動してアクセス

```bash
cd src && python -m http.server 8080
```

### デプロイ後に更新が反映されない

**対処法**: ブラウザキャッシュをクリア（Ctrl+Shift+R）

---

## 12. 連絡先

| 役割 | 担当 | 連絡先 |
|------|------|--------|
| プロジェクトオーナー | 野口 | k.noguchi@care-dx-platform.com |

---

## 13. 参考資料

- [Tetris Guideline - TetrisWiki](https://tetris.wiki/Tetris_Guideline)
- [Super Rotation System - TetrisWiki](https://tetris.wiki/Super_Rotation_System)
- [Firebase Hosting ドキュメント](https://firebase.google.com/docs/hosting)
- [GitHub リポジトリ](https://github.com/knoguchi-ship-it/tetris-web-game)
