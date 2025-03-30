/**
 * Debugging utility for user authentication
 * This file helps diagnose issues with user login and redirection
 */

// Function to check stored users and their types
async function checkStoredUsers() {
  try {
    const response = await fetch('http://localhost:3000/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const users = await response.json();
    console.log("Stored users:", users);

    // Log each user's type
    users.forEach((user, index) => {
      console.log(`User  ${index + 1}: ${user.username}, Type: ${user.userType}`);
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Function to check current logged in user
async function checkCurrentUser () {
  const currentUserJSON = sessionStorage.getItem("currentUser ");

  if (!currentUserJSON) {
    console.log("No user currently logged in");
    return null;
  }

  try {
    const parsedUser  = JSON.parse(currentUserJSON);
    console.log("Current user:", parsedUser );
    console.log("User  type:", parsedUser .userType);
    return parsedUser ;
  } catch (error) {
    console.error("Error parsing current user:", error);
    return null;
  }
}

// Function to fix user type if needed
async function fixUserType(username, correctType) {
  const users = await checkStoredUsers();

  if (users.length === 0) {
    return false;
  }

  const userIndex = users.findIndex((user) => user.username === username);

  if (userIndex === -1) {
    console.log(`User  ${username} not found`);
    return false;
  }

  // Update the user type on the server
  try {
    const response = await fetch('http://localhost:3000/api/user/type', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, correctType }),
    });

    if (!response.ok) throw new Error('Failed to update user type');
    const updatedUser  = await response.json();
    console.log(`Updated user ${username} type to "${updatedUser .userType}"`);
    return true;
  } catch (error) {
    console.error("Error updating user type:", error);
    return false;
  }
}

// Add to window for console access
window.debugAuth = {
  checkStoredUsers,
  checkCurrentUser ,
  fixUserType,
};

console.log(
  "Auth debugging utilities loaded. Use debugAuth.checkStoredUsers() or debugAuth.checkCurrentUser () to debug.",
);