import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getNote } from "../../utils/backend"
import { loadUsername } from "../../utils/datastore";
import { View, StyleSheet, Text } from "react-native";
import { Link, router } from 'expo-router';
import { auth } from "../../firebaseConfig";

export default function NotePage() {
    const id = useLocalSearchParams().id;
    const [content, setContent] = useState('');

    useEffect(() => {
      if (typeof id !== 'string') {
        console.error('no id found');
        router.replace('/titles');
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
      <View style={styles.container}>
          <Link href='/titles' style={styles.cornerTopRight}>to notes</Link>
          <Link href='/signin' style={styles.cornerTopLeft}>to user</Link>
          <Text>{content}</Text>
      </View>
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
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
    backgroundColor: 'lightblue',
  }
});

