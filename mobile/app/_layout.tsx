import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Connection Settings',
            headerStyle: { backgroundColor: '#1e1e2e' },
            headerTintColor: '#a9a3f0',
          }}
        />
      </Stack>
      <StatusBar hidden />
    </>
  );
}
