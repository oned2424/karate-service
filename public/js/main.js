// Main JavaScript file for Karate Video Service

class KarateVideoService {
    constructor() {
        this.currentVideo = null;
        this.isMirrored = false;
        this.currentSpeed = 1;
        this.showSubtitles = false;
        this.videos = [];
        
        // Habit package related
        this.streakData = { current: 0, longest: 0, total: 0 };
        this.todayCompleted = false;
        
        // User authentication related
        this.currentUser = null;
        this.isLoggedIn = undefined; // 初期状態は未確定
        
        this.init();
    }

    async init() {
        // 🔧 FIX: API優先でビデオデータを読み込み、サンプルデータは無効化
        // this.loadSampleVideos(); // サンプルデータを無効化
        this.setupEventListeners();
        this.setupVideoControls();
        this.setupSmoothScrolling();
        this.setupVideoLibrary(); // API経由でビデオを読み込み
        
        // ユーザー認証初期化（必ず先に完了）
        await this.initUserAuth();
        
        // 習慣化パッケージ初期化（認証状態確認後）
        await this.initHabitDashboard();
        
        // 🔧 FIX: カレンダー初期化の確実な実行
        await this.ensureCalendarInitialization();
    }

    // サンプル動画データを読み込み（開発中のサンプル動画）
    loadSampleVideos() {
        this.videos = [
            {
                id: 1,
                title: "Karate Kata - Traditional Form",
                description: "Traditional karate kata demonstration (Sample video - Feature in development)",
                category: "kata",
                url: "https://www.youtube.com/embed/NAn6DocT120",
                thumbnail: "https://img.youtube.com/vi/NAn6DocT120/maxresdefault.jpg",
                duration: "6:42",
                license: "Sample Content",
                attribution: "YouTube Sample - Feature in Development",
                isSample: true
            },
            {
                id: 2,
                title: "Kumite Basic Techniques",
                description: "Learn basic kumite techniques and combinations (Sample video - Feature in development)",
                category: "kihon",
                url: "https://www.youtube.com/embed/6jEoWCiMTI8",
                thumbnail: "https://img.youtube.com/vi/6jEoWCiMTI8/maxresdefault.jpg",
                duration: "10:34",
                license: "Sample Content",
                attribution: "YouTube Sample - Feature in Development",
                isSample: true
            },
            {
                id: 3,
                title: "Basic Training - Seiken Tsuki",
                description: "Detailed explanation of proper form and practice methods (Sample video - Feature in development)",
                category: "kihon",
                url: "https://www.youtube.com/embed/Bo_11Yy8z2Y",
                thumbnail: "https://img.youtube.com/vi/Bo_11Yy8z2Y/maxresdefault.jpg",
                duration: "4:33",
                license: "Sample Content",
                attribution: "YouTube Sample - Feature in Development",
                isSample: true
            }
        ];

        this.renderVideoGrid();
    }

