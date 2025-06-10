// 空手動画サービスのメインJavaScriptファイル

class KarateVideoService {
    constructor() {
        this.currentVideo = null;
        this.isMirrored = false;
        this.currentSpeed = 1;
        this.showSubtitles = false;
        this.videos = [];
        
        // 習慣化パッケージ関連
        this.streakData = { current: 0, longest: 0, total: 0 };
        this.todayCompleted = false;
        
        this.init();
    }

    init() {
        this.loadSampleVideos();
        this.setupEventListeners();
        this.setupVideoControls();
        this.setupSmoothScrolling();
        this.setupVideoLibrary();
        
        // 習慣化パッケージ初期化
        this.initHabitDashboard();
    }

    // サンプル動画データを読み込み（実際のCC-BY動画のメタデータ）
    loadSampleVideos() {
        this.videos = [
            {
                id: 1,
                title: "空手基本型 - 平安初段",
                description: "伝統的な空手の型、平安初段の完全な演武です。",
                category: "kata",
                url: "/videos/sample1.mp4", // 実際のCC-BY動画URLに置き換え
                thumbnail: "/images/kata1.jpg",
                duration: "3:25",
                license: "CC BY 4.0",
                attribution: "作成者: Traditional Karate Foundation"
            },
            {
                id: 2,
                title: "組手基本技術",
                description: "基本的な組手の技術とコンビネーションを学習します。",
                category: "kumite",
                url: "/videos/sample2.mp4",
                thumbnail: "/images/kumite1.jpg",
                duration: "5:12",
                license: "CC BY 4.0",
                attribution: "作成者: Karate Training Academy"
            },
            {
                id: 3,
                title: "基本稽古 - 正拳突き",
                description: "正拳突きの正しいフォームと練習方法を詳しく解説。",
                category: "kihon",
                url: "/videos/sample3.mp4",
                thumbnail: "/images/kihon1.jpg",
                duration: "4:33",
                license: "CC BY 4.0",
                attribution: "作成者: Martial Arts Education"
            }
        ];

        this.renderVideoGrid();
    }

