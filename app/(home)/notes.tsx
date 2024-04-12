import { View, FlatList, StyleSheet, TouchableOpacity, Text, Pressable } from 'react-native';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getTitles } from '@/utils/backend';
import { auth } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { noteTitle } from '@/utils/backend'
import { ScrollView, Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { TitleList } from '@/components/titleList';
import { saveNote, chatWithNotes, ping } from '@/utils/backend'
import { startRecording, stopRecording, cancelRecording } from '@/utils/record';
import { Audio } from 'expo-av';
import TimerProgressBar from '@/components/timer';
import { transcribe } from 'whisper-kit-expo';

enum TabState {
  RECENT = 'Recent',
  OLDEST = 'Oldest',
  FAVORITES = 'Favorites',
  ASK = 'Ask'
}

export default function NotesPage() {
    const [titles, setTitles] = useState<noteTitle[]>([])
    const [tabState, setTabState] = useState(TabState.RECENT);
    const [username, setUsername] = useState('');
    const goToRecord = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
      if (event.nativeEvent.state === State.END) {
        router.replace('/');
      }
    };
 
    useFocusEffect(useCallback(() => {
      const user = auth.currentUser;

      //only works if user has email
      if (user !== null && user.email) {
        setUsername(user.email);
        getTitles(user.email).then((titles) => {
          setTitles(titles);
        })
        .catch(error => {
          console.error(`Error trying to get titles: ${error}`);
        });
      } else {
        console.error('no user email found');
        router.replace('/signin');
      }

    }, []));   

    const displays = useMemo(() => computeLists(titles, username), [titles]);

    return (
      <FlingGestureHandler
        direction={Directions.LEFT}
        onHandlerStateChange={goToRecord}>
          <View style={styles.container}>
            <View style={styles.tabBar}>
            <ScrollableTabBar tabState={tabState} setTabState={(state) => setTabState(state)} />
              </View>
              {displays[tabState]}
          </View>
      </FlingGestureHandler>
    );
}

type ScrollableTabBarProps = {
  tabState: TabState,
  setTabState: (tabState: TabState) => void,
}

const ScrollableTabBar: React.FC<ScrollableTabBarProps> = ({tabState, setTabState}) => {
  return (
    <FlatList
      style={{flex: 1, height: 56}}
      contentContainerStyle={styles.tabContainer}
      horizontal={true}
      showsVerticalScrollIndicator={false}
      data={Object.values(TabState)}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => setTabState(item)}
          style={styles.tab}>
          <Text style={[styles.tabText, tabState == item && {color: "mediumturquoise", textDecorationLine: 'underline'}]}>{item}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

enum QueryState {
  IDLE,
  RECORDING_CHAT,
  QUERYING,
}

const stateMessage: { [key in QueryState]: string } = {
  [QueryState.RECORDING_CHAT]: "what do you want to know?",
  [QueryState.QUERYING]: 'hold on a sec...',
  [QueryState.IDLE]: 'ask away.',
};

const NoteQueryView: React.FC<{username: string}> = ({ username }) => {

  const [state, setState] = useState(QueryState.IDLE);
  const [recording, setRecording] = useState<Audio.Recording>();
  const [fileUri, setFileUri] = useState('');
  const [text, setText] = useState('');

  async function queryNotes() {
    if (state === QueryState.RECORDING_CHAT && recording) {
      const fileUri = await stopRecording(recording);
      setRecording(undefined);
      setFileUri(fileUri);
      setState(QueryState.QUERYING);
      if (!fileUri) {
        console.log('no audio recorded');
        return;
      }

      try {

        const query = await transcribe(fileUri);
        const content = await chatWithNotes(username, query);
        setText(content);
      } catch (err) {
        console.log("There was an error: ", err);
      }

      setState(QueryState.IDLE);

      setFileUri('');
    }
  }

  async function recordOnPress() {
    ping(); // warm up the serverless backend to avoid cold start
    try {
      if (!recording) {
        const recording = await startRecording();
        setRecording(recording);
        setState(QueryState.RECORDING_CHAT);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function cancelRecordingOnPress() {
    if (state === QueryState.RECORDING_CHAT && recording) {
      await cancelRecording(recording);
      setRecording(undefined);
      setFileUri('');
      setState(QueryState.IDLE);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={{fontSize: 24, fontWeight: 'bold',}}>{stateMessage[state]}</Text>
        <ScrollView style={styles.noteContainer} contentContainerStyle={styles.containerContent}>
          <Text style={styles.noteText}>{text}</Text>
        </ScrollView>
        <TimerProgressBar 
          onTimerComplete={queryNotes}
          color='mediumturquoise' 
          time={30} 
          active={state == QueryState.RECORDING_CHAT}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Pressable 
          disabled={state === QueryState.QUERYING}
          style={[styles.button, {backgroundColor: state === QueryState.QUERYING ? 'gray' : 'mediumpurple'}]} 
          onPress={state === QueryState.RECORDING_CHAT ? queryNotes : () => recordOnPress()}
        >
          <Ionicons name={state !== QueryState.RECORDING_CHAT ? "mic-outline" : "chatbubbles-outline"} size={48} color="white" />
          <Text style={{color: 'white', fontSize: 20}}>{state !== QueryState.RECORDING_CHAT ? 'query notes' : 'send query'}</Text>
        </Pressable>
        <Pressable
          disabled={state !== QueryState.RECORDING_CHAT}
          style={[styles.button, styles.cancelButton, {backgroundColor: state === QueryState.RECORDING_CHAT ? 'indianred' : 'gray'}]}
          onPress={cancelRecordingOnPress}
        >
          <Ionicons name="ios-backspace-outline" size={48} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const computeLists = (titles: noteTitle[], username: string) => {
  return {
    [TabState.RECENT]: <TitleList titles={[...titles].sort((a, b) => b.created.getTime() - a.created.getTime())} />,
    [TabState.OLDEST]: <TitleList titles={[...titles].sort((a, b) => a.created.getTime() - b.created.getTime())} />,
    [TabState.FAVORITES]: <TitleList titles={titles.filter((note) => note.favorite)} />,  
    [TabState.ASK]: <NoteQueryView username={username} />,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    height:10,
  },
  displayContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxHeight: 375,
    height: 375,
    paddingHorizontal: 16,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxHeight: 48,
    padding: 16,
  },
  tabContainer: {
    height: 56, 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  tab: {
    // justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    // width: 'max-content',
    padding: 8,
  },
  tabText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    height: 32,
  },
  titleContainer: {
    width: 350,
    height: 650,
  },
  title: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'black',
    height: 48,
  },
  titleText: {
    fontSize: 16,
    paddingHorizontal: 8,
    height: 24,
  },
  dateText: {
    fontSize: 12,
    paddingHorizontal: 8,
    height: 16,
    color: 'gray',
  },
  buttonContainer: {  
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 250,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'column',
    borderRadius: 10,
    width: 360,
    height: 180,
    marginHorizontal: 24,
  }, 
  cancelButton: {
    height: 48,
    marginTop: 4,
  },
  noteContainer: {
    maxHeight: 300,
    paddingHorizontal: 8,
  },
  containerContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  noteText: {
    fontSize: 16,
    fontWeight: '500',
  },
});


