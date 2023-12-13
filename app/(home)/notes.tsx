import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { getTitles } from '../../utils/backend';
import { auth } from '../../firebaseConfig';
import { router } from 'expo-router';
import { noteTitle } from '../../utils/backend'
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';

export default function NotesPage() {
    const [titles, setTitles] = useState<noteTitle[]>([])
    const goToRecord = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
      if (event.nativeEvent.state === State.END) {
        router.replace('/');
      }
    };
 
    useEffect(() => {
      const user = auth.currentUser;

      //only works if user has email
      if (user !== null && user.email) {
        getTitles(user.email).then((titles) => {
          setTitles(titles)
        })
        .catch(error => {
          console.error(`Error trying to get titles: ${error}`);
        });
      } else {
        console.error('no user email found');
        router.replace('/signin');
      }

    }, []);   
    return (
      <FlingGestureHandler
        direction={Directions.LEFT}
        onHandlerStateChange={goToRecord}>
        <View style={styles.container}>
            <FlatList
                data={titles}
                keyExtractor={(title) => title.id.toString()}
                renderItem={({ item }) => <NoteTitleElement note={item} />}
                style={styles.notesView}
            />
        </View>
      </FlingGestureHandler>
    );
}

const NoteTitleElement: React.FC<{ note: noteTitle }> = ({ note }) => {
  return (
    <TouchableOpacity
      onPress={() => router.replace(`/notes/${note.id}`)}
      style={styles.title}>
      <Text style={styles.titleText}>{note.title}</Text>
      <Text style={styles.dateText}>{parseString(note.created)}</Text>
    </TouchableOpacity> 
  );
}

function parseString(str: string): string {
  return new Date(Date.parse(str)).toDateString();

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height:10,
  },
  
  notesView: {
    position: 'absolute',
    top: 32,
    width: 350,
    maxHeight: 650,
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
    height: 24,
    color: 'gray',
  },
});