    // 動画グリッドをレンダリング
    renderVideoGrid() {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;

        videoGrid.innerHTML = this.videos.map(video => `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-thumbnail" onclick="karateService.playVideo('${video.url}', '${video.title}')">
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    <!-- 実際の実装では動画のサムネイルを表示 -->
                    <div style="width: 100%; height: 100%; background: linear-gradient(45deg, #c41e3a, #8b0000); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                        <i class="fas fa-fist-raised"></i>
                    </div>
                </div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p>${video.description}</p>
                    <div class="video-meta">
                        <span><i class="fas fa-clock"></i> ${video.duration}</span>
                        <span class="license-badge">${video.license}</span>
                    </div>
                    <div class="attribution" style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">
                        ${video.attribution}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 動画を再生
    playVideo(url, title) {
        const playerVideo = document.getElementById('playerVideo');
        if (!playerVideo) return;

        this.currentVideo = { url, title };
        
        // 実際のCC-BY動画URLを設定
        playerVideo.src = url;
        playerVideo.load();
        
        // エディターセクションにスクロール
        document.getElementById('editor').scrollIntoView({ 
            behavior: 'smooth' 
        });

        // 通知表示
        this.showNotification(`動画「${title}」を読み込みました`, 'success');
    }

    // 動画コントロールの設定
    setupVideoControls() {
        const playerVideo = document.getElementById('playerVideo');
        const mirrorBtn = document.getElementById('mirrorBtn');
        const slowBtn = document.getElementById('slowBtn');
        const normalBtn = document.getElementById('normalBtn');
        const subtitleBtn = document.getElementById('subtitleBtn');
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');

        if (!playerVideo) return;

        // 鏡映し機能
        mirrorBtn?.addEventListener('click', () => {
            this.isMirrored = !this.isMirrored;
            playerVideo.style.transform = this.isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
            mirrorBtn.classList.toggle('active', this.isMirrored);
            this.showNotification(
                this.isMirrored ? '鏡映し表示を有効にしました' : '鏡映し表示を無効にしました'
            );
        });

        // スロー再生
        slowBtn?.addEventListener('click', () => {
            this.currentSpeed = 0.5;
            playerVideo.playbackRate = this.currentSpeed;
            this.updateSpeedDisplay();
            this.updateSpeedButtons();
            this.showNotification('スロー再生に切り替えました (0.5x)');
        });

        // 通常再生
        normalBtn?.addEventListener('click', () => {
            this.currentSpeed = 1;
            playerVideo.playbackRate = this.currentSpeed;
            this.updateSpeedDisplay();
            this.updateSpeedButtons();
            this.showNotification('通常再生に切り替えました (1x)');
        });

        // 字幕切り替え
        subtitleBtn?.addEventListener('click', () => {
            this.showSubtitles = !this.showSubtitles;
            subtitleBtn.classList.toggle('active', this.showSubtitles);
            this.toggleSubtitles();
            this.showNotification(
                this.showSubtitles ? '字幕表示を有効にしました' : '字幕表示を無効にしました'
            );
        });

        // 速度スライダー
        speedSlider?.addEventListener('input', (e) => {
            this.currentSpeed = parseFloat(e.target.value);
            playerVideo.playbackRate = this.currentSpeed;
            this.updateSpeedDisplay();
            this.updateSpeedButtons();
        });

        // ダウンロードボタン（実際の実装では動画編集とダウンロード機能が必要）
        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            this.downloadEditedVideo();
        });
    }

    // 速度表示の更新
    updateSpeedDisplay() {
        const speedValue = document.getElementById('speedValue');
        if (speedValue) {
            speedValue.textContent = `${this.currentSpeed}x`;
        }
        
        const speedSlider = document.getElementById('speedSlider');
        if (speedSlider) {
            speedSlider.value = this.currentSpeed;
        }
    }

    // 速度ボタンの状態更新
    updateSpeedButtons() {
        const slowBtn = document.getElementById('slowBtn');
        const normalBtn = document.getElementById('normalBtn');
        
        slowBtn?.classList.toggle('active', this.currentSpeed === 0.5);
        normalBtn?.classList.toggle('active', this.currentSpeed === 1);
    }

    // 字幕の表示/非表示
    toggleSubtitles() {
        const playerVideo = document.getElementById('playerVideo');
        let subtitleOverlay = document.querySelector('.subtitle-overlay');
        
        if (this.showSubtitles) {
            if (!subtitleOverlay) {
                subtitleOverlay = document.createElement('div');
                subtitleOverlay.className = 'subtitle-overlay';
                playerVideo.parentElement.style.position = 'relative';
                playerVideo.parentElement.appendChild(subtitleOverlay);
            }
            
            const subtitleText = document.getElementById('subtitleText').value || 
                '技の名前や説明がここに表示されます';
            subtitleOverlay.textContent = subtitleText;
            subtitleOverlay.style.display = 'block';
        } else {
            if (subtitleOverlay) {
                subtitleOverlay.style.display = 'none';
            }
        }
    }

    // 編集された動画のダウンロード（模擬実装）
    downloadEditedVideo() {
        if (!this.currentVideo) {
            this.showNotification('動画が選択されていません', 'error');
            return;
        }

        this.showNotification('動画の編集とダウンロードを準備中...', 'info');
        
        // 実際の実装では、FFmpegを使用してサーバーサイドで動画を編集
        setTimeout(() => {
            this.showNotification('編集機能は開発中です。近日公開予定！', 'info');
        }, 2000);
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // カテゴリフィルター
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter?.addEventListener('change', (e) => {
            this.filterVideos(e.target.value);
        });

        // 表示オプションボタン
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const viewType = e.target.dataset.view;
                this.applyViewOption(viewType);
            });
        });

        // 字幕テキストの変更
        const subtitleText = document.getElementById('subtitleText');
        subtitleText?.addEventListener('input', () => {
            if (this.showSubtitles) {
                this.toggleSubtitles();
            }
        });
    }

    // 動画フィルタリング
    filterVideos(category) {
        const filteredVideos = category === 'all' 
            ? this.videos 
            : this.videos.filter(video => video.category === category);
        
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;

        videoGrid.innerHTML = filteredVideos.map(video => `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-thumbnail" onclick="karateService.playVideo('${video.url}', '${video.title}')">
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    <div style="width: 100%; height: 100%; background: linear-gradient(45deg, #c41e3a, #8b0000); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                        <i class="fas fa-fist-raised"></i>
                    </div>
                </div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p>${video.description}</p>
                    <div class="video-meta">
                        <span><i class="fas fa-clock"></i> ${video.duration}</span>
                        <span class="license-badge">${video.license}</span>
                    </div>
                    <div class="attribution" style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">
                        ${video.attribution}
                    </div>
                </div>
            </div>
        `).join('');

        this.showNotification(`${filteredVideos.length}件の動画を表示中`);
    }

    // 表示オプションの適用
    applyViewOption(viewType) {
        const playerVideo = document.getElementById('playerVideo');
        if (!playerVideo) return;

        switch(viewType) {
            case 'mirror':
                if (!this.isMirrored) {
                    document.getElementById('mirrorBtn')?.click();
                }
                break;
            case 'slow':
                document.getElementById('slowBtn')?.click();
                break;
            case 'subtitles':
                if (!this.showSubtitles) {
                    document.getElementById('subtitleBtn')?.click();
                }
                break;
        }
    }

    // スムーススクロールの設定
    setupSmoothScrolling() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ライブラリセクションを表示
    showLibrary() {
        document.getElementById('library').scrollIntoView({
            behavior: 'smooth'
        });
    }

    // 通知システム
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            ${type === 'success' ? 'background: #10b981;' : ''}
            ${type === 'error' ? 'background: #ef4444;' : ''}
            ${type === 'info' ? 'background: #3b82f6;' : ''}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Video Library Setup
    setupVideoLibrary() {
        this.loadVideosFromAPI();
        this.setupVideoLibraryEvents();
    }

    // Load videos from API
    async loadVideosFromAPI() {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) {
            console.error('videoGrid element not found');
            return;
        }

        try {
            console.log('Loading videos from API...');
            videoGrid.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading videos...</div>';
            
            const response = await fetch('/api/videos');
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API result:', result);
            
            if (result.success) {
                this.apiVideos = result.data;
                console.log('Loaded videos:', this.apiVideos.length);
                this.displayVideos(result.data);
            } else {
                console.error('API returned success:false');
                videoGrid.innerHTML = '<div class="no-videos-message">動画の読み込みに失敗しました</div>';
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            videoGrid.innerHTML = `<div class="no-videos-message">動画の読み込み中にエラーが発生しました: ${error.message}</div>`;
        }
    }

    // Display videos in grid
    displayVideos(videos) {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;

        if (videos.length === 0) {
            videoGrid.innerHTML = '<div class="no-videos-message">表示する動画がありません</div>';
            return;
        }

        videoGrid.innerHTML = videos.map(video => `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-thumbnail" onclick="karateService.playVideoFromAPI(${video.id})">
                    ${video.filename ? `
                        <video class="video-preview" preload="metadata">
                            <source src="/uploads/${video.filename}" type="video/mp4">
                        </video>
                    ` : ''}
                    <button class="play-overlay">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${this.escapeHtml(video.title)}</h3>
                    <p class="video-description">${this.escapeHtml(video.description)}</p>
                    <div class="video-meta">
                        <span class="video-category ${video.category}">${this.getCategoryName(video.category)}</span>
                        <span class="video-duration">${video.duration || '不明'}</span>
                    </div>
                    <div class="video-attribution">
                        CC-BY: ${this.escapeHtml(video.attribution)}
                    </div>
                    <div class="video-views">
                        <i class="fas fa-eye"></i> ${video.views.toLocaleString()} views
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Setup video library event listeners
    setupVideoLibraryEvents() {
        // Category filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const category = e.target.dataset.category;
                this.filterVideosByCategory(category);
            });
        });

        // Search input
        const searchInput = document.getElementById('videoSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchVideos(e.target.value);
                }, 300);
            });
        }
    }

    // Filter videos by category
    filterVideosByCategory(category) {
        if (!this.apiVideos) return;

        const filteredVideos = category === 'all' 
            ? this.apiVideos 
            : this.apiVideos.filter(video => video.category === category);
        
        this.displayVideos(filteredVideos);
    }

    // Search videos
    searchVideos(query) {
        if (!this.apiVideos) return;

        if (!query.trim()) {
            this.displayVideos(this.apiVideos);
            return;
        }

        const searchTerm = query.toLowerCase();
        const filteredVideos = this.apiVideos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) ||
            video.description.toLowerCase().includes(searchTerm) ||
            video.attribution.toLowerCase().includes(searchTerm)
        );
        
        this.displayVideos(filteredVideos);
    }

    // Play video from API
    async playVideoFromAPI(videoId) {
        try {
            // Increment view count
            await fetch(`/api/videos/${videoId}`, {
                method: 'GET'
            });

            // Find and play the actual video
            const video = this.apiVideos.find(v => v.id === videoId);
            if (video && video.filename) {
                this.loadVideoPlayer(video);
                this.showNotification(`再生中: ${video.title}`, 'success');
            } else {
                this.showNotification('動画ファイルが見つかりません', 'error');
            }
        } catch (error) {
            console.error('Error playing video:', error);
            this.showNotification('動画の再生に失敗しました', 'error');
        }
    }

    // Load video into player
    loadVideoPlayer(video) {
        const playerVideo = document.getElementById('playerVideo');
        if (!playerVideo) {
            this.showNotification('動画プレイヤーが見つかりません', 'error');
            return;
        }

        this.currentVideo = video;
        
        // Set video source
        playerVideo.src = `/uploads/${video.filename}`;
        playerVideo.load();
        
        // Scroll to editor section
        document.getElementById('editor').scrollIntoView({ 
            behavior: 'smooth' 
        });

        // Update player title
        const editorTitle = document.querySelector('#editor h2');
        if (editorTitle) {
            editorTitle.textContent = `動画編集ツール - ${video.title}`;
        }
    }

    // Utility functions
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    getCategoryName(category) {
        const names = {
            'kata': 'Kata',
            'kumite': 'Kumite',
            'kihon': 'Kihon'
        };
        return names[category] || category;
    }
}

