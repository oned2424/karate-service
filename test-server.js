const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>テストサーバー</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1>🎉 サーバーが正常に動作しています！</h1>
            <p>URL: <strong>${req.url}</strong></p>
            <p>時刻: <strong>${new Date().toLocaleString('ja-JP')}</strong></p>
            <p>このページが表示されれば、Node.jsサーバーは正常に動作しています。</p>
            <a href="/admin">管理者ページをテスト</a>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 テストサーバーが起動しました`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}`);
    console.log('');
    console.log('サーバーを停止するには Ctrl+C を押してください');
});

server.on('error', (err) => {
    console.error('❌ サーバーエラー:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.log(`ポート ${PORT} は既に使用されています。別のポートを試してください。`);
    }
});