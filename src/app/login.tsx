import { useCustomFonts } from '@/hooks/useFonts';
import { useAuthActions, useAuthFormState, useAuthUser } from '@/stores/auth.store';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { fontsLoaded } = useCustomFonts();
  const router = useRouter();
  const { isLoggedIn, user } = useAuthUser();
  const { isLoading } = useAuthFormState();
  const { login, logout } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submitLockRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      submitLockRef.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn && user && isMountedRef.current) {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/articles');
        }
      }
    }, [isLoggedIn, user, router])
  );

  const handleLogin = useCallback(async () => {
    if (submitLockRef.current || !isMountedRef.current) {
      return;
    }

    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    submitLockRef.current = true;

    try {
      await login({ email, password });
      if (isMountedRef.current) {
        Alert.alert('Success', 'Login successful!');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      // 
    } finally {
      setTimeout(() => {
        if (isMountedRef.current) {
          submitLockRef.current = false;
        }
      }, 500);
    }
  }, [email, password, login]);

  const handleLogout = useCallback(async () => {
    if (submitLockRef.current || !isMountedRef.current) {
      return;
    }
    submitLockRef.current = true;
    try {
      await logout();
      if (isMountedRef.current) {
        Alert.alert('Success', 'Logout successful!');
      }
    } catch (err) {
      if (isMountedRef.current) {
        Alert.alert('Logout Failed', 'Failed to logout');
      }
    } finally {
      setTimeout(() => {
        if (isMountedRef.current) {
          submitLockRef.current = false;
        }
      }, 500);
    }
  }, [logout]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/bg-login.png')}
          style={styles.imgBackground}
        />
        <View>
          <Text style={styles.title}>Masuk</Text>
          <Text style={styles.subtitle}>Selamat datang kembali!</Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            testID="email-input"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Kata Sandi"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            testID="password-input"
            editable={!isLoading}
          />

          <Text style={styles.forgotPassword}>Lupa Kata Sandi?</Text>

          <TouchableOpacity
            style={[styles.btnLogin, isLoading && styles.btnLoginDisabled]}
            onPress={handleLogin}
            disabled={isLoading || submitLockRef.current}
            testID="login-button"
            activeOpacity={0.7}
          >
            <Text style={styles.btnLoginText}>
              {isLoading ? 'Loading...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.flex}>
            <Text style={styles.textCreate}>Belum Punya Akun?</Text>
            <Text style={styles.textCreateGreen}> Buat Akun</Text>
          </View>

          <View style={styles.wrapLine}>
            <View style={styles.line} />
            <Text style={styles.textLine}>atau</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.btnLoginGoogle}
            onPress={handleLogout}
            disabled={isLoading || submitLockRef.current}
            testID="logout-button"
            activeOpacity={0.7}
          >
            <Image
              source={require('@/assets/images/ic-google.png')}
            />
            <Text style={styles.textLoginGoogle}>
              Google
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.skipLogin}>
          <Text style={styles.textSkipLogin}>Lewati, langsung lihat daftar komik</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Name: {user.name}</Text>
          <Text style={styles.userInfoText}>Email: {user.email}</Text>
          <Text style={styles.userInfoText}>ID: {user.id}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btnLogout, isLoading && styles.btnLogoutDisabled]}
        onPress={handleLogout}
        disabled={isLoading || submitLockRef.current}
        testID="logout-button"
        activeOpacity={0.7}
      >
        <Text style={styles.btnLogoutText}>
          {isLoading ? 'Loading...' : 'Logout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 44,
    backgroundColor: '#FFF',
    justifyContent: 'space-between',
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imgBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 188,
    height: 130,
  },
  title: {
    marginTop: 80,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#020202',
    lineHeight: 26,
    fontFamily: 'ComicBook',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    color: '#959697',
  },
  forgotPassword: {
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
    color: '#3FA535',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: 'white',
    borderRadius: 100,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: 'red',
  },
  btnLogin: {
    width: '100%',
    height: 52,
    backgroundColor: '#A3D69D',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  btnLoginDisabled: {
    opacity: 0.6,
  },
  btnLoginGoogle: {
    borderColor: '#EAE9E9',
    borderWidth: 1,
    width: '100%',
    height: 52,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textLoginGoogle: {
    color: '#020202',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  textCreate: {
    fontSize: 14,
    fontWeight: 400,
    color: '#959697',
  },
  textLine: {
    fontSize: 14,
    fontWeight: 400,
    color: '#959697',
    marginHorizontal: 16,
  },
  textCreateGreen: {
    fontSize: 14,
    fontWeight: 500,
    color: '#3FA535',
  },
  wrapLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  wrapError: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#8F9092',
  },
  btnLoginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  btnLogout: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  btnLogoutDisabled: {
    opacity: 0.6,
  },
  btnLogoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textSkipLogin: {
    fontSize: 16,
    fontWeight: 700,
    color: '#3FA535',
    textDecorationLine: 'underline',
  },
  skipLogin: {
    marginBottom: 60,
    margin: 'auto',
  },
  error: {
    color: 'red',
    marginLeft: 6,
  },
  userInfo: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
});