// グローバル関数
function showLibrary() {
    document.getElementById('library').scrollIntoView({
        behavior: 'smooth'
    });
}

// DOMの読み込み完了時にサービスを初期化
document.addEventListener('DOMContentLoaded', () => {
    window.karateService = new KarateVideoService();
    
    // ナビゲーションのスクロールエフェクト
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // フェードインアニメーション
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .video-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
});

// ==== 習慣化パッケージ機能 ====

// 習慣化ダッシュボード初期化
KarateVideoService.prototype.initHabitDashboard = function() {
    this.loadStreakData();
    this.loadMonthlyPhrase();
    this.setupTodayPracticeButton();
    this.renderMiniCalendar();
    this.setupJournalModal();
};

// ストリークデータの読み込み
KarateVideoService.prototype.loadStreakData = async function() {
    try {
        const response = await fetch('/api/practice/streak');
        const result = await response.json();
        
        if (result.success) {
            this.streakData = result.data;
            this.updateStreakDisplay();
        }
    } catch (error) {
        console.error('Error loading streak data:', error);
    }
    
    // 今日の練習状況確認
    await this.checkTodayStatus();
};

// ストリーク表示の更新
KarateVideoService.prototype.updateStreakDisplay = function() {
    const currentStreakEl = document.getElementById('currentStreak');
    const longestStreakEl = document.getElementById('longestStreak');
    const totalPracticeEl = document.getElementById('totalPractice');
    
    if (currentStreakEl) currentStreakEl.textContent = this.streakData.current;
    if (longestStreakEl) longestStreakEl.textContent = this.streakData.longest;
    if (totalPracticeEl) totalPracticeEl.textContent = this.streakData.total;
};

