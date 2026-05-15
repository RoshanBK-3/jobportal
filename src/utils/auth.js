import { supabase } from '../supabaseClient';

const USER_KEY = "user";

// Create new user account
export const registerUser = async (user) => {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('email')
      .eq('email', user.email);
    
    if (existing && existing.length > 0) {
      alert("User already exists!");
      return false;
    }
    
    // Prepare user data - ensure all fields are included
    const userData = {
      name: user.name || user.companyName,
      email: user.email,
      password: user.password,
      role: user.role,
      phone: user.phone || null,
      age: user.age ? parseInt(user.age) : null,
      gender: user.gender || null,
      company_name: user.companyName || null,
      location: user.location || null,
      contact: user.contact || null,
      profile_pic: null,
      cv: null
    };
    
    console.log("Registering user with data:", userData);
    
    const { error } = await supabase
      .from('users')
      .insert([userData]);
    
    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    
    console.log("User registered successfully!");
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    alert("Registration failed: " + error.message);
    return false;
  }
};

// Authenticate user and start session
export const loginUser = async (email, password) => {
  console.log("auth.js: Starting login for:", email);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password);
    
    console.log("auth.js: Query completed");
    
    if (error) {
      console.error("auth.js: Supabase error:", error);
      throw error;
    }
    
    console.log("auth.js: Data received:", data);
    
    if (data && data.length > 0) {
      const user = data[0];
      console.log("Raw user from DB:", user);
      
      // Make sure ALL fields are included
      const frontendUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        age: user.age || '',
        gender: user.gender || '',
        location: user.location || '',      // ← CRITICAL: Include this
        contact: user.contact || '',        // ← CRITICAL: Include this
        companyName: user.company_name || user.name || '',
        profilePic: user.profile_pic || '',
        cv: user.cv || ''
      };
      
      console.log("Frontend user being saved to localStorage:", frontendUser);
      
      localStorage.setItem(USER_KEY, JSON.stringify(frontendUser));
      console.log("auth.js: Login successful, user saved to localStorage");
      return frontendUser;
    } else {
      console.log("auth.js: No user found with these credentials");
      alert("Invalid email or password!");
      return null;
    }
  } catch (error) {
    console.error("auth.js: Login error:", error);
    alert("Login failed! Check console for details.");
    return null;
  }
};

// Get currently logged in user from session
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const getUser = getCurrentUser;

// Update user profile data
export const updateCurrentUser = async (updatedUser) => {
  try {
    console.log("Updating user:", updatedUser);
    
    const { error } = await supabase
      .from('users')
      .update({
        name: updatedUser.name,
        phone: updatedUser.phone,
        age: updatedUser.age ? parseInt(updatedUser.age) : null,
        gender: updatedUser.gender,
        profile_pic: updatedUser.profilePic,
        cv: updatedUser.cv,
        company_name: updatedUser.companyName,
        location: updatedUser.location,
        contact: updatedUser.contact
      })
      .eq('email', updatedUser.email);
    
    if (error) throw error;
    
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return true;
  } catch (error) {
    console.error("Update error:", error);
    return false;
  }
};

// End user session
export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("authChange"));
};

// Check if user has active session
export const isLoggedIn = () => {
  return !!localStorage.getItem(USER_KEY);
};