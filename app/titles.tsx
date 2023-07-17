import { View, FlatList, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { loadUsername } from '../utils/datastore';
import { getTitles } from '../utils/backend';

export default function TitleListPage() {
    const [titles, setTitles] = useState<string[]>([])
    useEffect(() => {
        loadUsername().then((username) => {
            if (!username) throw new Error('username does not exist');
            getTitles(username).then((titles) => {
                setTitles(titles);
            });
        });
    }, []);
    
    return (
        <View style={styles.container}>
            <Link href='/' style={styles.cornerTopRight}>to record</Link>
            <Link href='/user' style={styles.cornerTopLeft}>to user</Link>
            <FlatList
                data={titles}
                renderItem={({item}) => <Link href={`/notes/${item}`}>{item}</Link>}
                keyExtractor={item => item}
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

