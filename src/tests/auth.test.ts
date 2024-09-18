import { signUp, signIn, supabase, getCurrentUser, updateProfile, signOut, deleteAccount } from '../lib/supabase';
import { confirmTestUserEmail } from '../lib/testUtils';

describe('Auth Tests', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testPassword123!';
  const testFirstName = 'John';
  const testLastName = 'Doe';

  it('should sign up a new user and handle email confirmation', async () => {
    const signUpData = await signUp(testEmail, testPassword, testFirstName, testLastName);
    expect(signUpData).toBeDefined();
    expect(signUpData.user).toBeDefined();

    // Confirm the email using admin API (for testing purposes only)
    await confirmTestUserEmail(signUpData.user!.id);

    // Now try to sign in
    const signInData = await signIn(testEmail, testPassword);
    expect(signInData).toBeDefined();
    expect(signInData.user).toBeDefined();

    // Now try to fetch the user data
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    expect(error).toBeNull();
    expect(userData).toBeDefined();
    expect(userData.email).toBe(testEmail);
    expect(userData.first_name).toBe(testFirstName);
    expect(userData.last_name).toBe(testLastName);
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