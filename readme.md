Here’s the full README.md content (including the advanced usage section) in plain text format so you can upload it as README.md into your GitHub repo:

⸻


# 🎬 TubeVault

TubeVault is a simple web-based video & audio downloader powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp).  
It allows you to download videos, audio, or entire playlists directly by pasting a link — all from your browser.  

---

## 🚀 Features
- ✅ Paste any video/playlist URL and download directly
- ✅ Powered by **yt-dlp** (supports 1000+ sites)
- ✅ Beginner friendly interface
- ✅ Works on desktop or mobile (iPhone/iPad/Android too)
- ✅ Supports playlists, subtitles, audio-only downloads
- ✅ Free and open-source

---

## 📦 Installation

### Option 1: Run on Replit
1. Fork this repo into your own Replit account.
2. Replit will auto-detect Python and install dependencies.
3. Run the project and copy the generated web URL.
4. Bookmark/save that URL — it’s now your personal downloader.

### Option 2: Run Locally
Make sure you have Python 3 installed, then:

```bash
git clone https://github.com/ngaihtejames/TubeVault.git
cd TubeVault
pip install -r requirements.txt
python app.py

The app will start on http://127.0.0.1:5000

⸻

🔧 Advanced Usage (yt-dlp Options)

TubeVault is powered by yt-dlp, which supports hundreds of options.
Here are some common ones you might want to use:

🎵 Audio-only

Download just the audio (best quality, MP3 format):

yt-dlp -x --audio-format mp3 "<VIDEO_URL>"

📺 Best Video Quality

Download the highest available quality (video + audio):

yt-dlp -f "bestvideo+bestaudio/best" "<VIDEO_URL>"

📂 Download Playlist

Download all videos in a playlist:

yt-dlp -o "%(playlist_title)s/%(title)s.%(ext)s" "<PLAYLIST_URL>"

🌐 Subtitles

Download video with English subtitles (if available):

yt-dlp --write-subs --sub-lang en --embed-subs "<VIDEO_URL>"

🧹 Custom Output Filename

Save downloads with custom names:

yt-dlp -o "%(title)s.%(ext)s" "<VIDEO_URL>"


⸻

🖥 How to Use These in TubeVault
	•	The web app already handles basic downloads by default.
	•	To enable advanced options:
	1.	Open app.py.
	2.	Find where yt-dlp is called.
	3.	Add your desired options (for example, --audio-format mp3).
	•	Re-deploy your app, and the new options will be available.

⸻

⚖️ Disclaimer

This project is for personal and educational purposes only.
Please respect copyright laws and only download content you have the rights to.

⸻

👤 Author
	•	Built by ngaihtejames

---

Do you want me to also generate you a **version of `app.py` with a dropdown menu for selecting (Video / Audio only / With Subtitles)** so it’s beginner-friendly without editing code?
