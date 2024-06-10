import requests

class Invidious:
    def __init__(self):
        self.base_url = "https://yt.artemislena.eu"

    def search_playlists(self, query):
        response = requests.get(f'{self.base_url}/api/v1/search', params={'q': query, 'type': 'playlist'})
        if response.status_code == 200:
            playlists = response.json()
            sorted_playlists = sorted(playlists, key=lambda x: x.get('viewCount', 0), reverse=True)
            return sorted_playlists
        else:
            return None 

    def get_playlist_videos(self, playlist_id):
        response = requests.get(f'{self.base_url}/api/v1/playlists/{playlist_id}')
        if response.status_code == 200:
            playlist_details = response.json()
            return playlist_details.get('videos', [])
        else:
            print(f'Error: {response.status_code}')
            return [] 


def main():
    search_query = 'oppenheimer soundtrack'
    a = Invidious()
    playlists = a.search_playlists(search_query)
    # print(playlists)

    if playlists:
        for playlist in playlists:
            print(f"Title: {playlist['title']}, Author: {playlist['author']}, Items: {playlist['videoCount']}, Playlist ID: {playlist['playlistId']}")
            videos = a.get_playlist_videos(playlist['playlistId'])
            for video in videos:
                print(f"  Video Title: {video['title']}, Duration: {video['lengthSeconds']} seconds")
    else:
        print('No playlists found')


if __name__ == "__main__":
    main()