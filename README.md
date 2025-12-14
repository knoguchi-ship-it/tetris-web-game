# Tetris Web Game

Webブラウザで遊べる一人用テトリスゲーム。Tetris Guideline (2009) に準拠。

## Play Now

**https://tetris-web-game.web.app**

## Features

- **SRS (Super Rotation System)**: Wall Kick対応の標準回転システム
- **7-bag Randomizer**: 公平なピース生成アルゴリズム
- **Ghost Piece**: 着地位置のプレビュー表示
- **Hold**: ピースの一時保留機能
- **Next Queue**: 次の3ピースを表示
- **T-Spin Detection**: T-Spinボーナス判定
- **Combo / Back-to-Back**: 連続消去ボーナス
- **Level System**: ライン消去でレベルアップ、速度上昇

## Tech Stack

- HTML5 / CSS3 / JavaScript (ES6+)
- Canvas API
- LocalStorage (ハイスコア保存)
- Firebase Hosting
- No dependencies (Vanilla JS)

## Controls

| Key | Action |
|-----|--------|
| ← / A | Move Left |
| → / D | Move Right |
| ↓ / S | Soft Drop |
| ↑ / W | Hard Drop |
| Z / Q | Rotate CCW |
| X / E | Rotate CW |
| C / Shift | Hold |
| Space | Pause |
| R | Restart |

## Project Structure

```
├── docs/
│   ├── design.md      # ゲーム設計書
│   ├── deploy.md      # デプロイ手順
│   └── handover.md    # 引き継ぎドキュメント
├── src/
│   ├── index.html
│   ├── style.css
│   └── js/
│       ├── main.js
│       ├── game.js
│       ├── board.js
│       ├── tetromino.js
│       ├── srs.js
│       ├── input.js
│       ├── renderer.js
│       └── scoring.js
├── firebase.json
├── .firebaserc
└── README.md
```

## Local Development

```bash
# Clone repository
git clone https://github.com/knoguchi-ship-it/tetris-web-game.git
cd tetris-web-game

# Start local server
cd src && python -m http.server 8080

# Open in browser
# http://localhost:8080
```

## Deploy

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```

## Documentation

- [ゲーム設計書](docs/design.md) - Tetris Guideline準拠の詳細仕様
- [デプロイ手順](docs/deploy.md) - Firebase Hostingデプロイ計画
- [引き継ぎドキュメント](docs/handover.md) - プロジェクト引き継ぎ情報

## References

- [Tetris Guideline - TetrisWiki](https://tetris.wiki/Tetris_Guideline)
- [Super Rotation System - TetrisWiki](https://tetris.wiki/Super_Rotation_System)
- [Scoring - TetrisWiki](https://tetris.wiki/Scoring)

## License

MIT
