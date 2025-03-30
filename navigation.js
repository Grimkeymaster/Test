document.addEventListener("DOMContentLoaded", async function () {
  // State management
  const state = {
    isDropdownOpen: false,

    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
      update();
    },

    closeDropdown() {
      this.isDropdownOpen = false;
      update();
    },
  };

  // DOM elements
  const dropdownToggle = document.querySelector(".profile-dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const dropdownItems = document.querySelectorAll(".dropdown-item");
  const logoutButton = document.getElementById("logout-button");
  const editProfileButton = document.getElementById("edit-profile-button");
  const usernameDisplay = document.getElementById("username-display");
  const userTypeDisplay = document.getElementById("user-type-display");

  // Check if user is logged in
  const currentUserJSON = sessionStorage.getItem("currentUser ");

  if (!currentUserJSON) {
    // If not on login page, redirect to login
    if (!window.location.href.includes("login.html")) {
      window.location.href = "login.html";
    }
    return;
  }

  // Parse user data
  const currentUser  = JSON.parse(currentUserJSON);

  // Fetch user data from the server
  async function fetchUserData() {
    try {
      const response = await fetch(`http://localhost:3000/api/user?userId=${currentUser .id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const userData = await response.json();
      initializeUserData(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // Initialize user data display
  function initializeUserData(userData) {
    if (usernameDisplay) {
      usernameDisplay.textContent = userData.username;
    }

    if (userTypeDisplay) {
      userTypeDisplay.textContent = userData.userType;
    }
  }

  // Set up navigation based on user type
  setupNavigation(currentUser );

  // Set up dropdown menu
  setupDropdownMenu();

  // Set up navigation based on user type
  function setupNavigation(currentUser ) {
    const isCustomer = currentUser .userType !== "farmer";
    const isFarmer = currentUser .userType === "farmer";

    // Get all navigation links
    const homeLinks = document.querySelectorAll(".home-link, .nav-item:has(.home-icon)");
    const dashboardLinks = document.querySelectorAll(".dashboard-link, .nav-item:has(.dashboard-icon)");
    const historyLinks = document.querySelectorAll("#history-link, #history-button");

    // Set up home and dashboard links
    homeLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        if (isFarmer) {
          window.location.href = "farmer-dashboard.html";
        } else {
          window.location.href = "dashboard.html";
        }
      });
    });

    dashboardLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        if (isFarmer) {
          window.location.href = "farmer-dashboard.html";
        } else {
          window.location.href = "dashboard.html";
        }
      });
    });

    // Set up history links
    historyLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        if (isFarmer) {
          window.location.href = "farmer-history.html";
        } else {
          window.location.href = "customer-history.html";
        }
      });
    });
  }

  // Handle logout
  if (logoutButton) {
    logoutButton.addEventListener("click", function (e) {
      e.preventDefault();
      // Clear session storage
      sessionStorage.removeItem("currentUser ");
      // Redirect to login page
      window.location.href = "login.html";
    });
  }

  // Update the UI based on state
  function update() {
    // Update dropdown visibility
    dropdownToggle.setAttribute("aria-expanded", state.isDropdownOpen);
    dropdownMenu.style.display = state.isDropdownOpen ? "block" : "none";
  }

  // Event Listeners
  dropdownToggle.addEventListener("click", function () {
    state.toggleDropdown();
  });

  dropdownToggle.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      state.toggleDropdown();
    }
    if (event.key === "Escape") {
      state.closeDropdown();
    }
  });

  // Add event listeners to dropdown items
  dropdownItems.forEach((item) => {
    item.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        // Handle the action based on which item was clicked
        if (item.id === "logout-button") {
          // Clear session storage
          sessionStorage.removeItem("currentUser ");
          // Redirect to login page
          window.location.href = "login.html";
        }
        state.closeDropdown();
      }
    });

    item.addEventListener("click", function () {
      // Handle the action based on which item was clicked
      state.closeDropdown();
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !dropdownToggle.contains(event.target) &&
      !dropdownMenu.contains(event.target)
    ) {
      state.closeDropdown();
    }
  });

  // Fetch user data on page load
  fetchUserData();
});