export const APP_CONFIG = {
  name: "Karma.AI",
  version: "1.0.0",

  // API Configuration
  apiTimeout: 30000,

  // Image Configuration
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/jpg", "image/png"] as const,
  imageQuality: 0.8,

  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,

  // User Configuration
  minUsernameLength: 4,
  minPasswordLength: 6,
  maxUsernameLength: 30,

  // Location
  defaultLocationRadius: 10, // km
  maxLocationRadius: 100, // km

  // Credits
  defaultCredits: 5,
  imageGenerationCost: 1,

  // Verification
  verificationCodeLength: 4,
  verificationCodeStatic: "1234", // For demo purposes

  // URLs
  privacyPolicyUrl: "https://www.google.com",
  termsOfServiceUrl: "https://www.google.com",
  supportEmail: "support@karmaai.com",
} as const;

export const STORAGE_KEYS = {
  authToken: "authToken",
  userData: "userData",
  onboardingComplete: "onboardingComplete",
} as const;

export const ERROR_MESSAGES = {
  network: "Network error. Please check your connection.",
  unauthorized: "Unauthorized. Please login again.",
  serverError: "Server error. Please try again later.",
  invalidCredentials: "Invalid username or password.",
  usernameTaken: "Username is already taken.",
  emailTaken: "Email is already registered.",
  invalidEmail: "Invalid email format.",
  passwordTooShort: "Password must be at least 8 characters.",
  usernameTooShort: "Username must be at least 5 characters.",
  noImageSelected: "Please select an image first.",
  noPrompt: "Please describe your image.",
  insufficientCredits: "Insufficient credits. Please upgrade to premium.",
  locationPermissionDenied: "Location permission denied.",
  mediaPermissionDenied: "Media library permission denied.",
  invalidVerificationCode: "Invalid verification code.",
  generic: "An error occurred. Please try again.",
} as const;

export const SUCCESS_MESSAGES = {
  loginSuccess: "Login successful!",
  signupSuccess: "Account created successfully!",
  profileUpdated: "Profile updated successfully!",
  imageGenerated: "Image generated successfully!",
  friendRequestAccepted: "Friend request accepted!",
  friendRequestRejected: "Friend request rejected.",
  purchaseSuccess: "You are now a Premium member!",
  accountDeleted: "Account deleted successfully.",
} as const;
