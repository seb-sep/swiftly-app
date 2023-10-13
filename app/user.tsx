import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { storeUsername } from '../utils/datastore';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth } from '../firebaseConfig';


export default function App() {


  const [debug, setDebug] = useState('');
  const [username, storeUsername] = useState('');
  const [password, storePassword] = useState('');

  // check if the user is already signed in and redirect to the notes page
  // NEED TO CHANGE THIS BEFOR ETESTING 
  /*
  useEffect(() => {
    
    router.replace('/notes');
  }, []);
  */

    // run through the apple sign in flow
  return (
    <View style={styles.container}>
      <Text>log in</Text>
      <TextInput
        value={username}
        onChangeText={storeUsername}
        placeholder='username here'
      />
      <TextInput
        value={password}
        onChangeText={storePassword}
        placeholder='password here'
      />
      <Link href='/signup'>sign up</Link>
      <Text>{debug}</Text>
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

