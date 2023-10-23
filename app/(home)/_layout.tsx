import { Tabs } from 'expo-router/tabs';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
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
            name="titles"
            options={{
                tabBarIcon: ({focused}) => <Ionicons name="ios-clipboard-outline" size={32} color={focused ? 'mediumturquoise' : 'gray'}/>
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
  );
}
