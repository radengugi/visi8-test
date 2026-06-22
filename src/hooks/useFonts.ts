import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

/**
 * Custom Font Hook
 * Loads and manages custom fonts for the app
 *
 * Available Fonts:
 * - ComicBook: Custom comic book style font
 * - Regular: System default font
 */

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

/**
 * Font loading configuration
 * Add your custom fonts here
 */
const FONTS = {
  'ComicBook': require('../../assets/fonts/KOMIKAX_.ttf'),
  // Add more fonts here as needed
  // 'CustomFont': require('../../assets/fonts/CustomFont.ttf'),
};

/**
 * useCustomFonts Hook
 *
 * Usage:
 * ```tsx
 * const { fontsLoaded, fontError } = useCustomFonts();
 *
 * if (!fontsLoaded && !fontError) {
 *   return null; // or loading screen
 * }
 * ```
 */
export const useCustomFonts = () => {
  const [fontsLoaded, fontError] = useFonts(FONTS);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    } else if (fontError) {
      console.error('❌ Font loading error:', fontError);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return { fontsLoaded, fontError };
};

/**
 * Font names constant for type safety
 */
export const FONT_NAMES = {
  COMIC_BOOK: 'ComicBook',
  REGULAR: 'System',
} as const;
