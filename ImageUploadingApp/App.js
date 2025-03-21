import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SERVER_URL = 'http://192.168.1.163/api/'; // Change this to match your server IP

export default function App() {
  const [imageSource, setImageSource] = useState(null);
  const [comment, setComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);

  // Function to pick an image from the gallery
  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Enable permissions to access the gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageSource({ uri: result.assets[0].uri });
    }
  };

  // Function to take a photo using the camera
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Enable permissions to access the camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageSource({ uri: result.assets[0].uri });
    }
  };

  // Function to show options (Gallery or Camera)
  const showOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Select a Photo', 'Take a Photo'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) openImageLibrary();
          else if (buttonIndex === 2) openCamera();
        }
      );
    } else {
      Alert.alert(
        'Choose an Option',
        'Select an image source',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Select a Photo', onPress: openImageLibrary },
          { text: 'Take a Photo', onPress: openCamera },
        ],
        { cancelable: true }
      );
    }
  };

  // Function to upload an image with a comment
  const uploadPhoto = async () => {
    if (!imageSource) {
      Alert.alert('No image selected');
      return;
    }

    let fileName = imageSource.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(fileName);
    let type = match ? `image/${match[1]}` : `image`;

    let formData = new FormData();
    formData.append('image', { uri: imageSource.uri, name: fileName, type });
    formData.append('comment', comment);

    try {
      let response = await fetch(SERVER_URL + 'upload.php', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      let data = await response.text();
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.Status === 'Ok') {
          Alert.alert('Upload Success', 'Your image has been uploaded successfully!');
          setImageSource(null);
          setComment('');
          fetchUploadedImages();
        } else {
          Alert.alert('Upload Failed', jsonData.Message);
        }
      } catch (err) {
        Alert.alert('Error', 'Invalid server response: ' + err.message);
      }
    } catch (err) {
      Alert.alert('Upload Failed', err.message);
    }
  };

  // Function to fetch previously uploaded images
  const fetchUploadedImages = async () => {
    try {
      let response = await fetch(SERVER_URL + 'fetch_images.php');
      let data = await response.json();
      setUploadedImages(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch images: ' + error.message);
    }
  };

  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.imageCard}>
      <Image style={styles.image} source={{ uri: item.image }} />
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Your Image</Text>

      <TouchableOpacity onPress={showOptions}>
        <Image
          style={styles.image}
          source={imageSource ? imageSource : require('./assets/Not Available.png')}
        />
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={showOptions}>
          <Icon name="camera" size={24} color="white" />
          <Text style={styles.text}>Choose Image</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Add a comment"
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={uploadPhoto}>
        <Text style={styles.uploadText}>Upload Image</Text>
      </TouchableOpacity>

      {/* // Display Uploaded Images */}
      <Text style={styles.title}>Uploaded Images</Text>
      <FlatList
        data={uploadedImages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.imageList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '80%',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A3A3A',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
    flex: 1,
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  uploadButton: {
    width: 250,
    height: 50,
    backgroundColor: '#3EA055',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  uploadText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#ddd',
    marginTop: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '90%',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 20,
    backgroundColor: 'white',
  },
  imageList: {
    marginTop: 20,
    width: '100%',
  },
  imageCard: {
    marginBottom: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  comment: {
    color: 'white',
    marginTop: 10,
  },
  timestamp: {
    color: '#ccc',
    marginTop: 5,
  },
});
