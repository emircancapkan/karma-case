import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { authAPI } from './src/api/apiClient';

type Step = 'username' | 'password';

interface LoginFormValues {
  username: string;
  password: string;
}

const validationSchemas = {
  username: Yup.object().shape({
    username: Yup.string()
      .min(5, 'Username must be at least 5 characters')
      .required('Username is required'),
  }),
  password: Yup.object().shape({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
  }),
};

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('username');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const initialValues: LoginFormValues = {
    username: '',
    password: '',
  };

  const getProgressWidth = () => {
    return step === 'username' ? '50%' : '100%';
  };

  const getTitle = () => {
    return step === 'username' ? 'Enter your username' : 'Enter your password';
  };

  const handleContinue = async (values: LoginFormValues, validateField: (field: string) => Promise<any>) => {
    setErrorMessage('');
    setLoading(true);

    try {
      if (step === 'username') {
        await validateField('username');
        if (values.username.trim().length >= 5) {
          setStep('password');
        }
      } else {
        await validateField('password');
        if (values.password.trim().length >= 8) {
          // Login API call
          const response = await authAPI.login({
            username: values.username,
            password: values.password,
          });

          if (response.data.success) {
            // Save token and user data
            const { token, user } = response.data.data;
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));

            Alert.alert('Success', 'Login successful!', [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)/' as any),
              },
            ]);
          } else {
            setErrorMessage('Login failed. Please check your credentials.');
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'An error occurred. Please try again.';
      setErrorMessage(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isButtonEnabled = (values: LoginFormValues) => {
    if (step === 'username') {
      return values.username.trim().length >= 5;
    } else {
      return values.password.trim().length >= 8;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Formik
        initialValues={initialValues}
        onSubmit={() => {}}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ values, handleChange, handleBlur, validateField }) => (
          <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <StatusBar style="dark" />
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: getProgressWidth() }]} />
            </View>

            <View style={styles.content}>
              {/* Title */}
              <Text style={styles.title}>{getTitle()}</Text>

              {/* Error Message */}
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Input Field */}
              <View style={styles.inputContainer}>
                {step === 'username' ? (
                  <>
                    <Text style={styles.atSymbol}>@</Text>
                    <TextInput
                      style={styles.input}
                      value={values.username}
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      placeholder="username"
                      placeholderTextColor="#D1D5DB"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus
                      onSubmitEditing={() => handleContinue(values, validateField)}
                    />
                  </>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    placeholder="Enter your password"
                    placeholderTextColor="#D1D5DB"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() => handleContinue(values, validateField)}
                  />
                )}
              </View>
            </View>

            {/* Continue Button */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.continueButton,
                  (!isButtonEnabled(values) || loading) && styles.continueButtonDisabled,
                  pressed && isButtonEnabled(values) && !loading && styles.buttonPressed,
                ]}
                onPress={() => handleContinue(values, validateField)}
                disabled={!isButtonEnabled(values) || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[
                    styles.continueButtonText,
                    !isButtonEnabled(values) && styles.continueButtonTextDisabled
                  ]}>
                    CONTINUE
                  </Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        )}
      </Formik>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -20
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    marginTop: Platform.OS === 'ios' ? 44 : 0,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7C3AED',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems:'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 40,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#7C3AED',
    paddingBottom: 8,
    marginTop:100
  },
  atSymbol: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '500',
    marginRight: 1,
    marginLeft: '35%'
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#000000',
    paddingVertical: 8,
    textAlign: 'justify'
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  continueButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#C4B5FD',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  continueButtonTextDisabled: {
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

