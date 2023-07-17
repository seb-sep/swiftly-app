import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { router } from 'expo-router';
import { storeUsername } from '../utils/datastore';

export default function App() {


  const [username, setUsername] = useState('');

  return (
    <View style={styles.container}>
      <Link href="/">click here to write note</Link>
      <TextInput
        onChangeText={setUsername}
        value={username}
        placeholder='enter username here'
      />
      <Button
        onPress={() => {
          storeUsername(username).then(() => {
            router.replace('/');
          });

        }}
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

