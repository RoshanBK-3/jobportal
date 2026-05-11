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
    
    const { error } = await supabase
      .from('users')
      .insert([{
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        phone: user.phone || null,
        age: user.age || null,
        gender: user.gender || null,
        company_name: user.companyName || null,
        location: user.location || null,
        contact: user.contact || null,
      }]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    alert("Registration failed!");
    return false;
  }
};

// Authenticate user and start session
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const user = data[0];
      const frontendUser = {
        ...user,
        profilePic: user.profile_pic,
        companyName: user.company_name
      };
      localStorage.setItem(USER_KEY, JSON.stringify(frontendUser));
      return frontendUser;
    } else {
      alert("Invalid email or password!");
      return null;
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed!");
    return null;
  }
};

// Get currently logged in user from session
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem(USER_KEY));
};

export const getUser = getCurrentUser;

// Update user profile data
export const updateCurrentUser = async (updatedUser) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        name: updatedUser.name,
        phone: updatedUser.phone,
        age: updatedUser.age,
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