/**
 * Articles Screen
 * Uses ReadingProgressExample for reading progress functionality
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthActions } from '@/stores/auth.store';
import ReadingProgressExample from '@/components/reading/ReadingProgressExample';

export default function ArticlesScreen() {
  const { logout } = useAuthActions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ReadingProgressExample />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
