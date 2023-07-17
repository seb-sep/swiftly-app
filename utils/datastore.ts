import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadUsername = async () => {
      try {
        const value = await AsyncStorage.getItem('current-user');
        if (value !== null) {
          return value;
        }
      } catch (e) {
        throw new Error(`For some reason, the username could not be loaded: ${e}`);
      }
};

export const storeUsername = async (username: string) => {
    try {
        await AsyncStorage.setItem('current-user', username);
        console.log('Current user ' + username);
    } catch (e) {
        console.error(e);
    }
};