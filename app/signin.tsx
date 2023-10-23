import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function SignInPage() {

    const [enterEmail, setEmail] = useState('');
    const [enterPassword, setPassword] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [debug, setDebug] = useState('');
  
    useEffect(() => {
        const authed = onAuthStateChanged(auth, (user) => {
            if (user && user.email) {
                setCurrentUser(user.email);
            }
        });
    }, []);
    const handleSignIn = async () => {
        try {
            const credential = await signInWithEmailAndPassword(auth, enterEmail, enterPassword);
            setDebug(JSON.stringify(credential));
        } catch (error) {
            setDebug(JSON.stringify(error));
        }
        router.replace('/');

    };

    const goToRecord = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
      if (event.nativeEvent.state === State.END && currentUser) {
        router.replace('/');
      }
    };

    return (
        <FlingGestureHandler
            direction={Directions.RIGHT}
            onHandlerStateChange={goToRecord}
        >
            {!currentUser ?
                <View style={styles.container}>
                    <Text>sign in</Text>
                    <TextInput
                        value={enterEmail}
                        onChangeText={setEmail}
                        placeholder='email here'
                        autoCapitalize='none'
                    />
                    <TextInput
                        value={enterPassword}
                        onChangeText={setPassword}
                        placeholder='password here'
                        autoCapitalize='none'
                    />
                    <Button
                        title={'submit'}
                        onPress={handleSignIn}
                        color={'mediumpurple'}
                    />
                    <Link href='/signup' style={styles.notesIconStyle}>sign up</Link>
                    <Text>{debug}</Text>
                </View>
                :
                <View style={styles.container}>
                    <Ionicons name="chevron-back-outline" size={24} color="gray" style={styles.topLeft}/>
                    <Text>signed in as {currentUser}</Text>
                    <Button
                        title={'sign out'}
                        onPress={() => auth.signOut()}
                    />
                    <TouchableOpacity onPress={() => router.replace('/')} style={styles.notesIconStyle} >
                        <Ionicons name="mic-outline" size={24} color="mediumturquoise"/>
                    </TouchableOpacity>
                </View>
            }
        </FlingGestureHandler>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10,
        backgroundColor: 'mediumturquoise',
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
        fontSize: 20,
        color: 'mediumturquoise',
    }
});