import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { saveNote, transcribeAudio } from '../utils/backend'
import { startRecording, stopRecording } from '../utils/record';
import { Audio } from 'expo-av';
import { Link, router, useFocusEffect } from 'expo-router';
import { auth } from '../firebaseConfig';


export default function NoteTakingPage() {
  const [noteText, setNoteText] = useState('');
  const [username, setUsername] = useState('');
  const [recording, setRecording] = useState<Audio.Recording>();
  const [fileUri, setFileUri] = useState('');
  const [debug, setDebug] = useState('');


  useFocusEffect(() => {
    const user = auth.currentUser;

    //only works if user has email
    if (user !== null && user.email) {
      setUsername(user.email);
    } else {
      setDebug('no user email found');
      router.replace('/signin');
    }

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
      <View style={styles.container}>
      <Link href='/titles' style={styles.cornerTopRight}>to notes</Link>
      <Link href='/signin' style={styles.cornerTopLeft}>to user</Link>
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
      </View>
  )
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
},
cornerTopRight: {
  position: 'absolute',
  top: 0,
  right: 0,
  padding: 10,
  backgroundColor: 'lightblue',
},
cornerTopLeft: {
  position: 'absolute',
  top: 0,
  left: 0,
  padding: 10,
  backgroundColor: 'lightblue',
},
buttonOn: {
  color: 'blue',
},
buttonOff: {
  color: 'gray'
}
});

