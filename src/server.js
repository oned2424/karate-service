const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs');

// FFmpegのパスを設定
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, '../public')));
app.use('/styles', express.static(path.join(__dirname, '../assets/styles')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));

// Admin routes
app.get('/admin', (req, res) => {
    res.redirect('/admin/');
});

app.get('/admin/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// ファイルアップロード設定
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
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
        // 動画ファイルのみ許可
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('動画ファイルのみアップロード可能です'), false);
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB制限
    }
});

// CC-BYライセンス動画のサンプルデータベース
const ccByVideos = [
    {
        id: 1,
        title: "空手基本型 - 平安初段",
        description: "伝統的な空手の型、平安初段の完全な演武です。基本的な動作を学習するのに最適です。",
        category: "kata",
        filename: "heian_shodan.mp4",
        duration: "3:25",
        license: "CC BY 4.0",
        attribution: "Traditional Karate Foundation",
        attributionUrl: "https://example.com/traditional-karate",
        tags: ["初心者", "型", "基本"],
        uploadDate: "2024-01-15",
        views: 1250
    },
    {
        id: 2,
        title: "組手基本技術",
        description: "基本的な組手の技術とコンビネーションを学習します。攻撃と防御の基本を習得できます。",
        category: "kumite",
        filename: "kumite_basic.mp4",
        duration: "5:12",
        license: "CC BY 4.0",
        attribution: "Karate Training Academy",
        attributionUrl: "https://example.com/karate-academy",
        tags: ["組手", "基本", "コンビネーション"],
        uploadDate: "2024-01-20",
        views: 890
    },
    {
        id: 3,
        title: "基本稽古 - 正拳突き",
        description: "正拳突きの正しいフォームと練習方法を詳しく解説。力の伝達と正確性を重視した指導です。",
        category: "kihon",
        filename: "seiken_tsuki.mp4",
        duration: "4:33",
        license: "CC BY 4.0",
        attribution: "Martial Arts Education",
        attributionUrl: "https://example.com/martial-arts-edu",
        tags: ["基本", "突き", "フォーム"],
        uploadDate: "2024-02-01",
        views: 1580
    }
];

// ルート定義

// メインページ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 動画リストAPI
app.get('/api/videos', (req, res) => {
    const { category, search } = req.query;
    
    let filteredVideos = ccByVideos;
    
    // カテゴリフィルター
    if (category && category !== 'all') {
        filteredVideos = filteredVideos.filter(video => video.category === category);
    }
    
    // 検索フィルター
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredVideos = filteredVideos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) ||
            video.description.toLowerCase().includes(searchTerm) ||
            video.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    res.json({
        success: true,
        data: filteredVideos,
        total: filteredVideos.length
    });
});

// 特定動画の詳細情報API
app.get('/api/videos/:id', (req, res) => {
    const videoId = parseInt(req.params.id);
    const video = ccByVideos.find(v => v.id === videoId);
    
    if (!video) {
        return res.status(404).json({
            success: false,
            message: '動画が見つかりません'
        });
    }
    
    // 視聴回数を増加
    video.views += 1;
    
    res.json({
        success: true,
        data: video
    });
});

// 動画編集API
app.post('/api/videos/:id/edit', upload.none(), async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const video = ccByVideos.find(v => v.id === videoId);
        
        if (!video) {
            return res.status(404).json({
                success: false,
                message: '動画が見つかりません'
            });
        }
        
        const {
            mirror = false,
            speed = 1,
            subtitles = '',
            startTime = 0,
            endTime = null
        } = req.body;
        
        const inputPath = path.join(__dirname, '../assets/videos', video.filename);
        const outputFilename = `edited_${video.id}_${Date.now()}.mp4`;
        const outputPath = path.join(__dirname, '../uploads', outputFilename);
        
        // FFmpegコマンドを構築
        let ffmpegCommand = ffmpeg(inputPath);
        
        // 速度調整
        if (speed !== 1) {
            ffmpegCommand = ffmpegCommand.videoFilters(`setpts=${1/speed}*PTS`);
        }
        
        // 鏡映し効果
        if (mirror) {
            ffmpegCommand = ffmpegCommand.videoFilters('hflip');
        }
        
        // 時間範囲の指定
        if (startTime > 0) {
            ffmpegCommand = ffmpegCommand.seekInput(startTime);
        }
        
        if (endTime) {
            ffmpegCommand = ffmpegCommand.duration(endTime - startTime);
        }
        
        // 字幕の追加（簡易版）
        if (subtitles) {
            const subtitleFilter = `drawtext=text='${subtitles}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=h-th-20`;
            ffmpegCommand = ffmpegCommand.videoFilters(subtitleFilter);
        }
        
        // 動画を処理
        ffmpegCommand
            .output(outputPath)
            .on('end', () => {
                res.json({
                    success: true,
                    message: '動画編集が完了しました',
                    downloadUrl: `/api/download/${outputFilename}`,
                    filename: outputFilename
                });
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                res.status(500).json({
                    success: false,
                    message: '動画編集中にエラーが発生しました',
                    error: err.message
                });
            })
            .run();
            
    } catch (error) {
        console.error('Video editing error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
});

