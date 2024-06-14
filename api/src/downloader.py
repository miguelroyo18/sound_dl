import yt_dlp

class Downloader:
    def __init__(self):
        self.ydl_opts = {
            'format': 'bestvideo+bestaudio/best',
            'keepvideo': False,
            'outtmpl': '%(playlist)s/%(title)s.mp3',
            'progress_hooks': [self.__progress_hook],
        }
        self.info = None

    def __progress_hook(self, d):
        thumbnails = d['info_dict'].get('thumbnails', [])
        if thumbnails:
            # Sort thumbnails by resolution or by width (assuming higher width means better quality)
            thumbnails.sort(key=lambda x: x.get('width', 0), reverse=True)
            best_thumbnail_url = thumbnails[0].get('url', '')
        else:
            best_thumbnail_url = ''
        info = {
            'title': d['filename'],
            'downloaded_bytes': d['downloaded_bytes'],
            'total_bytes': d['total_bytes'],
            'status': d['status'],
            'speed': d['speed'],
            'thumbnail': best_thumbnail_url
        }
        self.info = info

    def download(self, link):
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            ydl.download([link])

    def fetch_status(self):
        return self.info


def main():
    d = Downloader()
    d.download('https://youtube.com/playlist?list=OLAK5uy_mILURVALxTqJ_zGiItm1omaSNWl28HCkw&feature=shared')

if __name__ == "__main__":
    main()
