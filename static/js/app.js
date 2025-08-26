// yt-dlp Web Interface JavaScript

class VideoDownloader {
    constructor() {
        this.currentDownloadId = null;
        this.progressInterval = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Download form submission
        document.getElementById('downloadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startDownload();
        });

        // Get video info button
        document.getElementById('getInfoBtn').addEventListener('click', () => {
            this.getVideoInfo();
        });

        // File management buttons
        document.getElementById('refreshFilesBtn').addEventListener('click', () => {
            this.loadDownloadedFiles();
        });

        document.getElementById('cleanupBtn').addEventListener('click', () => {
            this.cleanupAllFiles();
        });

        // Auto-refresh files every 30 seconds
        setInterval(() => {
            this.loadDownloadedFiles();
        }, 30000);
    }

    async getVideoInfo() {
        const url = document.getElementById('videoUrl').value.trim();
        if (!url) {
            this.showError('Please enter a video URL');
            return;
        }

        const btn = document.getElementById('getInfoBtn');
        const originalText = btn.innerHTML;
        
        try {
            // Show loading state
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Getting Info...';
            btn.disabled = true;
            this.hideError();
            this.hideSuccess();

            const response = await fetch('/info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get video information');
            }

            this.displayVideoInfo(data);

        } catch (error) {
            console.error('Error getting video info:', error);
            this.showError(`Failed to get video information: ${error.message}`);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    displayVideoInfo(info) {
        const card = document.getElementById('videoInfoCard');
        const content = document.getElementById('videoInfoContent');

        let html = '<div class="row">';

        // Thumbnail
        if (info.thumbnail) {
            html += `
                <div class="col-md-3 mb-3">
                    <img src="${info.thumbnail}" alt="Video thumbnail" class="img-fluid video-thumbnail">
                </div>
            `;
        }

        // Video details
        html += `
            <div class="col-md-9">
                <div class="video-info-item">
                    <span class="video-info-label">Title:</span>
                    <div>${this.escapeHtml(info.title)}</div>
                </div>
                <div class="video-info-item">
                    <span class="video-info-label">Uploader:</span>
                    <div>${this.escapeHtml(info.uploader)}</div>
                </div>
        `;

        if (info.duration) {
            html += `
                <div class="video-info-item">
                    <span class="video-info-label">Duration:</span>
                    <div>${this.formatDuration(info.duration)}</div>
                </div>
            `;
        }

        if (info.view_count) {
            html += `
                <div class="video-info-item">
                    <span class="video-info-label">Views:</span>
                    <div>${info.view_count.toLocaleString()}</div>
                </div>
            `;
        }

        if (info.description) {
            html += `
                <div class="video-info-item">
                    <span class="video-info-label">Description:</span>
                    <div class="text-muted">${this.escapeHtml(info.description)}</div>
                </div>
            `;
        }

        html += '</div></div>';

        // Available formats
        if (info.formats && info.formats.length > 0) {
            html += `
                <div class="mt-3">
                    <h6 class="video-info-label">Available Formats:</h6>
                    <div class="format-list">
            `;

            info.formats.forEach(format => {
                const sizeText = format.filesize ? 
                    ` (${this.formatFileSize(format.filesize)})` : '';
                const qualityText = format.quality || 'Unknown quality';
                const resolutionText = format.height ? 
                    ` - ${format.width}x${format.height}` : '';

                html += `
                    <div class="format-item">
                        ${format.ext.toUpperCase()} - ${qualityText}${resolutionText}${sizeText}
                    </div>
                `;
            });

            html += '</div></div>';
        }

        content.innerHTML = html;
        card.style.display = 'block';

        // Scroll to video info
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async startDownload() {
        const url = document.getElementById('videoUrl').value.trim();
        if (!url) {
            this.showError('Please enter a video URL');
            return;
        }

        // Get download options
        const options = await this.getDownloadOptions();

        const btn = document.getElementById('downloadBtn');
        const originalText = btn.innerHTML;

        try {
            // Show loading state
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Starting...';
            btn.disabled = true;
            this.hideError();
            this.hideSuccess();

            const response = await fetch('/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url: url,
                    options: options
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start download');
            }

            this.currentDownloadId = data.download_id;
            this.showProgress();
            this.startProgressTracking();

        } catch (error) {
            console.error('Error starting download:', error);
            this.showError(`Failed to start download: ${error.message}`);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    async getDownloadOptions() {
        const options = {};

        // Quality selection
        const quality = document.getElementById('quality').value;
        if (quality) {
            options.format = quality;
        }

        // Format selection
        const format = document.getElementById('format').value;
        if (format) {
            options.format = `${options.format || 'best'}[ext=${format}]`;
        }

        // Audio only option
        if (document.getElementById('audioOnly').checked) {
            options.format = 'bestaudio/best';
            options.postprocessors = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }];
        }

        // Playlist option
        if (document.getElementById('downloadPlaylist').checked) {
            options.noplaylist = false;  // Allow playlist downloads
        }

        // Cookie handling
        const cookieText = document.getElementById('cookieText').value.trim();
        const cookieFile = document.getElementById('cookieFile').files[0];
        
        if (cookieFile) {
            // Read cookie file content
            const cookieContent = await this.readFileAsText(cookieFile);
            if (cookieContent) {
                options.cookiedata = cookieContent;
            }
        } else if (cookieText) {
            // Use pasted cookie text
            options.cookiedata = cookieText;
        }

        return options;
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    showProgress() {
        document.getElementById('progressCard').style.display = 'block';
        document.getElementById('progressCard').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    hideProgress() {
        document.getElementById('progressCard').style.display = 'none';
    }

    startProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.progressInterval = setInterval(() => {
            this.updateProgress();
        }, 1000);
    }

    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    async updateProgress() {
        if (!this.currentDownloadId) return;

        try {
            const response = await fetch(`/progress/${this.currentDownloadId}`);
            const progress = await response.json();

            if (!response.ok) {
                throw new Error(progress.error || 'Failed to get progress');
            }

            this.displayProgress(progress);

            // Handle completion or error
            if (progress.status === 'finished') {
                this.stopProgressTracking();
                this.showSuccess('Download completed successfully!', progress.filename);
                this.resetDownloadButton();
                this.loadDownloadedFiles();
            } else if (progress.status === 'error') {
                this.stopProgressTracking();
                this.showError(`Download failed: ${progress.error}`);
                this.hideProgress();
                this.resetDownloadButton();
            }

        } catch (error) {
            console.error('Error updating progress:', error);
            this.stopProgressTracking();
            this.showError(`Error tracking progress: ${error.message}`);
            this.hideProgress();
            this.resetDownloadButton();
        }
    }

    displayProgress(progress) {
        const progressBar = document.getElementById('progressBar');
        const progressInfo = document.getElementById('progressInfo');
        const progressDetails = document.getElementById('progressDetails');

        // Update progress bar
        const percent = progress.percent || 0;
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${percent.toFixed(1)}%`;

        // Update progress info
        if (progress.status === 'starting') {
            progressInfo.textContent = 'Preparing download...';
            progressDetails.innerHTML = '';
        } else if (progress.status === 'downloading') {
            progressInfo.textContent = `Downloading: ${this.getFileName(progress.filename)}`;
            
            // Update progress details
            let detailsHtml = '<div class="progress-details">';
            
            if (progress.speed) {
                detailsHtml += `
                    <div class="progress-detail-item">
                        <div class="progress-detail-value">${this.formatSpeed(progress.speed)}</div>
                        <div class="progress-detail-label">Speed</div>
                    </div>
                `;
            }

            if (progress.downloaded_bytes && progress.total_bytes) {
                detailsHtml += `
                    <div class="progress-detail-item">
                        <div class="progress-detail-value">
                            ${this.formatFileSize(progress.downloaded_bytes)} / 
                            ${this.formatFileSize(progress.total_bytes)}
                        </div>
                        <div class="progress-detail-label">Downloaded</div>
                    </div>
                `;
            }

            if (progress.eta) {
                detailsHtml += `
                    <div class="progress-detail-item">
                        <div class="progress-detail-value">${this.formatDuration(progress.eta)}</div>
                        <div class="progress-detail-label">ETA</div>
                    </div>
                `;
            }

            detailsHtml += '</div>';
            progressDetails.innerHTML = detailsHtml;
        }
    }

    resetDownloadButton() {
        const btn = document.getElementById('downloadBtn');
        btn.innerHTML = '<i class="fas fa-download me-1"></i>Download Video';
        btn.disabled = false;
    }

    async loadDownloadedFiles() {
        const container = document.getElementById('filesContainer');
        const loading = document.getElementById('filesLoading');

        try {
            loading.style.display = 'block';
            container.innerHTML = '';

            const response = await fetch('/downloads');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load files');
            }

            loading.style.display = 'none';

            if (data.files.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <h5>No Downloaded Files</h5>
                        <p class="text-muted">Downloaded files will appear here</p>
                    </div>
                `;
                return;
            }

            let html = '';
            data.files.forEach(file => {
                html += `
                    <div class="file-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${this.escapeHtml(file.filename)}</h6>
                                <div class="file-size">${file.size_mb} MB</div>
                                <div class="file-date">Modified: ${file.modified}</div>
                            </div>
                            <div class="btn-group">
                                <a href="https://play.tg-drive.eu.org/?m=https://tubevault.onrender.com/download_file/${encodeURIComponent(file.filename)}" 
                                   class="btn btn-primary btn-sm">
                                    <i class="fas fa-download me-1"></i>
                                    Descargar
                                </a>
                                <a href="/download_file/${encodeURIComponent(file.filename)}" 
                                   class="btn btn-primary btn-sm">
                                    <i class="fas fa-download me-1"></i>
                                    Ver
                                </a>
                                <button class="btn btn-outline-danger btn-sm" 
                                        onclick="app.deleteFile('${this.escapeHtml(file.filename)}')">
                                    <i class="fas fa-trash me-1"></i>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

        } catch (error) {
            console.error('Error loading files:', error);
            loading.style.display = 'none';
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading files: ${error.message}
                </div>
            `;
        }
    }

    async deleteFile(filename) {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/delete_file/${encodeURIComponent(filename)}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete file');
            }

            this.loadDownloadedFiles();

        } catch (error) {
            console.error('Error deleting file:', error);
            this.showError(`Failed to delete file: ${error.message}`);
        }
    }

    async cleanupAllFiles() {
        if (!confirm('Are you sure you want to delete ALL downloaded files? This cannot be undone.')) {
            return;
        }

        const btn = document.getElementById('cleanupBtn');
        const originalText = btn.innerHTML;

        try {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Cleaning...';
            btn.disabled = true;

            const response = await fetch('/cleanup', {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to cleanup files');
            }

            this.loadDownloadedFiles();

        } catch (error) {
            console.error('Error cleaning up files:', error);
            this.showError(`Failed to cleanup files: ${error.message}`);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    showError(message) {
        const alert = document.getElementById('errorAlert');
        const messageEl = document.getElementById('errorMessage');
        messageEl.textContent = message;
        alert.style.display = 'block';
        alert.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideError() {
        document.getElementById('errorAlert').style.display = 'none';
    }

    showSuccess(message, filename) {
        const alert = document.getElementById('successAlert');
        const messageEl = document.getElementById('successMessage');
        const downloadBtn = document.getElementById('downloadFileBtn');
        
        messageEl.textContent = message;
        
        if (filename) {
            downloadBtn.onclick = () => {
                window.location.href = `/download_file/${encodeURIComponent(this.getFileName(filename))}`;
            };
            downloadBtn.style.display = 'inline-block';
        } else {
            downloadBtn.style.display = 'none';
        }
        
        alert.style.display = 'block';
        alert.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.hideProgress();
    }

    hideSuccess() {
        document.getElementById('successAlert').style.display = 'none';
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatSpeed(bytesPerSecond) {
        return this.formatFileSize(bytesPerSecond) + '/s';
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    getFileName(filepath) {
        return filepath.split('/').pop().split('\\').pop();
    }
}

// Initialize the application
const app = new VideoDownloader();

// Global function for file operations (called from HTML)
function loadDownloadedFiles() {
    app.loadDownloadedFiles();
}
