/**
 * Data storage and retrieval functionality
 * Uses server-side API for persistence
 */

// Save user data to the server
async function saveUserData(userData) {
  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error('Failed to save user data');
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

// Update existing user data
async function updateUserData(userId, updatedData) {
  try {
    const response = await fetch('http://localhost:3000/api/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, ...updatedData }),
    });

    if (!response.ok) throw new Error('Failed to update user data');
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
}

// Save transaction data
async function saveTransaction(transactionData) {
  const currentUserJSON = sessionStorage.getItem("currentUser ");
  if (!currentUserJSON) return false;

  const currentUser  = JSON.parse(currentUserJSON);
  
  try {
    const response = await fetch('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: currentUser .id,
        transactionData: transactionData,
      }),
    });

    if (!response.ok) throw new Error('Failed to save transaction data');
    return true;
  } catch (error) {
    console.error('Error saving transaction data:', error);
    return false;
  }
}

// Get all transactions for a specific user
async function getUserTransactions() {
  const currentUserJSON = sessionStorage.getItem("currentUser ");
  if (!currentUserJSON) return [];

  const currentUser  = JSON.parse(currentUserJSON);
  
  try {
    const response = await fetch(`http://localhost:3000/api/transactions?userId=${currentUser .id}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

// Check if username already exists
async function usernameExists(username) {
  const users = await getUsersData();
  return users.some((user) => user.username === username);
}

// Get all registered users
async function getUsersData() {
  try {
    const response = await fetch('http://localhost:3000/api/users'); // Assuming you have an endpoint to get all users
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Verify login credentials
async function verifyCredentials(username, password) {
  const users = await getUsersData();

  // Find user with matching username and password
  const matchedUser  = users.find(
    (user) => user.username === username && user.password === password,
  );

  // Ensure user type is properly formatted if user exists
  if (matchedUser ) {
    // Make sure userType exists and is properly formatted
    if (!matchedUser .userType) {
      matchedUser .userType = "customer"; // Default to customer if missing
    }

    // Log for debugging
    console.log(
      "Found user:",
      matchedUser .username,
      "Type:",
      matchedUser .userType,
    );
  }

  return matchedUser  || null;
}