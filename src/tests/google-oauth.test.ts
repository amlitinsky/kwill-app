import { signInWithGoogle, getCurrentUser, signOut, deleteAccount } from '../lib/supabase';

describe('Google OAuth Tests', () => {
  const testEmail = 'amlitinsky@gmail.com';

  it('should complete the Google OAuth flow', async () => {
    // Simulate Google OAuth sign-in
    const signInData = await signInWithGoogle();
    expect(signInData).toBeDefined();

    // Test get current user
    const currentUser = await getCurrentUser();
    expect(currentUser).toBeDefined();

    // Verify the user's email
    expect(currentUser?.email).toBe(testEmail);

    // Test sign out
    await expect(signOut()).resolves.not.toThrow();

    // Sign in again to delete the account
    await signInWithGoogle();

    // Test delete account
    await expect(deleteAccount()).resolves.not.toThrow();
  });
});