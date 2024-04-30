import { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { createAccount } from '../utils/backend';
// import { GestureHandlerStateChangeNativeEvent, State } from 'react-native-gesture-handler';

export default function SignUpPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState({first: '', confirm: ''});
    const [debug, setDebug] = useState('');

    const handleSignUp = async () => {
        if (password.first !== password.confirm) {
            setDebug('passwords do not match');
            setTimeout(() => {
                setDebug('');
            }, 1000);
            return;
        }
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password.first);
            if (credential?.user?.email) {
                const success = await createAccount(credential.user.email);
                if (!success) {
                    setDebug('account creation failed, try with a different email or password');
                    setTimeout(() => {
                        setDebug('');
                    }, 1000);
                    return;
                }
                router.replace('/');
            } else {
                setDebug('account creation failed, try with a different email or password');
                setTimeout(() => {
                    setDebug('');
                }, 1000);
            }
        } catch (error) {
            setDebug(JSON.stringify(error));
            setDebug('account creation failed, try with a different email or password');
            setTimeout(() => {
                setDebug('');
            }, 1000);
        }
    }
    
    // const goToSignIn = (event: { nativeEvent: GestureHandlerStateChangeNativeEvent }) => {
    //   if (event.nativeEvent.state === State.END) {
    //     router.replace('/signin');
    //   }
    // };

    return (
        <View style={styles.container}>
            <Text style={{fontSize: 24, fontWeight: 'bold'}}>sign up</Text>
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
                    value={password.first}
                    onChangeText={(text) => setPassword({first: text, confirm: password.confirm})}
                    placeholder='password here'
                    autoCapitalize='none'
                />
                <TextInput
                    style={styles.textBox}
                    value={password.confirm}
                    onChangeText={(text) => setPassword({first: password.first, confirm: text})}
                    placeholder='confirm password'
                    autoCapitalize='none'
                />



                <TouchableOpacity
                    onPress={handleSignUp}
                    style={{backgroundColor: 'mediumpurple', padding: 10, borderRadius: 4}}
                >
                    <Text style={{color: 'white'}}>sign up</Text>
                </TouchableOpacity>
                <Text>{debug}</Text>
            </View>
            <View style={styles.notesIconStyle}>
                <Link style={{color: 'white'}} href='/signin' >already have an account? sign in</Link>
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