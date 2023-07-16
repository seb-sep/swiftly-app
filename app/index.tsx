import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

export default function App() {
  const storeUsername = async (username: string) => {
    try {
      await AsyncStorage.setItem('current-user', username);
      console.log('Current user ' + username);
    } catch (e) {
      console.error(e);
    }
  };

  const [username, setUsername] = useState('');

  return (
    <View style={styles.container}>
      <Link href="/note">click here to write note</Link>
      <TextInput
        onChangeText={setUsername}
        value={username}
        placeholder='enter username here'
      />
      <Button
        onPress={() => storeUsername(username)}
        title='sign in'
        />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

