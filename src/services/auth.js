import {
  signIn,
  confirmSignIn,
  signOut,
  fetchAuthSession,
  getCurrentUser,
  resetPassword,
  confirmResetPassword
} from 'aws-amplify/auth';

export async function signInWithCognito(email, password) {
  // Clear an old browser session so a fresh sign-in can start.
  try {
    await signOut();
  } catch {
    // There may be no previous session to clear.
  }

  const result = await signIn({
    username: email.trim(),
    password
  });

  if (!result.isSignedIn) {
    return {
      signedIn: false,
      nextStep: result.nextStep
    };
  }

  return {
    signedIn: true,
    user: await getCurrentUser()
  };
}

export async function completeNewPasswordSignIn(newPassword) {
  const result = await confirmSignIn({
    challengeResponse: newPassword
  });

  if (!result.isSignedIn) {
    return {
      signedIn: false,
      nextStep: result.nextStep
    };
  }

  return {
    signedIn: true,
    user: await getCurrentUser()
  };
}

export async function startCognitoPasswordReset(email) {
  return resetPassword({ username: email.trim() });
}

export async function finishCognitoPasswordReset(email, confirmationCode, newPassword) {
  await confirmResetPassword({
    username: email.trim(),
    confirmationCode: confirmationCode.trim(),
    newPassword
  });
}

export async function signOutFromCognito() {
  await signOut();
}

export async function getCognitoIdToken() {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() || null;
}
