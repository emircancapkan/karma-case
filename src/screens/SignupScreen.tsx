import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
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
  const codeInputRef = useRef<TextInput>(null);

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
              {step === 'username' ? (
                <View style={styles.usernameContainer}>
                  <Text style={styles.atSymbol}>@</Text>
                  <TextInput
                    value={values.username}
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                    placeholder="username"
                    placeholderTextColor={colors.textPlaceholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() => handleContinue(values, validateField)}
                    style={styles.usernameInput}
                  />
                </View>
              ) : step === 'password' ? (
                <View style={styles.passwordContainer}>
                  <TextInput
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textPlaceholder}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() => handleContinue(values, validateField)}
                    style={styles.passwordInput}
                  />
                </View>
              ) : step === 'mailVerification' ? (
                <View style={styles.emailContainer}>
                  <TextInput
                    value={values.mail}
                    onChangeText={handleChange('mail')}
                    onBlur={handleBlur('mail')}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() => handleContinue(values, validateField)}
                    style={styles.emailInput}
                  />
                </View>
              ) : step === 'code' ? (
                <Pressable 
                  style={styles.codeContainer}
                  onPress={() => codeInputRef.current?.focus()}
                >
                  <View style={styles.otpBoxesContainer}>
                    {[0, 1, 2, 3].map((index) => (
                      <View key={index} style={styles.otpBox}>
                        <Text style={styles.otpBoxText}>
                          {values.code[index] || ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <TextInput
                    ref={codeInputRef}
                    value={values.code}
                    onChangeText={(text) => {
                      // Only accept numbers and max 4 digits
                      const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
                      handleChange('code')(numericText);
                    }}
                    onBlur={handleBlur('code')}
                    keyboardType="number-pad"
                    maxLength={4}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() => handleContinue(values, validateField)}
                    style={styles.hiddenInput}
                    caretHidden={false}
                  />
                </Pressable>
              ) : null}
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
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: spacing.sm,
    marginTop: 100,
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: spacing.sm,
    marginTop: 100,
    width: '100%',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: spacing.sm,
    marginTop: 100,
    width: '100%',
  },
  codeContainer: {
    alignItems: 'center',
    marginTop: 100,
    width: '100%',
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  otpBox: {
    width: 56,
    height: 70,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxText: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    fontSize: 1,
  },
  atSymbol: {
    ...typography.body,
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '500',
    marginRight: spacing.xs / 2,
  },
  inputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  input: {
    fontSize: 18,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  usernameInput: {
    fontSize: 18,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    textAlign: 'left',
    backgroundColor: 'transparent',
    color: colors.textPrimary,
  },
  passwordInput: {
    fontSize: 18,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    textAlign: 'center',
    backgroundColor: 'transparent',
    color: colors.textPrimary,
    width: '100%',
  },
  emailInput: {
    fontSize: 18,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    textAlign: 'center',
    backgroundColor: 'transparent',
    color: colors.textPrimary,
    width: '100%',
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

