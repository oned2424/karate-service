# 🚀 Replit展開ガイド - 空手動画サービス

## ステップ1: Replitでプロジェクト作成

1. **https://replit.com** にアクセス
2. 「Sign up」でアカウント作成（無料）
3. 「Create Repl」をクリック
4. 「Node.js」を選択
5. プロジェクト名: `karate-video-service`

## ステップ2: ファイルのアップロード方法

### A. 主要ファイルを手動でコピペ

#### 1. package.json
```json
{
  "name": "karate-video-service",
  "version": "1.0.0",
  "description": "空手動画キュレーション＆編集サービス",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  }
}
```

#### 2. server.js (ルートに作成)
以下のコードをコピペ:

#### 3. publicフォルダの作成
- `public/index.html`
- `public/admin/index.html`
- `public/admin/dashboard.html`
- `public/js/main.js`
- `public/js/admin.js`

#### 4. assetsフォルダの作成
- `assets/styles/main.css`
- `assets/styles/admin.css`
- `assets/styles/trust-badge.css`

### B. GitHubからインポート（推奨）

1. GitHubでリポジトリ作成
2. プロジェクトファイルをプッシュ
3. Replitで「Import from GitHub」

## ステップ3: 設定とデプロイ

1. **依存関係インストール**:
   - Replitコンソールで `npm install`

2. **サーバー起動**:
   - 「Run」ボタンをクリック
   - または `npm start`

3. **公開URL取得**:
   - 自動的に `https://プロジェクト名.ユーザー名.repl.co` が生成される

## ステップ4: 動画アップロード機能

ReplitではFFmpegが制限されているため、以下の代替案:

### A. 簡易版（動画メタデータのみ）
- ファイル情報の保存
- プレビュー機能
- 管理画面での一覧表示

### B. 外部サービス連携
- Cloudinary
- AWS S3 + Lambda
- Vercel + API

## 今すぐ試せる方法

最も簡単な手順:
1. Replitアカウント作成
2. 以下のスターターコードを使用
3. 即座にテスト開始