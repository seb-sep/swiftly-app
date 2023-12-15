import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Linking } from 'react-native';
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';

export default function App() {


  const [debug, setDebug] = useState('');
  const [user, setUser] = useState('');

  const goToRecord = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
    if (event.nativeEvent.state === State.END) {
      router.replace('/');
    }
  }

  useEffect(() => {
    const authed = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
          setUser(user.email);
      } else {
        router.replace('/signin');
      }
    });
  }, []);

  return (
    <FlingGestureHandler
      direction={Directions.RIGHT}
      onHandlerStateChange={goToRecord}
    >
      <View style={styles.container}>
        <Text>signed in as {user}</Text>
        <Button
            title={'sign out'}
            onPress={() => auth.signOut()}
            color={'mediumturquoise'}
        />
        <TouchableOpacity onPress={() => openURL(reviewUrl)} style={styles.feedbackButton}>
          <Text style={{color: 'mediumturquoise'}}>give your feedback</Text>
        </TouchableOpacity>
      </View> 
    </FlingGestureHandler>
  );
}

const reviewUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfS87SeXGlUjJ3J-k6a0k2q4usKUtCiK3g-EDkISsn8j2V2dQ/viewform?usp=sf_link';

const openURL = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.log(`Don't know how to open URL: ${url}`);
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesIconStyle: {
    position: 'absolute',
    bottom: 16,
    padding: 10,
    backgroundColor: 'lightblue',
  },
  feedbackButton: {
    position: 'absolute',
    bottom: 16,
    padding: 10,
  }
});

