import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function SignInPage() {

    const [username, storeUsername] = useState('');
    const [password, storePassword] = useState('');
    const [debug, setDebug] = useState('');

    const handleSignIn = async () => {
        try {
            const credential = await signInWithEmailAndPassword(auth, username, password);
            setDebug(JSON.stringify(credential));
        } catch (error) {
            setDebug(JSON.stringify(error));
        }
        router.replace('/');

    }

    return (
        <View style={styles.container}>
            <Link href='/' style={styles.cornerTopRight}>record</Link>
            <Text>sign in</Text>
            <Link href='/signup'>sign up</Link>
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
                onPress={handleSignIn}
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
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10,
        backgroundColor: 'lightblue',
    }
  });