import os
import logging
import threading
import time
import json
import tempfile
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, flash, redirect, url_for
from werkzeug.middleware.proxy_fix import ProxyFix
import yt_dlp
import shutil
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Global variables for tracking downloads
download_progress = {}
download_status = {}

# Ensure downloads directory exists
DOWNLOADS_DIR = os.path.join(os.getcwd(), 'downloads')
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

class DownloadProgressHook:
    """Custom progress hook for yt-dlp downloads"""
    
    def __init__(self, download_id):
        self.download_id = download_id
        
    def __call__(self, d):
        global download_progress, download_status
        
        if d['status'] == 'downloading':
            # Extract progress information
            total_bytes = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
            downloaded_bytes = d.get('downloaded_bytes', 0)
            
            if total_bytes > 0:
                percent = (downloaded_bytes / total_bytes) * 100
            else:
                percent = 0
                
            speed = d.get('speed', 0)
            eta = d.get('eta', 0)
            
            download_progress[self.download_id] = {
                'status': 'downloading',
                'percent': round(percent, 1),
                'downloaded_bytes': downloaded_bytes,
                'total_bytes': total_bytes,
                'speed': speed,
                'eta': eta,
                'filename': d.get('filename', 'Unknown')
            }
            
        elif d['status'] == 'finished':
            download_progress[self.download_id] = {
                'status': 'finished',
                'percent': 100,
                'filename': d['filename']
            }
            download_status[self.download_id] = 'completed'
            
        elif d['status'] == 'error':
            download_progress[self.download_id] = {
                'status': 'error',
                'error': str(d.get('error', 'Unknown error'))
            }
            download_status[self.download_id] = 'error'

def download_video(url, download_id, options=None):
    """Download video using yt-dlp in a separate thread"""
    global download_progress, download_status
    
    try:
        # Set default options
        default_options = {
            'outtmpl': os.path.join(DOWNLOADS_DIR, '%(playlist_index)s - %(title)s.%(ext)s'),
            'format': 'best[height<=720]/best',  # Default to 720p or best available
            'progress_hooks': [DownloadProgressHook(download_id)],
            'noplaylist': True,  # Default to single video only (can be overridden)
        }
        
        # Merge with user options if provided
        if options:
            # Handle cookies separately
            cookiedata = options.pop('cookiedata', None)
            if cookiedata:
                # Write cookie data to temporary file for yt-dlp
                import tempfile
                cookie_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False)
                cookie_file.write(cookiedata)
                cookie_file.close()
                default_options['cookiefile'] = cookie_file.name
                logger.info(f"Using cookies from temporary file: {cookie_file.name}")
            
            default_options.update(options)
            
        # Initialize download status
        download_status[download_id] = 'downloading'
        download_progress[download_id] = {
            'status': 'starting',
            'percent': 0,
            'filename': 'Preparing download...'
        }
        
        # Create yt-dlp object and download
        with yt_dlp.YoutubeDL(default_options) as ydl:
            logger.info(f"Starting download for URL: {url}")
            ydl.download([url])
            
        logger.info(f"Download completed for ID: {download_id}")
        
        # Clean up temporary cookie file if it exists
        cookie_file = default_options.get('cookiefile')
        if cookie_file and os.path.exists(cookie_file):
            try:
                os.unlink(cookie_file)
                logger.info(f"Cleaned up temporary cookie file: {cookie_file}")
            except Exception as cleanup_error:
                logger.warning(f"Failed to cleanup cookie file: {cleanup_error}")
        
    except Exception as e:
        logger.error(f"Download failed for ID {download_id}: {str(e)}")
        download_status[download_id] = 'error'
        download_progress[download_id] = {
            'status': 'error',
            'error': str(e)
        }
        
        # Clean up temporary cookie file if it exists even on error
        try:
            cookie_file = default_options.get('cookiefile')
            if cookie_file and os.path.exists(cookie_file):
                try:
                    os.unlink(cookie_file)
                    logger.info(f"Cleaned up temporary cookie file after error: {cookie_file}")
                except Exception as cleanup_error:
                    logger.warning(f"Failed to cleanup cookie file after error: {cleanup_error}")
        except NameError:
            # default_options not yet defined, no cleanup needed
            pass