// 今日の練習状況チェック
KarateVideoService.prototype.checkTodayStatus = async function() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/practice/calendar?year=${today.split('-')[0]}&month=${today.split('-')[1]}`);
        const result = await response.json();
        
        if (result.success) {
            this.todayCompleted = result.data.some(record => record.date === today);
            this.updateTodayButton();
        }
    } catch (error) {
        console.error('Error checking today status:', error);
    }
};

// Today練習ボタンの設定
KarateVideoService.prototype.setupTodayPracticeButton = function() {
    const todayBtn = document.getElementById('todayPracticeBtn');
    if (!todayBtn) return;
    
    todayBtn.addEventListener('click', async () => {
        if (this.todayCompleted) return;
        
        try {
            todayBtn.disabled = true;
            todayBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recording...';
            
            const response = await fetch('/api/practice/today', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.todayCompleted = true;
                this.streakData = result.data.streak;
                this.updateTodayButton();
                this.updateStreakDisplay();
                this.renderMiniCalendar();
                this.showNotification('🎉 ' + result.message, 'success');
                
                // 練習後の日記モーダルを表示
                setTimeout(() => {
                    this.showJournalModal();
                }, 1000);
            } else {
                this.showNotification(result.message, 'error');
                todayBtn.disabled = false;
                this.updateTodayButton();
            }
        } catch (error) {
            console.error('Error recording practice:', error);
            this.showNotification('記録に失敗しました', 'error');
            todayBtn.disabled = false;
            this.updateTodayButton();
        }
    });
};

// Today ボタンの状態更新
KarateVideoService.prototype.updateTodayButton = function() {
    const todayBtn = document.getElementById('todayPracticeBtn');
    const statusEl = document.getElementById('todayStatus');
    
    if (!todayBtn || !statusEl) return;
    
    if (this.todayCompleted) {
        todayBtn.innerHTML = '<i class="fas fa-check"></i> <span>Today Complete!</span>';
        todayBtn.disabled = true;
        statusEl.innerHTML = '<span class="status-text" style="color: #22c55e;">Great job! See you tomorrow 🎉</span>';
    } else {
        todayBtn.innerHTML = '<i class="fas fa-check"></i> <span>Mark Today Complete</span>';
        todayBtn.disabled = false;
        statusEl.innerHTML = '<span class="status-text">Ready to practice!</span>';
    }
};

// 月替わりフレーズの読み込み
KarateVideoService.prototype.loadMonthlyPhrase = async function() {
    try {
        const response = await fetch('/api/phrase/current');
        const result = await response.json();
        
        const phraseEl = document.getElementById('monthlyPhrase');
        if (!phraseEl) return;
        
        if (result.success && result.data) {
            const phrase = result.data;
            phraseEl.innerHTML = `
                <div class="phrase-content">
                    <div class="phrase-japanese">${phrase.japanese}</div>
                    <div class="phrase-romaji">${phrase.romaji}</div>
                    <div class="phrase-english">"${phrase.english}"</div>
                    <div class="phrase-explanation">${phrase.explanation}</div>
                </div>
            `;
        } else {
            phraseEl.innerHTML = `
                <div class="phrase-content">
                    <div class="phrase-english">New phrase coming soon...</div>
                    <div class="phrase-explanation">Check back next month for wisdom from the masters.</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading monthly phrase:', error);
    }
};

