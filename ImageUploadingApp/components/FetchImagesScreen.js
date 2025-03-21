// FetchImagesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert } from 'react-native';

const SERVER_URL = 'http://192.168.1.163/api/'; // Change this to match your server IP

const FetchImagesScreen = () => {
  const [uploadedImages, setUploadedImages] = useState([]);

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
      <Text style={styles.title}>Uploaded Images</Text>
      <FlatList
        data={uploadedImages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.imageList}
      />
    </View>
  );
};

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

export default FetchImagesScreen;
