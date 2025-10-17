import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useAuth } from '@/src/hooks';
import { Input } from '@/src/components/common';
import { colors, spacing, typography, borderRadius, shadows } from '@/src/theme';
import type { LoginFormValues, LoginStep } from '@/src/types';
import { APP_CONFIG } from '@/src/config/constants';


export const LoginScreen: React.FC = React.memo(() => {
  const { login, isLoading } = useAuth();
  const [step, setStep] = useState<LoginStep>('username');
  const [errorMessage, setErrorMessage] = useState('');

  const initialValues: LoginFormValues = {
    username: '',
    password: '',
  };

  const getProgressWidth = useCallback(() => {
    return step === 'username' ? '50%' : '100%';
  }, [step]);

  const getTitle = useCallback(() => {
    return step === 'username' ? 'Enter your username' : 'Enter your password';
  }, [step]);

  const handleContinue = useCallback(async (values: LoginFormValues, validateField: (field: string) => Promise<any>) => {
    setErrorMessage('');

    try {
      if (step === 'username') {
        await validateField('username');
        if (values.username.trim().length >= APP_CONFIG.minUsernameLength) {
          setStep('password');
        }
      } else {
        await validateField('password');
        if (values.password.trim().length >= APP_CONFIG.minPasswordLength) {
          const result = await login({
            username: values.username,
            password: values.password,
          });

          if (!result.success) {
            setErrorMessage(result.error || 'Login failed');
          }
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
    }
  }, [step, login]);

  const isButtonEnabled = useCallback((values: LoginFormValues) => {
    if (step === 'username') {
      return values.username.trim().length >= APP_CONFIG.minUsernameLength;
    } else {
      return values.password.trim().length >= APP_CONFIG.minPasswordLength;
    }
  }, [step]);

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
                    <Input
                      value={values.username}
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      placeholder="username"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus
                      onSubmitEditing={() => handleContinue(values, validateField)}
                      containerStyle={styles.inputWrapper}
                      style={styles.input}
                    />
                  </>
                ) : (
                  <Input
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    placeholder="Enter your password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() => handleContinue(values, validateField)}
                    containerStyle={styles.inputWrapper}
                    style={styles.input}
                  />
                )}
              </View>
            </View>

            {/* Continue Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (!isButtonEnabled(values) || isLoading) && styles.buttonDisabled
                ]}
                onPress={() => handleContinue(values, validateField)}
                disabled={!isButtonEnabled(values) || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.continueButtonText}>CONTINUE</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </Formik>
    </SafeAreaView>
  );
});

LoginScreen.displayName = 'LoginScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: -20,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.border,
    marginTop: Platform.OS === 'ios' ? 44 : 0,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['5xl'],
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing['4xl'],
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: spacing.sm,
    marginTop: 100,
    width: '100%',
  },
  atSymbol: {
    ...typography.body,
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '500',
    marginRight: spacing.xs / 2,
    marginLeft: '35%',
  },
  inputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  input: {
    fontSize: 18,
    paddingVertical: spacing.sm,
    textAlign: 'justify',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing['4xl'] : spacing.xl,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primary,
  },
  continueButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    opacity: 0.6,
  },
});

