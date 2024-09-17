import {
  signUp,
  signIn,
  signOut,
  deleteAccount,
  getCurrentUser,
  updateProfile,
} from '../lib/supabase';

describe('Auth Tests', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'testPassword123!';
  const testFirstName = 'John';
  const testLastName = 'Doe';

  it('should sign up a new user', async () => {
    const signUpData = await signUp(testEmail, testPassword, testFirstName, testLastName);
    console.log(signUpData)
    expect(signUpData).toBeDefined();
    expect(signUpData.user).toBeDefined();
  });

  it('should sign in a user', async () => {
    const signInData = await signIn(testEmail, testPassword);
    expect(signInData).toBeDefined();
    expect(signInData.user).toBeDefined();
  });

  it('should get current user', async () => {
    const currentUser = await getCurrentUser();
    expect(currentUser).toBeDefined();
    expect(currentUser?.email).toBe(testEmail);
  });

  it('should update user profile', async () => {
    await expect(updateProfile('Jane', 'Smith')).resolves.not.toThrow();
  });

  it('should sign out a user', async () => {
    await expect(signOut()).resolves.not.toThrow();
  });

  it('should delete user account', async () => {
    await signIn(testEmail, testPassword);
    await expect(deleteAccount()).resolves.not.toThrow();
  });
});