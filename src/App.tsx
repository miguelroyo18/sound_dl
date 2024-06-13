import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  PlatformColor,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#333' : '#FFF',
  };

  const textColor = {
    color: isDarkMode ? '#FFF' : '#000',
  };

  const get_accentColor = () => {
    return { backgroundColor: PlatformColor('SystemAccentColor')};
  };

  const [searchResults, updateSearchResults] = useState([]);
  const [itemsFromPlaylist, setItemsFromPlaylist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlaylistID, setSelectedPlaylistID] = useState('');

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

  const renderPlaylist = ({ item }) => (
    <View style={styles.resultItem}>
      <View style={styles.playlistInfo}>
        <View style={styles.itemInfo}>
          <Text style={[styles.resultText, textColor]}>{item.title}</Text>
          <Text style={[styles.bottomBarText, textColor]}>{item.author} &#8226; {item.videoCount} items</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, get_accentColor()]}
          onPress={() => handleItemsFromPlaylistSearch(item.playlistId)}
        >
          {selectedPlaylistID === item.playlistId && <Text style={[styles.buttonText, textColor]}>⯅</Text>}
          {selectedPlaylistID !== item.playlistId && <Text style={[styles.buttonText, textColor]}>⯆</Text>}
        </TouchableOpacity>
      </View>
      {selectedPlaylistID === item.playlistId && (
        <View style={styles.itemsInfo}>
          <FlatList
            data={itemsFromPlaylist}
            renderItem={renderVideo}
            ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
          />
        </View>
      )}
    </View>
  );

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderVideo = ({ item }) => (
    <View style={styles.resultItem}>
      <View style={styles.itemInfo}>
        <Text style={[styles.resultText, textColor]}>{item.title}</Text>
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
          <Text style={[styles.content, textColor]}>Downloads</Text>
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
  content: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  resultsContainer: {
    flexGrow: 1
  },
  resultItem: {
    borderRadius: 5,
  },
  item: {
    borderRadius: 5,
  },
  playlistInfo: {
    alignSelf: 'center',
    width: '98%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#555',
    borderRadius: 5,
    flexDirection: 'row',
  },
  itemsInfo: {
    alignSelf: 'center',
    width: '98%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#555',
    borderRadius: 5,
  },
  itemInfo: {
    marginRight: 10,
    width: '100%',
  },
  resultText: {
    fontSize: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginStart: 'auto',
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
  },
  divider: {
    width: 1,
    backgroundColor: 'gray',
  },
  itemDivider: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 10,
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
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default App;
