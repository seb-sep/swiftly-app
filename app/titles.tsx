import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { loadUsername } from '../utils/datastore';
import { getTitles } from '../utils/backend';
import { auth } from '../firebaseConfig';
import { router } from 'expo-router';
import { noteTitle } from '../utils/backend'
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function TitleListPage() {
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
          console.error(error);
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
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.notesIconStyle} >
            <Ionicons name="mic-outline" size={24} color="black"/>
          </TouchableOpacity>
          <Ionicons name="chevron-forward-outline" size={24} color="black" style={styles.bottomRight}/>
        </View>
      </FlingGestureHandler>
    );
}

const NoteTitleElement: React.FC<{ note: noteTitle }> = ({ note }) => {
  return (
    <TouchableOpacity
    onPress={() => router.replace(`/notes/${note.id}`)}
    style={styles.title}>
      <Text>{note.title}</Text>
    </TouchableOpacity> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height:10,
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
  bottomRight: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 10,
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
    height: 32,
  },
  notesIconStyle: {
    position: 'absolute',
    bottom: 16,
    padding: 10,
    backgroundColor: 'lightblue',
  }
});

