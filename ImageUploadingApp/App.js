import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function App() {
  const [imageSource, setImageSource] = useState(null);
  const [comment, setComment] = useState('');

  // Function to open Image Library
  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to enable permissions to access photos.');
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

  // Function to open Camera
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to enable permissions to access the camera.');
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

  // Function to show options
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

  // Function to upload photo with comment
  const uploadPhoto = async () => {
    if (!imageSource) {
      Alert.alert('No image selected');
      return;
    }

    let fileName = imageSource.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(fileName);
    let type = match ? `image/${match[1]}` : `image`;

    let formData = new FormData();
    formData.append('image', {
      uri: imageSource.uri,
      name: fileName,
      type: type,
    });

    // Add comment to form data
    formData.append('comment', comment);

    fetch('http://192.168.1.163/api/upload.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
      .then((response) => response.text()) // Get raw response
      .then((data) => {
        try {
          const jsonData = JSON.parse(data); // Try parsing JSON
          Alert.alert('Upload Success', 'Your image has been uploaded successfully!');
          setImageSource(null); // Reset image
          setComment(''); // Clear comment field
        } catch (err) {
          Alert.alert('Error', 'Failed to parse JSON response: ' + err.message);
        }
      })
      .catch((err) => Alert.alert('Upload Failed', err.message));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Your Image</Text>

      <Image
        style={styles.image}
        source={imageSource ? imageSource : require('./assets/Not Available.png')}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={openCamera}>
          <Icon name="camera" size={24} color="white" />
          <Text style={styles.text}>Take a Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={openImageLibrary}>
          <Icon name="image" size={24} color="white" />
          <Text style={styles.text}>Select from Gallery</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between', // Adjusts spacing between buttons
    width: '80%', // Set a fixed width to align buttons properly
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginHorizontal: 10,
    flex: 1, // Makes both buttons take equal width
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
});
