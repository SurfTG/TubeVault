# Overview

This is a web-based video downloader application that provides a user-friendly interface for downloading videos from YouTube, Vimeo, TikTok, and hundreds of other platforms using yt-dlp. The application features a Flask backend with real-time download progress tracking, file management capabilities, and a responsive Bootstrap-based frontend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Vanilla JavaScript with Bootstrap 5 (dark theme)
- **UI Components**: Responsive web interface with collapsible advanced options, real-time progress tracking, and file management
- **Styling**: Bootstrap CSS with custom styles for animations and hover effects
- **Client-Side Logic**: JavaScript class-based architecture for handling downloads, progress updates, and file operations

## Backend Architecture
- **Framework**: Flask (Python web framework)
- **Application Structure**: Single-file Flask application with modular components
- **Progress Tracking**: Custom progress hook system for real-time download monitoring
- **File Management**: Local file system storage with cleanup capabilities
- **Request Handling**: RESTful API endpoints for video operations and file management

## Core Features
- **Video Information Retrieval**: Pre-download video metadata extraction
- **Multiple Format Support**: Audio-only, video-only, and combined format downloads
- **Quality Selection**: Configurable video quality and format options
- **Real-time Progress**: Live download progress with speed and ETA tracking
- **File Management**: Downloaded file listing, cleanup, and direct download links

## Data Storage
- **File Storage**: Local filesystem storage in dedicated downloads directory
- **Progress Data**: In-memory storage using global dictionaries for download status and progress
- **Session Management**: Flask sessions with configurable secret key

## Error Handling
- **Download Errors**: Comprehensive error catching with user-friendly messages
- **Progress Monitoring**: Graceful handling of download interruptions and status updates
- **File Operations**: Safe file handling with existence checks and cleanup routines

# External Dependencies

## Core Libraries
- **yt-dlp**: Primary video downloading engine supporting hundreds of platforms
- **Flask**: Web framework for HTTP request handling and routing
- **Werkzeug**: WSGI utilities including proxy fix for deployment environments

## Frontend Dependencies
- **Bootstrap 5**: UI framework with Replit dark theme integration
- **Font Awesome**: Icon library for enhanced user interface
- **CDN-hosted Resources**: External CSS and JavaScript libraries for styling and functionality

## System Requirements
- **Python Environment**: Standard Python installation with pip package management
- **File System Access**: Local directory creation and file manipulation permissions
- **Network Access**: HTTP/HTTPS connectivity for video platform access and CDN resources

## Deployment Considerations
- **WSGI Compatibility**: ProxyFix middleware for reverse proxy deployments
- **Environment Variables**: Configurable session secrets and debugging options
- **Port Configuration**: Flexible port binding for various hosting environments