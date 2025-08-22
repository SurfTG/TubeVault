# TubeVault 🎥💾

TubeVault is a powerful, easy-to-use YouTube video and playlist downloader built with **Python** and **yt-dlp**.  
It allows you to download videos, audio, and entire playlists with just a few clicks or commands.

---

## 🚀 Features
- 📥 Download individual YouTube videos or entire playlists
- 🎶 Extract audio in MP3/other formats
- ⚡ Fast downloads powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- 🌐 Simple web interface (Flask-based)
- 💻 Command-line usage for advanced users
- 📂 Automatically saves files in organized folders

---

## 📦 Installation

### Option 1: Run via GitHub (Recommended)
1. Clone the repository:
   ```bash
   git clone https://github.com/ngaihtejames/TubeVault.git
   cd TubeVault
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the app:
   ```bash
   python app.py
   ```

4. Open your browser and go to:
   ```
   http://127.0.0.1:5000
   ```

---

### Option 2: Run Locally
Make sure you have Python 3 installed, then run:

```bash
git clone https://github.com/ngaihtejames/TubeVault.git
cd TubeVault
pip install -r requirements.txt
python app.py
```

The app will start on http://127.0.0.1:5000

---

## 🔧 Advanced Usage (yt-dlp Options)
You can use all yt-dlp flags directly in the command line. Example:

```bash
yt-dlp -f bestaudio[ext=m4a] https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

---

## 📂 Project Structure
```
TubeVault/
│── app.py             # Main Flask app
│── requirements.txt   # Dependencies
│── static/            # CSS, JS, assets
│── templates/         # HTML templates
│── downloads/         # Saved videos/audio
│── README.md          # Project documentation
```

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License
This project is licensed under the MIT License – see the LICENSE file for details.

---

## 👤 Author
- **James Ngaihte** ([@ngaihtejames](https://github.com/ngaihtejames))
