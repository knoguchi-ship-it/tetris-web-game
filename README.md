# Tetris Web Game

Webブラウザで遊べる一人用テトリスゲーム。Tetris Guideline (2009) に準拠。

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
│   └── design.md    # 詳細設計ドキュメント
├── src/             # ソースコード (実装予定)
│   ├── index.html
│   ├── style.css
│   └── js/
└── README.md
```

## Documentation

詳細な仕様は [docs/design.md](docs/design.md) を参照。

## References

- [Tetris Guideline - TetrisWiki](https://tetris.wiki/Tetris_Guideline)
- [Super Rotation System - TetrisWiki](https://tetris.wiki/Super_Rotation_System)
- [Scoring - TetrisWiki](https://tetris.wiki/Scoring)

## License

MIT