    // 動画グリッドをレンダリング
    renderVideoGrid() {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;

        // Get current language translations
        const t = window.translations ? window.translations[window.currentLanguage || 'en'] : {
            'dev-notice-title': '🚧 Feature in Development',
            'dev-notice-desc': 'The videos shown here are sample content. The video library feature is currently under development and will include professional karate training videos with CC-BY licensing.'
        };

        // Show development notice
        const developmentNotice = `
            <div class="development-notice" style="grid-column: 1 / -1; background: linear-gradient(135deg, #fff3cd, #ffeaa7); border: 1px solid #ffc107; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: center;">
                <h4 style="color: #856404; margin-bottom: 0.5rem;">${t['dev-notice-title']}</h4>
                <p style="color: #856404; margin: 0; font-size: 0.95rem;">${t['dev-notice-desc']}</p>
            </div>
        `;

        const videoCards = this.videos.map(video => {
            const thumbnailStyle = video.thumbnail.startsWith('http') 
                ? `background-image: url('${video.thumbnail}'); background-size: cover; background-position: center;`
                : `background: linear-gradient(45deg, #c41e3a, #8b0000); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;`;
                
            const thumbnailContent = video.thumbnail.startsWith('http') 
                ? '' 
                : '<i class="fas fa-fist-raised"></i>';

            return `
                <div class="video-card ${video.isSample ? 'sample-video' : ''}" data-video-id="${video.id}">
                    ${video.isSample ? '<div class="sample-badge">SAMPLE</div>' : ''}
                    <div class="video-thumbnail" onclick="karateService.playVideo('${video.url}', '${video.title}')">
                        <div class="play-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                        <div style="width: 100%; height: 100%; ${thumbnailStyle}">
                            ${thumbnailContent}
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-category ${video.category}">${video.category.toUpperCase()}</div>
                        <h3 class="video-title">${video.title}</h3>
                        <p class="video-description">${video.description}</p>
                        <div class="video-meta">
                            <span class="video-duration"><i class="fas fa-clock"></i> ${video.duration}</span>
                            <span class="license-badge">${video.license}</span>
                        </div>
                        <div class="video-attribution">
                            ${video.attribution}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        videoGrid.innerHTML = developmentNotice + videoCards;
    }

    // 動画を再生
    playVideo(url, title) {
        console.log('Playing video:', url, title);
        const playerVideo = document.getElementById('playerVideo');
        if (!playerVideo) {
            console.error('Player video element not found');
            return;
        }

        this.currentVideo = { url, title };
        
        // YouTube動画の場合は別の処理
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Get current language translations
            const t = window.translations ? window.translations[window.currentLanguage || 'en'] : {
                'sample-video-notice': 'This is a sample video for demonstration purposes. The video editor features below are not functional with YouTube videos.'
            };
            
            // YouTube iframe用のコンテナを作成
            const videoPlayerContainer = playerVideo.parentElement;
            // Apply mirror transform if mirroring is currently active
            const mirrorTransform = this.isMirrored ? 'transform: scaleX(-1);' : '';
            videoPlayerContainer.innerHTML = `
                <iframe 
                    id="youtubePlayer"
                    width="100%" 
                    height="400" 
                    src="${url}?autoplay=1&rel=0&modestbranding=1&showinfo=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin"
                    style="border-radius: 12px; box-shadow: 0 4px 6px var(--shadow); ${mirrorTransform}">
                </iframe>
                <div class="sample-video-notice" style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 1rem; margin-top: 1rem; text-align: center;">
                    <p style="color: #856404; margin: 0; font-size: 0.9rem;">
                        <i class="fas fa-info-circle"></i> ${t['sample-video-notice']}
                    </p>
                </div>
            `;
        } else {
            // 通常のビデオファイルの場合
            playerVideo.src = url;
            playerVideo.load();
        }
        
        // エディターセクションにスクロール
        document.getElementById('editor').scrollIntoView({ 
            behavior: 'smooth' 
        });

        // 通知表示
        this.showNotification(`Video "${title}" loaded`, 'success');
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
            
            // Check if we have a YouTube iframe or regular video
            const youtubePlayer = document.getElementById('youtubePlayer');
            if (youtubePlayer) {
                // Apply transform to YouTube iframe
                youtubePlayer.style.transform = this.isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
            } else {
                // Apply transform to regular video
                playerVideo.style.transform = this.isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
            }
            
            mirrorBtn.classList.toggle('active', this.isMirrored);
            
            // 🔧 ADD: Sync with editor panel mirror toggle
            const mirrorToggle = document.getElementById('mirrorToggle');
            if (mirrorToggle) {
                mirrorToggle.checked = this.isMirrored;
            }
            
            this.showNotification(
                this.isMirrored ? 'Mirror display enabled' : 'Mirror display disabled'
            );
        });

        // スロー再生
        slowBtn?.addEventListener('click', () => {
            this.currentSpeed = 0.5;
            playerVideo.playbackRate = this.currentSpeed;
            this.updateSpeedDisplay();
            this.updateSpeedButtons();
            this.showNotification('Switched to slow playback (0.5x)');
        });

        // 通常再生
        normalBtn?.addEventListener('click', () => {
            this.currentSpeed = 1;
            playerVideo.playbackRate = this.currentSpeed;
            this.updateSpeedDisplay();
            this.updateSpeedButtons();
            this.showNotification('Switched to normal playback (1x)');
        });

        // 字幕切り替え
        subtitleBtn?.addEventListener('click', () => {
            this.showSubtitles = !this.showSubtitles;
            subtitleBtn.classList.toggle('active', this.showSubtitles);
            this.toggleSubtitles();
            this.showNotification(
                this.showSubtitles ? 'Subtitles enabled' : 'Subtitles disabled'
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

        // 🔧 ADD: Mirror toggle in editor panel
        const mirrorToggle = document.getElementById('mirrorToggle');
        mirrorToggle?.addEventListener('change', (e) => {
            const shouldMirror = e.target.checked;
            if (shouldMirror !== this.isMirrored) {
                // Trigger the existing mirror button functionality
                document.getElementById('mirrorBtn')?.click();
            }
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
                'Technique names and descriptions will be displayed here';
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
            this.showNotification('No video selected', 'error');
            return;
        }

        this.showNotification('Preparing video editing and download...', 'info');
        
        // 実際の実装では、FFmpegを使用してサーバーサイドで動画を編集
        setTimeout(() => {
            this.showNotification('Editing feature is under development. Coming soon!', 'info');
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

        this.showNotification(`Showing ${filteredVideos.length} videos`);
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

        videoGrid.innerHTML = videos.map(video => {
            // 🔧 FIX: YouTubeビデオとアップロードビデオの両方に対応
            const isYouTubeVideo = video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'));
            const videoThumbnail = isYouTubeVideo ? video.thumbnail : '';
            const clickHandler = isYouTubeVideo 
                ? `karateService.playVideo('${video.url}', '${this.escapeHtml(video.title)}')`
                : `karateService.playVideoFromAPI(${video.id})`;

            return `
                <div class="video-card${video.isSample ? ' sample-video' : ''}" data-video-id="${video.id}">
                    ${video.isSample ? '<div class="sample-badge">SAMPLE</div>' : ''}
                    <div class="video-thumbnail" onclick="${clickHandler}">
                        ${isYouTubeVideo ? `
                            <img class="video-preview" src="${videoThumbnail}" alt="${this.escapeHtml(video.title)}" loading="lazy">
                        ` : video.filename ? `
                            <video class="video-preview" preload="metadata">
                                <source src="/uploads/${video.filename}" type="video/mp4">
                            </video>
                        ` : ''}
                        <button class="play-overlay">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    <div class="video-info">
                        <span class="video-category ${video.category}">${this.getCategoryName(video.category)}</span>
                        <h3 class="video-title">${this.escapeHtml(video.title)}</h3>
                        <p class="video-description">${this.escapeHtml(video.description)}</p>
                        <div class="video-meta">
                            <span class="video-duration">${video.duration || '不明'}</span>
                            <span class="video-views">
                                <i class="fas fa-eye"></i> ${video.views ? video.views.toLocaleString() : '0'} views
                            </span>
                        </div>
                        <div class="video-attribution">
                            ${this.escapeHtml(video.attribution || 'YouTube Sample')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
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

// Initialize calendar when page loads
document.addEventListener('DOMContentLoaded', function() {
    // 🔥 ULTRA AGGRESSIVE: 3つの絵文字モーダル（😊😐😫）完全撲滅システム
    const DESTROY_THREE_EMOJI_MODALS = () => {
        // 🔒 CRITICAL: 感情選択処理中は実行を停止
        if (window.isEmotionSelectionInProgress || isEmotionSelectionInProgress) {
            console.log('⏸️ Cleanup paused: emotion selection in progress');
            return;
        }
        
        console.log('🔥 ULTRA AGGRESSIVE cleanup running...');
        
        // 1. 即座に3つの絵文字パターン（😊😐😫）を持つ全ての要素を削除
        document.querySelectorAll('*').forEach(element => {
            if (element.textContent && 
                element.textContent.includes('😊') && 
                element.textContent.includes('😐') && 
                element.textContent.includes('😫') &&
                element.id !== 'emotionModal') { // 正しい5つ絵文字モーダルは保護
                console.log('🚫 DESTROYED 3-emoji element:', element);
                element.remove();
            }
        });
        
        // 2. journal関連の完全撲滅（emotion-btnは保護）
        document.querySelectorAll('#journalModal, .journal-modal, [id*="journal"], [class*="journal"], .mood-selector, .journal-content, [data-journal]').forEach(el => {
            // emotion-btnクラスを持つ要素は保護
            if (el.classList.contains('emotion-btn')) return;
            if (el.closest('#emotionModal')) return; // emotionModal内の要素も保護
            // selected-mood-* クラスを持つ要素も保護
            if (el.className && el.className.includes('selected-mood-')) return;
            
            console.log('🚫 DESTROYED journal element:', el);
            el.remove();
        });
        
        // 3. 正確に3つの絵文字ボタンを持つモーダルを破壊（メインのemotionModalは完全保護）
        document.querySelectorAll('*').forEach(element => {
            // 複数の保護レイヤー
            if (element.id === 'emotionModal') return; // メインのemotionModalを保護
            if (element.closest('#emotionModal')) return; // メインのemotionModalの子要素も保護
            if (element.classList.contains('emotion-selector')) return; // emotion-selectorコンテナを保護
            if (element.classList.contains('emotion-modal-content')) return; // emotion-modal-contentを保護
            
            const emojiButtons = element.querySelectorAll('button[data-emotion], .emotion-btn, [onclick*="emotion"], [data-mood], .mood-option');
            
            // 5つのボタンを持つ要素は絶対に削除しない（メインモーダル保護）
            if (emojiButtons && emojiButtons.length === 5) {
                console.log('🛡️ PROTECTED 5-button element from deletion:', element);
                return;
            }
            
            if (emojiButtons && emojiButtons.length === 3) {
                console.log('🚫 DESTROYED 3-button modal:', element);
                console.log('🔍 Buttons in destroyed element:', Array.from(emojiButtons).map(btn => ({
                    dataEmotion: btn.getAttribute('data-emotion'),
                    textContent: btn.textContent,
                    onclick: btn.getAttribute('onclick')
                })));
                element.remove();
            }
        });
        
        // 4. 重複するemotion modalを削除（最初の1つ以外）
        const emotionModals = document.querySelectorAll('.emotion-modal');
        if (emotionModals.length > 1) {
            for (let i = 1; i < emotionModals.length; i++) {
                console.log('🚫 DESTROYED duplicate emotion modal:', emotionModals[i]);
                emotionModals[i].remove();
            }
        }
        
        // 5. 固定位置の不審なオーバーレイを削除
        document.querySelectorAll('div[style*="position: fixed"], div[style*="z-index"]').forEach(element => {
            if (element.textContent && 
                element.textContent.includes('😊') && 
                element.textContent.includes('😐') && 
                element.textContent.includes('😫')) {
                console.log('🚫 DESTROYED fixed position 3-emoji overlay:', element);
                element.remove();
            }
        });
        
        // 4. 重複したemotion modalの削除（正しいものは1つだけ残す）
        const allEmotionModals = document.querySelectorAll('.emotion-modal');
        if (allEmotionModals.length > 1) {
            for (let i = 1; i < allEmotionModals.length; i++) {
                console.log('🚫 重複emotion modalを削除:', allEmotionModals[i]);
                allEmotionModals[i].remove();
            }
        }
    };
    
    // 🔥 ULTRA AGGRESSIVEシステム実行
    DESTROY_THREE_EMOJI_MODALS();
    
    // 🔧 FIX: 無限ループ防止 - 5秒間隔に変更
    setInterval(DESTROY_THREE_EMOJI_MODALS, 5000);
    
    // 🔄 DOM監視システム - 新しい3つ絵文字モーダルを即座に破壊
    let isProcessing = false; // 🔧 FIX: 無限ループ防止フラグ
    const observer = new MutationObserver((mutations) => {
        if (isProcessing) return; // 処理中は新しい監視をスキップ
        isProcessing = true;
        
        try {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // 即座に3つ絵文字パターンを検出・破壊
                    if (node.textContent && 
                        node.textContent.includes('😊') && 
                        node.textContent.includes('😐') && 
                        node.textContent.includes('😫')) {
                        console.log('🚫 INSTANT DESTROY 3-emoji node:', node);
                        node.remove();
                        return;
                    }
                    
                    // journal関連を即座に破壊
                    if (node.id === 'journalModal' || 
                        node.classList.contains('journal-modal') ||
                        node.classList.contains('mood-selector')) {
                        console.log('🚫 INSTANT DESTROY journal node:', node);
                        node.remove();
                        return;
                    }
                    
                    // 3つ絵文字ボタンを持つモーダルも即座に破壊（メインのemotionModalは保護）
                    if (node.id === 'emotionModal') return; // メインのemotionModalを保護
                    if (node.closest && node.closest('#emotionModal')) return; // メインのemotionModalの子要素も保護
                    
                    const emojiButtons = node.querySelectorAll && node.querySelectorAll('button[data-emotion], .emotion-btn, [onclick*="emotion"]');
                    if (emojiButtons && emojiButtons.length === 3) {
                        console.log('🚫 INSTANT DESTROY 3-button modal:', node);
                        node.remove();
                        return;
                    }
                }
                });
            });
        } finally {
            // 🔧 FIX: 処理完了フラグをリセット
            setTimeout(() => {
                isProcessing = false;
            }, 100);
        }
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id']
    });
    
    // 定期的なクリーンアップ（安全網）
    setInterval(preventUnwantedModals, 1000);
    
    // KarateVideoServiceの初期化
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

    const fadeInObserver = new IntersectionObserver((entries) => {
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
        fadeInObserver.observe(element);
    });
    
    // Initialize mini calendar
    if (document.getElementById('miniCalendarDays')) {
        generateMiniCalendar(miniCurrentMonth, miniCurrentYear);
    }
    
    // 🔧 FIX: カレンダー初期化はensureCalendarInitializationで適切に処理される
});

// ==== 習慣化パッケージ機能 ====

// 習慣化ダッシュボード初期化
KarateVideoService.prototype.initHabitDashboard = async function() {
    console.log('🔧 Initializing habit dashboard...');
    
    await this.loadStreakData();
    this.loadMonthlyPhrase();
    this.setupTodayPracticeButton();
    this.renderMiniCalendar();
    this.setupJournalModal();
    
    console.log('✅ Basic habit dashboard initialized');
};

