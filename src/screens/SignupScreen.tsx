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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/src/hooks';
import { Input } from '@/src/components/common';
import { colors, spacing, typography, borderRadius, shadows } from '@/src/theme';
import type { SignupFormValues, SignupStep } from '@/src/types';
import type { RootStackParamList } from '@/src/navigation/types';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SignupScreen: React.FC = React.memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const { signup, checkUsername, checkEmail, isLoading } = useAuth();
  const [step, setStep] = useState<SignupStep>('username');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUsernameErrorModalVisible, setIsUsernameErrorModalVisible] = useState(false);
  const [isPasswordErrorModalVisible, setIsPasswordErrorModalVisible] = useState(false);
  const [isEmailErrorModalVisible, setIsEmailErrorModalVisible] = useState(false);
  const [isCodeErrorModalVisible, setIsCodeErrorModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
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
      case 'password': return 'Create a password';
      case 'mailVerification': return 'We\'ll send you a confirmation code to verify your account';
      case 'code': return 'Enter the verification code';
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
            try {
              const isAvailable = await checkUsername(values.username);
              if (isAvailable) {
                setStep('password');
              } else {
                setIsUsernameErrorModalVisible(true);
              }
            } catch (e) {
              setIsUsernameErrorModalVisible(true);
            }
          } else {
            setIsUsernameErrorModalVisible(true);
          }
          break;

        case 'password':
          await validateField('password');
          if (values.password.trim().length >= APP_CONFIG.minPasswordLength) {
            setStep('mailVerification');
          } else {
            setIsPasswordErrorModalVisible(true);
          }
          break;

        case 'mailVerification':
          await validateField('mail');
          if (validationSchemas.mailVerification.isValidSync({ mail: values.mail })) {
            try {
              const isAvailable = await checkEmail(values.mail);
              if (isAvailable) {
                setStep('code');
                showSuccess('Verification code sent to your email');
              } else {
                setIsEmailErrorModalVisible(true);
              }
            } catch (e) {
              setIsEmailErrorModalVisible(true);
            }
          } else {
            setIsEmailErrorModalVisible(true);
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
            } else {
              setIsSuccessModalVisible(true);
            }
          } else {
            setIsCodeErrorModalVisible(true);
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
        return values.username.trim().length >= 1;
      case 'password':
        return values.password.trim().length >= 1;
      case 'mailVerification':
        return values.mail.trim().length >= 1;
      case 'code':
        return values.code.trim().length >= 1;
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

              {/* Error Message (hidden when username, password, email, or code modal is used) */}
              {step !== 'username' && step !== 'password' && step !== 'mailVerification' && step !== 'code' && errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Input Field */}
              {step === 'username' ? (
                <>
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
                  <Text style={styles.disclaimer}>This is how you will look in the app</Text>
                </>
                
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

            {/* Username Invalid Modal */}
            <Modal
              transparent
              visible={isUsernameErrorModalVisible}
              animationType="fade"
              onRequestClose={() => setIsUsernameErrorModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Invalid Username</Text>
                  <Text style={styles.modalSubtitle}>
                    Username is already used or contains invalid characters. Please try again.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    activeOpacity={0.9}
                    onPress={() => setIsUsernameErrorModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>TRY AGAIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Password Invalid Modal */}
            <Modal
              transparent
              visible={isPasswordErrorModalVisible}
              animationType="fade"
              onRequestClose={() => setIsPasswordErrorModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Invalid Password</Text>
                  <Text style={styles.modalSubtitle}>
                    Invalid password, please create a password with at least 6 characters.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    activeOpacity={0.9}
                    onPress={() => setIsPasswordErrorModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>TRY AGAIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Email Invalid Modal */}
            <Modal
              transparent
              visible={isEmailErrorModalVisible}
              animationType="fade"
              onRequestClose={() => setIsEmailErrorModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Invalid E-mail Address</Text>
                  <Text style={styles.modalSubtitle}>
                    E-mail address is already used or contains invalid characters. Please try again.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    activeOpacity={0.9}
                    onPress={() => setIsEmailErrorModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>TRY AGAIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Code Invalid Modal */}
            <Modal
              transparent
              visible={isCodeErrorModalVisible}
              animationType="fade"
              onRequestClose={() => setIsCodeErrorModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Invalid Code</Text>
                  <Text style={styles.modalSubtitle}>
                    Verification code is incorrect. Please try again.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    activeOpacity={0.9}
                    onPress={() => setIsCodeErrorModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>TRY AGAIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Success Modal */}
            <Modal
              transparent
              visible={isSuccessModalVisible}
              animationType="fade"
              onRequestClose={() => setIsSuccessModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>You have successfully registered 🎉</Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    activeOpacity={0.9}
                    onPress={() => {
                      setIsSuccessModalVisible(false);
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }],
                      });
                    }}
                  >
                    <Text style={styles.modalButtonText}>CONTINUE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
    textAlign: 'center',
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
  disclaimer:{
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    ...shadows.primary,
  },
  modalTitle: {
    ...typography.h3,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
});

