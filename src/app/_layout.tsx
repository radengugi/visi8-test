import { QueryProvider } from '@/providers/query-provider';
import { useAuthActions, useAuthState } from '@/stores/auth.store';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoadingScreen: React.FC = () => (
  <SafeAreaView style={styles.safeArea}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#208AEF' }}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={{ marginTop: 16, color: '#FFFFFF', fontSize: 16 }}>Loading...</Text>
    </View>
  </SafeAreaView>
);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading } = useAuthState();
  const { restoreSession } = useAuthActions();
  const [isSessionRestored, setIsSessionRestored] = useState(false);

  useEffect(() => {
    restoreSession()
      .then(() => setIsSessionRestored(true))
      .catch((error) => {
        console.error('Failed to restore session:', error);
        setIsSessionRestored(true);
      });
  }, [restoreSession]);

  if (!isSessionRestored || isLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={styles.safeArea}>
        <QueryProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="articles"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </QueryProvider>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