// ストリークデータの読み込み
KarateVideoService.prototype.loadStreakData = async function() {
    console.log('🔧 Loading streak data...');
    
    try {
        const response = await fetch('/api/practice/streak');
        const result = await response.json();
        
        if (result.success) {
            this.streakData = result.data;
            this.updateStreakDisplay();
        } else {
            // サーバーからエラーが返ってきた場合、デフォルト値を設定
            this.streakData = { current: 0, longest: 0, total: 0 };
            this.updateStreakDisplay();
        }
    } catch (error) {
        console.error('Error loading streak data:', error);
        // ネットワークエラーの場合もデフォルト値を設定
        this.streakData = { current: 0, longest: 0, total: 0 };
        this.updateStreakDisplay();
    }
    
    // 今日の練習状況確認
    await this.checkTodayStatus();
};

// ストリーク表示の更新
KarateVideoService.prototype.updateStreakDisplay = function() {
    const currentStreakEl = document.getElementById('currentStreak');
    const longestStreakEl = document.getElementById('longestStreak');
    const totalPracticeEl = document.getElementById('totalPractice');
    
    console.log('🔧 Updating streak display:', {
        isLoggedIn: this.isLoggedIn,
        currentUser: this.currentUser,
        streakData: this.streakData
    });
    
    // ストリークデータを表示（ログイン状態に関係なく、サーバーからのデータを使用）
    if (currentStreakEl) {
        currentStreakEl.textContent = this.streakData?.current || 0;
    }
    if (longestStreakEl) {
        longestStreakEl.textContent = this.streakData?.longest || 0;
    }
    if (totalPracticeEl) {
        totalPracticeEl.textContent = this.streakData?.total || 0;
    }
    
    console.log('🔧 Streak display updated:', {
        current: this.streakData?.current || 0,
        longest: this.streakData?.longest || 0,
        total: this.streakData?.total || 0
    });
};

// 今日の練習状況チェック
KarateVideoService.prototype.checkTodayStatus = async function() {
    console.log('🔧 Checking today status...');
    
    try {
        // 🔧 FIX: Use consistent local date format to match backend
        const todayDate = new Date();
        const today = `${todayDate.getFullYear()}-${todayDate.getMonth() + 1}-${todayDate.getDate()}`;
        console.log('🔍 Frontend today date (local):', today);
        
        const response = await fetch(`/api/practice/calendar?year=${todayDate.getFullYear()}&month=${todayDate.getMonth() + 1}`);
        const result = await response.json();
        
        if (result.success) {
            console.log('🔍 Calendar data received:', result.data);
            console.log('🔍 Looking for today:', today);
            
            this.todayCompleted = result.data.some(record => {
                console.log('🔍 Checking record date:', record.date, 'vs today:', today);
                return record.date === today;
            });
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
    
    // 既存のイベントリスナーを削除（重複防止）
    todayBtn.removeEventListener('click', this.todayPracticeClickHandler);
    
    // 新しいクリックハンドラーを定義
    this.todayPracticeClickHandler = () => {
        if (this.todayCompleted) return;
        
        // 🚫 CRITICAL: ボタンクリック時に3つの絵文字モーダルを予防的削除
        if (window.preventUnwantedModals) {
            window.preventUnwantedModals();
        }
        
        // 直接感情選択モーダルを開く
        openTodayEmotionModal();
        
        // 🚫 少し遅延して再度削除（安全網）
        setTimeout(() => {
            if (window.preventUnwantedModals) window.preventUnwantedModals();
        }, 200);
    };
    
    // イベントリスナーを追加
    todayBtn.addEventListener('click', this.todayPracticeClickHandler);
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

// 🔧 FIX: カレンダー初期化の確実な実行
KarateVideoService.prototype.ensureCalendarInitialization = async function() {
    console.log('🔧 Ensuring calendar initialization...');
    
    // データロード
    await this.loadFullCalendarData();
    
    // ストリークデータの再読み込み（カレンダーデータ読み込み後）
    await this.loadStreakData();
    
    // カレンダー表示の初期化
    if (document.getElementById('calendarDays')) {
        generateCalendar(currentMonth, currentYear);
    }
    
    // 今日の状態確認と表示更新
    await this.checkTodayStatus();
    updateTodayDisplay();
    
    // 統計情報の更新
    updateCalendarStats();
    updateDashboardStats();
    
    console.log('✅ Calendar initialization completed');
};

// フルカレンダー用のemotionDataを読み込み
KarateVideoService.prototype.loadFullCalendarData = async function() {
    // 🔧 FIX: 重複呼び出し防止
    if (this._loadingCalendarData) {
        console.log('Calendar data already loading, skipping...');
        return;
    }
    
    // 🔧 FIX: 認証状態に関係なくデータロードを試行
    console.log('🔧 Loading full calendar data regardless of auth status...');
    
    this._loadingCalendarData = true;
    
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        
        const response = await fetch(`/api/practice/calendar?year=${year}&month=${month}`);
        const result = await response.json();
        
        if (result.success) {
            const practiceData = result.data;
            
            // practiceDataからemotionData形式に変換
            const newEmotionData = {};
            console.log('🔄 Converting practice data to emotion data:', practiceData);
            practiceData.forEach(record => {
                if (record.completed && record.emotion) {
                    console.log(`   📝 Converting record: date=${record.date}, emotion=${record.emotion}`);
                    // YYYY-MM-DD形式のキーでemotionDataに格納
                    newEmotionData[record.date] = record.emotion;
                }
            });
            console.log('🔄 New emotion data created:', newEmotionData);
            
            // グローバルのemotionDataを更新
            emotionData = { ...emotionData, ...newEmotionData };
            
            console.log('Full calendar emotion data loaded:', Object.keys(emotionData).length, 'entries');
            console.log('Emotion data keys:', Object.keys(emotionData));
            console.log('Sample emotion data:', emotionData);
            
            // フルカレンダーの統計を更新
            updateCalendarStats();
            
            // カレンダー表示も更新（既に生成されている場合）
            if (document.getElementById('calendarDays')) {
                generateCalendar(currentMonth, currentYear);
            }
        } else {
            console.log('No calendar data available from API');
        }
    } catch (error) {
        console.error('Error loading full calendar data:', error);
    } finally {
        // 🔧 FIX: 処理完了フラグをリセット
        this._loadingCalendarData = false;
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

// 練習後日記モーダルの設定 - 既存のemotionModalを使用
KarateVideoService.prototype.setupJournalModal = function() {
    // 既存のemotionModalを使用するため、特別な設定は不要
    // emotionModalは既にHTMLに定義済み
};

// Journal modal functions removed to fix 3-emoji modal issue

// フルカレンダー表示（将来の実装）
function showFullCalendar() {
    window.karateService.showNotification('フルカレンダー機能は近日公開予定です', 'info');
}

// ==== ユーザー認証機能 ====

// ユーザー認証初期化
KarateVideoService.prototype.initUserAuth = async function() {
    await this.checkAuthStatus();
    this.updateDashboardForUser();
    // Ensure hero section visibility is properly set
    this.updateAuthUI();
};

// 認証状態チェック
KarateVideoService.prototype.checkAuthStatus = async function() {
    try {
        const response = await fetch('/api/user/auth-status');
        const result = await response.json();
        
        if (result.success) {
            this.isLoggedIn = result.isLoggedIn;
            this.currentUser = result.user;
            
            // LocalStorageにバックアップ保存（セッション復元用）
            if (result.isLoggedIn && result.user) {
                localStorage.setItem('karateUserBackup', JSON.stringify({
                    isLoggedIn: true,
                    user: result.user,
                    timestamp: Date.now()
                }));
            } else {
                localStorage.removeItem('karateUserBackup');
            }
            
            this.updateAuthUI();
        }
    } catch (error) {
        console.error('Auth status check error:', error);
        
        // ネットワークエラー時はLocalStorageから復元を試行
        const backup = localStorage.getItem('karateUserBackup');
        if (backup) {
            try {
                const backupData = JSON.parse(backup);
                // 24時間以内のバックアップのみ有効
                if (Date.now() - backupData.timestamp < 24 * 60 * 60 * 1000) {
                    console.log('Using localStorage backup for auth');
                    this.isLoggedIn = backupData.isLoggedIn;
                    this.currentUser = backupData.user;
                    this.updateAuthUI();
                    return;
                }
            } catch (e) {
                console.error('Failed to parse auth backup:', e);
            }
        }
        
        this.isLoggedIn = false;
        this.currentUser = null;
        this.updateAuthUI();
    }
};

// 認証UIの更新
KarateVideoService.prototype.updateAuthUI = function() {
    const guestState = document.getElementById('guestState');
    const loggedInState = document.getElementById('loggedInState');
    const userName = document.getElementById('userName');
    const heroSection = document.getElementById('home');
    
    if (this.isLoggedIn && this.currentUser) {
        guestState.style.display = 'none';
        loggedInState.style.display = 'block';
        userName.textContent = this.currentUser.displayName || this.currentUser.username;
        
        // Hide hero section when logged in
        if (heroSection) {
            heroSection.style.display = 'none';
        }
    } else {
        guestState.style.display = 'block';
        loggedInState.style.display = 'none';
        
        // Show hero section when not logged in
        if (heroSection) {
            heroSection.style.display = 'flex';
        }
    }
};

// ダッシュボードのユーザー表示更新
KarateVideoService.prototype.updateDashboardForUser = function() {
    const dashboardHeader = document.querySelector('.dashboard-header');
    if (!dashboardHeader) return;
    
    // 既存のユーザー表示を削除
    const existingWelcome = document.querySelector('.dashboard-user-welcome');
    const existingNotice = document.querySelector('.guest-notice');
    if (existingWelcome) existingWelcome.remove();
    if (existingNotice) existingNotice.remove();
    
    const welcomeDiv = document.createElement('div');
    
    if (this.isLoggedIn && this.currentUser) {
        // Logged in user display
        welcomeDiv.className = 'dashboard-user-welcome';
        welcomeDiv.innerHTML = `
            <h3>Welcome back, ${this.currentUser.displayName || this.currentUser.username}! 🥋</h3>
            <p>Tracking your personal training records</p>
        `;
    } else {
        // Guest user display
        welcomeDiv.className = 'guest-notice';
        welcomeDiv.innerHTML = `
            <h4>🎯 Guest Mode Experience</h4>
            <p>Create an account to permanently save your personal training records!</p>
            <a href="/user-login.html" class="login-btn">
                <i class="fas fa-user-plus"></i>
                Create Account to Save Data
            </a>
        `;
    }
    
    dashboardHeader.parentNode.insertBefore(welcomeDiv, dashboardHeader.nextSibling);
};

// ユーザーメニューの表示切り替え
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// プロフィール表示
function showProfile() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.remove('show');
    
    if (window.karateService.currentUser) {
        const user = window.karateService.currentUser;
        const profileInfo = `
ユーザー名: ${user.username}
表示名: ${user.displayName}
メール: ${user.email}
登録日: ${new Date(user.createdAt).toLocaleDateString()}
最終ログイン: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '初回ログイン'}
        `;
        alert('プロフィール情報:\n\n' + profileInfo);
    }
}

// ログアウト
async function logoutUser() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.remove('show');
    
    try {
        const response = await fetch('/api/user/logout', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.karateService.showNotification('ログアウトしました', 'success');
            window.karateService.isLoggedIn = false;
            window.karateService.currentUser = null;
            
            // LocalStorageバックアップをクリア
            localStorage.removeItem('karateUserBackup');
            
            window.karateService.updateAuthUI();
            window.karateService.updateDashboardForUser();
            
            // ページをリロードして状態をリセット
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            window.karateService.showNotification('ログアウトに失敗しました', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.karateService.showNotification('ログアウト中にエラーが発生しました', 'error');
    }
}

// ドロップダウンメニューの外側クリックで閉じる
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const userButton = document.querySelector('.user-button');
    
    if (dropdown && !userButton.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Calendar functionality
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = null;
let selectedEmotion = null;
let isSelectingForToday = false;
let emotionData = {
    // Empty by default - only user-registered entries will have colors
};

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function generateCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    calendarDays.innerHTML = '';
    
    // 🔧 FIX: 前月・次月の正確な年月を計算
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 0) {
        prevMonth = 11;
        prevYear = year - 1;
    }
    
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 11) {
        nextMonth = 0;
        nextYear = year + 1;
    }
    
    console.log(`🗓️ Generating calendar for ${year}-${month + 1}`);
    console.log(`   Previous month: ${prevYear}-${prevMonth + 1}`);
    console.log(`   Next month: ${nextYear}-${nextMonth + 1}`);
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, prevMonth, prevYear);
        calendarDays.appendChild(dayElement);
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false, month, year);
        calendarDays.appendChild(dayElement);
    }
    
    // Next month's leading days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, nextMonth, nextYear);
        calendarDays.appendChild(dayElement);
    }
    
    // Update month display
    const monthDisplay = document.getElementById('monthDisplay');
    if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
    }
}

