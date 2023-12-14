import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { noteTitle } from '../utils/backend';
import { router, useFocusEffect } from 'expo-router';
import React from 'react';


export const TitleList: React.FC<{ titles: noteTitle[] }> = ({ titles }) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={titles}
                keyExtractor={(title) => title.id.toString()}
                renderItem={({ item }) => <NoteTitleElement note={item} />}
                style={styles.notesView}
            />
        </View>
    )
}

const MAX_TITLE_CHARS = 40

const NoteTitleElement: React.FC<{ note: noteTitle }> = ({ note }) => {
  return (
    <TouchableOpacity
      onPress={() => router.replace(`/notes/${note.id}`)}
      style={styles.title}>
      <Text style={styles.titleText}>{trimTitle(note.title)}</Text>
      <Text style={styles.dateText}>{parseString(note.created)}</Text>
    </TouchableOpacity> 
  );
}

function parseString(str: string): string {
  return new Date(Date.parse(str)).toDateString();
}

function trimTitle(title: string): string {
  return title.length > MAX_TITLE_CHARS ? title.substring(0, MAX_TITLE_CHARS) + '...' : title;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  
  notesView: {
    position: 'absolute',
    width: 350,
    maxHeight: 650,
    // borderWidth: 1,
    // borderColor: 'blue',    
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


