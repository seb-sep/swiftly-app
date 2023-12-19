import { useCallback, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { transcribeNoteAndSave, ping } from '../../utils/backend'
import { startRecording, stopRecording } from '../../utils/record';
import { Audio } from 'expo-av';
import { Link, router, useFocusEffect } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, ScrollView, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import TimerProgressBar from '../../components/timer';

enum NoteTakingState {
  RECORDING_NOTE,
  QUERYING,
  IDLE
}

const stateMessage: { [key in NoteTakingState]: string } = {
  [NoteTakingState.RECORDING_NOTE]: "what's on your mind?",
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
      router.replace('/notes');
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
        setState(NoteTakingState.RECORDING_NOTE);
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
       const content = await transcribeNoteAndSave(username, fileUri);
        setNoteText(content); 
      } catch (err) {
        console.log("There was an error: ", err);
        setDebug(JSON.stringify(err));
    }

    setFileUri('');
  }

  setState(NoteTakingState.IDLE);
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
              <View style={{paddingBottom: 24}}>
                <TimerProgressBar 
                  onTimerComplete={transcribeAndSave}
                  color='mediumturquoise' 
                  time={30} 
                  active={state == NoteTakingState.RECORDING_NOTE}
                />
              </View>
          </View>
          <View style={styles.buttonContainer}>
            <Pressable 
              disabled={state === NoteTakingState.QUERYING}
              style={[styles.button, {backgroundColor: state === NoteTakingState.QUERYING ? 'gray' : 'mediumseagreen'}]} 
              onPress={state === NoteTakingState.RECORDING_NOTE ? transcribeAndSave : () => recordOnPress()}
            >
              <Ionicons name={state !== NoteTakingState.RECORDING_NOTE ? "mic-outline" : "stop"} size={48} color="white" />
              <Text style={{color: 'white', fontSize: 20}}>{state !== NoteTakingState.RECORDING_NOTE ? 'record note' : 'stop recording'}</Text>
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
  height: 200,
  width: 360,
  // borderWidth: 1,
  flexDirection: 'column',
  justifyContent: 'space-evenly',
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
});

