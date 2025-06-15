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
    resave: true, // セッションデータが変更されていなくても保存
    saveUninitialized: true, // 初期化されていないセッションも保存
    cookie: { 
        secure: false, // HTTPでも動作するようにfalse
        httpOnly: true, // XSS攻撃を防ぐ
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
        sameSite: 'lax' // CSRF攻撃を防ぐ
    },
    name: 'karate.session.id' // セッションID名をカスタマイズ
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
        title: "Karate Kata - Traditional Form",
        description: "Traditional karate kata demonstration (Sample video - Feature in development)",
        category: "kata",
        filename: "https://www.youtube.com/embed/NAn6DocT120",
        url: "https://www.youtube.com/embed/NAn6DocT120",
        thumbnail: "https://img.youtube.com/vi/NAn6DocT120/maxresdefault.jpg",
        duration: "6:42",
        license: "Sample Content",
        attribution: "YouTube Sample - Feature in Development",
        attributionUrl: "https://youtube.com",
        tags: ["kata", "traditional", "sample"],
        uploadDate: new Date().toISOString().split('T')[0],
        views: 1250,
        isSample: true
    },
    {
        id: 2,
        title: "Kumite Basic Techniques",
        description: "Learn basic kumite techniques and combinations (Sample video - Feature in development)",
        category: "kihon",
        filename: "https://www.youtube.com/embed/6jEoWCiMTI8",
        url: "https://www.youtube.com/embed/6jEoWCiMTI8",
        thumbnail: "https://img.youtube.com/vi/6jEoWCiMTI8/maxresdefault.jpg",
        duration: "10:34",
        license: "Sample Content",
        attribution: "YouTube Sample - Feature in Development",
        attributionUrl: "https://youtube.com",
        tags: ["kihon", "basic", "sample"],
        uploadDate: new Date().toISOString().split('T')[0],
        views: 890,
        isSample: true
    },
    {
        id: 3,
        title: "Basic Training - Seiken Tsuki",
        description: "Detailed explanation of proper form and practice methods (Sample video - Feature in development)",
        category: "kihon",
        filename: "https://www.youtube.com/embed/Bo_11Yy8z2Y",
        url: "https://www.youtube.com/embed/Bo_11Yy8z2Y",
        thumbnail: "https://img.youtube.com/vi/Bo_11Yy8z2Y/maxresdefault.jpg",
        duration: "4:33",
        license: "Sample Content",
        attribution: "YouTube Sample - Feature in Development",
        attributionUrl: "https://youtube.com",
        tags: ["kihon", "seiken", "tsuki", "sample"],
        uploadDate: new Date().toISOString().split('T')[0],
        views: 750,
        isSample: true
    }
];

let nextVideoId = 4;

// ユーザー認証システム用データ構造
let users = []; // ユーザーアカウント { id, username, email, password, displayName, createdAt, lastLogin }
let userPracticeRecords = {}; // ユーザー別練習記録 { userId: [records] }
// 🚫 userJournalEntries removed to eliminate 3-emoji modal issue
let userSettings = {}; // ユーザー別設定 { userId: settings }

let nextUserId = 1;

// 習慣化パッケージ用データ構造（グローバル - 後方互換性のため残す）
let practiceRecords = []; // 練習記録 { id, date, completed, timestamp }
// 🚫 journalEntries removed to eliminate 3-emoji modal issue
let globalUserSettings = { // グローバル設定（ゲストユーザー用）
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
// 🚫 nextJournalId removed to eliminate 3-emoji modal issue

// ==== Replit対応: ファイルベース永続化 ====
const DATA_FILE = 'userData.json';

// データをファイルに保存
function saveDataToFile() {
    try {
        const data = {
            users,
            userPracticeRecords,
            userSettings,
            practiceRecords,
            globalUserSettings,
            nextUserId,
            nextPracticeId,
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('✅ Data saved to file:', new Date().toLocaleString());
    } catch (error) {
        console.error('❌ Error saving data to file:', error);
    }
}

// ファイルからデータを読み込み
function loadDataFromFile() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            
            // データを復元
            users = data.users || [];
            userPracticeRecords = data.userPracticeRecords || {};
            userSettings = data.userSettings || {};
            practiceRecords = data.practiceRecords || [];
            globalUserSettings = data.globalUserSettings || {
                notifications: { enabled: true, time: '19:00', channels: { push: true, email: false } },
                streak: { current: 0, longest: 0, total: 0 }
            };
            nextUserId = data.nextUserId || 1;
            nextPracticeId = data.nextPracticeId || 1;
            
            console.log('✅ Data loaded from file:', {
                users: users.length,
                userRecords: Object.keys(userPracticeRecords).length,
                practiceRecords: practiceRecords.length,
                timestamp: data.timestamp
            });
        } else {
            console.log('📄 No existing data file found, starting fresh');
        }
    } catch (error) {
        console.error('❌ Error loading data from file:', error);
        console.log('🔄 Starting with default data');
    }
}

