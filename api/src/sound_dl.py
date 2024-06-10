from flask import Flask, request, jsonify
from flask_cors import CORS

from downloader import Downloader
from invidious import Invidious

app = Flask(__name__)
CORS(app)


@app.route('/api/get_status', methods=['GET'])
def get_status():
    try:
        status = downloader.fetch_status()
        print(status)
        return jsonify(status)
    except request.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/download', methods=['POST'])
def download():
    link = request.args.get('link', '')
    downloader.download(link)
    return jsonify({"message": "Download started"})


@app.route('/api/get_playlists', methods=['GET'])
def get_playlists():
    search_query = request.args.get('query', '')
    try:
        results = invidious.search_playlists(search_query)
        return results
    except request.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/get_videos_from_playlist', methods=['GET'])
def get_videos_from_playlist():
    playlistID = request.args.get('playlistID', '')
    try:
        results = invidious.get_playlist_videos(playlistID)
        return results
    except request.RequestException as e:
        return jsonify({"error": str(e)}), 500
        

if __name__ == "__main__":
    downloader = Downloader()
    invidious = Invidious()
    app.run(host='0.0.0.0', port=5000)