function createDayElement(day, isOtherMonth, actualMonth = null, actualYear = null) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    } else {
        // 🔧 FIX: 実際の日付を使用してemotionデータを検索
        const year = actualYear || currentYear;
        const month = actualMonth !== null ? actualMonth : currentMonth;
        
        // 正確な日付文字列を生成（バックエンドと同じ形式）
        const monthNoPad = String(month + 1);
        const dayNoPad = String(day);
        const dateKeyNoPad = `${year}-${monthNoPad}-${dayNoPad}`;
        
        // 0埋めバージョンも試行（互換性のため）
        const monthPadded = String(month + 1).padStart(2, '0');
        const dayPadded = String(day).padStart(2, '0');
        const dateKeyPadded = `${year}-${monthPadded}-${dayPadded}`;
        
        console.log(`🔍 Checking emotion for day ${day}, month ${month + 1}, year ${year}`);
        console.log(`   📅 Date keys: ${dateKeyNoPad}, ${dateKeyPadded}`);
        
        // emotionDataから該当データを探す（両方の形式で）
        let emotion = emotionData[dateKeyNoPad] || emotionData[dateKeyPadded];
        
        // emotionがオブジェクトの場合はemotionプロパティを取得
        if (emotion && typeof emotion === 'object' && emotion.emotion) {
            emotion = emotion.emotion;
        }
        
        if (emotion) {
            console.log(`🎯 FOUND EMOTION: ${emotion} for day ${day} (month ${month + 1})`);
            console.log(`   📅 Matched date key: ${dateKeyNoPad}`);
            console.log(`   📊 All emotionData keys:`, Object.keys(emotionData));
            console.log(`   🎨 Adding classes: has-emotion, ${emotion}`);
            dayElement.classList.add('has-emotion', emotion);
            
            // Debug: CSS適用状態を即座にチェック
            setTimeout(() => {
                const computedStyle = getComputedStyle(dayElement);
                console.log(`   🖌️ Day ${day} final styles:`, {
                    backgroundColor: computedStyle.backgroundColor,
                    color: computedStyle.color,
                    className: dayElement.className
                });
            }, 100);
        } else {
            console.log(`❌ No emotion for day ${day} (keys: ${dateKeyNoPad}, ${dateKeyPadded})`);
        }
        // クリックハンドラはそのまま
        dayElement.addEventListener('click', () => {
            if (!isOtherMonth) {
                selectedDay = day;
                showEmotionModal();
            }
        });
    }
    return dayElement;
}

function changeMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    // Add slide animation class
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        calendarGrid.style.transform = `translateX(${direction > 0 ? '100%' : '-100%'})`;
        calendarGrid.style.opacity = '0';
        
        setTimeout(() => {
            generateCalendar(currentMonth, currentYear);
            calendarGrid.style.transform = `translateX(${direction > 0 ? '-100%' : '100%'})`;
            
            setTimeout(() => {
                calendarGrid.style.transition = 'all 0.3s ease';
                calendarGrid.style.transform = 'translateX(0)';
                calendarGrid.style.opacity = '1';
                
                setTimeout(() => {
                    calendarGrid.style.transition = '';
                }, 300);
            }, 50);
        }, 150);
    }
}

