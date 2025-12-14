# Firebase Hosting デプロイ計画書

## 1. 概要

テトリスゲームをFirebase Hostingを使用してWebに公開する。

---

## 2. 前提条件

| 項目 | 値 |
|------|-----|
| GCPアカウント | k.noguchi@care-dx-platform.com |
| プロジェクト名 | tetris-web-game（新規作成） |
| デプロイ対象 | `src/` ディレクトリ |
| 想定URL | https://tetris-web-game.web.app |

---

## 3. 実行手順

### Step 1: Firebase CLIのインストール

```bash
npm install -g firebase-tools
```

### Step 2: Firebaseログイン

```bash
firebase login
```
- ブラウザが開き、k.noguchi@care-dx-platform.com でログイン
- 認証完了後、CLIに戻る

### Step 3: Firebaseプロジェクト作成

```bash
firebase projects:create tetris-web-game --display-name "Tetris Web Game"
```

または、Firebase Console (https://console.firebase.google.com) で手動作成：
1. 「プロジェクトを追加」をクリック
2. プロジェクト名: `tetris-web-game`
3. Google Analyticsは無効でOK

### Step 4: プロジェクトの初期化

```bash
cd C:\AIプロジェクト
firebase init hosting
```

設定内容：
- **Project**: `tetris-web-game` を選択
- **Public directory**: `src`
- **Single-page app**: No
- **GitHub Actions**: No（オプション）
- **Overwrite index.html**: No

### Step 5: デプロイ

```bash
firebase deploy --only hosting
```

---

## 4. 生成されるファイル

```
C:\AIプロジェクト\
├── .firebaserc          # プロジェクト設定
├── firebase.json        # Hosting設定
└── src/                 # デプロイ対象
    ├── index.html
    ├── style.css
    └── js/
        └── *.js
```

### firebase.json の内容

```json
{
  "hosting": {
    "public": "src",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

## 5. 公開URL

デプロイ完了後、以下のURLでアクセス可能：

- **デフォルト**: https://tetris-web-game.web.app
- **代替**: https://tetris-web-game.firebaseapp.com

---

## 6. 更新時の手順

コード変更後は以下のコマンドで再デプロイ：

```bash
firebase deploy --only hosting
```

---

## 7. 確認コマンド

```bash
# ログイン状態確認
firebase login:list

# プロジェクト一覧
firebase projects:list

# デプロイ履歴
firebase hosting:channel:list
```

---

## 8. トラブルシューティング

### 認証エラーの場合
```bash
firebase login --reauth
```

### プロジェクトが見つからない場合
```bash
firebase use --add
```

### デプロイ前にローカルプレビュー
```bash
firebase serve --only hosting
```

---

## 9. コスト

Firebase Hosting無料枠：
- ストレージ: 10 GB
- 転送量: 360 MB/日
- カスタムドメイン: 無料

→ 今回のテトリスゲームでは十分な無料枠内で運用可能

---

## 10. 次のステップ（オプション）

1. カスタムドメイン設定
2. GitHub ActionsによるCI/CDパイプライン構築
3. Firebase Analyticsの有効化
