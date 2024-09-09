import { createClient } from './client';

const supabase = createClient();

/* GET-USER-ROLES */


export async function getUserRoles(token: string) {
  try {
    // Step 1: Check cache for user info
    const cacheKey = `user_info_${token.substring(0, 10)}`;
    let cachedInfo = sessionStorage.getItem(cacheKey);
    let userInfo;

    if (cachedInfo) {
      userInfo = JSON.parse(cachedInfo);
    } else {
      // Step 2: Fetch user info from Auth0 if not cached
      const domain = process.env.AUTH0_DOMAIN;
      const response = await fetch(`https://${domain}/userinfo`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status !== 200) {
        console.error(`Auth0 returned status code ${response.status}`);
        throw new Error("Failed to retrieve user info");
      }

      userInfo = await response.json();
      sessionStorage.setItem(cacheKey, JSON.stringify(userInfo)); // Cache the user info
    }

    const userId = userInfo.sub;
    const email = userInfo.email || '';
    const nickname = userInfo.nickname || '';

    if (!email) {
      throw new Error("Email is required for user creation");
    }

    // Step 3: Try to get the user from the database by userId
    let { data: user, error } = await supabase
      .from('CustomUser')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Step 4: If user doesn't exist, create the user
      const { data: newUser, error: createError } = await supabase
        .from('CustomUser')
        .insert([
          {
            user_id: userId,
            email,
            username: nickname || email,
          },
        ])
        .single();

      if (createError) {
        console.error(`Error while creating user: ${createError.message}`);

        // Step 5: If creation fails, try fetching the user by email
        const { data: existingUser, error: emailError } = await supabase
          .from('CustomUser')
          .select('*')
          .eq('email', email)
          .single();

        if (emailError) {
          console.error(`Failed to create or retrieve user for ${email}`);
          throw new Error("Unable to create or retrieve user");
        }

        // Step 6: Update user_id if necessary
        if (!existingUser.user_id) {
          await supabase
            .from('CustomUser')
            .update({ user_id: userId })
            .eq('email', email);
        }

        user = existingUser;
      } else {
        user = newUser;
      }
    }

    // Step 7: Update user information if needed
    await supabase
      .from('CustomUser')
      .update({
        email,
        username: nickname || email,
      })
      .eq('user_id', userId);

    // Step 8: Get the user's role and verification status
    let roleData = { verified: false };

    if (['in', 'ad', 'hs', 'st'].includes(user.user_type)) {
      const roleTable = {
        'in': 'InstructorData',
        'ad': 'AdminData',
        'hs': 'HeuStaffData',
        'st': 'StudentData',
      }[user.user_type];

      const { data: roleInstance, error: roleError } = await supabase
        .from(roleTable)
        .select('verified')
        .eq('user_id', user.user_id)
        .single();

      if (roleInstance) {
        roleData.verified = roleInstance.verified || false;
      }
    }

    // Step 9: Return the user's role and verification status
    return {
      role: user.user_type,
      verified: roleData.verified,
    };
  } catch (error) {
    console.error(`Error in getUserRoles: ${error.message}`);
    throw new Error("An unexpected error occurred");
  }
}

