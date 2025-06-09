// 最小限のサーバー - localhost問題の診断用
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

const PORT = 8080;

// MIMEタイプのマッピング
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    const parsedUrl = url.parse(req.url, true);
    let filePath = parsedUrl.pathname;
    
    // ルートパスの場合はindex.htmlを返す
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    // 管理者ページ
    if (filePath === '/admin' || filePath === '/admin/') {
        filePath = '/admin/index.html';
    }
    
    // ファイルパスを解決
    const fullPath = path.join(__dirname, 'public', filePath);
    
    // ファイルの存在チェック
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            // 404エラー
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head><title>404 - ファイルが見つかりません</title></head>
                <body>
                    <h1>404 - ファイルが見つかりません</h1>
                    <p>パス: ${filePath}</p>
                    <p>フルパス: ${fullPath}</p>
                    <a href="/">ホームに戻る</a>
                </body>
                </html>
            `);
            return;
        }
        
        // ファイルを読み込んで返す
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>500 - サーバーエラー</title></head>
                    <body>
                        <h1>500 - サーバーエラー</h1>
                        <p>ファイルの読み込みに失敗しました</p>
                        <p>エラー: ${err.message}</p>
                    </body>
                    </html>
                `);
                return;
            }
            
            const mimeType = getMimeType(fullPath);
            res.writeHead(200, { 
                'Content-Type': mimeType + (mimeType.startsWith('text/') ? '; charset=utf-8' : '')
            });
            res.end(data);
        });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 簡易サーバーが起動しました');
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}`);
    console.log(`   http://0.0.0.0:${PORT}`);
    console.log('');
    console.log('アクセス可能なページ:');
    console.log(`   メインサイト: http://localhost:${PORT}/`);
    console.log(`   管理者画面: http://localhost:${PORT}/admin/`);
    console.log('');
    console.log('サーバーを停止するには Ctrl+C を押してください');
    console.log('');
});

server.on('error', (err) => {
    console.error('❌ サーバーエラー:', err);
    if (err.code === 'EADDRINUSE') {
        console.log(`ポート ${PORT} は既に使用されています。`);
        console.log('別のポートを試すか、使用中のプロセスを終了してください。');
    }
});

// Ctrl+C でのシャットダウン処理
process.on('SIGINT', () => {
    console.log('\n🛑 サーバーを停止しています...');
    server.close(() => {
        console.log('✅ サーバーが停止しました');
        process.exit(0);
    });
});