@app.route('/')
def index():
    """Main page with download interface"""
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def start_download():
    """Start a new download"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
            
        # Validate URL format
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return jsonify({'error': 'Invalid URL format'}), 400
            
        # Generate unique download ID
        download_id = f"download_{int(time.time() * 1000)}"
        
        # Get download options from request
        options = data.get('options', {})
        
        # Start download in background thread
        thread = threading.Thread(
            target=download_video,
            args=(url, download_id, options),
            daemon=True
        )
        thread.start()
        
        logger.info(f"Started download thread for ID: {download_id}")
        
        return jsonify({
            'success': True,
            'download_id': download_id,
            'message': 'Download started successfully'
        })
        
    except Exception as e:
        logger.error(f"Error starting download: {str(e)}")
        return jsonify({'error': f'Failed to start download: {str(e)}'}), 500

@app.route('/progress/<download_id>')
def get_progress(download_id):
    """Get download progress for a specific download ID"""
    try:
        progress = download_progress.get(download_id, {
            'status': 'not_found',
            'error': 'Download not found'
        })
        
        return jsonify(progress)
        
    except Exception as e:
        logger.error(f"Error getting progress for {download_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/downloads')
def list_downloads():
    """List all downloaded files"""
    try:
        files = []
        if os.path.exists(DOWNLOADS_DIR):
            for filename in os.listdir(DOWNLOADS_DIR):
                if filename != '.gitkeep':
                    filepath = os.path.join(DOWNLOADS_DIR, filename)
                    if os.path.isfile(filepath):
                        file_size = os.path.getsize(filepath)
                        file_modified = datetime.fromtimestamp(os.path.getmtime(filepath))
                        
                        files.append({
                            'filename': filename,
                            'size': file_size,
                            'size_mb': round(file_size / (1024 * 1024), 2),
                            'modified': file_modified.strftime('%Y-%m-%d %H:%M:%S')
                        })
        
        # Sort by modification time (newest first)
        files.sort(key=lambda x: x['modified'], reverse=True)
        
        return jsonify({'files': files})
        
    except Exception as e:
        logger.error(f"Error listing downloads: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/download_file/<filename>')
def download_file(filename):
    """Download a specific file"""
    try:
        filepath = os.path.join(DOWNLOADS_DIR, filename)
        
        # Security check: ensure file is in downloads directory
        if not os.path.abspath(filepath).startswith(os.path.abspath(DOWNLOADS_DIR)):
            return "Access denied", 403
            
        if not os.path.exists(filepath):
            return "File not found", 404
            
        return send_file(filepath, as_attachment=True, download_name=filename)
        
    except Exception as e:
        logger.error(f"Error downloading file {filename}: {str(e)}")
        return f"Error downloading file: {str(e)}", 500

@app.route('/delete_file/<filename>', methods=['POST'])
def delete_file(filename):
    """Delete a specific file"""
    try:
        filepath = os.path.join(DOWNLOADS_DIR, filename)
        
        # Security check: ensure file is in downloads directory
        if not os.path.abspath(filepath).startswith(os.path.abspath(DOWNLOADS_DIR)):
            return jsonify({'error': 'Access denied'}), 403
            
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
            
        os.remove(filepath)
        logger.info(f"Deleted file: {filename}")
        
        return jsonify({'success': True, 'message': 'File deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting file {filename}: {str(e)}")
        return jsonify({'error': f'Error deleting file: {str(e)}'}), 500

@app.route('/cleanup', methods=['POST'])
def cleanup_downloads():
    """Clean up all downloaded files"""
    try:
        if os.path.exists(DOWNLOADS_DIR):
            for filename in os.listdir(DOWNLOADS_DIR):
                if filename != '.gitkeep':
                    filepath = os.path.join(DOWNLOADS_DIR, filename)
                    if os.path.isfile(filepath):
                        os.remove(filepath)
        
        # Clear progress tracking
        download_progress.clear()
        download_status.clear()
        
        logger.info("Cleaned up all downloads")
        return jsonify({'success': True, 'message': 'All files cleaned up successfully'})
        
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        return jsonify({'error': f'Error during cleanup: {str(e)}'}), 500

@app.route('/info', methods=['POST'])
def get_video_info():
    """Get video information without downloading"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
            
        # Configure yt-dlp for info extraction only
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Extract relevant information
            video_info = {
                'title': info.get('title', 'Unknown Title') if info else 'Unknown Title',
                'uploader': info.get('uploader', 'Unknown Uploader') if info else 'Unknown Uploader',
                'duration': info.get('duration', 0) if info else 0,
                'view_count': info.get('view_count', 0) if info else 0,
                'description': '',
                'thumbnail': info.get('thumbnail', '') if info else '',
                'formats': []
            }
            
            # Handle description safely
            if info and info.get('description'):
                desc = info.get('description', '')
                video_info['description'] = desc[:200] + '...' if len(desc) > 200 else desc
            
            # Extract available formats
            if info and 'formats' in info and info['formats']:
                for fmt in info['formats']:
                    if fmt.get('vcodec') != 'none':  # Video formats only
                        format_info = {
                            'format_id': fmt.get('format_id', ''),
                            'ext': fmt.get('ext', ''),
                            'quality': fmt.get('format_note', ''),
                            'filesize': fmt.get('filesize', 0),
                            'height': fmt.get('height', 0),
                            'width': fmt.get('width', 0)
                        }
                        video_info['formats'].append(format_info)
            
            return jsonify(video_info)
            
    except Exception as e:
        logger.error(f"Error getting video info: {str(e)}")
        return jsonify({'error': f'Failed to get video information: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
