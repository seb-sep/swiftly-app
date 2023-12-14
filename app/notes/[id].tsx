import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getNote, deleteNote } from "../../utils/backend"
import { loadUsername } from "../../utils/datastore";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Link, router } from 'expo-router';
import { auth } from "../../firebaseConfig";
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function NotePage() {
    const id = useLocalSearchParams().id;
    const [content, setContent] = useState('');
    const [email, setEmail] = useState('');
    const [noteId, setId] = useState('');

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
          setId(id);
          setEmail(user.email);
        } else {
          console.error('no user email found');
          router.replace('/signin');
        }
      }
    }, []);   

    const onDelete = async () => {
      setContent('deleting note...');
      await deleteNote(email, noteId);
      router.replace('/notes');
    }

    return (
      <FlingGestureHandler
        direction={Directions.RIGHT}
        onHandlerStateChange={goBack}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onDelete} style={styles.topLeft}>
            <Ionicons name="trash-outline" size={24} color="indianred" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/notes')} style={styles.topRight}>
            <Ionicons name="star-outline" size={24} color="mediumturquoise" />
          </TouchableOpacity>
          <Text style={styles.noteText}>{content}</Text>
          <TouchableOpacity onPress={() => router.replace('/notes')} style={styles.bottom} >
            <Ionicons name="chevron-back-outline" size={24} color="gray" />
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
  topRight: {
    position: 'absolute',
    top: 32,
    right: 48,
    padding: 8,
  },
  topLeft: {
    position: 'absolute',
    top: 32,
    left: 48,
    padding: 8,
  },
  bottom: {
    position: 'absolute',
    bottom: 16,
    padding: 8,
  },
  noteText: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 24,
    padding: 16,
  },
});