// ミニカレンダーのレンダリング
KarateVideoService.prototype.renderMiniCalendar = async function() {
    const calendarEl = document.getElementById('miniCalendar');
    if (!calendarEl) return;
    
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        
        const response = await fetch(`/api/practice/calendar?year=${year}&month=${month}`);
        const result = await response.json();
        
        if (result.success) {
            const practiceData = result.data;
            const calendar = this.generateMiniCalendar(year, month, practiceData);
            calendarEl.innerHTML = calendar;
        }
    } catch (error) {
        console.error('Error rendering mini calendar:', error);
    }
};

// ミニカレンダーのHTML生成
KarateVideoService.prototype.generateMiniCalendar = function(year, month, practiceData) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date().toISOString().split('T')[0];
    const practiceMap = {};
    practiceData.forEach(record => {
        practiceMap[record.date] = record.completed;
    });
    
    let calendarHTML = `
        <div class="calendar-header">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
    `;
    
    for (let week = 0; week < 6; week++) {
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + week * 7 + day);
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayNum = currentDate.getDate();
            
            let className = 'calendar-day';
            if (currentDate.getMonth() !== month - 1) {
                className += ' other-month';
            }
            if (dateStr === today) {
                className += ' today';
            }
            if (practiceMap[dateStr]) {
                className += ' completed';
            }
            
            calendarHTML += `<div class="${className}">${dayNum}</div>`;
        }
        
        if (startDate.getMonth() !== month - 1 && week > 2) break;
        startDate.setDate(startDate.getDate() + 7);
    }
    
    return calendarHTML;
};

