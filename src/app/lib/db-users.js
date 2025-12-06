import { supabaseAdmin } from './supabase';

/**
 * Find user by Twitter ID
 */
export async function findUserByTwitterId(twitterId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('twitter_id', twitterId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is expected
    console.error('Error finding user:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new user
 */
export async function createUser(userData) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        twitter_id: userData.twitterId,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        profile_image_url: userData.profileImageUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return data;
}

/**
 * Update existing user
 */
export async function updateUser(twitterId, userData) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      username: userData.username,
      name: userData.name,
      email: userData.email,
      profile_image_url: userData.profileImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('twitter_id', twitterId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return data;
}

/**
 * Find or create user (upsert) - Twitter
 */
export async function findOrCreateUser(twitterUserData) {
  const userData = {
    twitterId: twitterUserData.id,
    username: twitterUserData.username,
    name: twitterUserData.name,
    email: twitterUserData.email || null,
    profileImageUrl: twitterUserData.profile_image_url,
  };

  // Try to find existing user
  let user = await findUserByTwitterId(userData.twitterId);

  if (user) {
    // Update existing user with latest info
    user = await updateUser(userData.twitterId, userData);
  } else {
    // Create new user
    user = await createUser(userData);
  }

  return user;
}

/**
 * Find user by email (for Google auth)
 */
export async function findUserByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error finding user by email:', error);
    throw error;
  }

  return data;
}

/**
 * Create Google user
 */
export async function createGoogleUser(userData) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        email: userData.email,
        name: userData.name,
        profile_image_url: userData.profileImageUrl,
        google_id: userData.googleId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating Google user:', error);
    throw error;
  }

  return data;
}

/**
 * Update Google user
 */
export async function updateGoogleUser(email, userData) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      name: userData.name,
      profile_image_url: userData.profileImageUrl,
      google_id: userData.googleId,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email)
    .select()
    .single();

  if (error) {
    console.error('Error updating Google user:', error);
    throw error;
  }

  return data;
}

/**
 * Find or create Google user
 */
export async function findOrCreateGoogleUser(googleUserData) {
  const userData = {
    googleId: googleUserData.id,
    email: googleUserData.email,
    name: googleUserData.name,
    profileImageUrl: googleUserData.picture,
  };

  // Try to find existing user by email
  let user = await findUserByEmail(userData.email);

  if (user) {
    // Update existing user with latest info
    user = await updateGoogleUser(userData.email, userData);
  } else {
    // Create new user
    user = await createGoogleUser(userData);
  }

  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user:', error);
    throw error;
  }

  return data;
}
