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

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            const credential = await signInWithEmailAndPassword(auth, email, password);
            router.replace('/');
        } catch (error) {
            setDebug('sign in failed, please try again');
            setTimeout(() => {
                setDebug('');
            }, 1000);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={{fontSize: 24, fontWeight: 'bold'}}>sign in</Text>
            <View style={styles.textContainer}>
                <TextInput
                    style={styles.textBox}
                    value={email}
                    onChangeText={setEmail}
                    placeholder='email here'
                    autoCapitalize='none'
                />
                <TextInput
                    style={styles.textBox}
                    value={password}
                    onChangeText={setPassword}
                    placeholder='password here'
                    autoCapitalize='none'
                />

                <TouchableOpacity
                    onPress={handleSignIn}
                    style={{backgroundColor: 'mediumpurple', padding: 10, borderRadius: 4}}
                >
                    <Text style={{color: 'white'}}>sign in</Text>
                </TouchableOpacity>
                <Text>{debug}</Text>
            </View>
            <View style={styles.notesIconStyle}>
                <Link style={{color: 'white'}} href='/signup' >don't have an account? sign up</Link>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 8,
        height: 64,
        width: 256,
    },
    textBox: {
        borderColor: 'darkgray',
        borderWidth: 1,
        borderRadius: 4,
        height: 32,
        width: 240,
        padding: 8,
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
        borderRadius: 4,
        backgroundColor: 'mediumseagreen',
    }
});