import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { hello } from '../modules/speech-to-text';
import { useEffect, useState } from 'react';

export default function App() {
    const [message, setMessage] = useState("")
    useEffect(() => {
        setMessage(hello());
    }, []);
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Link href="/note">CLick here to write note</Link>
      <StatusBar style="auto" />
      <Text>{message}</Text>
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