function showEmotionModal() {
    const modal = document.getElementById('emotionModal');
    if (!modal) {
        console.error('Emotion modal not found!');
        return;
    }
    
    console.log('showEmotionModal called');
    
    // Reset modal state
    selectedEmotion = null;
    const commentTextarea = document.getElementById('emotionComment');
    const saveBtn = document.getElementById('saveEmotionBtn');
    
    if (commentTextarea) commentTextarea.value = '';
    if (saveBtn) saveBtn.disabled = true;
    
    // Reset emotion button states within the modal only
    const modalButtons = modal.querySelectorAll('.emotion-btn');
    modalButtons.forEach(btn => {
        // Remove all selected-* classes
        btn.classList.remove('selected-mood-1', 'selected-mood-2', 'selected-mood-3', 'selected-mood-4', 'selected-mood-5');
    });
    
    // Load existing data if available
    const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDay}`;
    const existingData = emotionData[dateKey];
    if (existingData) {
        selectedEmotion = existingData.emotion;
        if (commentTextarea) commentTextarea.value = existingData.comment || '';
        const emotionBtn = modal.querySelector(`[data-emotion="${existingData.emotion}"]`);
        if (emotionBtn) {
            emotionBtn.classList.add(`selected-${existingData.emotion}`);
        }
        if (saveBtn) saveBtn.disabled = false;
    }
    
    modal.classList.add('active');
    
    // Close modal when clicking outside
    const modalClickHandler = (e) => {
        if (e.target === modal) {
            closeEmotionModal();
            modal.removeEventListener('click', modalClickHandler);
        }
    };
    modal.addEventListener('click', modalClickHandler);
}

function closeEmotionModal() {
    const modal = document.getElementById('emotionModal');
    if (modal) {
        modal.classList.remove('active');
    }
    selectedEmotion = null;
}

// 🔒 感情選択処理中フラグ（クリーンアップシステム制御用）
let isEmotionSelectionInProgress = false;
window.isEmotionSelectionInProgress = false;

function selectEmotionButton(emotion) {
    // 🔒 CRITICAL: 感情選択処理中はクリーンアップシステムを停止
    isEmotionSelectionInProgress = true;
    window.isEmotionSelectionInProgress = true;
    
    selectedEmotion = emotion;
    
    console.log('selectEmotionButton called with:', emotion);
    
    // Only work with buttons inside the main emotion modal to prevent conflicts
    const emotionModal = document.getElementById('emotionModal');
    if (!emotionModal) {
        console.error('Main emotion modal not found');
        return;
    }
    
    // Ensure modal has exactly 5 emotion buttons to prevent conflicts
    const modalButtons = emotionModal.querySelectorAll('.emotion-btn');
    console.log(`Found ${modalButtons.length} emotion buttons in modal`);
    
    // DEBUGGING: Log all current buttons and their properties
    modalButtons.forEach((btn, index) => {
        console.log(`BEFORE - Button ${index}:`, {
            dataEmotion: btn.getAttribute('data-emotion'),
            textContent: btn.textContent,
            classList: Array.from(btn.classList),
            onclick: btn.getAttribute('onclick'),
            parentElement: btn.parentElement?.tagName
        });
    });
    
    if (modalButtons.length !== 5) {
        console.error(`CRITICAL: Expected 5 emotion buttons, found ${modalButtons.length}. Possible modal conflict!`);
        console.error('Available buttons:', Array.from(modalButtons).map(btn => ({
            dataEmotion: btn.getAttribute('data-emotion'),
            textContent: btn.textContent
        })));
        
        // Don't return early - continue with whatever buttons we have for debugging
        console.warn('Continuing with available buttons for debugging...');
    }
    
    modalButtons.forEach((btn, index) => {
        // Log button state before modification
        console.log(`Button ${index}: data-emotion="${btn.getAttribute('data-emotion')}", textContent="${btn.textContent}"`);
        
        // Remove all selected-* classes but preserve emotion-btn class
        btn.classList.remove('selected-mood-1', 'selected-mood-2', 'selected-mood-3', 'selected-mood-4', 'selected-mood-5');
        
        // Make sure emotion-btn class is always present
        if (!btn.classList.contains('emotion-btn')) {
            btn.classList.add('emotion-btn');
        }
        
        // Verify button integrity
        const expectedDataEmotion = btn.getAttribute('data-emotion');
        if (!expectedDataEmotion) {
            console.error(`Button ${index} missing data-emotion attribute!`);
        }
    });
    
    // Highlight selected button within the modal only
    const selectedBtn = emotionModal.querySelector(`[data-emotion="${emotion}"]`);
    if (selectedBtn) {
        console.log(`Selecting button with data-emotion="${emotion}", textContent="${selectedBtn.textContent}"`);
        selectedBtn.classList.add(`selected-${emotion}`);
        console.log('Selected button found and highlighted:', emotion);
    } else {
        console.error('Selected button not found in modal:', emotion);
    }
    
    // Enable save button
    const saveBtn = document.getElementById('saveEmotionBtn');
    if (saveBtn) {
        saveBtn.disabled = false;
    }
    
    // 🔓 CRITICAL: 感情選択処理完了、クリーンアップシステム再開許可
    setTimeout(() => {
        isEmotionSelectionInProgress = false;
        window.isEmotionSelectionInProgress = false;
        console.log('🔓 Emotion selection completed, cleanup system re-enabled');
    }, 500); // 500ms後に安全に再開
}

async function saveEmotion() {
    if (selectedDay && selectedEmotion) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDay}`;
        const commentTextarea = document.getElementById('emotionComment');
        const comment = commentTextarea ? commentTextarea.value : '';
        
        // Debug logging for emotion data creation
        console.log('SAVING EMOTION:');
        console.log('Selected day:', selectedDay);
        console.log('Current year:', currentYear, 'Current month (0-indexed):', currentMonth);
        console.log('Generated date key:', dateKey);
        console.log('Emotion:', selectedEmotion);
        console.log('Comment:', comment);
        
        try {
            // Save to server
            const response = await fetch('/api/practice/emotion', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: dateKey,
                    emotion: selectedEmotion,
                    comment: comment
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update local emotionData only after successful server save
                emotionData[dateKey] = {
                    emotion: selectedEmotion,
                    comment: comment
                };
                
                console.log('✅ Emotion saved to server successfully');
                console.log('Server response:', result);
                
                // Update streak data if returned from server
                if (result.data.streak && window.karateService) {
                    window.karateService.streakData = result.data.streak;
                    window.karateService.updateStreakDisplay();
                    console.log('✅ Streak data updated:', result.data.streak);
                }
                
                // Show success notification
                if (window.karateService && window.karateService.showNotification) {
                    window.karateService.showNotification(`${selectedDay}日の練習記録を保存しました`, 'success');
                }
            } else {
                console.error('❌ Failed to save emotion to server:', result.message);
                if (window.karateService && window.karateService.showNotification) {
                    window.karateService.showNotification('感情記録の保存に失敗しました: ' + result.message, 'error');
                }
                return; // Don't update local data if server save failed
            }
        } catch (error) {
            console.error('❌ Network error saving emotion:', error);
            if (window.karateService && window.karateService.showNotification) {
                window.karateService.showNotification('ネットワークエラーが発生しました', 'error');
            }
            return; // Don't update local data if network error
        }
        
        // Update calendar displays
        generateCalendar(currentMonth, currentYear);
        generateMiniCalendar(miniCurrentMonth, miniCurrentYear);
        
        // Update statistics
        updateCalendarStats();
        updateDashboardStats();
        
        // Check if this is today's date and update Today's Practice display
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        if (dateKey === todayKey) {
            // CRITICAL: ALWAYS update Today's display to ensure calendar changes sync
            // This fixes the issue where calendar edits don't update Today's Practice display
            updateTodayDisplay();
            
            // Also update karate service state for today's completion
            if (window.karateService) {
                window.karateService.todayCompleted = true;
                window.karateService.updateTodayButton();
                // Update streak data since we now have today's practice
                window.karateService.loadStreakData();
            }
        }
        
        // If this was for today, reset the flag
        if (isSelectingForToday) {
            isSelectingForToday = false;
        }
        
        // Close modal
        closeEmotionModal();
    }
}

function skipEmotion() {
    closeEmotionModal();
}

// Today's practice recording function
async function recordTodayPractice() {
    // 🚫 CRITICAL: API実行前に3つの絵文字モーダルを予防的削除
    if (window.preventUnwantedModals) {
        window.preventUnwantedModals();
    }
    
    try {
        const response = await fetch('/api/practice/today', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        // 🚫 CRITICAL: API応答後に即座に3つの絵文字モーダルを削除
        if (window.preventUnwantedModals) {
            window.preventUnwantedModals();
        }
        
        if (result.success) {
            window.karateService.todayCompleted = true;
            window.karateService.streakData = result.data.streak;
            window.karateService.updateTodayButton();
            window.karateService.updateStreakDisplay();
            window.karateService.showNotification('🎉 ' + result.message, 'success');
            
            // 🚫 CRITICAL: 成功後の時間差削除で確実に阻止
            setTimeout(() => {
                if (window.preventUnwantedModals) window.preventUnwantedModals();
            }, 100);
            setTimeout(() => {
                if (window.preventUnwantedModals) window.preventUnwantedModals();
            }, 500);
            setTimeout(() => {
                if (window.preventUnwantedModals) window.preventUnwantedModals();
            }, 1000);
            setTimeout(() => {
                if (window.preventUnwantedModals) window.preventUnwantedModals();
            }, 2000);
        } else {
            window.karateService.showNotification(result.message, 'error');
        }
        
    } catch (error) {
        console.error('Error recording practice:', error);
        window.karateService.showNotification('記録に失敗しました', 'error');
        
        // エラー時も削除
        if (window.preventUnwantedModals) {
            window.preventUnwantedModals();
        }
    }
}

function updateCalendarStats() {
    const emotions = Object.values(emotionData);
    
    // Calculate completion rate for current month
    const thisMonthEntries = Object.keys(emotionData).filter(date => {
        const [year, month] = date.split('-');
        return parseInt(year) === currentYear && parseInt(month) === currentMonth + 1;
    });
    
    // Calculate TOTAL COMPLETIONS as actual practice entries from month start to today ONLY
    const today = new Date();
    let totalCompletions;
    
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
        // Current month: count actual practice entries from month start to today (inclusive)
        const dayOfMonth = today.getDate();
        const currentMonthEntries = Object.keys(emotionData).filter(date => {
            const [year, month, day] = date.split('-').map(Number);
            
            // Add validation to ensure valid date components
            if (isNaN(year) || isNaN(month) || isNaN(day)) {
                console.warn('Invalid date found in emotionData:', date);
                return false;
            }
            
            const isCurrentYear = year === currentYear;
            const isCurrentMonth = month === currentMonth + 1;
            const isValidDay = day >= 1 && day <= dayOfMonth;
            
            // Detailed logging only for debugging the off-by-one issue
            if (!isValidDay && isCurrentYear && isCurrentMonth) {
                console.log(`Date ${date} excluded: day ${day} not in range 1-${dayOfMonth}`);
            }
            
            return isCurrentYear && isCurrentMonth && isValidDay;
        });
        
        // Debug logging to help identify the issue
        console.log('TOTAL COMPLETIONS DEBUG:');
        console.log('Today:', today.toISOString().split('T')[0]);
        console.log('Current year:', currentYear, 'Current month (0-indexed):', currentMonth);
        console.log('Day of month:', dayOfMonth);
        console.log('Looking for entries in month:', currentMonth + 1);
        console.log('Current month entries found:', currentMonthEntries);
        console.log('Total count:', currentMonthEntries.length);
        
        totalCompletions = currentMonthEntries.length;
    } else {
        // Other month: count all entries for that month
        totalCompletions = thisMonthEntries.length;
    }
    
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const completionRate = thisMonthEntries.length > 0 ? Math.round((thisMonthEntries.length / daysInCurrentMonth) * 100) : 0;
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    
    // Calculate current streak (backwards from today)
    for (let i = 0; i >= -30; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() + i);
        const checkKey = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
        
        if (emotionData[checkKey]) {
            if (i === 0) currentStreak = 1;
            else if (currentStreak > 0) currentStreak++;
        } else {
            if (i === 0) currentStreak = 0;
            break;
        }
    }
    
    // Calculate longest streak
    const sortedDates = Object.keys(emotionData).sort();
    let tempStreak = 0;
    let currentStreakCount = 0;
    let lastDate = null;
    
    for (let dateStr of sortedDates) {
        const currentDate = new Date(dateStr);
        if (lastDate) {
            const diffTime = currentDate - lastDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreakCount++;
            } else {
                longestStreak = Math.max(longestStreak, currentStreakCount);
                currentStreakCount = 1;
            }
        } else {
            currentStreakCount = 1;
        }
        lastDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, currentStreakCount);
    
    // Update full calendar stats display
    const fullCurrentStreakEl = document.getElementById('fullCurrentStreak');
    const fullLongestStreakEl = document.getElementById('fullLongestStreak');
    const fullCompletionRateEl = document.getElementById('fullCompletionRate');
    const fullTotalDaysEl = document.getElementById('fullTotalDays');
    
    // 🔧 FIX: カレンダー統計はemotionDataに基づいて表示（ログイン状態に関係なく）
    console.log('🔧 Updating calendar stats:', {
        currentStreak,
        longestStreak,
        completionRate,
        totalCompletions
    });
    
    if (fullCurrentStreakEl) fullCurrentStreakEl.textContent = currentStreak;
    if (fullLongestStreakEl) fullLongestStreakEl.textContent = longestStreak;
    if (fullCompletionRateEl) fullCompletionRateEl.textContent = `${completionRate}%`;
    if (fullTotalDaysEl) fullTotalDaysEl.textContent = totalCompletions;
}

