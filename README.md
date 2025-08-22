# **TubeVault** 🎥💾

> ⚡ Now available in two options! 
> - Use the **existing web app / CLI** (instructions below remain unchanged).  
> - Or try the new **Google Colab Notebook**, which auto-detects video/playlist and lets you pick qualities just like YouTube’s menu

## **First Option ; Web App** _(best recommended for users with pc or laptop)_    

**TubeVault is a powerful, easy-to-use YouTube video and playlist downloader built with *Python* and *yt-dlp*.**  
**It allows you to download videos, audio, and entire playlists with just a few clicks or commands.**

---

### 🚀 **Features**
- 📥 Download individual YouTube videos or entire playlists
- 🎶 Extract audio in MP3/other formats
- ⚡ Fast downloads powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- 🌐 Simple web interface (Flask-based)
- 💻 Command-line usage for advanced users
- 📂 Automatically saves files in organized folders

---

### 📦 Installation

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

#### 🔧 Advanced Usage (yt-dlp Options)
You can use all yt-dlp flags directly in the command line. Example:

```bash
yt-dlp -f bestaudio[ext=m4a] https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

---

#### 📂 Project Structure
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

## 🆕 **Second Option ; Google Colab Notebook**

For those who prefer a cloud-based solution:

- **Auto-detects** whether the link is a **single video** or a **playlist**  
- **Single video:** shows all exact available formats (144p–1080p+, audio-only, etc.)  
- **Playlist:** lets you choose a **target quality** (360p, 480p, 720p, 1080p, best, audio-only)  
- **Graceful fallback** if a chosen resolution isn’t available  
- Optional `cookies.txt` upload for login/age-restricted videos  
- Files save automatically to `MyDrive/YT-Downloads`  

👉 Open the notebook here:  
[TubeVault.ipynb](./TubeVault.ipynb)

### **How to use**:
1. Open the notebook in **Google Colab**.  
2. Run the **Setup cell** to install `yt-dlp` and mount Google Drive.  
3. (Optional) Upload `cookies.txt` if required.  
4. Paste your YouTube link and select quality.  
5. Downloads will appear in `MyDrive/YT-Downloads`.

---
### 🤝 **Contributing**
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

### 📜 **License**
This project is licensed under the MIT License – see the LICENSE file for details.

---

### 👤 Author
- **James Ngaihte** ([@ngaihtejames](https://github.com/ngaihtejames))
