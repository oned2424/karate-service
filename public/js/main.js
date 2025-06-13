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
        
        // ユーザー認証関連
        this.currentUser = null;
        this.isLoggedIn = false;
        
        this.init();
    }

    init() {
        this.loadSampleVideos();
        this.setupEventListeners();
        this.setupVideoControls();
        this.setupSmoothScrolling();
        this.setupVideoLibrary();
        
        // ユーザー認証初期化
        this.initUserAuth();
        
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
    
    // 100ms間隔で連続実行（最強レベル）
    setInterval(DESTROY_THREE_EMOJI_MODALS, 100);
    
    // 🔄 DOM監視システム - 新しい3つ絵文字モーダルを即座に破壊
    const observer = new MutationObserver((mutations) => {
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
        
        // 監視後も念のため撲滅システム実行
        setTimeout(DESTROY_THREE_EMOJI_MODALS, 1);
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
    
    // Initialize full calendar if calendar section exists
    if (document.getElementById('calendarDays')) {
        generateCalendar(currentMonth, currentYear);
        updateCalendarStats();
    }
    
    // Initialize Today's Practice display
    updateTodayDisplay();
    
    // Initialize statistics
    updateCalendarStats();
    updateDashboardStats();
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
    
    // 強化されたログイン状態チェック - ゲストユーザーには適切な値を表示
    const isLoggedIn = this.isLoggedIn === true && this.currentUser !== null;
    
    if (currentStreakEl) currentStreakEl.textContent = isLoggedIn ? this.streakData.current : 0;
    // LONGEST STREAK - ゲストユーザーは必ず0を表示
    if (longestStreakEl) {
        longestStreakEl.textContent = isLoggedIn ? this.streakData.longest : 0;
    }
    if (totalPracticeEl) totalPracticeEl.textContent = isLoggedIn ? this.streakData.total : 0;
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
};

// 認証状態チェック
KarateVideoService.prototype.checkAuthStatus = async function() {
    try {
        const response = await fetch('/api/user/auth-status');
        const result = await response.json();
        
        if (result.success) {
            this.isLoggedIn = result.isLoggedIn;
            this.currentUser = result.user;
            this.updateAuthUI();
        }
    } catch (error) {
        console.error('Auth status check error:', error);
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
    
    if (this.isLoggedIn && this.currentUser) {
        guestState.style.display = 'none';
        loggedInState.style.display = 'block';
        userName.textContent = this.currentUser.displayName || this.currentUser.username;
    } else {
        guestState.style.display = 'block';
        loggedInState.style.display = 'none';
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
        // ログインユーザー向け表示
        welcomeDiv.className = 'dashboard-user-welcome';
        welcomeDiv.innerHTML = `
            <h3>Welcome back, ${this.currentUser.displayName || this.currentUser.username}! 🥋</h3>
            <p>あなた専用の練習記録をトラッキングしています</p>
        `;
    } else {
        // ゲストユーザー向け表示
        welcomeDiv.className = 'guest-notice';
        welcomeDiv.innerHTML = `
            <h4>🎯 ゲストモードで体験中</h4>
            <p>アカウントを作成すると、あなただけの練習記録を永続的に保存できます！</p>
            <a href="/user-login.html" class="login-btn">
                <i class="fas fa-user-plus"></i>
                アカウント作成でデータを保存
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
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true);
        calendarDays.appendChild(dayElement);
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false);
        calendarDays.appendChild(dayElement);
    }
    
    // Next month's leading days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true);
        calendarDays.appendChild(dayElement);
    }
    
    // Update month display
    const monthDisplay = document.getElementById('monthDisplay');
    if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
    }
}

function createDayElement(day, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    } else {
        // emotionDataに該当データがある日だけ色を付与
        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
        const emotionEntry = emotionData[dateKey];
        if (emotionEntry && emotionEntry.emotion) {
            dayElement.classList.add('has-emotion', emotionEntry.emotion);
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

function saveEmotion() {
    if (selectedDay && selectedEmotion) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDay}`;
        const commentTextarea = document.getElementById('emotionComment');
        const comment = commentTextarea ? commentTextarea.value : '';
        
        // Debug logging for emotion data creation
        console.log('SAVING EMOTION:');
        console.log('Selected day:', selectedDay);
        console.log('Current year:', currentYear, 'Current month (0-indexed):', currentMonth);
        console.log('Generated date key:', dateKey);
        
        emotionData[dateKey] = {
            emotion: selectedEmotion,
            comment: comment
        };
        
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
            // If this is today's practice, record it on the server
            if (window.karateService) {
                recordTodayPractice();
            }
        }
        
        // CRITICAL: ALWAYS update Today's display to ensure calendar changes sync
        // This fixes the issue where calendar edits don't update Today's Practice display
        updateTodayDisplay();
        
        // Also update karate service state for today's completion
        if (dateKey === todayKey && window.karateService) {
            window.karateService.todayCompleted = true;
            window.karateService.updateTodayButton();
        }
        
        // If this was for today, reset the flag
        if (isSelectingForToday) {
            isSelectingForToday = false;
        }
        
        // Close modal
        closeEmotionModal();
        
        // Show notification if available
        if (window.karateService && window.karateService.showNotification) {
            window.karateService.showNotification(`${selectedDay}日の練習記録を保存しました`, 'success');
        }
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
    
    // CRITICAL: 強化されたログイン状態チェック - ゲストユーザーは必ずLONGEST STREAK = 0
    const isLoggedIn = window.karateService && 
                      window.karateService.isLoggedIn === true && 
                      window.karateService.currentUser !== null;
    
    if (fullCurrentStreakEl) fullCurrentStreakEl.textContent = isLoggedIn ? currentStreak : 0;
    if (fullLongestStreakEl) fullLongestStreakEl.textContent = isLoggedIn ? longestStreak : 0;
    if (fullCompletionRateEl) fullCompletionRateEl.textContent = isLoggedIn ? `${completionRate}%` : '0%';
    if (fullTotalDaysEl) fullTotalDaysEl.textContent = isLoggedIn ? totalCompletions : 0;
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
        const dateKey = `${miniCurrentYear}-${miniCurrentMonth + 1}-${day}`;
        const emotionEntry = emotionData[dateKey];
        
        if (emotionEntry && emotionEntry.emotion) {
            dayElement.classList.add('has-emotion', emotionEntry.emotion);
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
        
        // Update emotion display
        const emotionEmojis = {
            'mood-1': '😄',
            'mood-2': '😊', 
            'mood-3': '😐',
            'mood-4': '😕',
            'mood-5': '😟'
        };
        
        if (todayEmotionIcon) todayEmotionIcon.textContent = emotionEmojis[todayData.emotion] || '😐';
        if (todayEmotionLabel) todayEmotionLabel.textContent = `Today's feeling: ${todayData.emotion}`;
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