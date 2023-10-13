import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpjCoERdPtQC-VnCk2tnt8bxBHpoAR-wI",
  authDomain: "swiftly-firebase.firebaseapp.com",
  projectId: "swiftly-firebase",
  storageBucket: "swiftly-firebase.appspot.com",
  messagingSenderId: "64768284252",
  appId: "1:64768284252:web:5878684fe15f7008083899",
  measurementId: "G-V6F3D6WVQ4"
};

  
  

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export { auth };
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
