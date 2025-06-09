// Admin Dashboard JavaScript

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.videos = [];
        this.stats = {};
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupFileUpload();
    }

    checkAuthentication() {
        if (localStorage.getItem('adminAuthenticated') !== 'true') {
            window.location.href = '/admin/index.html';
            return;
        }
        
        const adminUser = localStorage.getItem('adminUser');
        document.getElementById('adminUsername').textContent = adminUser || 'Admin';
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.showSection(section);
            });
        });

        // Video upload form
        document.getElementById('videoUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadVideo();
        });

        // Edit video form
        document.getElementById('editVideoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateVideo();
        });

        // Search functionality
        document.getElementById('videoSearch')?.addEventListener('input', (e) => {
            this.searchVideos(e.target.value);
        });
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'videos':
                this.loadVideos();
                break;
            case 'upload':
                this.resetUploadForm();
                break;
        }
    }

    async loadDashboardData() {
        try {
            const [statsResponse, videosResponse] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/videos')
            ]);

            this.stats = await statsResponse.json();
            const videosData = await videosResponse.json();
            this.videos = videosData.data || [];

            this.updateStatistics();
            this.loadRecentVideos();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        }
    }

    updateStatistics() {
        if (this.stats.success) {
            const data = this.stats.data;
            document.getElementById('totalVideos').textContent = data.totalVideos || 0;
            document.getElementById('totalViews').textContent = this.formatNumber(data.totalViews || 0);
            document.getElementById('activeUsers').textContent = this.formatNumber(2500); // Demo data
            document.getElementById('avgRating').textContent = '4.9';
        }
    }

    loadRecentVideos() {
        const recentVideos = this.videos.slice(0, 5);
        const tableHtml = this.generateVideosTable(recentVideos, true);
        document.getElementById('recentVideosTable').innerHTML = tableHtml;
    }

    async loadVideos() {
        try {
            const response = await fetch('/api/videos');
            const data = await response.json();
            this.videos = data.data || [];
            this.renderVideosTable();
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showNotification('Error loading videos', 'error');
        }
    }

    renderVideosTable() {
        const tableBody = document.getElementById('videosTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = this.videos.map(video => `
            <tr>
                <td>
                    <div class="video-thumbnail">
                        <i class="fas fa-play"></i>
                    </div>
                </td>
                <td>
                    <div>
                        <strong>${video.title}</strong>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            ${video.attribution}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="category-badge ${video.category}">
                        ${this.formatCategory(video.category)}
                    </span>
                </td>
                <td>${video.duration || 'N/A'}</td>
                <td>${this.formatNumber(video.views || 0)}</td>
                <td>
                    <span class="status-badge active">Active</span>
                </td>
                <td>
                    <div class="video-actions">
                        <button class="action-btn edit" onclick="adminDashboard.editVideo(${video.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminDashboard.deleteVideo(${video.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    generateVideosTable(videos, isRecent = false) {
        const headers = isRecent 
            ? ['Title', 'Category', 'Views', 'Date']
            : ['Thumbnail', 'Title', 'Category', 'Duration', 'Views', 'Status', 'Actions'];
        
        return `
            <table class="videos-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${videos.map(video => {
                        if (isRecent) {
                            return `
                                <tr>
                                    <td><strong>${video.title}</strong></td>
                                    <td>${this.formatCategory(video.category)}</td>
                                    <td>${this.formatNumber(video.views || 0)}</td>
                                    <td>${video.uploadDate || 'N/A'}</td>
                                </tr>
                            `;
                        }
                        return this.renderVideosTable();
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    setupFileUpload() {
        const fileInput = document.getElementById('videoFile');
        const uploadArea = document.querySelector('.file-upload-area');
        const selectedFileDiv = document.getElementById('selectedFile');

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
                fileInput.files = files;
            }
        });
    }

    handleFileSelect(file) {
        const selectedFileDiv = document.getElementById('selectedFile');
        
        if (file) {
            if (file.type !== 'video/mp4') {
                this.showNotification('Please select an MP4 video file', 'error');
                return;
            }
            
            if (file.size > 100 * 1024 * 1024) { // 100MB
                this.showNotification('File size must be less than 100MB', 'error');
                return;
            }

            selectedFileDiv.innerHTML = `
                <i class="fas fa-file-video"></i>
                <strong>${file.name}</strong>
                <span>(${this.formatFileSize(file.size)})</span>
            `;
            selectedFileDiv.style.display = 'block';
        }
    }

    async uploadVideo() {
        const form = document.getElementById('videoUploadForm');
        const formData = new FormData(form);
        
        // Validation
        const requiredFields = ['title', 'category', 'license', 'attribution'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                this.showNotification(`${field} is required`, 'error');
                return;
            }
        }

        const fileInput = document.getElementById('videoFile');
        if (!fileInput.files[0]) {
            this.showNotification('Please select a video file', 'error');
            return;
        }

        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Video uploaded successfully!', 'success');
                this.resetUploadForm();
                this.loadDashboardData();
            } else {
                this.showNotification(result.message || 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Upload failed. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    editVideo(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        document.getElementById('editVideoId').value = video.id;
        document.getElementById('editVideoTitle').value = video.title;
        document.getElementById('editVideoDescription').value = video.description || '';
        document.getElementById('editVideoCategory').value = video.category;

        this.showModal('editVideoModal');
    }

    async updateVideo() {
        const videoId = document.getElementById('editVideoId').value;
        const title = document.getElementById('editVideoTitle').value;
        const description = document.getElementById('editVideoDescription').value;
        const category = document.getElementById('editVideoCategory').value;

        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    category
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Video updated successfully!', 'success');
                this.closeModal('editVideoModal');
                this.loadVideos();
            } else {
                this.showNotification(result.message || 'Update failed', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            this.showNotification('Update failed. Please try again.', 'error');
        }
    }

    async deleteVideo(videoId) {
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }

        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Video deleted successfully!', 'success');
                this.loadVideos();
                this.loadDashboardData();
            } else {
                this.showNotification(result.message || 'Delete failed', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Delete failed. Please try again.', 'error');
        }
    }

    searchVideos(query) {
        if (!query) {
            this.renderVideosTable();
            return;
        }

        const filteredVideos = this.videos.filter(video =>
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.description.toLowerCase().includes(query.toLowerCase()) ||
            video.category.toLowerCase().includes(query.toLowerCase())
        );

        this.videos = filteredVideos;
        this.renderVideosTable();
    }

    resetUploadForm() {
        document.getElementById('videoUploadForm').reset();
        document.getElementById('selectedFile').style.display = 'none';
        document.querySelector('.file-upload-area').classList.remove('dragover');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #10b981;' : ''}
            ${type === 'error' ? 'background: #ef4444;' : ''}
            ${type === 'info' ? 'background: #3b82f6;' : ''}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatCategory(category) {
        const categories = {
            'kata': 'Kata (Forms)',
            'kumite': 'Kumite (Sparring)',
            'kihon': 'Kihon (Basics)'
        };
        return categories[category] || category;
    }

    refreshVideos() {
        this.loadVideos();
        this.showNotification('Videos refreshed', 'success');
    }
}

// Global functions
function showSection(sectionName) {
    window.adminDashboard.showSection(sectionName);
}

function closeModal(modalId) {
    window.adminDashboard.closeModal(modalId);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/index.html';
    }
}

function refreshVideos() {
    window.adminDashboard.refreshVideos();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .category-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .category-badge.kata {
        background: rgba(99, 102, 241, 0.1);
        color: #4338ca;
    }
    
    .category-badge.kumite {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
    }
    
    .category-badge.kihon {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
    }
    
    .content-section {
        display: none;
    }
    
    .content-section.active {
        display: block;
    }
    
    .admin-user {
        color: var(--text-secondary);
        font-size: 0.95rem;
    }
    
    .license-cards {
        margin-top: 1rem;
    }
    
    .license-card {
        background: white;
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .license-card h4 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }
    
    .license-requirements {
        margin-top: 1rem;
    }
    
    .license-requirements ul {
        margin-top: 0.5rem;
        padding-left: 1.5rem;
    }
    
    .search-controls input {
        padding: 0.75rem 1rem;
        border: 1px solid var(--border);
        border-radius: 6px;
        font-size: 0.95rem;
        width: 250px;
    }
`;
document.head.appendChild(style);