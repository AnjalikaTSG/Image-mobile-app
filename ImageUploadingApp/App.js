import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS } from 'react-native';

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
      .then((response) => response.text())  // Change this to text() to inspect the raw response
      .then((data) => {
        try {
          const jsonData = JSON.parse(data); // Attempt to parse the response as JSON
          Alert.alert('Upload Success', JSON.stringify(jsonData));
        } catch (err) {
          Alert.alert('Error', 'Failed to parse JSON response: ' + err.message);
        }
      })
      .catch((err) => Alert.alert('Upload Failed', err.message));
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={imageSource ? imageSource : require('./assets/Not Available.png')}
      />
      <TouchableOpacity style={styles.button} onPress={showOptions}>
        <Text style={styles.text}>Select Image</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Add a comment"
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity style={styles.button} onPress={uploadPhoto}>
        <Text style={styles.text}>Upload Image</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 250,
    height: 50,
    backgroundColor: 'blue',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 30,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    width: 250,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 20,
  },
});
