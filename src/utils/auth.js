const USER_KEY = "user";
const USERS_DB_KEY = "users_db";

// =======================
// REGISTER USER / COMPANY
// =======================
export const registerUser = (user) => {
  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];

  // prevent duplicate email
  const exists = users.find((u) => u.email === user.email);

  if (exists) {
    alert("User already exists with this email");
    return false;
  }

  users.push(user);

  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

  return true;
};

// =======================
// LOGIN USER
// =======================
export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];

  const foundUser = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!foundUser) return null;

  // Store the complete user object including profilePic and CV
  localStorage.setItem(USER_KEY, JSON.stringify(foundUser));

  window.dispatchEvent(new Event("authChange"));

  return foundUser;
};

// =======================
// GET CURRENT USER
// =======================
export const getUser = () => {
  return JSON.parse(localStorage.getItem(USER_KEY));
};

export const getCurrentUser = () => {
  const currentUser = JSON.parse(localStorage.getItem(USER_KEY));
  
  // Also check if there's updated data in users_db and sync
  if (currentUser) {
    const users = JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];
    const latestUserData = users.find(u => u.email === currentUser.email);
    
    // If newer data exists in users_db, use that
    if (latestUserData && (latestUserData.profilePic !== currentUser.profilePic || latestUserData.cv !== currentUser.cv)) {
      localStorage.setItem(USER_KEY, JSON.stringify(latestUserData));
      return latestUserData;
    }
  }
  
  return currentUser;
};

// =======================
// UPDATE CURRENT USER
// =======================
export const updateCurrentUser = (updatedUser) => {
  // Update in current session
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  
  // Also update in users_db
  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];
  const updatedUsers = users.map(u => 
    u.email === updatedUser.email ? updatedUser : u
  );
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));

  window.dispatchEvent(new Event("authChange"));
};

// =======================
// LOGOUT
// =======================
export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("authChange"));
};

// =======================
// CHECK LOGIN
// =======================
export const isLoggedIn = () => {
  return !!localStorage.getItem(USER_KEY);
};