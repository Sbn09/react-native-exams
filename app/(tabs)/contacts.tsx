import React from 'react';
import { View, FlatList, StyleSheet, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ExternalLink } from '@/components/ExternalLink';

const contactList = [
  {
    id: '1',
    title: 'Service de la Préfecture',
    role: 'Délivrance des autorisations pour les convois exceptionnels.',
    contact: '0123456789',
  },
  {
    id: '2',
    title: 'Police ou Gendarmerie Locale',
    role: 'Assistance pour escorter les convois et assurer la sécurité routière.',
    contact: '17',
  },
  {
    id: '3',
    title: 'Entreprise de Grutage',
    role: 'Levage d’obstacles comme les feux tricolores ou autres structures.',
    contact: '0456789012',
  },
  {
    id: '4',
    title: 'Service des Ponts et Chaussées',
    role: 'Vérification de la capacité des ponts et gestion des fermetures de routes.',
    contact: '0298765432',
  },
  {
    id: '5',
    title: 'SNCF Réseau (Lignes Ferroviaires)',
    role: 'Coordination pour la traversée des passages à niveau.',
    contact: '0890123456',
  },
  {
    id: '6',
    title: 'EDF (Compagnie Électrique)',
    role: 'Déplacement temporaire des lignes électriques pour le passage du convoi.',
    contact: '0969321515',
  },
];

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="call-outline" style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Contacts Utiles</ThemedText>
      </ThemedView>
      
      <FlatList
        data={contactList}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <ThemedText type="subtitle">{item.title}</ThemedText>
            <ThemedText>{item.role}</ThemedText>
            <ExternalLink href={`tel:${item.contact}`} style={styles.contactLink}>
              {item.contact}
            </ExternalLink>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  contactItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contactLink: {
    color: '#0F6BCE',
    fontWeight: 'bold',
    marginTop: 5,
  },
});
