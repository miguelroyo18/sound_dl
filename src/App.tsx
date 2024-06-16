import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  PlatformColor,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#333' : '#FFF',
  };

  const backgroundCol = {
    backgroundColor: isDarkMode ? '#555' : '#F5F5F5'
  };

  const textColor = {
    color: isDarkMode ? '#FFF' : '#000',
  };

  const get_accentColor = () => {
    if (isDarkMode) {
      return { backgroundColor: PlatformColor('SystemAccentColorLight1')};
    } else {
      return { backgroundColor: PlatformColor('SystemAccentColorLight3')};
    }
  };

  const [searchResults, updateSearchResults] = useState([]);
  const [itemsFromPlaylist, setItemsFromPlaylist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlaylistID, setSelectedPlaylistID] = useState('');
  const [downloadingStatus, setDownloadingStatus] = useState(null);


  const handlePlaylistSearch = async () => {
    updateSearchResults([]);
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/api/get_playlists?query=${searchQuery}+soundtrack`);
      if (!response.ok) {
        throw new Error('HTTP error! Status: ${response.status}');
      }

      const data = await response.json();
      updateSearchResults(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }; 

  const handleItemsFromPlaylistSearch = async (playlistID) => {
    if (playlistID === selectedPlaylistID) {
      setSelectedPlaylistID('');
    } else {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/get_videos_from_playlist?playlistID=${playlistID}`);
        if (!response.ok) {
          throw new Error('HTTP error! Status: ${response.status}');
        }

        const data = await response.json();
        setItemsFromPlaylist(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setSelectedPlaylistID(playlistID);
      }
    }
  };

  const downloadPlaylist = async (playlistID) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link: `https://youtube.com/playlist?list=${playlistID}`}),
      });
    } catch (error) {
      console.error('Error downloading playlist:', error);
    }
  };

  const fetchDownloadingStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/get_status');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const status = await response.json();
      if (status && status.status === 'downloading' && status.title) {
        setDownloadingStatus(status);
      } else {
        setDownloadingStatus(null);
      }
    } catch (error) {
      console.error('Error fetching downloading status:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDownloadingStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formatBytes = (bytes) => {
    const sizes = ['b', 'KiB', 'MiB', 'GiB', 'TiB'];
  
    if (bytes === 0) return '0 b';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
  };


  const renderPlaylist = ({ item }) => (
    <View style={styles.playlists}>
      <View style={[styles.playlistInfo, backgroundCol]}>
        <Image
          source={{ uri: item.playlistThumbnail }}
          style={styles.thumbnail}
        />
        <View style={styles.trackInfo}>
          <Text style={[styles.tittleText, textColor]}>{item.title}</Text>
          <Text style={[styles.bottomBarText, textColor]}>{item.author} &#8226; {item.videoCount} items</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, get_accentColor()]}
            onPress={() => handleItemsFromPlaylistSearch(item.playlistId)}
          >
            {selectedPlaylistID === item.playlistId && <Text style={[styles.buttonText, textColor]}>⯅</Text>}
            {selectedPlaylistID !== item.playlistId && <Text style={[styles.buttonText, textColor]}>⯆</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, get_accentColor()]}
            onPress={() => downloadPlaylist(item.playlistId)}
          >
            <Text style={[styles.buttonText, textColor]}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
      {selectedPlaylistID === item.playlistId && (
        <View style={[styles.tracksContainer, backgroundCol]}>
          <FlatList
            data={itemsFromPlaylist}
            renderItem={renderVideo}
            ItemSeparatorComponent={() => <View style={styles.tracksDivider} />}
          />
        </View>
      )}
    </View>
  );

  const renderVideo = ({ item }) => (
    <View style={styles.playlists}>
      <View style={styles.tittleText}>
        <Text style={[styles.tittleText, textColor]}>{item.title}</Text>
        <Text style={[styles.bottomBarText, textColor]}>{item.author} &#8226; {formatTime(item.lengthSeconds)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        <View style={[styles.leftColumn, backgroundStyle]}>
          <TextInput
            style={[styles.searchBar, textColor]}
            placeholder="Search soundtrack..."
            placeholderTextColor={isDarkMode ? '#AAA' : '#555'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handlePlaylistSearch}
          />
          {loading && <ActivityIndicator style={styles.loadingIndicator} size="large" color={textColor.color} />}
          {searchResults.length === 0 && !loading && (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, textColor]}>No searches yet.</Text>
            </View>
          )}
          <FlatList
            data={searchResults}
            renderItem={renderPlaylist}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.resultsContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <View style={styles.divider} />
        <View style={[styles.rightColumn, backgroundStyle]}>
        {downloadingStatus ? (
            <View style={[styles.downloadingStatusContainer, backgroundCol]}>
              <Image source={{ uri: downloadingStatus.thumbnail }} style={styles.downloadingThumbnail} />
              <View style={styles.tracksDivider} />
              <View style={styles.downloadingInfo}>
                <Text style={[styles.tittleText, textColor]}>{downloadingStatus.title}</Text>
                <ProgressBar
                  progress={(downloadingStatus.downloaded_bytes / downloadingStatus.total_bytes) * 10000}
                  width={null}
                  color={PlatformColor('SystemAccentColorLight2')}
                  style={styles.progressBar}
                />
                <Text style={[styles.bottomBarText, textColor]}>Downloading...</Text>
                <Text style={[styles.bottomBarText, textColor]}>
                  {(downloadingStatus.downloaded_bytes / downloadingStatus.total_bytes * 100).toFixed(2)}% complete at {formatBytes(downloadingStatus.speed)}/s
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.downloadingStatusContainer, backgroundCol]}>
              <Image source={{ uri: 'https://via.placeholder.com/750?text=No+current+downloads' }} style={styles.downloadingThumbnail} />
              <View style={styles.tracksDivider} />
              <View style={styles.downloadingInfo}>
                <Text style={[styles.tittleText, textColor]}>No downloads</Text>
                <Text style={[styles.bottomBarText, textColor]}>There are currently no downloads in progress.</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarText}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 3,
    marginTop: 10,
    gap: 5,
    padding: 10,
  },
  rightColumn: {
    flex: 2,
    padding: 10,
    marginTop: 10,
    gap: 5
  },
  searchBar: {
    height: 35,
    width: '98%',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    alignSelf: 'center'
  },
  resultsContainer: {
    flexGrow: 1
  },
  playlists: {
    borderRadius: 5,
  },
  playlistInfo: {
    alignSelf: 'center',
    width: '98%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
  },
  tracksContainer: {
    alignSelf: 'center',
    width: '98%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  trackInfo: {
    marginRight: 10,
    width: '100%',
    marginTop: 10,
    marginLeft: 5
  },
  tittleText: {
    fontSize: 15,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 5,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginStart: 'auto',
    marginLeft: 10,
    marginTop: 13,
    marginRight: 5,
    height: 35
  },
  buttonContainer: {
    flexDirection: 'row',
    marginStart: 'auto',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
  },
  divider: {
    width: 1,
    backgroundColor: 'gray',
  },
  tracksDivider: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 10,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
  },
  downloadingStatusContainer: {
    flex: 1,
    borderRadius: 5,
    padding: 10,
    paddingHorizontal: 20,
    width: '97%',
    alignSelf: 'center'
  },
  downloadingInfo: {
    marginTop: 20,
    flexShrink: 1,
  },
  downloadingThumbnail: {
    marginTop: 30,
    marginBottom: 30,
    alignSelf: 'center',
    width: '38%',
    height: '25%',
    borderRadius: 5,
  },
  progressBar: {
    marginBottom: 5,
    marginTop: 15,
    borderRadius: 10,
  },
  bottomBar: {
    height: 20,
    justifyContent: 'center',
    paddingLeft: 5,
    alignItems: 'flex-start',
    borderColor: 'grey',
    borderTopWidth: 0.5 
  },
  bottomBarText: {
    fontSize: 12,
    color: 'grey'
  },
});

export default App;
