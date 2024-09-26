import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Obstacle {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUri?: string;
}

const App = () => {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [newObstacle, setNewObstacle] = useState<Obstacle>({ id: '', title: '', description: '', latitude: 0, longitude: 0 });
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadObstacles();
  }, []);

  const loadObstacles = async () => {
    try {
      const storedObstacles = await AsyncStorage.getItem('obstacles');
      if (storedObstacles) {
        setObstacles(JSON.parse(storedObstacles));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les obstacles');
    }
  };

  const saveObstacles = async (updatedObstacles: Obstacle[]) => {
    try {
      await AsyncStorage.setItem('obstacles', JSON.stringify(updatedObstacles));
      setObstacles(updatedObstacles);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les obstacles');
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission de localisation refusée');
        return { latitude: 0, longitude: 0 };
      }
      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir la localisation');
      return { latitude: 0, longitude: 0 };
    }
  };

  const addObstacle = async () => {
    if (!newObstacle.title || !newObstacle.description) {
      Alert.alert('Erreur', 'Le titre et la description sont obligatoires.');
      return;
    }

    const location = await getLocation();
    const newObstacleWithId = { 
      ...newObstacle, 
      id: Date.now().toString(), 
      latitude: location.latitude, 
      longitude: location.longitude, 
      imageUri: imageUri ?? ''
    };
    
    const updatedObstacles = [...obstacles, newObstacleWithId];
    saveObstacles(updatedObstacles);
    setNewObstacle({ id: '', title: '', description: '', latitude: 0, longitude: 0 });
    setImageUri(undefined);
    setModalVisible(false);
  };

  const deleteObstacle = (id: string) => {
    const updatedObstacles = obstacles.filter(obstacle => obstacle.id !== id);
    saveObstacles(updatedObstacles);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erreur', 'Permission d\'accès à la galerie refusée.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri); 
    }
  };
  
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erreur', 'Permission d\'accès à la caméra refusée.');
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <ParallaxScrollView
      headerImage={<Image source={require('@/assets/images/maps.jpg')} style={styles.headerImage} />}
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Liste des obstacles</Text>
        <FlatList
          data={obstacles}
          renderItem={({ item }) => (
            <View style={styles.obstacleItem}>
              <Text style={styles.obstacleTitle}>{item.title}</Text>
              <Text style={styles.obstacleDescription}>{item.description}</Text>
              <Text style={styles.obstacleCoords}>Position: {item.latitude}, {item.longitude}</Text>
              {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.obstacleImage} />}
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteObstacle(item.id)}>
                <Ionicons name="close-circle" size={40} color="#D03838"/>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={item => item.id}
        />

        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={60} color="#0F6BCE" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <TextInput
              placeholder="Titre de l'obstacle"
              value={newObstacle.title}
              onChangeText={(text) => setNewObstacle({ ...newObstacle, title: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={newObstacle.description}
              onChangeText={(text) => setNewObstacle({ ...newObstacle, description: text })}
              style={styles.input}
            />

            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerButtons}>
                <View style={{ marginBottom: 10 }}>
                  <Button color="#0F6BCE" title="Choisir une photo" onPress={pickImage} />
                </View>
                <Button color="#0F6BCE" title="Prendre une photo" onPress={takePhoto} />
              </View>
            )}

            <Button color="#0F6BCE" title="Ajouter un obstacle" onPress={addObstacle} />
            <View style={styles.closeButton}>
              <Button color="#D03838" title="Fermer" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
  closeButton: {
    marginTop: 20,
  },
  obstacleItem: {
    marginVertical: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: 'white',
  },
  obstacleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  obstacleDescription: {
    color: '#fff',
  },
  obstacleCoords: {
    color: '#fff',
  },
  obstacleImage: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  deleteText: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    padding: 8,
    color: '#000',
    backgroundColor: '#fff',
    width: '100%'
  },
  imagePickerButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  previewImage: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    top: -10,
    zIndex: 100,
  },
  deleteButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  modalView: {
    marginTop: 200,
    margin: 20,
    backgroundColor: '#747A80',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
});

export default App;
