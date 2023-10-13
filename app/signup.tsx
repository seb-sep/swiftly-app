import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { createAccount } from '../utils/backend';

export default function SignUpPage() {

    const [username, storeUsername] = useState('');
    const [password, storePassword] = useState('');
    const [debug, setDebug] = useState('');

    const handleSignUp = async () => {
        try {
            const credential = await createUserWithEmailAndPassword(auth, username, password);
            if (credential?.user?.email) {
                createAccount(credential.user.email);
                router.replace('/');
            } else {
                setDebug('No user email found');
            }
        } catch (error) {
            setDebug(JSON.stringify(error));
        }
    }

    return (
        <View style={styles.container}>
            <Link href='/signin' style={styles.cornerTopRight}>signin</Link>
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
            />
            <Text>{debug}</Text>
        </View>
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
      backgroundColor: 'blue',
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10,
        backgroundColor: 'lightblue',
    }
  });