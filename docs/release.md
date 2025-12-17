# リリースガイド

このドキュメントでは、p5.pave2riso のリリースフローとブランチ戦略を説明します。

---

## ブランチ戦略

```
main (安定版・リリース用)
  │
  ├── v1.0.0 (タグ)
  ├── v1.1.0 (タグ)
  └── v1.2.0 (タグ)

feature/* (新機能開発用、マージ後削除)
fix/* (バグ修正用、マージ後削除)
```

### ブランチの役割

| ブランチ | 用途 | 寿命 |
|---------|------|------|
| `main` | 安定版。常にリリース可能な状態を維持 | 永続 |
| `feature/*` | 新機能の開発 | マージ後削除 |
| `fix/*` | バグ修正 | マージ後削除 |

---

## リリースフロー

### 1. 開発ブランチで作業

```bash
# 新機能の場合
git checkout -b feature/new-feature main

# バグ修正の場合
git checkout -b fix/bug-description main
```

### 2. 開発・テスト

```bash
# ビルド
npm run build

# Lint
npm run lint

# 動作確認（examples/ で確認）
```

### 3. main にマージ

```bash
git checkout main
git merge feature/new-feature
```

### 4. バージョン更新

```bash
# package.json のバージョンを更新
# 例: "version": "1.1.0" → "version": "1.2.0"

# ビルドを再実行
npm run build
```

### 5. コミット・タグ付け

```bash
git add -A
git commit -m "🚀 Release v1.2.0"
git tag v1.2.0
```

### 6. プッシュ

```bash
git push origin main --tags
```

### 7. npm 公開

```bash
npm publish
```

### 8. ブランチ削除（任意）

```bash
# ローカル
git branch -d feature/new-feature

# リモート
git push origin --delete feature/new-feature
```

---

## 外部ユーザーの使用方法

### npm install

```bash
npm install p5.pave2riso
```

```javascript
import { createP5Pave2Riso } from 'p5.pave2riso'
```

### CDN（npm経由）

```html
<!-- 最新版 -->
<script type="module">
  import { createP5Pave2Riso } from 'https://cdn.jsdelivr.net/npm/p5.pave2riso/dist/p5.pave2riso.js'
</script>

<!-- バージョン指定 -->
<script type="module">
  import { createP5Pave2Riso } from 'https://cdn.jsdelivr.net/npm/p5.pave2riso@1.1.0/dist/p5.pave2riso.js'
</script>
```

### CDN（GitHub経由）

```html
<!-- main ブランチ（最新安定版） -->
<script type="module">
  import { createP5Pave2Riso } from 'https://cdn.jsdelivr.net/gh/hirookagikko/p5.pave2riso@main/dist/p5.pave2riso.js'
</script>

<!-- タグ指定 -->
<script type="module">
  import { createP5Pave2Riso } from 'https://cdn.jsdelivr.net/gh/hirookagikko/p5.pave2riso@v1.1.0/dist/p5.pave2riso.js'
</script>
```

---

## バージョニング

[Semantic Versioning](https://semver.org/) に従います。

| 変更内容 | バージョン |
|---------|-----------|
| 破壊的変更（API変更など） | メジャー (`2.0.0`) |
| 新機能追加（後方互換） | マイナー (`1.2.0`) |
| バグ修正 | パッチ (`1.1.1`) |

---

## チェックリスト

リリース前に確認：

- [ ] `npm run build` が成功する
- [ ] `npm run lint` がエラーなし
- [ ] examples/ が正常に動作する
- [ ] package.json のバージョンを更新した
- [ ] README に破壊的変更があれば記載した
