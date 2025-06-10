// Replit用の簡易サーバー（FFmpegなしバージョン + 管理者認証）
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// セッション設定
app.use(session({
    secret: 'karate-admin-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // HTTPでも動作するようにfalse
        maxAge: 24 * 60 * 60 * 1000 // 24時間
    }
}));

// ミドルウェア設定
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(path.join(__dirname, 'assets/styles')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// アップロードディレクトリの作成
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ファイルアップロード設定（Replit対応）
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

// 習慣化パッケージ用データ構造
let practiceRecords = []; // 練習記録 { id, date, completed, timestamp }
let journalEntries = []; // 日記エントリ { id, date, mood, text, videoId?, timestamp }
let userSettings = { // ユーザー設定
    notifications: {
        enabled: true,
        time: '19:00',
        channels: {
            push: true,
            email: false
        }
    },
    streak: {
        current: 0,
        longest: 0,
        total: 0
    }
};

// 月替わり日本語フレーズ
let monthlyPhrases = [
    {
        id: 1,
        month: '2025-06',
        japanese: '礼に始まり礼に終わる',
        romaji: 'Rei ni hajimari rei ni owaru',
        english: 'Begin with respect, end with respect',
        explanation: 'Traditional martial arts principle emphasizing respect in all aspects of training.',
        active: true
    }
];

let nextPracticeId = 1;
let nextJournalId = 1;

// 管理者認証ミドルウェア
function requireAuth(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// ルート定義
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 管理者画面（認証が必要）
app.get('/admin-standalone', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-standalone.html'));
});

app.get('/admin', (req, res) => {
    res.redirect('/admin/');
});

app.get('/admin/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

// ログインページ
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// ログイン処理
app.post('/login', (req, res) => {
    const { password } = req.body;
    
    if (password === 'karate-admin-2024') {
        req.session.isAuthenticated = true;
        res.json({ success: true, message: 'ログイン成功' });
    } else {
        res.status(401).json({ success: false, message: 'パスワードが間違っています' });
    }
});

// ログアウト処理
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'ログアウトしました' });
});

// 認証状態チェック API
app.get('/api/auth-check', (req, res) => {
    res.json({ 
        isAuthenticated: !!req.session.isAuthenticated 
    });
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

// API: 動画アップロード（Replit版・認証が必要）
app.post('/api/upload', requireAuth, upload.single('video'), (req, res) => {
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

// API: 動画更新（認証が必要）
app.put('/api/videos/:id', requireAuth, (req, res) => {
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

// API: 動画削除（認証が必要）
app.delete('/api/videos/:id', requireAuth, (req, res) => {
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

// API: 統計情報（認証が必要）
app.get('/api/stats', requireAuth, (req, res) => {
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

// ==== 習慣化パッケージ API ====

// API: 今日の練習記録 (Today✓ボタン)
app.post('/api/practice/today', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = practiceRecords.find(record => record.date === today);
    
    if (existingRecord) {
        return res.json({
            success: false,
            message: '今日はすでに練習を記録済みです',
            data: existingRecord
        });
    }
    
    const newRecord = {
        id: nextPracticeId++,
        date: today,
        completed: true,
        timestamp: new Date().toISOString()
    };
    
    practiceRecords.push(newRecord);
    
    // ストリーク計算
    updateStreak();
    
    res.json({
        success: true,
        message: '今日の練習を記録しました！',
        data: {
            record: newRecord,
            streak: userSettings.streak
        }
    });
});

// API: ストリーク情報取得
app.get('/api/practice/streak', (req, res) => {
    res.json({
        success: true,
        data: userSettings.streak
    });
});

// API: 練習カレンダーデータ
app.get('/api/practice/calendar', (req, res) => {
    const { year, month } = req.query;
    let filteredRecords = practiceRecords;
    
    if (year && month) {
        const filterDate = `${year}-${month.padStart(2, '0')}`;
        filteredRecords = practiceRecords.filter(record => 
            record.date.startsWith(filterDate)
        );
    }
    
    res.json({
        success: true,
        data: filteredRecords.map(record => ({
            date: record.date,
            completed: record.completed,
            title: '練習完了'
        }))
    });
});

// API: 練習後日記保存
app.post('/api/journal', (req, res) => {
    const { mood, text, videoId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    if (!mood || !['happy', 'neutral', 'tired'].includes(mood)) {
        return res.status(400).json({
            success: false,
            message: '有効なムードを選択してください'
        });
    }
    
    const newEntry = {
        id: nextJournalId++,
        date: today,
        mood: mood,
        text: text || '',
        videoId: videoId || null,
        timestamp: new Date().toISOString()
    };
    
    journalEntries.push(newEntry);
    
    res.json({
        success: true,
        message: '練習日記を保存しました',
        data: newEntry
    });
});

// API: 日記履歴取得
app.get('/api/journal', (req, res) => {
    const { limit = 10 } = req.query;
    const recentEntries = journalEntries
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, parseInt(limit));
    
    res.json({
        success: true,
        data: recentEntries
    });
});

// API: 月替わりフレーズ取得
app.get('/api/phrase/current', (req, res) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentPhrase = monthlyPhrases.find(phrase => 
        phrase.month === currentMonth && phrase.active
    );
    
    res.json({
        success: true,
        data: currentPhrase || null
    });
});

// API: ユーザー設定取得
app.get('/api/settings', (req, res) => {
    res.json({
        success: true,
        data: userSettings
    });
});

// API: ユーザー設定更新
app.put('/api/settings', (req, res) => {
    const { notifications } = req.body;
    
    if (notifications) {
        userSettings.notifications = { ...userSettings.notifications, ...notifications };
    }
    
    res.json({
        success: true,
        message: '設定を更新しました',
        data: userSettings
    });
});

// ストリーク計算ヘルパー関数
function updateStreak() {
    const sortedRecords = practiceRecords
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedRecords.length === 0) {
        userSettings.streak = { current: 0, longest: 0, total: 0 };
        return;
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    
    // 連続日数計算
    for (let i = 0; i < sortedRecords.length; i++) {
        const recordDate = new Date(sortedRecords[i].date);
        const daysDiff = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24));
        
        if (i === 0 && daysDiff <= 1) {
            currentStreak = 1;
            tempStreak = 1;
        } else if (i > 0) {
            const prevDate = new Date(sortedRecords[i - 1].date);
            const prevDiff = Math.floor((prevDate - recordDate) / (1000 * 60 * 60 * 24));
            
            if (prevDiff === 1) {
                if (i === 1 && daysDiff <= 1) currentStreak++;
                tempStreak++;
            } else {
                if (tempStreak > longestStreak) longestStreak = tempStreak;
                tempStreak = 1;
            }
        }
    }
    
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    if (currentStreak === 0 && sortedRecords[0].date === today.toISOString().split('T')[0]) {
        currentStreak = 1;
    }
    
    userSettings.streak = {
        current: currentStreak,
        longest: Math.max(longestStreak, currentStreak),
        total: practiceRecords.length
    };
}

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
    console.log(`🥋 空手動画サービス(Replit版)がポート ${PORT} で起動しました`);
    console.log(`   アクセスURL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    console.log('');
    console.log('利用可能な機能:');
    console.log('- 動画アップロード（実際のファイル保存）');
    console.log('- 動画一覧・検索・管理');
    console.log('- CC-BYライセンス管理');
    console.log('- 管理者画面（認証機能付き）');
    console.log('');
    console.log('注意: FFmpeg動画編集機能は除外（Replit制限のため）');
});