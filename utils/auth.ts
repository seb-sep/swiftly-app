import React from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { router, useFocusEffect } from 'expo-router';
import { auth } from '../firebaseConfig';


export function useAuth() {

  const [user, setUser] = React.useState<User | null>(null);

  useFocusEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
        } else {
          router.replace('/signin');
        }
      });

      return () => unsub();
  });

  return user;

}