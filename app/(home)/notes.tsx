import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { getTitles } from '../../utils/backend';
import { auth } from '../../firebaseConfig';
import { router, useFocusEffect } from 'expo-router';
import { noteTitle } from '../../utils/backend'
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { TitleList } from '../../components/titleList';

enum TabState {
  RECENT,
  FAVORITES,
}

export default function NotesPage() {
    const [titles, setTitles] = useState<noteTitle[]>([])
    const [tabState, setTabState] = useState(TabState.RECENT);
    const goToRecord = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
      if (event.nativeEvent.state === State.END) {
        router.replace('/');
      }
    };
 
    useFocusEffect(useCallback(() => {
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

    }, []));   

    const displays = {
      [TabState.RECENT]: <TitleList titles={titles} />,
      [TabState.FAVORITES]: <TitleList titles={titles.filter((note) => note.favorite)} />,  
    };

    return (
      <FlingGestureHandler
        direction={Directions.LEFT}
        onHandlerStateChange={goToRecord}>
          <View style={styles.container}>
            <View style={styles.tabBar}>
              <TouchableOpacity
                onPress={() => setTabState(TabState.RECENT)}
                style={styles.tab}>
                <Text style={[styles.tabText, tabState == TabState.RECENT && {color: "mediumturquoise", textDecorationLine: 'underline'}]}>Recent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTabState(TabState.FAVORITES)}
                style={styles.tab}>
                <Text style={[styles.tabText, tabState == TabState.FAVORITES && {color: "mediumturquoise", textDecorationLine: 'underline'}]}>Favorites</Text>
              </TouchableOpacity>
              </View>
              <View style={styles.titleContainer}>
                {displays[tabState]}
              </View>
          </View>
      </FlingGestureHandler>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height:10,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxHeight: 56,
    padding: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: 'gray',
    // borderWidth: 1,
    // borderColor: 'green',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    paddingTop: 8,
  },
  tabText: {
    textAlign: 'center',
    fontSize: 16,
    height: 32,
  },
  titleContainer: {
    // borderWidth: 1,
    // borderColor: 'purple',
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
});


