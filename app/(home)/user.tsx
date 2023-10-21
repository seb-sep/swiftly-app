import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { storeUsername } from '../../utils/datastore';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
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
        />
      </View> 
    </FlingGestureHandler>
  );
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
  }
});

