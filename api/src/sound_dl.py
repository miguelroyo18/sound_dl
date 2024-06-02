from flask import Flask, request, jsonify
from flask_cors import CORS

from downloader import Downloader

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


@app.route('/api/download_yt', methods=['POST'])
def download_yt():
    link = request.get_json()
    print(link)
    result = downloader.download(link)

    return jsonify({"message": "Download started"})

if __name__ == "__main__":
    downloader = Downloader()
    app.run(host='0.0.0.0', port=5000)