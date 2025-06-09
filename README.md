# 🥋 KarateMaster - 空手動画学習プラットフォーム

[![Deploy on Replit](https://replit.com/badge/github/replit/replit)](https://replit.com/@replit/karate-video-service)

## 🚀 クイックスタート（GitHub → Replit）

### 1. GitHubリポジトリからデプロイ

1. **Replit.com** にアクセス
2. 「Create Repl」をクリック
3. 「Import from GitHub」を選択
4. このリポジトリのURLを入力
5. 「Import from GitHub」をクリック

### 2. 自動起動

- 依存関係が自動インストールされます
- `npm start` で自動起動
- 公開URLが自動生成されます

## ✨ 主な機能

### 🎬 動画管理システム
- **実際の動画アップロード**（最大50MB）
- **メタデータ管理**（タイトル、説明、カテゴリ）
- **CC-BYライセンス強制**
- **動画一覧・検索・削除**

### 👨‍💼 管理者画面
- **プロフェッショナルなダッシュボード**
- **統計情報表示**
- **動画アップロードフォーム**
- **ライセンス管理**

### 🌍 国際的デザイン
- **外国人向け信頼性デザイン**
- **日本の伝統色使用**
- **レスポンシブ対応**
- **多言語準備**

## 🔧 技術スタック

- **バックエンド**: Node.js + Express
- **ファイルアップロード**: Multer
- **フロントエンド**: Vanilla JS + CSS3
- **デザイン**: Professional UI/UX
- **ホスティング**: Replit

## 📂 プロジェクト構造

```
karate-video-service/
├── index.js              # メインサーバーファイル
├── package.json          # プロジェクト設定
├── public/               # 静的ファイル
│   ├── index.html        # メインページ
│   ├── admin/            # 管理者画面
│   └── js/               # JavaScript
├── assets/               # スタイルシート
│   └── styles/
└── uploads/              # アップロードファイル（自動生成）
```

## 🚀 ローカル開発

```bash
# クローン
git clone [repository-url]
cd karate-video-service

# 依存関係インストール
npm install

# 開発サーバー起動
npm start
```

## 📋 使用方法

### 🎯 管理者アクセス
1. `/admin/` にアクセス
2. ログイン情報：
   - ユーザー名: `admin`
   - パスワード: `karate2024`

### 📤 動画アップロード
1. 管理者画面ログイン
2. 「Upload Video」セクション
3. 動画ファイル選択（MP4、最大50MB）
4. メタデータ入力：
   - タイトル（必須）
   - カテゴリ（型/組手/基本）
   - **CC-BYライセンス（必須）**
   - 帰属表示（必須）
5. アップロード実行

### 🎬 動画管理
- 「Manage Videos」で一覧表示
- 編集・削除機能
- 検索・フィルタリング

## 📜 ライセンス

### プラットフォーム
MIT License

### 動画コンテンツ
すべての動画は **Creative Commons Attribution (CC BY 4.0)** ライセンス必須

## 🛠 制限事項（Replit版）

- ✅ 動画アップロード・管理
- ✅ メタデータ管理
- ✅ 管理者画面
- ❌ FFmpeg動画編集（Replit制限）
- ❌ 大容量ファイル（50MB制限）

## 🔮 今後の予定

- AWS S3連携（大容量対応）
- Cloudinary連携（動画編集）
- ユーザー認証システム
- 評価・コメント機能

## 📞 サポート

- GitHub Issues
- Email: support@karatemaster.com

---

**🥋 Learn Karate the Modern Way!**