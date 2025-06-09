const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('サーバーは正常に動作しています。\n');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ シンプルなテストサーバーがポート ${PORT} で起動しました。`);
  console.log('公開URLにアクセスして、メッセージが表示されるか確認してください。');
});