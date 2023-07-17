import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getNote } from "../../utils/backend"
import { loadUsername } from "../../utils/datastore";
import { View, StyleSheet, Text } from "react-native";
import { Link } from 'expo-router';

export default function NotePage() {
    const title = useLocalSearchParams().title;
    const [content, setContent] = useState('');

    useEffect(() => {
        loadUsername().then((username) => {
            if (!username) throw new Error('no username');
            if (typeof title === 'string') {
                getNote(username, title).then((note) => {
                    setContent(note);
                });
            }
        });
    }, []);

    return (
        <View style={styles.container}>
            <Link href='/titles' style={styles.cornerTopRight}>to notes</Link>
            <Link href='/user' style={styles.cornerTopLeft}>to user</Link>
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

