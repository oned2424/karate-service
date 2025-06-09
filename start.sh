#!/bin/bash

echo "🥋 空手動画サービスを起動しています..."

# ポートを確認
echo "利用可能なポートを確認中..."

# 複数のポートを試す
for port in 3000 8080 8000 9000 5000; do
    if ! netstat -an | grep -q ":$port "; then
        echo "ポート $port が利用可能です"
        export PORT=$port
        echo ""
        echo "🚀 サーバーをポート $port で起動中..."
        echo "アクセスURL: http://localhost:$port"
        echo "管理者画面: http://localhost:$port/admin"
        echo ""
        echo "サーバーを停止するには Ctrl+C を押してください"
        echo ""
        
        # サーバー起動
        node src/server.js
        exit 0
    fi
done

echo "❌ 利用可能なポートが見つかりませんでした"
echo "手動でポートを指定してください: PORT=ポート番号 node src/server.js"