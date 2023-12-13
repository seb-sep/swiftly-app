import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getNote } from "../../utils/backend"
import { loadUsername } from "../../utils/datastore";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Link, router } from 'expo-router';
import { auth } from "../../firebaseConfig";
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function NotePage() {
    const id = useLocalSearchParams().id;
    const [content, setContent] = useState('');

    const goBack = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
      if (event.nativeEvent.state === State.END) {
        console.log('go back');
        router.replace('/notes');
      }
    };

    useEffect(() => {
      if (typeof id !== 'string') {
        console.error('no id found');
        router.replace('/notes');
      } else {
        const user = auth.currentUser;
        //only works if user has email
        if (user !== null && user.email) {

          getNote(user.email, id).then((note) => {
            setContent(note);
          });
        } else {
          console.error('no user email found');
          router.replace('/signin');
        }
      }
    }, []);   

    return (
      <FlingGestureHandler
        direction={Directions.RIGHT}
        onHandlerStateChange={goBack}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.replace('/notes')} style={styles.topLeft}>
            <Ionicons name="chevron-back-outline" size={24} color="gray" style={styles.topLeft}/>
          </TouchableOpacity>
          <Text>{content}</Text>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.notesIconStyle} >
            <Ionicons name="mic-outline" size={32} color="mediumturquoise"/>
          </TouchableOpacity>
        </View>
      </FlingGestureHandler>
    );

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
  topLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 10,
  },
  notesIconStyle: {
    position: 'absolute',
    bottom: 16,
    padding: 10,
  }
});