// 練習後日記モーダルの設定
KarateVideoService.prototype.setupJournalModal = function() {
    // HTML に日記モーダルを追加
    const modal = document.createElement('div');
    modal.className = 'journal-modal';
    modal.id = 'journalModal';
    modal.innerHTML = `
        <div class="journal-content">
            <div class="journal-header">
                <h3>How was your practice today?</h3>
                <p>Reflect on your training session</p>
            </div>
            
            <div class="mood-selector">
                <button class="mood-option" data-mood="happy">😊</button>
                <button class="mood-option" data-mood="neutral">😐</button>
                <button class="mood-option" data-mood="tired">😫</button>
            </div>
            
            <textarea class="journal-text" id="journalText" placeholder="What did you learn today? How did you feel? Any challenges or breakthroughs? (optional)" maxlength="140"></textarea>
            
            <div class="journal-actions">
                <button class="journal-cancel" onclick="karateService.hideJournalModal()">Skip</button>
                <button class="journal-save" onclick="karateService.saveJournal()">Save Reflection</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // ムード選択の設定
    modal.querySelectorAll('.mood-option').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.mood-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    // モーダル外クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            this.hideJournalModal();
        }
    });
};

// 日記モーダル表示
KarateVideoService.prototype.showJournalModal = function() {
    const modal = document.getElementById('journalModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('journalText').focus();
    }
};

// 日記モーダル非表示
KarateVideoService.prototype.hideJournalModal = function() {
    const modal = document.getElementById('journalModal');
    if (modal) {
        modal.classList.remove('active');
        // フォームリセット
        modal.querySelectorAll('.mood-option').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('journalText').value = '';
    }
};

// 日記保存
KarateVideoService.prototype.saveJournal = async function() {
    const modal = document.getElementById('journalModal');
    const selectedMood = modal.querySelector('.mood-option.selected');
    const journalText = document.getElementById('journalText').value;
    
    if (!selectedMood) {
        this.showNotification('ムードを選択してください', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mood: selectedMood.dataset.mood,
                text: journalText,
                videoId: this.currentVideo?.id || null
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            this.showNotification('練習の振り返りを保存しました！', 'success');
            this.hideJournalModal();
        } else {
            this.showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error saving journal:', error);
        this.showNotification('保存に失敗しました', 'error');
    }
};

// フルカレンダー表示（将来の実装）
function showFullCalendar() {
    window.karateService.showNotification('フルカレンダー機能は近日公開予定です', 'info');
}