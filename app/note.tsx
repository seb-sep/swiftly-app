import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { saveNote } from '../utils/backend'
import { Audio } from 'expo-av';

export default function NotePage() {
    const testUsername = 'Goku';
    const [noteText, setNoteText] = useState('');
    const recordInput = () => setNoteText('This is a testk');

    const [recording, setRecording] = useState<Audio.Recording>();
    const [url, setUrl] = useState('');
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

      setUrl(uri);
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
                onPress={() => saveNote(testUsername, 'adding from the mobile app', noteText)}
                title='Save Note'
            />
            <Text>{url}</Text>
        </View>
    )
}