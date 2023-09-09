import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { saveNote } from '../utils/backend'
import { transcribe } from '../utils/whisper';
import { Audio } from 'expo-av';
import { Link, router } from 'expo-router';
import { loadUsername } from '../utils/datastore';

export default function NoteTakingPage() {
    ;
    const [noteText, setNoteText] = useState('');
    const [username, setUsername] = useState('');
    const [recording, setRecording] = useState<Audio.Recording>();
    const [fileUri, setFileUri] = useState('');
    const [debug, setDebug] = useState('');
    useEffect(() => {
      loadUsername().then((user) => {
        if (!user) {
          router.replace('/user');
        } else {
          setUsername(user);
        }
      });
    }, []);
    async function startRecording() {
      try {
        console.log('Requesting permissions..');
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
  
        console.log('Starting recording..');
        const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        console.log('Recording started');
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    }
  
    async function stopRecording() {
      console.log('Stopping recording..');
      setRecording(undefined);
      if (!recording) {
        throw new ReferenceError('recording state somehow undefined here');
      }
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync(
        {
          allowsRecordingIOS: false,
        }
      );
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      if (uri) {
        setFileUri(uri);
      }
    }

    async function transcribeAndSave() {
        setDebug('trying to save');
        try {
            const content = await transcribe(fileUri);
            console.log("Response is " + content);
            await saveNote(username, "demo title", content);
            setDebug(content);
        } catch (err) {
            console.log("There was an error: ", err);
            setDebug(JSON.stringify(err));
        }
    }

    return (
        <View style={styles.container}>
        <Link href='/titles' style={styles.cornerTopRight}>to notes</Link>
        <Link href='/user' style={styles.cornerTopLeft}>to user</Link>
            <Text>{noteText}</Text>
            <Button
                title={recording ? 'Stop Recording' : 'Start Recording'}
                onPress={recording ? stopRecording : startRecording}
            />
            <Button
                onPress={transcribeAndSave}
                title='Save Note'
            />
            <Text>{username}</Text>
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
  }
});

