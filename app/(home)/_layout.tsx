import { Tabs } from 'expo-router/tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <Tabs
        screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIconStyle: {
                position: 'relative',
                top: 16,
                zIndex: 2,
                width: 56,
                height: 48,

            },
            tabBarStyle: {
                height: 40,
                paddingBottom: 8,
            },
        }}
    >
        <Tabs.Screen
            name="notes"
            options={{
                tabBarIcon: ({focused}) => <Ionicons name="clipboard-outline" size={32} color={focused ? 'mediumturquoise' : 'gray'}/>
            }}
        />
        <Tabs.Screen
            name="index"
            options={{
                tabBarIcon: ({focused}) => <Ionicons name="mic-outline" size={32} color={focused ? 'mediumturquoise' : 'gray'}/>
            }}
        />
        <Tabs.Screen
            name="user"
            options={{
                tabBarIcon: ({focused}) => <Ionicons name="person-circle-outline" size={32} color={focused ? 'mediumturquoise' : 'gray'}/>
            }}
        />
    </Tabs>
    </GestureHandlerRootView>
  );
}
