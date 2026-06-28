import { useCustomFonts } from '@/hooks/useFonts';
import { useAuthLoading, useAuthStore, useEmailError, usePasswordError } from '@/stores/auth.store';
import { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { fontsLoaded } = useCustomFonts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isLoading = useAuthLoading();
  const emailError = useEmailError();
  const passwordError = usePasswordError();

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const handleLogin = useCallback(async () => {
    try {
      await login({ email, password });
      Alert.alert('Success', 'Login successful!');
      setEmail('');
      setPassword('');
    } catch (err) {
      // 
    }
  }, [email, password, login]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logout successful!');
    } catch (err) {
      Alert.alert('Logout Failed', 'Failed to logout');
    }
  }, [logout]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

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
          style={[styles.input, emailError && styles.inputError]}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          testID="email-input"
        />
        {emailError && (
          <View style={styles.wrapError}>
            <Image
              source={require('@/assets/images/ic-warning.svg')}
            />
            <Text style={styles.error} testID="email-error">
              {emailError}
            </Text>
          </View>
        )}

        <TextInput
          style={[styles.input, passwordError && styles.inputError]}
          placeholder="Kata Sandi"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          testID="password-input"
        />

        {passwordError && (
          <View style={styles.wrapError}>
            <Image
              source={require('@/assets/images/ic-warning.svg')}
            />
            <Text style={styles.error} testID="password-error">
              {passwordError}
            </Text>
          </View>
        )}

        <Text style={styles.forgotPassword}>Lupa Kata Sandi?</Text>

        <TouchableOpacity
          style={[
            styles.btnLogin,
            email && password && styles.btnLoginActive
          ]}
          onPress={handleLogin}
          disabled={isLoading}
          testID="login-button"
          activeOpacity={0.7}
        >
          <Text style={styles.btnLoginText}>
            {isLoading ? 'Loading...' : 'Masuk'}
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
          disabled={isLoading}
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
};

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
  btnLoginActive: {
    backgroundColor: '#60B558',
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
});
