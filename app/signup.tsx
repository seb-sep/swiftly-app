import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { createAccount } from '../utils/backend';
import { Directions, FlingGestureHandler, GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpPage() {

    const [username, storeUsername] = useState('');
    const [password, storePassword] = useState('');
    const [debug, setDebug] = useState('');

    const handleSignUp = async () => {
        try {
            const credential = await createUserWithEmailAndPassword(auth, username, password);
            if (credential?.user?.email) {
                const success = await createAccount(credential.user.email);
                if (!success) {
                    setDebug('account creation failed, try with a different email or password');
                    return;
                }
                router.replace('/');
            } else {
                setDebug('account creation failed, try with a different email or password');
            }
        } catch (error) {
            console.log(JSON.stringify(error, null, 2));
            setDebug(JSON.stringify(error));
        }
    }
    
    const goToSignIn = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
      if (event.nativeEvent.state === State.END) {
        router.replace('/signin');
      }
    };

    return (

        <FlingGestureHandler
            direction={Directions.RIGHT}
            onHandlerStateChange={goToSignIn}
        >
            <View style={styles.container}>
                <Text>sign up</Text>
                <TextInput
                    value={username}
                    onChangeText={storeUsername}
                    placeholder='email here'
                    autoCapitalize='none'
                />
                <TextInput
                    value={password}
                    onChangeText={storePassword}
                    placeholder='password here'
                    autoCapitalize='none'
                />
                <Button
                    title={'submit'}
                    onPress={handleSignUp}
                    color={'mediumpurple'}
                />
                <Text>{debug}</Text>
                <Link href='/signin' style={styles.notesIconStyle}>sign in</Link>
            </View>
        </FlingGestureHandler>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    box: {
      width: 100,
      height: 100,
      backgroundColor: 'mediumturquoise',
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