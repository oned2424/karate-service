# 空手動画サービス - クラウド展開ガイド

## 🌐 推奨クラウドプラットフォーム

### 1. Replit (最も簡単)
1. https://replit.com にアクセス
2. 「Create Repl」→「Node.js」選択
3. プロジェクトファイルをアップロード
4. `npm install` 実行
5. `node src/server.js` でサーバー起動
6. 自動的に公開URLが生成される

### 2. CodeSandbox
1. https://codesandbox.io にアクセス
2. 「Create Sandbox」→「Node.js」
3. プロジェクトをインポート
4. 自動的にサーバーが起動

### 3. Vercel (本格運用向け)
1. https://vercel.com にアクセス
2. GitHubリポジトリからデプロイ
3. 自動的にHTTPS URLが生成

## 📦 アップロード用ファイル

必要なファイル一覧:
- package.json
- src/server.js
- public/ フォルダ全体
- assets/ フォルダ全体

## 🔧 ローカル問題の診断

### 可能性のある原因:
1. **ファイアウォール設定**
   - macOSの設定 → セキュリティとプライバシー → ファイアウォール
   
2. **プロキシ設定**
   - 企業ネットワークやVPN接続
   
3. **ホストファイル設定**
   - `/etc/hosts` の設定確認

4. **Node.js権限問題**
   - セキュリティソフトによるブロック

## 🚀 今すぐできる解決策

### A. 外部IPでのテスト
```bash
# ローカルIPアドレスを確認
ifconfig | grep "inet " | grep -v 127.0.0.1

# そのIPアドレスでアクセス
# 例: http://192.168.1.100:8080
```

### B. 別ポートでテスト
```bash
# ポート番号を変更
PORT=3001 node simple-server.js
PORT=9000 node simple-server.js
```

### C. 管理者権限で実行
```bash
sudo node simple-server.js
```