// Mini Calendar functionality
let miniCurrentMonth = new Date().getMonth();
let miniCurrentYear = new Date().getFullYear();

function generateMiniCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const miniCalendarDays = document.getElementById('miniCalendarDays');
    if (!miniCalendarDays) return;
    
    miniCalendarDays.innerHTML = '';
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createMiniDayElement(day, true);
        miniCalendarDays.appendChild(dayElement);
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createMiniDayElement(day, false);
        miniCalendarDays.appendChild(dayElement);
    }
    
    // Next month's leading days
    const totalCells = miniCalendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createMiniDayElement(day, true);
        miniCalendarDays.appendChild(dayElement);
    }
    
    // Update month display
    const miniMonthDisplay = document.getElementById('miniMonthDisplay');
    if (miniMonthDisplay) {
        miniMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    }
    
    // Update mini stats
    updateMiniStats();
}

function createMiniDayElement(day, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'mini-calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    } else {
        // Check if this day has an emotion
        const month = String(miniCurrentMonth + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateKey = `${miniCurrentYear}-${month}-${dayStr}`;
        const emotion = emotionData[dateKey];
        
        if (emotion) {
            dayElement.classList.add('has-emotion', emotion);
        }
        
        // Add click handler to scroll to full calendar
        dayElement.addEventListener('click', () => {
            if (!isOtherMonth) {
                selectedDay = day;
                // Sync main calendar to mini calendar month
                currentMonth = miniCurrentMonth;
                currentYear = miniCurrentYear;
                // Scroll to full calendar and open modal
                document.querySelector('#calendar').scrollIntoView({behavior: 'smooth'});
                setTimeout(() => {
                    generateCalendar(currentMonth, currentYear);
                    showEmotionModal();
                }, 500);
            }
        });
    }
    
    return dayElement;
}

function changeMiniMonth(direction) {
    miniCurrentMonth += direction;
    
    if (miniCurrentMonth > 11) {
        miniCurrentMonth = 0;
        miniCurrentYear++;
    } else if (miniCurrentMonth < 0) {
        miniCurrentMonth = 11;
        miniCurrentYear--;
    }
    
    generateMiniCalendar(miniCurrentMonth, miniCurrentYear);
}

function updateDashboardStats() {
    const thisMonthEntries = Object.keys(emotionData).filter(date => {
        const [year, month] = date.split('-');
        const today = new Date();
        return parseInt(year) === today.getFullYear() && parseInt(month) === today.getMonth() + 1;
    });
    
    const today = new Date();
    const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const completionRate = thisMonthEntries.length > 0 ? Math.round((thisMonthEntries.length / daysInCurrentMonth) * 100) : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    
    for (let i = 0; i >= -30; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() + i);
        const checkKey = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
        
        if (emotionData[checkKey]) {
            if (i === 0) currentStreak = 1;
            else if (currentStreak > 0) currentStreak++;
        } else {
            if (i === 0) currentStreak = 0;
            break;
        }
    }
    
    // Update dashboard calendar stats
    const dashCurrentStreakEl = document.getElementById('dashCurrentStreak');
    const dashCompletionRateEl = document.getElementById('dashCompletionRate');
    
    if (dashCurrentStreakEl) dashCurrentStreakEl.textContent = currentStreak;
    if (dashCompletionRateEl) dashCompletionRateEl.textContent = `${completionRate}%`;
}

// Today's Practice functions
function openTodayEmotionModal() {
    const today = new Date();
    selectedDay = today.getDate();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    miniCurrentMonth = today.getMonth();
    miniCurrentYear = today.getFullYear();
    isSelectingForToday = true;
    
    showEmotionModal();
}

function updateTodayDisplay() {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const todayData = emotionData[todayKey];
    
    console.log('🔍 updateTodayDisplay:', {
        todayKey,
        todayData,
        emotionDataKeys: Object.keys(emotionData),
        emotionDataSample: emotionData
    });
    
    const todayBtn = document.getElementById('todayPracticeBtn');
    const todayStatus = document.getElementById('todayStatus');
    const todayEmotionDisplay = document.getElementById('todayEmotionDisplay');
    const todayEmotionIcon = document.querySelector('.today-emotion-icon');
    const todayEmotionLabel = document.querySelector('.today-emotion-label');
    
    if (todayData) {
        // Hide button and status, show emotion display
        if (todayBtn) todayBtn.style.display = 'none';
        if (todayStatus) todayStatus.style.display = 'none';
        if (todayEmotionDisplay) todayEmotionDisplay.style.display = 'flex';
        
        // Update emotion display with rich messages
        const emotionData = {
            'mood-1': {
                emoji: '😄',
                en: {
                    title: 'Feeling great!',
                    subtitles: [
                        'A day of great progress',
                        'The Path to Black Belt Opens',
                        'The Summit is in Sight',
                        'An Awakening Strike',
                        'A Leap Forward',
                        'Kata, Perfected'
                    ]
                },
                ja: {
                    title: '最高の気分！',
                    subtitles: [
                        '大きな進歩を感じた日',
                        '黒帯への道、開ける',
                        '頂が見えた',
                        '覚醒の一撃',
                        '飛躍的な進歩',
                        '型、極まる'
                    ]
                }
            },
            'mood-2': {
                emoji: '😊',
                en: {
                    title: 'Good vibes!',
                    subtitles: [
                        'A day of solid growth',
                        'One Step Forward',
                        'A Solid Feeling',
                        'Sweat Never Lies',
                        'The Next Belt in Sight',
                        'The Way Forward is Clear'
                    ]
                },
                ja: {
                    title: '良い感じ！',
                    subtitles: [
                        '確かな成長を感じた日',
                        '一歩前進',
                        '確かな手応え',
                        '汗は嘘をつかない',
                        '次の帯が見える',
                        '道が拓ける'
                    ]
                }
            },
            'mood-3': {
                emoji: '😐',
                en: {
                    title: 'As usual.',
                    subtitles: [
                        'The day I practiced with a normal mind',
                        'Midway on the Path',
                        'Training Continues',
                        'Solidifying the Foundation',
                        'Step by Step',
                        'A Calm Mind is the Way'
                    ]
                },
                ja: {
                    title: 'いつも通り。',
                    subtitles: [
                        '平常心で稽古できた日',
                        '道半ば',
                        '鍛錬あるのみ',
                        '基礎を固める',
                        '一歩一歩',
                        '平常心、是道なり'
                    ]
                }
            },
            'mood-4': {
                emoji: '😕',
                en: {
                    title: 'Not going well...',
                    subtitles: [
                        'The day the issue was found',
                        'Facing a Wall',
                        'Lost on the Path',
                        'Form is Breaking',
                        'The Next Step is Unclear',
                        'A Day of Stagnation'
                    ]
                },
                ja: {
                    title: 'うまくいかない…',
                    subtitles: [
                        '課題が見つかった日',
                        '壁に直面',
                        '道に迷う',
                        '型が崩れる',
                        '見えぬ一歩',
                        '停滞の一日'
                    ]
                }
            },
            'mood-5': {
                emoji: '😟',
                en: {
                    title: 'Really down...',
                    subtitles: [
                        'A day to go back to the beginning',
                        'With a White Belt\'s Heart',
                        'A Great Wall',
                        'Losing Sight of the Way',
                        'Starting Over',
                        'Spirit is Tested'
                    ]
                },
                ja: {
                    title: 'かなり落ち込む…',
                    subtitles: [
                        '初心に戻るべき日',
                        '白帯の心で',
                        '大きな壁',
                        '道を見失う',
                        '一から出直し',
                        '心が折れそうだ'
                    ]
                }
            }
        };
        
        // Get current language reliably
        function getCurrentLanguage() {
            return window.currentLanguage || 
                   (typeof currentLanguage !== 'undefined' ? currentLanguage : null) || 
                   localStorage.getItem('preferredLanguage') || 
                   'en';
        }
        
        const currentLang = getCurrentLanguage();
        console.log('updateTodayDisplay currentLang:', currentLang); // Debug log
        const moodData = emotionData[todayData.emotion] || emotionData['mood-3'];
        const message = moodData[currentLang] || moodData.en;
        
        // Select a random subtitle for variety
        const subtitle = message.subtitles[Math.floor(Math.random() * message.subtitles.length)];
        
        if (todayEmotionIcon) todayEmotionIcon.textContent = moodData.emoji;
        if (todayEmotionLabel) {
            todayEmotionLabel.innerHTML = `<strong>${message.title}</strong><br><span style="font-size: 12px; opacity: 0.8;">${subtitle}</span>`;
        }
    } else {
        // Show button and status, hide emotion display
        if (todayBtn) todayBtn.style.display = 'flex';
        if (todayStatus) todayStatus.style.display = 'block';
        if (todayEmotionDisplay) todayEmotionDisplay.style.display = 'none';
    }
}

