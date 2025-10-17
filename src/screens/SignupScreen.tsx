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
import * as Yup from 'yup';
import { useAuth } from '@/src/hooks';
import { Input } from '@/src/components/common';
import { colors, spacing, typography, borderRadius, shadows } from '@/src/theme';
import type { SignupFormValues, SignupStep } from '@/src/types';
import { APP_CONFIG } from '@/src/config/constants';
import { showSuccess } from '@/src/utils/helpers';

const validationSchemas = {
  username: Yup.object().shape({
    username: Yup.string()
      .min(APP_CONFIG.minUsernameLength, `Username must be at least ${APP_CONFIG.minUsernameLength} characters`)
      .required('Username is required'),
  }),
  password: Yup.object().shape({
    password: Yup.string()
      .min(APP_CONFIG.minPasswordLength, `Password must be at least ${APP_CONFIG.minPasswordLength} characters`)
      .required('Password is required'),
  }),
  mailVerification: Yup.object().shape({
    mail: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
  }),
  code: Yup.object().shape({
    code: Yup.number()
      .min(1000, 'Verification code must be 4 digits')
      .max(9999, 'Verification code must be 4 digits')
      .required('Verification code is required'),
  }),
};

export const SignupScreen: React.FC = React.memo(() => {
  const { signup, checkUsername, checkEmail, isLoading } = useAuth();
  const [step, setStep] = useState<SignupStep>('username');
  const [errorMessage, setErrorMessage] = useState('');

  const initialValues: SignupFormValues = {
    username: '',
    password: '',
    mail: '',
    code: '',
  };

  const getProgressWidth = useCallback(() => {
    switch (step) {
      case 'username': return '25%';
      case 'password': return '50%';
      case 'mailVerification': return '75%';
      case 'code': return '100%';
      default: return '0%';
    }
  }, [step]);

  const getTitle = useCallback(() => {
    switch (step) {
      case 'username': return 'Enter your username';
      case 'password': return 'Enter your password';
      case 'mailVerification': return 'Enter your email';
      case 'code': return 'Enter verification code: 1234';
      default: return '';
    }
  }, [step]);

  const handleContinue = useCallback(async (values: SignupFormValues, validateField: (field: string) => Promise<any>) => {
    setErrorMessage('');

    try {
      switch (step) {
        case 'username':
          await validateField('username');
          if (values.username.trim().length >= APP_CONFIG.minUsernameLength) {
            await checkUsername(values.username);
            setStep('password');
          }
          break;

        case 'password':
          await validateField('password');
          if (values.password.trim().length >= APP_CONFIG.minPasswordLength) {
            setStep('mailVerification');
          }
          break;

        case 'mailVerification':
          await validateField('mail');
          if (validationSchemas.mailVerification.isValidSync({ mail: values.mail })) {
            await checkEmail(values.mail);
            setStep('code');
            showSuccess('Verification code sent to your email');
          }
          break;

        case 'code':
          await validateField('code');
          if (values.code.trim().length === 4 && values.code === APP_CONFIG.verificationCodeStatic) {
            const result = await signup({
              username: values.username,
              password: values.password,
              mail: values.mail,
              code: values.code,
            });

            if (!result.success) {
              setErrorMessage(result.error || 'Signup failed');
            }
          } else {
            setErrorMessage('Invalid verification code');
          }
          break;
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
    }
  }, [step, signup, checkUsername, checkEmail]);

  const isButtonEnabled = useCallback((values: SignupFormValues) => {
    switch (step) {
      case 'username':
        return values.username.trim().length >= APP_CONFIG.minUsernameLength;
      case 'password':
        return values.password.trim().length >= APP_CONFIG.minPasswordLength;
      case 'mailVerification':
        return validationSchemas.mailVerification.isValidSync({ mail: values.mail });
      case 'code':
        return values.code.trim().length === 4;
      default:
        return false;
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
                {step === 'username' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
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
                  </View>
                )}
                {step === 'password' && (
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
                {step === 'mailVerification' && (
                  <Input
                    value={values.mail}
                    onChangeText={handleChange('mail')}
                    onBlur={handleBlur('mail')}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() => handleContinue(values, validateField)}
                    containerStyle={styles.inputWrapper}
                    style={styles.input}
                  />
                )}
                {step === 'code' && (
                  <Input
                    value={values.code}
                    onChangeText={handleChange('code')}
                    onBlur={handleBlur('code')}
                    placeholder="1234"
                    keyboardType="number-pad"
                    maxLength={4}
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

SignupScreen.displayName = 'SignupScreen';

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
    marginLeft: '35%',
    marginRight: spacing.xs / 2,
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