// 動画更新API
app.put('/api/videos/:id', (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const videoIndex = ccByVideos.findIndex(v => v.id === videoId);
        
        if (videoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '動画が見つかりません'
            });
        }
        
        const { title, description, category } = req.body;
        
        // 動画情報を更新
        if (title) ccByVideos[videoIndex].title = title;
        if (description) ccByVideos[videoIndex].description = description;
        if (category) ccByVideos[videoIndex].category = category;
        
        res.json({
            success: true,
            message: '動画が更新されました',
            data: ccByVideos[videoIndex]
        });
        
    } catch (error) {
        console.error('Video update error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
});

// 動画削除API
app.delete('/api/videos/:id', (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const videoIndex = ccByVideos.findIndex(v => v.id === videoId);
        
        if (videoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '動画が見つかりません'
            });
        }
        
        const video = ccByVideos[videoIndex];
        
        // ファイルを削除
        const filePath = path.join(__dirname, '../uploads', video.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // 配列から削除
        ccByVideos.splice(videoIndex, 1);
        
        res.json({
            success: true,
            message: '動画が削除されました'
        });
        
    } catch (error) {
        console.error('Video delete error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
});

// 編集済み動画のダウンロード
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'ファイルが見つかりません'
        });
    }
    
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).json({
                success: false,
                message: 'ダウンロード中にエラーが発生しました'
            });
        }
        
        // ダウンロード後にファイルを削除（オプション）
        setTimeout(() => {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('File cleanup error:', unlinkErr);
                }
            });
        }, 60000); // 1分後に削除
    });
});

// 動画アップロードAPI（CC-BYライセンス動画のみ）
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
            // アップロードされたファイルを削除
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'CC-BYライセンスの動画のみアップロード可能です'
            });
        }
        
        // 新しい動画エントリを作成
        const newVideo = {
            id: ccByVideos.length + 1,
            title: title || 'タイトル未設定',
            description: description || '',
            category: category || 'kihon',
            filename: req.file.filename,
            license: license,
            attribution: attribution || '不明',
            attributionUrl: attributionUrl || '',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadDate: new Date().toISOString().split('T')[0],
            views: 0
        };
        
        // 動画の長さを取得
        ffmpeg.ffprobe(req.file.path, (err, metadata) => {
            if (err) {
                console.error('FFprobe error:', err);
                newVideo.duration = '不明';
            } else {
                const duration = metadata.format.duration;
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                newVideo.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            ccByVideos.push(newVideo);
            
            res.json({
                success: true,
                message: '動画がアップロードされました',
                data: newVideo
            });
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

// ライセンス情報API
app.get('/api/licenses', (req, res) => {
    res.json({
        success: true,
        data: {
            'CC BY 4.0': {
                name: 'Creative Commons Attribution 4.0 International',
                description: '作品を自由に共有・改変できます。適切な帰属表示が必要です。',
                url: 'https://creativecommons.org/licenses/by/4.0/',
                requirements: [
                    '作者名の明記',
                    'ライセンス名の明記',
                    'オリジナル作品へのリンク'
                ]
            }
        }
    });
});

// 統計情報API
app.get('/api/stats', (req, res) => {
    const totalVideos = ccByVideos.length;
    const totalViews = ccByVideos.reduce((sum, video) => sum + video.views, 0);
    const categoryCounts = ccByVideos.reduce((counts, video) => {
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

// エラーハンドリング
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'ファイルサイズが大きすぎます（最大100MB）'
            });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました',
        error: error.message
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
app.listen(PORT, () => {
    console.log(`🥋 空手動画サービスがポート ${PORT} で起動しました`);
    console.log(`   http://localhost:${PORT}`);
    console.log('');
    console.log('利用可能な機能:');
    console.log('- CC-BY動画のキュレーション');
    console.log('- 鏡映し表示');
    console.log('- スロー/倍速再生');
    console.log('- 字幕表示');
    console.log('- 動画編集・ダウンロード');
});