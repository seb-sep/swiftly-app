import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { saveNote, transcribeAudio } from '../utils/backend'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

export default function NotePage() {
    const loadUsername = async () => {
      try {
        const value = await AsyncStorage.getItem('current-user');
        if (value !== null) {
          return value;
        }
      } catch (e) {
        throw new Error(`For some reason, the username could not be loaded: ${e}`);
      }
    };
    const [noteText, setNoteText] = useState('');
    const [username, setUsername] = useState('');
    const [recording, setRecording] = useState<Audio.Recording>();
    const [fileUri, setFileUri] = useState('');
    const [debug, setDebug] = useState('');
    useEffect(() => {
      loadUsername().then((user) => {
        if (!user) throw new Error('No signed in user');
        setUsername(user);
      });
    })
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
            const content = await transcribeAudio(fileUri);
            console.log("Response is " + content);
            await saveNote(username, "demo title", content);
            setDebug(content);
        } catch (err) {
            console.log("There was an error: ", err);
            setDebug(JSON.stringify(err));
        }
    }

    return (
        <View style={{
            flexDirection: 'column',

        }}>
            <Text>{noteText}</Text>
            <Button
                title={recording ? 'Stop Recording' : 'Start Recording'}
                onPress={recording ? stopRecording : startRecording}
            />
            <Button
                onPress={transcribeAndSave}
                title='Save Note'
            />
            <Text>{fileUri}</Text>
            <Text>{debug}</Text>
        </View>
    )
}