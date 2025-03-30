document.addEventListener("DOMContentLoaded", async function () {
  // Check if user is logged in
  const currentUserJSON = sessionStorage.getItem("currentUser ");
  if (!currentUserJSON) {
    window.location.href = "login.html";
    return;
  }

  // Parse user data
  const currentUser  = JSON.parse(currentUserJSON);

  // Check if user is a farmer
  if (currentUser .userType.trim().toLowerCase() !== "farmer") {
    window.location.href = "dashboard.html";
    return;
  }

  // Set user information
  document.getElementById("user-name").textContent = currentUser .username;
  document.getElementById("user-type").textContent = currentUser .userType;

  // Fetch current date and time
  const updateDateTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateString = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    document.getElementById("current-time-date").textContent =
      `${timeString}, ${dateString}`;
  };
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // Fetch user data from the server
  async function fetchUserData() {
    try {
      const response = await fetch(`http://localhost:3000/api/user?userId=${currentUser .id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const userData = await response.json();
      // You can use userData to set more information if needed
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // Fetch total income from the server
  async function fetchTotalIncome() {
    try {
      const response = await fetch(`http://localhost:3000/api/income?userId=${currentUser .id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const incomeData = await response.json();
      document.querySelector("#income-card .card-value").textContent = `₹${incomeData.totalIncome}`;
    } catch (error) {
      console.error('Error fetching total income:', error);
    }
  }

  // Fetch data
  fetchUserData();
  fetchTotalIncome();

  // Toggle dropdown menu
  document.getElementById("profile-icon").addEventListener("click", function (event) {
    event.stopPropagation();
    document.getElementById("dropdown-menu").classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    const dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu.classList.contains("show") && !event.target.closest(".profile-container")) {
      dropdownMenu.classList.remove("show");
    }
  });

  // Logout functionality
  document.getElementById("logout-button").addEventListener("click", function (event) {
    event.preventDefault();
    sessionStorage.removeItem("currentUser ");
    window.location.href = "login.html";
  });

  // Card click functionality
  document.getElementById("income-card").addEventListener("click", function() {
    window.location.href = "farmer-history.html";
  });

  document.getElementById("submit-card").addEventListener("click", function() {
    window.location.href = "inventory.html";
  });

  document.getElementById("compost-card").addEventListener("click", function() {
    // Implement compost request functionality
    alert("Compost request feature will be implemented soon!");
  });
});