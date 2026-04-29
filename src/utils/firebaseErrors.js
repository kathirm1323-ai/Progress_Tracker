/**
 * Convert Firebase error codes to user-friendly messages.
 */
const errorMap = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email. Please sign up first.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your internet connection.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups.',
  'auth/invalid-api-key': 'App configuration error. Please check Firebase API key.',
  'auth/api-key-not-valid': 'Invalid Firebase API key. Please check your configuration.',
  'auth/configuration-not-found': 'Firebase project not configured correctly.',
};

export function getFirebaseErrorMessage(error) {
  // Firebase errors have a 'code' property like 'auth/user-not-found'
  if (error?.code && errorMap[error.code]) {
    return errorMap[error.code];
  }
  // Fallback: try to extract code from message
  const match = error?.message?.match(/\(auth\/([^)]+)\)/);
  if (match) {
    const code = `auth/${match[1]}`;
    if (errorMap[code]) return errorMap[code];
    // Return the code itself as a readable string
    return match[1].replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
  }
  // Last fallback
  return error?.message || 'An unexpected error occurred. Please try again.';
}