// Define the missing preventUnwantedModals function
function preventUnwantedModals() {
    // Remove any journal modals immediately
    document.querySelectorAll('#journalModal, .journal-modal, [id*="journal"], [class*="journal"]').forEach(el => {
        if (el.id !== 'emotionModal') { // Protect the main emotion modal
            el.remove();
        }
    });
    
    // Remove any 3-emoji modals (😊😐😫) but NEVER touch the main 5-emotion modal
    document.querySelectorAll('*').forEach(element => {
        if (element.id === 'emotionModal') return; // Skip the main emotion modal entirely
        
        if (element.textContent && 
            element.textContent.includes('😊') && 
            element.textContent.includes('😐') && 
            element.textContent.includes('😫')) {
            element.remove();
        }
    });
    
    // Remove any modals with exactly 3 emotion buttons, but protect the main 5-emotion modal
    document.querySelectorAll('*').forEach(element => {
        if (element.id === 'emotionModal') return; // Skip the main emotion modal entirely
        if (element.closest('#emotionModal')) return; // Skip any child elements of the main emotion modal
        
        const emojiButtons = element.querySelectorAll('button[data-emotion], .emotion-btn, [onclick*="emotion"]');
        if (emojiButtons && emojiButtons.length === 3) {
            element.remove();
        }
    });
}

// Make the function globally available
window.preventUnwantedModals = preventUnwantedModals;

// Make functions globally available
window.changeMonth = changeMonth;
window.changeMiniMonth = changeMiniMonth;
window.selectEmotionButton = selectEmotionButton;
window.saveEmotion = saveEmotion;
window.skipEmotion = skipEmotion;
window.openTodayEmotionModal = openTodayEmotionModal;

// Language switching functionality
let currentLanguage = 'en'; // Default to English

const translations = {
    en: {
        // Navigation
        'nav-home': 'Home',
        'nav-dashboard': 'Dashboard',
        'nav-calendar': 'Calendar',
        'nav-library': 'Video Library',
        'nav-editor': 'Editor',
        'nav-about': 'About',
        'nav-login': 'Login',
        'nav-profile': 'Profile',
        'nav-logout': 'Logout',
        
        // Hero Section
        'hero-title': 'Master <span class="highlight">Karate</span> with Expert Guidance',
        'hero-description': 'Professional karate training videos with mirror mode, slow motion, and subtitles. Learn from authentic Japanese masters with CC-BY licensed content.',
        'hero-start': 'Start Learning',
        'hero-learn': 'Learn More',
        'hero-authentic': 'Authentic Japanese Training',
        'hero-cc': 'CC-BY Licensed Content',
        'hero-quality': 'Professional Quality',
        
        // Dashboard
        'dashboard-title': 'Practice Dashboard',
        'dashboard-subtitle': 'Track your daily karate practice and build lasting habits',
        'today-practice': 'Today\'s Practice',
        'mark-complete': 'Mark Today Complete',
        'ready-practice': 'Ready to practice!',
        'streak': 'Streak',
        'days': 'Days',
        'longest': 'Longest',
        'total': 'Total',
        'monthly-wisdom': 'Monthly Wisdom',
        'loading': 'Loading...',
        
        // Calendar
        'calendar-title': 'Practice Calendar',
        'calendar-subtitle': 'Track your daily training progress',
        'current-streak': 'CURRENT STREAK',
        'longest-streak': 'LONGEST STREAK',
        'completion-rate': 'COMPLETION RATE',
        'total-completions': 'TOTAL COMPLETIONS',
        
        // Video Library
        'library-title': 'Video Library',
        'library-subtitle': 'Professional karate training videos with CC-BY licensing',
        'all-videos': 'All Videos',
        'kata': 'Kata (Forms)',
        'kumite': 'Kumite (Sparring)',
        'kihon': 'Kihon (Basics)',
        'search-videos': 'Search videos...',
        'loading-videos': 'Loading videos...',
        'dev-notice-title': '🚧 Feature in Development',
        'dev-notice-desc': 'The videos shown here are sample content. The video library feature is currently under development and will include professional karate training videos with CC-BY licensing.',
        'sample-video-notice': 'This is a sample video for demonstration purposes. The video editor features below are not functional with YouTube videos.',
        
        // Editor
        'editor-title': 'Video Editor Tool',
        'mirror': 'Mirror',
        'slow': 'Slow (0.5x)',
        'normal': 'Normal (1x)',
        'subtitle-toggle': 'Subtitle Toggle',
        'edit-options': 'Edit Options',
        'playback-speed': 'Playback Speed',
        'subtitle-display': 'Subtitle Display',
        'subtitle-placeholder': 'Enter subtitle text...',
        'download-video': 'Download Edited Video',
        
        // About
        'about-title': 'About Karate Pocket Dojo',
        'about-subtitle': 'Your personal karate training companion',
        'video-learning': 'Video Learning',
        'video-learning-desc': 'Learn karate from basics to advanced techniques through video.',
        'habit-tracking': 'Habit Tracking',
        'habit-tracking-desc': 'Record your daily practice and support continuous growth.',
        'practice-journal': 'Practice Journal',
        'practice-journal-desc': 'Record your practice reflections and visualize your progress.',
        'community': 'Community',
        'community-desc': 'Walk the path of karate together with peers who share the same goals.',
        
        // Modal
        'modal-title': 'How was your practice today?',
        'modal-subtitle': 'Reflect on your training session',
        'modal-placeholder': 'What did you learn today? How did you feel? Any challenges or breakthroughs? (optional)',
        'skip': 'Skip',
        'save-reflection': 'Save Reflection',
        
        // Footer
        'footer-platform': 'Platform',
        'footer-legal': 'Legal',
        'footer-support': 'Support',
        'footer-editor-tools': 'Editor Tools',
        'footer-about-us': 'About Us',
        'footer-privacy': 'Privacy Policy',
        'footer-terms': 'Terms of Service',
        'footer-licensing': 'CC-BY Licensing',
        'footer-help': 'Help Center',
        'footer-contact': 'Contact Us',
        'footer-copy': '© 2024 Karate Pocket Dojo. Professional training platform with CC-BY licensed content.',
        'footer-secure': 'Secure Platform',
        'footer-open': 'Open Content',
        'footer-tagline': 'Authentic Japanese karate training for global learners',
        
        // Guest notice
        'guest-title': '🎯 Guest Mode Experience',
        'guest-desc': 'Create an account to permanently save your personal training records!',
        'guest-button': 'Create Account to Save Data',
        'user-welcome': 'Welcome back, {name}! 🥋',
        'user-tracking': 'Tracking your personal training records'
    },
    ja: {
        // Navigation
        'nav-home': 'ホーム',
        'nav-dashboard': 'ダッシュボード',
        'nav-calendar': 'カレンダー',
        'nav-library': 'ビデオライブラリ',
        'nav-editor': 'エディター',
        'nav-about': 'について',
        'nav-login': 'ログイン',
        'nav-profile': 'プロフィール',
        'nav-logout': 'ログアウト',
        
        // Hero Section
        'hero-title': '専門指導で<span class="highlight">空手</span>をマスター',
        'hero-description': 'ミラーモード、スローモーション、字幕付きのプロフェッショナル空手指導動画。CC-BYライセンスコンテンツで本格的な日本の師匠から学びましょう。',
        'hero-start': '学習開始',
        'hero-learn': '詳細を見る',
        'hero-authentic': '本格的な日本指導',
        'hero-cc': 'CC-BYライセンスコンテンツ',
        'hero-quality': 'プロフェッショナル品質',
        
        // Dashboard
        'dashboard-title': '練習ダッシュボード',
        'dashboard-subtitle': '毎日の空手練習を追跡し、持続的な習慣を構築',
        'today-practice': '今日の練習',
        'mark-complete': '今日を完了としてマーク',
        'ready-practice': '練習の準備完了！',
        'streak': 'ストリーク',
        'days': '日',
        'longest': '最長',
        'total': '合計',
        'monthly-wisdom': '月の知恵',
        'loading': '読み込み中...',
        
        // Calendar
        'calendar-title': '練習カレンダー',
        'calendar-subtitle': '日々のトレーニング進捗を追跡',
        'current-streak': '現在のストリーク',
        'longest-streak': '最長ストリーク',
        'completion-rate': '完了率',
        'total-completions': '総完了数',
        
        // Video Library
        'library-title': 'ビデオライブラリ',
        'library-subtitle': 'CC-BYライセンス付きプロフェッショナル空手指導動画',
        'all-videos': '全ての動画',
        'kata': '型',
        'kumite': '組手',
        'kihon': '基本',
        'search-videos': '動画を検索...',
        'loading-videos': '動画を読み込み中...',
        'dev-notice-title': '🚧 開発中の機能',
        'dev-notice-desc': 'ここに表示されている動画はサンプルコンテンツです。ビデオライブラリ機能は現在開発中で、CC-BYライセンス付きのプロフェッショナル空手指導動画を含む予定です。',
        'sample-video-notice': 'これはデモンストレーション用のサンプル動画です。以下の動画編集機能はYouTube動画では動作しません。',
        
        // Editor
        'editor-title': '動画編集ツール',
        'mirror': '鏡映し',
        'slow': 'スロー (0.5x)',
        'normal': '通常 (1x)',
        'subtitle-toggle': '字幕切替',
        'edit-options': '編集オプション',
        'playback-speed': '再生速度',
        'subtitle-display': '字幕表示',
        'subtitle-placeholder': '字幕テキストを入力...',
        'download-video': '編集動画をダウンロード',
        
        // About
        'about-title': 'Karate Pocket Dojoについて',
        'about-subtitle': 'あなたの個人的な空手トレーニングコンパニオン',
        'video-learning': '動画学習',
        'video-learning-desc': '空手の基本技術から応用まで、動画で学習できます。',
        'habit-tracking': '習慣トラッキング',
        'habit-tracking-desc': '日々の練習を記録し、継続的な成長をサポートします。',
        'practice-journal': '練習日記',
        'practice-journal-desc': '練習の振り返りを記録し、上達のプロセスを可視化します。',
        'community': 'コミュニティ',
        'community-desc': '同じ目標を持つ仲間と一緒に、空手の道を歩みます。',
        
        // Modal
        'modal-title': '今日の練習はいかがでしたか？',
        'modal-subtitle': 'トレーニングセッションを振り返る',
        'modal-placeholder': '今日何を学びましたか？どう感じましたか？課題や突破口はありましたか？（任意）',
        'skip': 'スキップ',
        'save-reflection': '振り返りを保存',
        
        // Footer
        'footer-platform': 'プラットフォーム',
        'footer-legal': '法的事項',
        'footer-support': 'サポート',
        'footer-editor-tools': 'エディターツール',
        'footer-about-us': '私たちについて',
        'footer-privacy': 'プライバシーポリシー',
        'footer-terms': '利用規約',
        'footer-licensing': 'CC-BYライセンス',
        'footer-help': 'ヘルプセンター',
        'footer-contact': 'お問い合わせ',
        'footer-copy': '© 2024 Karate Pocket Dojo. CC-BYライセンスコンテンツによるプロフェッショナルトレーニングプラットフォーム。',
        'footer-secure': 'セキュアプラットフォーム',
        'footer-open': 'オープンコンテンツ',
        'footer-tagline': 'グローバル学習者向けの本格的な日本空手指導',
        
        // Guest notice
        'guest-title': '🎯 ゲストモードで体験中',
        'guest-desc': 'アカウントを作成すると、あなただけの練習記録を永続的に保存できます！',
        'guest-button': 'アカウント作成でデータを保存',
        'user-welcome': 'おかえりなさい、{name}さん！ 🥋',
        'user-tracking': 'あなた専用の練習記録をトラッキングしています'
    }
};

function switchLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ja' : 'en';
    window.currentLanguage = currentLanguage; // Update global variable
    updatePageLanguage();
    
    // Update language toggle button
    const languageToggle = document.querySelector('.language-toggle');
    if (languageToggle) {
        languageToggle.textContent = currentLanguage === 'en' ? '🌐 JP/EN' : '🌐 EN/JP';
    }
    
    // Save language preference
    localStorage.setItem('preferredLanguage', currentLanguage);
}

function updatePageLanguage() {
    const t = translations[currentLanguage];
    
    // Update navigation
    updateElementText('[href="#home"] .nav-link', t['nav-home']);
    updateElementText('[href="#dashboard"] .nav-link', t['nav-dashboard']);
    updateElementText('[href="#calendar"] .nav-link', t['nav-calendar']);
    updateElementText('[href="#library"] .nav-link', t['nav-library']);
    updateElementText('[href="#editor"] .nav-link', t['nav-editor']);
    updateElementText('[href="#about"] .nav-link', t['nav-about']);
    
    // Update hero section
    updateElementHTML('.hero-content h1', t['hero-title']);
    updateElementText('.hero-content p', t['hero-description']);
    updateElementContent('.cta-button.primary span', t['hero-start']);
    updateElementContent('.cta-button.secondary span', t['hero-learn']);
    
    // Update trust indicators
    updateElementText('.trust-item:nth-child(1) span', t['hero-authentic']);
    updateElementText('.trust-item:nth-child(2) span', t['hero-cc']);
    updateElementText('.trust-item:nth-child(3) span', t['hero-quality']);
    
    // Update dashboard
    updateElementText('.dashboard-header h2', t['dashboard-title']);
    updateElementText('.dashboard-header p', t['dashboard-subtitle']);
    updateElementHTML('.today-practice h3', `<i class="fas fa-calendar-check"></i> ${t['today-practice']}`);
    updateElementHTML('.streak-card h3', `<i class="fas fa-fire"></i> ${t['streak']}`);
    updateElementHTML('.phrase-card h3', `<i class="fas fa-quote-left"></i> ${t['monthly-wisdom']}`);
    
    // Update calendar section
    updateElementText('#calendar .section-header h2', t['calendar-title']);
    updateElementText('#calendar .section-header p', t['calendar-subtitle']);
    
    // Update video library
    updateElementText('#library .section-header h2', t['library-title']);
    updateElementText('#library .section-header p', t['library-subtitle']);
    
    // Update filter buttons
    updateElementText('[data-category="all"]', t['all-videos']);
    updateElementText('[data-category="kata"]', t['kata']);
    updateElementText('[data-category="kumite"]', t['kumite']);
    updateElementText('[data-category="kihon"]', t['kihon']);
    
    // Update search placeholder
    updateElementAttribute('#videoSearch', 'placeholder', t['search-videos']);
    
    // Update editor section
    updateElementText('#editor h2', t['editor-title']);
    updateElementHTML('#mirrorBtn', `<i class="fas fa-arrows-alt-h"></i> ${t['mirror']}`);
    updateElementHTML('#slowBtn', `<i class="fas fa-turtle"></i> ${t['slow']}`);
    updateElementHTML('#normalBtn', `<i class="fas fa-play"></i> ${t['normal']}`);
    updateElementHTML('#subtitleBtn', `<i class="fas fa-closed-captioning"></i> ${t['subtitle-toggle']}`);
    
    // Update about section
    updateElementText('#about .section-header h2', t['about-title']);
    updateElementText('#about .section-header p', t['about-subtitle']);
    
    // Update modal
    updateElementText('.emotion-modal-title', t['modal-title']);
    updateElementText('.emotion-modal-subtitle', t['modal-subtitle']);
    updateElementAttribute('#emotionComment', 'placeholder', t['modal-placeholder']);
    updateElementText('.emotion-skip-btn', t['skip']);
    updateElementText('#saveEmotionBtn', t['save-reflection']);
    
    // Update footer
    updateElementText('.footer-tagline', t['footer-tagline']);
    updateElementText('.footer-copy', t['footer-copy']);
    
    // Update user messages in JavaScript
    updateUserMessages();
    
    // Update video library if it exists
    if (window.karateService) {
        window.karateService.renderVideoGrid();
    }
}

function updateElementText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    }
}

function updateElementHTML(selector, html) {
    const element = document.querySelector(selector);
    if (element) {
        element.innerHTML = html;
    }
}

function updateElementContent(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    }
}

function updateElementAttribute(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.setAttribute(attribute, value);
    }
}

function updateUserMessages() {
    // Update guest notice and user welcome messages
    if (window.karateService) {
        window.karateService.updateDashboardForUser();
        // Update Today's feeling display if shown
        // Force update with current language
        setTimeout(() => {
            window.karateService.updateTodayDisplay();
        }, 100); // Small delay to ensure language change is processed
    }
}

// Load saved language preference on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && savedLanguage !== currentLanguage) {
        currentLanguage = savedLanguage;
        window.currentLanguage = currentLanguage; // Update global variable
        updatePageLanguage();
        
        // Update language toggle button
        const languageToggle = document.querySelector('.language-toggle');
        if (languageToggle) {
            languageToggle.textContent = currentLanguage === 'en' ? '🌐 JP/EN' : '🌐 EN/JP';
        }
    } else {
        // Ensure global variable is set even if no saved language
        window.currentLanguage = currentLanguage;
    }
});

// Make language switching globally available
window.switchLanguage = switchLanguage;
window.translations = translations;
window.currentLanguage = currentLanguage;