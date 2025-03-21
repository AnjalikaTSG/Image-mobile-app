// App.js
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import UploadScreen from './components/UploadScreen';
import FetchImagesScreen from './components/FetchImagesScreen';

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <UploadScreen />
      <FetchImagesScreen />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingBottom: 20,
  },
});
