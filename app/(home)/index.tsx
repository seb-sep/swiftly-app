import { useCallback, useState } from 'react';
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
import TimerProgressBar from '../../components/timer';

enum NoteTakingState {
  RECORDING_NOTE,
  RECORDING_CHAT,
  QUERYING,
  IDLE
}

const stateMessage: { [key in NoteTakingState]: string } = {
  [NoteTakingState.RECORDING_NOTE]: "what's on your mind?",
  [NoteTakingState.RECORDING_CHAT]: 'what do you want to know?',
  [NoteTakingState.QUERYING]: 'hold on a sec...',
  [NoteTakingState.IDLE]: 'think swiftly.',
};

export default function NoteTakingPage() {
  const [state, setState] = useState(NoteTakingState.IDLE);
  const [noteText, setNoteText] = useState('');
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

  async function recordOnPress(actionType: NoteTakingState.RECORDING_CHAT | NoteTakingState.RECORDING_NOTE) {
    ping(); // warm up the serverless backend to avoid cold start
    try {
      if (!recording) {
        const recording = await startRecording();
        setRecording(recording);
        setState(actionType);
      }
    } catch (err) {
      console.error(err);
      setDebug(JSON.stringify(err));
    }
  }

  async function transcribeAndSave() {
    console.log(state);
    if (state === NoteTakingState.RECORDING_NOTE && recording) {
      const fileUri = await stopRecording(recording);
      setRecording(undefined);
      setFileUri(fileUri);
      setState(NoteTakingState.QUERYING);
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

  setState(NoteTakingState.IDLE);
}

async function queryNotes() {
  if (state === NoteTakingState.RECORDING_CHAT && recording) {
    const fileUri = await stopRecording(recording);
    setRecording(undefined);
    setFileUri(fileUri);
    setState(NoteTakingState.QUERYING);
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

    setState(NoteTakingState.IDLE);

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
              <Text style={{fontSize: 24, fontWeight: 'bold'}}>{stateMessage[state]}</Text>
              <Text style={{fontSize: 16}}>{noteText}</Text>
              <TimerProgressBar 
                onTimerComplete={state === NoteTakingState.RECORDING_NOTE ? transcribeAndSave : queryNotes} 
                color='mediumturquoise' 
                time={30} 
                active={state === NoteTakingState.RECORDING_CHAT || state == NoteTakingState.RECORDING_NOTE}
              />
          </View>
          <View style={styles.buttonContainer}>
            <Pressable 
              disabled={state === NoteTakingState.QUERYING || state === NoteTakingState.RECORDING_CHAT}
              style={[styles.button, {backgroundColor: 'mediumseagreen'}]} 
              onPress={state === NoteTakingState.RECORDING_NOTE ? transcribeAndSave : () => recordOnPress(NoteTakingState.RECORDING_NOTE)}
            >
              <Ionicons name={state !== NoteTakingState.RECORDING_NOTE? "mic-outline" : "stop"} size={48} color="white" />
              <Text style={{color: 'white', fontSize: 20}}>record note</Text>
            </Pressable>
            <Pressable 
              disabled={state === NoteTakingState.QUERYING || state === NoteTakingState.RECORDING_NOTE}
              style={[styles.button, {backgroundColor: 'mediumpurple'}]} 
              onPress={state === NoteTakingState.RECORDING_CHAT ? queryNotes : () => recordOnPress(NoteTakingState.RECORDING_CHAT)}
            >
              <Ionicons name={state !== NoteTakingState.RECORDING_CHAT? "search" : "stop"} size={48} color="white" />
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
  paddingBottom: 24,
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

