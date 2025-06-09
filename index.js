// Replit用の簡易サーバー（FFmpegなしバージョン）
const express = require('express');
console.log('[DEBUG] express loaded');
const cors = require('cors');
console.log('[DEBUG] cors loaded');
const multer = require('multer');
console.log('[DEBUG] multer loaded');
const path = require('path');
console.log('[DEBUG] path loaded');
const fs = require('fs');
console.log('[DEBUG] fs loaded');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
console.log('[DEBUG] Setting up middleware...');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('[DEBUG] Middleware setup complete.');

// 静的ファイルの配信
console.log('[DEBUG] Setting up static file serving...');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(path.join(__dirname, 'assets/styles')));
console.log('[DEBUG] Static file serving setup complete.');

// アップロードディレクトリの作成
console.log('[DEBUG] Checking for uploads directory...');
const uploadDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        console.log(`[DEBUG] Uploads directory not found. Creating it at: ${uploadDir}`);
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('[DEBUG] Uploads directory created successfully.');
    } else {
        console.log('[DEBUG] Uploads directory already exists.');
    }
} catch (error) {
    console.error('[FATAL] Could not create uploads directory!', error);
    process.exit(1); // ディレクトリが作れない場合は致命的エラーとして終了
}

// ファイルアップロード設定（Replit対応）
console.log('[DEBUG] Setting up multer...');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('動画ファイルのみアップロード可能です'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB制限（Replitの制限に合わせて調整）
    }
});

// データベース代替（メモリ内ストレージ）
let videos = [
    {
        id: 1,
        title: "空手基本型 - 平安初段",
        description: "伝統的な空手の型、平安初段の完全な演武です。",
        category: "kata",
        filename: "sample1.mp4",
        duration: "3:25",
        license: "CC BY 4.0",
        attribution: "Traditional Karate Foundation",
        attributionUrl: "https://example.com",
        tags: ["初心者", "型", "基本"],
        uploadDate: new Date().toISOString().split('T')[0],
        views: 1250
    },
    {
        id: 2,
        title: "組手基本技術",
        description: "基本的な組手の技術とコンビネーション",
        category: "kumite",
        filename: "sample2.mp4",
        duration: "5:12",
        license: "CC BY 4.0",
        attribution: "Karate Training Academy",
        attributionUrl: "https://example.com",
        tags: ["組手", "基本"],
        uploadDate: new Date().toISOString().split('T')[0],
        views: 890
    }
];

let nextVideoId = 3;

// ルート定義
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/admin-standalone', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-standalone.html'));
});

app.get('/admin', (req, res) => {
    res.redirect('/admin/');
});

app.get('/admin/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

// API: 動画一覧取得
app.get('/api/videos', (req, res) => {
    const { category, search } = req.query;
    
    let filteredVideos = videos;
    
    if (category && category !== 'all') {
        filteredVideos = filteredVideos.filter(video => video.category === category);
    }
    
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredVideos = filteredVideos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) ||
            video.description.toLowerCase().includes(searchTerm)
        );
    }
    
    res.json({
        success: true,
        data: filteredVideos,
        total: filteredVideos.length
    });
});

// API: 特定動画の詳細
app.get('/api/videos/:id', (req, res) => {
    const videoId = parseInt(req.params.id);
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
        return res.status(404).json({
            success: false,
            message: '動画が見つかりません'
        });
    }
    
    video.views += 1;
    
    res.json({
        success: true,
        data: video
    });
});

// API: 動画アップロード（Replit版）
app.post('/api/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '動画ファイルが選択されていません'
            });
        }
        
        const {
            title,
            description,
            category,
            license,
            attribution,
            attributionUrl,
            tags
        } = req.body;
        
        // CC-BYライセンスの確認
        if (!license || !license.startsWith('CC BY')) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'CC-BYライセンスの動画のみアップロード可能です'
            });
        }
        
        // 動画の長さを取得（簡易版）
        const stats = fs.statSync(req.file.path);
        const durationMins = Math.floor(Math.random() * 10) + 1; // ランダム（実際はFFprobeで取得）
        const durationSecs = Math.floor(Math.random() * 60);
        const duration = `${durationMins}:${durationSecs.toString().padStart(2, '0')}`;
        
        const newVideo = {
            id: nextVideoId++,
            title: title || 'タイトル未設定',
            description: description || '',
            category: category || 'kihon',
            filename: req.file.filename,
            fileSize: req.file.size,
            originalName: req.file.originalname,
            duration: duration,
            license: license,
            attribution: attribution || '不明',
            attributionUrl: attributionUrl || '',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadDate: new Date().toISOString().split('T')[0],
            views: 0
        };
        
        videos.push(newVideo);
        
        res.json({
            success: true,
            message: '動画がアップロードされました',
            data: newVideo
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'アップロード中にエラーが発生しました',
            error: error.message
        });
    }
});

// API: 動画更新
app.put('/api/videos/:id', (req, res) => {
    const videoId = parseInt(req.params.id);
    const videoIndex = videos.findIndex(v => v.id === videoId);
    
    if (videoIndex === -1) {
        return res.status(404).json({
            success: false,
            message: '動画が見つかりません'
        });
    }
    
    const { title, description, category } = req.body;
    
    if (title) videos[videoIndex].title = title;
    if (description) videos[videoIndex].description = description;
    if (category) videos[videoIndex].category = category;
    
    res.json({
        success: true,
        message: '動画が更新されました',
        data: videos[videoIndex]
    });
});

// API: 動画削除
app.delete('/api/videos/:id', (req, res) => {
    const videoId = parseInt(req.params.id);
    const videoIndex = videos.findIndex(v => v.id === videoId);
    
    if (videoIndex === -1) {
        return res.status(404).json({
            success: false,
            message: '動画が見つかりません'
        });
    }
    
    const video = videos[videoIndex];
    
    // ファイル削除
    const filePath = path.join(uploadDir, video.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    
    videos.splice(videoIndex, 1);
    
    res.json({
        success: true,
        message: '動画が削除されました'
    });
});

// API: 統計情報
app.get('/api/stats', (req, res) => {
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const categoryCounts = videos.reduce((counts, video) => {
        counts[video.category] = (counts[video.category] || 0) + 1;
        return counts;
    }, {});
    
    res.json({
        success: true,
        data: {
            totalVideos,
            totalViews,
            categoryCounts,
            avgViewsPerVideo: Math.round(totalViews / totalVideos) || 0
        }
    });
});

// API: ライセンス情報
app.get('/api/licenses', (req, res) => {
    res.json({
        success: true,
        data: {
            'CC BY 4.0': {
                name: 'Creative Commons Attribution 4.0 International',
                description: '作品を自由に共有・改変できます。適切な帰属表示が必要です。',
                url: 'https://creativecommons.org/licenses/by/4.0/'
            }
        }
    });
});

// エラーハンドリング
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'ファイルサイズが大きすぎます（最大50MB）'
            });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました'
    });
});

// 404ハンドリング
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'ページが見つかりません'
    });
});

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SUCCESS] 🥋 空手動画サービス(Replit版)がポート ${PORT} で起動しました`);
    console.log(`   アクセスURL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    console.log('');
    console.log('利用可能な機能:');
    console.log('- 動画アップロード（実際のファイル保存）');
    console.log('- 動画一覧・検索・管理');
    console.log('- CC-BYライセンス管理');
    console.log('- 管理者画面');
    console.log('');
    console.log('注意: FFmpeg動画編集機能は除外（Replit制限のため）');
});