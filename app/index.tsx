import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { saveNote, transcribeAudio } from '../utils/backend'
import { Audio } from 'expo-av';
import { Link, router, useFocusEffect } from 'expo-router';
import { loadUsername } from '../utils/datastore';
import { auth } from '../firebaseConfig';

const customRecordingOptions: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.ALAW,
    audioQuality: Audio.IOSAudioQuality.MAX,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};


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
    async function startRecording() {
      try {
        console.log('Requesting permissions..');
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
  
        console.log('Starting recording..');
        const { recording } = await Audio.Recording.createAsync(customRecordingOptions);
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
        setDebug('transcribing...');
        try {
            const content = await transcribeAudio(fileUri);
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
                onPress={recording ? stopRecording : startRecording}
            />
            <Button
                onPress={transcribeAndSave}
                title='Save Note'
            />
            <Text>{`user: ${username}`}</Text>
            <Text>{debug}</Text>
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