// データマイグレーション：既存記録にemotionフィールドを追加
function migrateExistingRecords() {
    console.log('🔄 Starting data migration for emotion fields...');
    
    let migrationCount = 0;
    
    // userPracticeRecordsをマイグレーション
    Object.keys(userPracticeRecords).forEach(userId => {
        userPracticeRecords[userId].forEach(record => {
            if (!record.emotion) {
                record.emotion = 'mood-1'; // デフォルト値を設定
                migrationCount++;
            }
        });
    });
    
    // practiceRecordsをマイグレーション
    practiceRecords.forEach(record => {
        if (!record.emotion) {
            record.emotion = 'mood-1'; // デフォルト値を設定
            migrationCount++;
        }
    });
    
    if (migrationCount > 0) {
        console.log(`✅ Migrated ${migrationCount} records with emotion fields`);
        saveDataToFile(); // マイグレーション後に保存
    } else {
        console.log('✅ No migration needed - all records already have emotion fields');
    }
}

// アプリ起動時にデータを読み込み
loadDataFromFile();

// データマイグレーションを実行
migrateExistingRecords();

// 定期的自動保存（5分毎）
setInterval(saveDataToFile, 5 * 60 * 1000);

// 管理者認証ミドルウェア
function requireAuth(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// ユーザー認証ミドルウェア
function requireUser(req, res, next) {
    if (req.session.userId) {
        req.userId = req.session.userId;
        next();
    } else {
        res.status(401).json({
            success: false,
            message: 'ログインが必要です',
            requireLogin: true
        });
    }
}

// オプショナルユーザー認証（ゲストも許可）
function optionalUser(req, res, next) {
    req.userId = req.session.userId || null;
    next();
}

// パスワードハッシュ化のヘルパー関数（簡易版）
function hashPassword(password) {
    // 実際の本番環境では bcrypt を使用
    return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}

// ユーザー用デフォルト設定
function createDefaultUserSettings() {
    return {
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

// ==== ユーザー認証システム API ====

// ユーザー登録
app.post('/api/user/register', (req, res) => {
    const { username, email, password, displayName } = req.body;
    
    // バリデーション
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'ユーザー名、メール、パスワードは必須です'
        });
    }
    
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'パスワードは6文字以上である必要があります'
        });
    }
    
    // 既存ユーザーチェック
    const existingUser = users.find(user => 
        user.username === username || user.email === email
    );
    
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: 'このユーザー名またはメールアドレスは既に使用されています'
        });
    }
    
    // 新しいユーザー作成
    const newUser = {
        id: nextUserId++,
        username: username,
        email: email,
        password: hashPassword(password),
        displayName: displayName || username,
        createdAt: new Date().toISOString(),
        lastLogin: null
    };
    
    users.push(newUser);
    
    // ユーザー専用データ初期化
    userPracticeRecords[newUser.id] = [];
    // 🚫 userJournalEntries removed to eliminate 3-emoji modal issue
    userSettings[newUser.id] = createDefaultUserSettings();
    
    // セッション設定（自動ログイン）
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    
    // データをファイルに保存
    saveDataToFile();
    
    res.json({
        success: true,
        message: 'アカウントが作成されました',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            displayName: newUser.displayName
        }
    });
});

// ユーザーログイン
app.post('/api/user/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'ユーザー名とパスワードを入力してください'
        });
    }
    
    // ユーザー検索（ユーザー名またはメールアドレス）
    const user = users.find(u => 
        u.username === username || u.email === username
    );
    
    if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({
            success: false,
            message: 'ユーザー名またはパスワードが間違っています'
        });
    }
    
    // ログイン時刻更新
    user.lastLogin = new Date().toISOString();
    
    // セッション設定
    req.session.userId = user.id;
    req.session.username = user.username;
    
    // データをファイルに保存
    saveDataToFile();
    
    res.json({
        success: true,
        message: 'ログインしました',
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            lastLogin: user.lastLogin
        }
    });
});

