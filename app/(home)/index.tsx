import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { ping, saveNote } from '@/utils/backend'
import { startRecording, stopRecording, cancelRecording } from '@/utils/record';
import { Audio } from 'expo-av';
import { Link, router, useFocusEffect } from 'expo-router';
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import TimerProgressBar from '@/components/timer';
import { useAuth } from '@/utils/auth';
import { transcribe } from 'whisper-kit-expo';

enum NoteTakingState {
  RECORDING_NOTE,
  QUERYING,
  IDLE
}

const stateMessage: { [key in NoteTakingState]: string } = {
  [NoteTakingState.RECORDING_NOTE]: "what's on your mind?",
  [NoteTakingState.QUERYING]: 'saving note!',
  [NoteTakingState.IDLE]: 'think swiftly.',
};

export default function NoteTakingPage() {
  const [state, setState] = useState(NoteTakingState.IDLE);
  const [noteText, setNoteText] = useState('');
  // const [username, setUsername] = useState('');
  const [recording, setRecording] = useState<Audio.Recording>();
  const [fileUri, setFileUri] = useState('');
  const [debug, setDebug] = useState('');

  const user = useAuth();

  const goToNotes = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
    if (event.nativeEvent.state === State.END) {
      router.replace('/notes');
    }
  };
  
  const goToUser = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
    if (event.nativeEvent.state === State.END) {
      router.replace('/user');
    }
  };

  

  async function recordOnPress() {
    ping(); // warm up the serverless backend to avoid cold start
    try {
      if (!recording) {
        const recording = await startRecording();
        setRecording(recording);
        setState(NoteTakingState.RECORDING_NOTE);
      }
    } catch (err) {
      console.error(err);
      setDebug(JSON.stringify(err));
    }
  }

  async function transcribeAndSave() {
    // record audio file
    if (state === NoteTakingState.RECORDING_NOTE && recording) {
      setState(NoteTakingState.QUERYING);
      const fileUri = await stopRecording(recording);
      setRecording(undefined);
      setFileUri(fileUri);
      console.log('transcribing...');
      setFileUri('');
      setState(NoteTakingState.IDLE);
      if (!fileUri) {
        setNoteText('no audio recorded. try again maybe?');
        return;
      }

      // transcribe audio
      setNoteText("check back when we're done.");

      const transcription = await transcribe(fileUri);
      setNoteText(transcription);

      // immediately save the note
      (async () => {
        try {
          if (user?.email) {
            await saveNote(user?.email, transcription);
          }
        } catch (err) {
          console.log("There was an error: ", err);
          setDebug(JSON.stringify(err));
        }
      })();

  }
}

async function cancelRecordingOnPress() {
  if (state === NoteTakingState.RECORDING_NOTE && recording) {
    await cancelRecording(recording);
    setRecording(undefined);
    setFileUri('');
    setState(NoteTakingState.IDLE);
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
              <Text style={{fontSize: 24, fontWeight: 'bold'}}>{stateMessage[state]}</Text>
              <ScrollView style={styles.noteContainer} contentContainerStyle={styles.containerContent}>
                <Text style={styles.noteText}>{noteText}</Text>
              </ScrollView>
              <TimerProgressBar 
                onTimerComplete={transcribeAndSave}
                color='mediumturquoise' 
                time={30} 
                active={state == NoteTakingState.RECORDING_NOTE}
              />
          </View>
          <View style={styles.buttonContainer}>
            <Pressable 
              disabled={state === NoteTakingState.QUERYING}
              style={[styles.button, {backgroundColor: state === NoteTakingState.QUERYING ? 'gray' : 'mediumseagreen'}]} 
              onPress={state === NoteTakingState.RECORDING_NOTE ? transcribeAndSave : () => recordOnPress()}
            >
              <Ionicons name={state !== NoteTakingState.RECORDING_NOTE ? "mic-outline" : "cloud-upload-outline"} size={48} color="white" />
              <Text style={{color: 'white', fontSize: 20}}>{state !== NoteTakingState.RECORDING_NOTE ? 'record note' : 'save note'}</Text>
            </Pressable>
            <Pressable
              disabled={state !== NoteTakingState.RECORDING_NOTE}
              style={[styles.button, styles.cancelButton, {backgroundColor: state === NoteTakingState.RECORDING_NOTE ? 'indianred' : 'gray'}]}
              onPress={cancelRecordingOnPress}
            >
              <Ionicons name="backspace-outline" size={48} color="white" />
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
  justifyContent: 'space-around',
  flexDirection: 'column',
  paddingHorizontal: 24,
},
displayContainer: {
  height: 425,
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  // borderWidth: 1,
},
noteText: {
  fontSize: 16,
  fontWeight: '500',
  // borderWidth: 1,
  // borderColor: 'blue',
  textAlign: 'center',
},
containerContent: {
  flexGrow: 1,
  justifyContent: 'center',
},
noteContainer: {
  maxHeight: 400,
  width: 280,
  // borderWidth: 1,
  // borderColor: 'red',
  paddingHorizontal: 8,
},
buttonContainer: {
  height: 250,
  width: 360,
  // borderWidth: 1,
  // borderColor: 'green',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingBottom: 48,
},
button: {
  alignItems: 'center',
  justifyContent: 'space-evenly',
  flexDirection: 'column',
  width: 360,
  height: 180,
  borderRadius: 10,
  marginHorizontal: 24,
},
cancelButton: {
  height: 48,
  marginTop: 4,
},
});

