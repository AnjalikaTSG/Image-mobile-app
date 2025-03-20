import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'http://192.168.1.163/ap'; // Change this to your working API URL

export default function App() {
  const [image, setImage] = useState(null);
  const [comment, setComment] = useState('');
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    fetchUploads();
  }, []);

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert('Permission Denied', 'You need to enable camera and media permissions.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.photo],
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      base64: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image || !comment.trim()) {
      Alert.alert('Error', 'Image and comment are required!');
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'upload.jpg',
      type: 'image/jpeg',
    });
    formData.append('comment', comment);

    try {
      await axios.post(`${API_URL}/upload.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchUploads();
      setImage(null);
      setComment('');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'An error occurred while uploading.');
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await axios.get(`${API_URL}/fetch.php`);
      if (Array.isArray(response.data)) {
        setUploads(response.data);
      } else {
        console.error('Invalid data format:', response.data);
        Alert.alert('Error', 'Invalid API response. Please check the server.');
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
      Alert.alert('Network Error', 'Failed to fetch uploads.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={takePhoto} style={styles.button}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <TextInput
        placeholder="Add a comment"
        value={comment}
        onChangeText={setComment}
        style={styles.textInput}
      />

      <Button title="Upload" onPress={uploadImage} />

      <FlatList
        data={uploads}
        keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <View style={styles.uploadItem}>
            {item.image ? (
              <Image source={{ uri: `${API_URL}/uploads/${item.image}` }} style={styles.uploadImage} />
            ) : (
              <Text>No Image</Text>
            )}
            <Text>{item.comment}</Text>
            <Text>{item.timestamp}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  uploadItem: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  uploadImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
  },
});
