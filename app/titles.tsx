import { View, FlatList, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { loadUsername } from '../utils/datastore';
import { getTitles } from '../utils/backend';
import { auth } from '../firebaseConfig';
import { router } from 'expo-router';
import { noteTitle } from '../utils/backend'

export default function TitleListPage() {
    const [titles, setTitles] = useState<noteTitle[]>([])
 
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
        <View style={styles.container}>
            <Link href='/' style={styles.cornerTopRight}>to record</Link>
            <Link href='/signin' style={styles.cornerTopLeft}>to user</Link>
            <FlatList
                data={titles}
                keyExtractor={(title) => title.id.toString()}
                renderItem={({ item }) => <Link href={`/notes/${item.id}`}>{item.title}</Link>}
            />
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

