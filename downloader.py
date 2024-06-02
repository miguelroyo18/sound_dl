import yt_dlp

ydl_opts = {
    'format': 'bestvideo+bestaudio/best',
    'keepvideo': False,
    'outtmpl': '%(playlist)s/%(title)s.mp3',
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download(['https://youtube.com/playlist?list=OLAK5uy_mILURVALxTqJ_zGiItm1omaSNWl28HCkw&feature=shared'])