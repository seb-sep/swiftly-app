import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { saveNote, transcribeAudio } from '../utils/backend'
import { startRecording, stopRecording } from '../utils/record';
import { Audio } from 'expo-av';
import { Link, router, useFocusEffect } from 'expo-router';
import { auth } from '../firebaseConfig';
import 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function NoteTakingPage() {
  const [noteText, setNoteText] = useState('');
  const [username, setUsername] = useState('');
  const [recording, setRecording] = useState<Audio.Recording>();
  const [fileUri, setFileUri] = useState('');
  const [debug, setDebug] = useState('');

  const goToNotes = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
    if (event.nativeEvent.state === State.END) {
      console.log('go to notes');
      router.replace('/titles');
    }
  };

  useFocusEffect(() => {
    const authed = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setUsername(user.email);
      } else {
        router.replace('/signin');
      }
    });
  });

  async function recordOnPress() {
    try {
      if (recording) {
        const fileUri = await stopRecording(recording);
        setRecording(undefined);
        setFileUri(fileUri);
      } else {
        const recording = await startRecording();
        setRecording(recording);
      }
    } catch (err) {
      console.error(err);
      setDebug(JSON.stringify(err));
    }
  }

  async function transcribeAndSave() {
    setDebug('transcribing...');
    if (!fileUri) {
      setDebug('no file recorded');
      return;
    }
    try {
      const content = await transcribeAudio(fileUri);
      setNoteText(content);
      console.log("Response is " + content);
      setDebug('saving...');
      await saveNote(username, "demo title", content);
      setDebug('saved!');
    } catch (err) {
      console.log("There was an error: ", err);
      setDebug(JSON.stringify(err));
  }
}


  return (
    <FlingGestureHandler
      direction={Directions.RIGHT}
      onHandlerStateChange={goToNotes}
      >
      <View style={styles.container}>
          <TouchableOpacity onPress={() => router.replace('/signin')} style={styles.userIconStyle}>
            <Ionicons name="person-circle-outline" size={24} color="black"/>
          </TouchableOpacity>
          <Text>{noteText}</Text>
          <Button
              title={recording ? 'Stop Recording' : 'Start Recording'}
              onPress={recordOnPress}
          />
          <Pressable onPress={transcribeAndSave} disabled={!fileUri}>
            <Text style={fileUri ? styles.buttonOn : styles.buttonOff} >Transcribe Note</Text>
          </Pressable>
          <Text>{debug}</Text>
          <Text>{`user: ${username}`}</Text>
          <TouchableOpacity onPress={() => router.replace('/titles')} style={styles.notesIconStyle} >
            <Ionicons name="ios-clipboard-outline" size={24} color="black"/>
          </TouchableOpacity>
          <Ionicons name="chevron-back-outline" size={24} color="black" style={styles.bottomLeft}/>
      </View>
    </FlingGestureHandler>
  )
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
},
bottomLeft: {
  position: 'absolute',
  bottom: 16,
  left: 16,
  padding: 10,
},
buttonOn: {
  color: 'blue',
},
buttonOff: {
  color: 'gray'
},
userIconStyle: {
  position: 'absolute',
  top: 0,
  right: 16,
  padding: 10,
  backgroundColor: 'lightblue',
},
notesIconStyle: {
  position: 'absolute',
  bottom: 16,
  padding: 10,
  backgroundColor: 'lightblue',
}
});

