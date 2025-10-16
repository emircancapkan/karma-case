import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleSignUp = () => {
    router.replace('/signup' as any);
  };

  const handleSignIn = () => {
    router.push('/login' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Karma<Text style={styles.headerTitleAI}>.AI</Text>
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Illustration placeholder */}
        <View style={styles.illustrationContainer}>
          <Image source={require('../assets/images/home_page.png')} style={styles.illustrationImage} />
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Karma.AI</Text>
          <Text style={styles.welcomeDescription}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit risus euismod lacus.
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable 
          style={({ pressed }) => [
            styles.signUpButton,
            pressed && styles.buttonPressed
          ]}
          onPress={handleSignUp}
        >
          <Text style={styles.signUpButtonText}>SIGN UP</Text>
        </Pressable>

        <Pressable 
          style={({ pressed }) => [
            styles.signInButton,
            pressed && styles.buttonPressed
          ]}
          onPress={handleSignIn}
        >
          <Text style={styles.signInButtonText}>SIGN IN</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
  },
  headerTitleAI: {
    color: '#7C3AED',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    gap: 20,
  },
  signUpButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  signInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

