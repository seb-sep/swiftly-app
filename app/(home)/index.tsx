import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { saveNote, transcribeAudio, queryNotesWithVoice, ping } from '../../utils/backend'
import { startRecording, stopRecording } from '../../utils/record';
import { Audio } from 'expo-av';
import { Link, router, useFocusEffect } from 'expo-router';
import { auth } from '../../firebaseConfig';
import 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function NoteTakingPage() {
  const [noteText, setNoteText] = useState("what's on your mind?");
  const [username, setUsername] = useState('');
  const [recording, setRecording] = useState<Audio.Recording>();
  const [fileUri, setFileUri] = useState('');
  const [debug, setDebug] = useState('');

  const goToNotes = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
    if (event.nativeEvent.state === State.END) {
      router.replace('/titles');
    }
  };
  
  const goToUser = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
    if (event.nativeEvent.state === State.END) {
      router.replace('/user');
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
    ping(); // warm up the serverless backend to avoid cold start
    try {
      if (!recording) {
        const recording = await startRecording();
        setRecording(recording);
      }
    } catch (err) {
      console.error(err);
      setDebug(JSON.stringify(err));
    }
  }

  async function transcribeAndSave() {
    if (recording) {
      const fileUri = await stopRecording(recording);
      setRecording(undefined);
      setFileUri(fileUri);

      setDebug('transcribing...');
      if (!fileUri) {
        setDebug('no audio recorded');
        return;
      }
      try {
        const content = await transcribeAudio(fileUri);
        setNoteText(content);
        console.log("Response is " + content);
        setDebug('saving...');
        await saveNote(username, content);
        setDebug('saved!');
      } catch (err) {
        console.log("There was an error: ", err);
        setDebug(JSON.stringify(err));
    }

    setFileUri('');
  }
}

async function queryNotes() {
  if (recording) {
    const fileUri = await stopRecording(recording);
    setRecording(undefined);
    setFileUri(fileUri);
    setDebug('querying...');

    if (!fileUri) {
      setDebug('no audio recorded');
      return;
    }

    try {
      const content = await queryNotesWithVoice(username, fileUri);
      setNoteText(content);
    } catch (err) {
      console.log("There was an error: ", err);
      setDebug(JSON.stringify(err));
    }

    setDebug('');
    setFileUri('');
  }
}


  return (
    <FlingGestureHandler
      direction={Directions.RIGHT}
      onHandlerStateChange={goToNotes}
      >
    <FlingGestureHandler
      direction={Directions.LEFT}
      onHandlerStateChange={goToUser}
      >
      <View style={styles.container}>
          <View style={styles.displayContainer}>
              <Text style={{fontSize: 16}}>{noteText}</Text>
              <Text style={{fontSize: 16}}>{debug}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, {backgroundColor: 'mediumseagreen'}]} onPress={recording ? transcribeAndSave : recordOnPress}>
              <Ionicons name={!recording ? "mic-outline" : "stop"} size={48} color="white" />
              <Text style={{color: 'white', fontSize: 20}}>record note</Text>
            </Pressable>
            <Pressable style={[styles.button, {backgroundColor: 'mediumpurple'}]}onPress={recording ? queryNotes : recordOnPress}>
              <Ionicons name={!recording ? "search" : "stop"} size={48} color="white" />
              <Text style={{color: 'white', fontSize: 20}}>query note</Text>
            </Pressable>
          </View>
      </View>
    </FlingGestureHandler>
    </FlingGestureHandler>
  )
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  paddingHorizontal: 24,
},
displayContainer: {
  height: 500,
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  alignItems: 'center',
},
buttonContainer: {
  height: 200,
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
},
button: {
  alignItems: 'center',
  justifyContent: 'space-evenly',
  flexDirection: 'column',
  borderRadius: 10,
  width: 160,
  height: 200,
  marginHorizontal: 24,
},
});