// ユーザーログアウト
app.post('/api/user/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'ログアウトに失敗しました'
            });
        }
        res.json({
            success: true,
            message: 'ログアウトしました'
        });
    });
});

// ユーザー情報取得
app.get('/api/user/profile', requireUser, (req, res) => {
    const user = users.find(u => u.id === req.userId);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'ユーザーが見つかりません'
        });
    }
    
    res.json({
        success: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }
    });
});

// ユーザーログイン状態チェック
app.get('/api/user/auth-status', (req, res) => {
    if (req.session.userId) {
        const user = users.find(u => u.id === req.session.userId);
        res.json({
            success: true,
            isLoggedIn: true,
            user: user ? {
                id: user.id,
                username: user.username,
                displayName: user.displayName
            } : null
        });
    } else {
        res.json({
            success: true,
            isLoggedIn: false,
            user: null
        });
    }
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

// ==== 習慣化パッケージ API (ユーザー対応) ====

// API: 今日の練習記録 (Today✓ボタン)
app.post('/api/practice/today', optionalUser, (req, res) => {
    // 🔧 FIX: Use local date instead of UTC to match frontend
    const todayDate = new Date();
    const today = `${todayDate.getFullYear()}-${todayDate.getMonth() + 1}-${todayDate.getDate()}`;
    console.log('🔍 Backend today date (local):', today);
    console.log('🔍 UTC comparison would be:', new Date().toISOString().split('T')[0]);
    const userId = req.userId;
    
    // ユーザー記録を取得（ログイン済みまたはゲスト）
    const records = userId ? userPracticeRecords[userId] : practiceRecords;
    const existingRecord = records.find(record => record.date === today);
    
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
        timestamp: new Date().toISOString(),
        userId: userId || null,
        emotion: 'mood-1' // デフォルトemotion値を追加
    };
    
    // ユーザー別記録に追加
    if (userId) {
        if (!userPracticeRecords[userId]) {
            userPracticeRecords[userId] = [];
        }
        userPracticeRecords[userId].push(newRecord);
        // ユーザー別ストリーク計算
        updateUserStreak(userId);
        const streak = userSettings[userId]?.streak || { current: 0, longest: 0, total: 0 };
        
        // データをファイルに保存
        saveDataToFile();
        
        res.json({
            success: true,
            message: '今日の練習を記録しました！',
            data: {
                record: newRecord,
                streak: streak
            },
            // CRITICAL: Explicitly prevent any modal triggers
            preventModal: true,
            skipJournal: true
        });
    } else {
        // ゲストユーザー（グローバル記録）
        practiceRecords.push(newRecord);
        updateStreak();
        
        // データをファイルに保存
        saveDataToFile();
        
        res.json({
            success: true,
            message: '今日の練習を記録しました！',
            data: {
                record: newRecord,
                streak: globalUserSettings.streak
            },
            // CRITICAL: Explicitly prevent any modal triggers
            preventModal: true,
            skipJournal: true
        });
    }
});

// API: ストリーク情報取得
app.get('/api/practice/streak', optionalUser, (req, res) => {
    const userId = req.userId;
    const streak = userId 
        ? userSettings[userId]?.streak || { current: 0, longest: 0, total: 0 }
        : globalUserSettings.streak;
    
    res.json({
        success: true,
        data: streak
    });
});

// API: 練習カレンダーデータ
app.get('/api/practice/calendar', optionalUser, (req, res) => {
    const { year, month } = req.query;
    const userId = req.userId;
    
    let allRecords = userId ? userPracticeRecords[userId] || [] : practiceRecords;
    let filteredRecords = allRecords;
    
    if (year && month) {
        // 🔧 FIX: 両方の日付形式（ゼロパディングありとなし）をサポート
        const filterDatePadded = `${year}-${month.padStart(2, '0')}`;
        const filterDateNoPad = `${year}-${month}`;
        
        console.log('🔍 Filtering calendar data:', {
            year,
            month,
            filterDatePadded,
            filterDateNoPad,
            allRecordsCount: allRecords.length,
            allRecords: allRecords.map(r => ({ date: r.date, emotion: r.emotion }))
        });
        
        filteredRecords = allRecords.filter(record => 
            record.date.startsWith(filterDatePadded) || 
            record.date.startsWith(filterDateNoPad)
        );
        
        console.log('🔍 Filtered records:', filteredRecords.length, filteredRecords);
    }
    
    res.json({
        success: true,
        data: filteredRecords.map(record => ({
            date: record.date,
            completed: record.completed,
            title: '練習完了',
            emotion: record.emotion || 'mood-1' // デフォルトemotionを追加
        }))
    });
});

// 🚫 Journal API removed to eliminate 3-emoji modal issue

// API: 練習記録のemotion更新
app.put('/api/practice/emotion', optionalUser, (req, res) => {
    const { date, emotion, comment } = req.body;
    const userId = req.userId;
    
    if (!date || !emotion) {
        return res.status(400).json({
            success: false,
            message: '日付と感情は必須です'
        });
    }
    
    // ユーザー記録を取得（ログイン済みまたはゲスト）
    let records;
    if (userId) {
        // ユーザー記録を初期化（存在しない場合）
        if (!userPracticeRecords[userId]) {
            userPracticeRecords[userId] = [];
        }
        records = userPracticeRecords[userId];
    } else {
        // ゲストユーザーの場合はglobal practiceRecordsを使用
        records = practiceRecords;
    }
    
    // 該当日の記録を検索
    let existingRecord = records.find(record => record.date === date);
    
    if (existingRecord) {
        // 既存の記録のemotionを更新
        existingRecord.emotion = emotion;
        if (comment !== undefined) {
            existingRecord.comment = comment;
        }
    } else {
        // 新しい記録を作成
        const newRecord = {
            id: nextPracticeId++,
            date: date,
            completed: true,
            timestamp: new Date().toISOString(),
            userId: userId || null,
            emotion: emotion,
            comment: comment || ''
        };
        
        if (userId) {
            if (!userPracticeRecords[userId]) {
                userPracticeRecords[userId] = [];
            }
            userPracticeRecords[userId].push(newRecord);
        } else {
            practiceRecords.push(newRecord);
        }
        
        existingRecord = newRecord;
    }
    
    // データをファイルに保存
    saveDataToFile();
    
    res.json({
        success: true,
        message: '感情記録を更新しました',
        data: {
            date: existingRecord.date,
            emotion: existingRecord.emotion,
            comment: existingRecord.comment || ''
        }
    });
});

// 🔧 DEBUG: データベース状況確認用API
app.get('/api/debug/data', optionalUser, (req, res) => {
    const userId = req.userId;
    
    const debugInfo = {
        userId: userId,
        isLoggedIn: !!userId,
        userPracticeRecordsKeys: Object.keys(userPracticeRecords),
        practiceRecordsCount: practiceRecords.length,
        userRecordsCount: userId ? (userPracticeRecords[userId] || []).length : 0,
        practiceRecords: practiceRecords,
        userRecords: userId ? userPracticeRecords[userId] : null,
        allUserRecords: userPracticeRecords
    };
    
    console.log('🔍 Debug data info:', debugInfo);
    
    res.json({
        success: true,
        debug: debugInfo
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

// ストリーク計算ヘルパー関数（グローバル用）
function updateStreak() {
    const sortedRecords = practiceRecords
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedRecords.length === 0) {
        globalUserSettings.streak = { current: 0, longest: 0, total: 0 };
        return;
    }
    
    const streak = calculateStreakFromRecords(sortedRecords);
    globalUserSettings.streak = streak;
}

// ユーザー別ストリーク計算ヘルパー関数
function updateUserStreak(userId) {
    if (!userPracticeRecords[userId]) {
        userSettings[userId].streak = { current: 0, longest: 0, total: 0 };
        return;
    }
    
    const sortedRecords = userPracticeRecords[userId]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedRecords.length === 0) {
        userSettings[userId].streak = { current: 0, longest: 0, total: 0 };
        return;
    }
    
    const streak = calculateStreakFromRecords(sortedRecords);
    userSettings[userId].streak = streak;
}

// 共通ストリーク計算ロジック
function calculateStreakFromRecords(sortedRecords) {
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
    
    return {
        current: currentStreak,
        longest: Math.max(longestStreak, currentStreak),
        total: sortedRecords.length
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
    console.log('- ファイルベース永続化（Replit対応）');
    console.log('');
    console.log('注意: FFmpeg動画編集機能は除外（Replit制限のため）');
});

// 🛡️ Replit対応: グレースフルシャットダウン時のデータ保存
process.on('SIGINT', () => {
    console.log('\n📄 アプリケーション終了中...');
    saveDataToFile();
    console.log('✅ データを保存しました');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n📄 アプリケーション終了中...');
    saveDataToFile();
    console.log('✅ データを保存しました');
    process.exit(0);
});