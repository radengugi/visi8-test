import { useAuthState } from '@/stores/auth.store';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  const { isLoggedIn, user, isLoading } = useAuthState();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.message}>Loading...</Text>
      </View>
    );
  }

  if (isLoggedIn && user) {
    return <Redirect href="/articles" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#959697',
  },
});
