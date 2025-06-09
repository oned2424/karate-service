// 空手動画サービスのメインJavaScriptファイル

class KarateVideoService {
    constructor() {
        this.currentVideo = null;
        this.isMirrored = false;
        this.currentSpeed = 1;
        this.showSubtitles = false;
        this.videos = [];
        this.init();
    }

    init() {
        this.loadSampleVideos();
        this.setupEventListeners();
        this.setupVideoControls();
        this.setupSmoothScrolling();
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