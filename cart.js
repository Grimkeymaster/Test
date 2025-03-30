document.addEventListener("DOMContentLoaded", async function () {
  // Check if user is logged in
  const currentUserJSON = sessionStorage.getItem("currentUser ");
  if (!currentUserJSON) {
    window.location.href = "login.html";
    return;
  }

  // Parse user data
  const currentUser  = JSON.parse(currentUserJSON);

  // Update dashboard link based on user role
  const dashboardLink = document.getElementById("dashboard-link");
  if (currentUser .userType.trim().toLowerCase() === "farmer") {
    dashboardLink.href = "farmer-dashboard.html";
  } else {
    dashboardLink.href = "dashboard.html";
  }

  // DOM elements
  const cartItemsContainer = document.getElementById("cart-items");
  const subtotalElement = document.getElementById("subtotal");
  const taxElement = document.getElementById("tax");
  const totalElement = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const profileIcon = document.getElementById("profile-icon");
  const dropdownMenu = document.getElementById("dropdown-menu");
  const logoutButton = document.getElementById("logout-button");

  // Load cart items from the server
  let cartItems = [];

  async function fetchCartItems() {
    try {
      const response = await fetch(`http://localhost:3000/api/cart?userId=${currentUser .id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      cartItems = await response.json();
      renderCart();
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }

  // Render cart items and calculate totals
  function renderCart() {
    cartItemsContainer.innerHTML = "";

    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = '<div class="no-items">Your cart is empty</div>';
      updateTotals(0);
      checkoutBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;

    cartItems.forEach(item => {
      const itemElement = document.createElement("div");
      itemElement.className = "inventory-item";

      const itemTotal = item.price * item.quantity;

      itemElement.innerHTML = `
        <div class="item-cell">${item.name}</div>
        <div class="item-cell">₹${item.price}/kg</div>
        <div class="item-cell">
          <input type="number" min="1" value="${item.quantity}" class="quantity-input" data-id="${item.id}">
        </div>
        <div class="item-cell">₹${itemTotal.toFixed(2)}</div>
        <div class="item-cell">
          <button class="remove-item-btn" data-id="${item.id}">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      `;

      cartItemsContainer.appendChild(itemElement);
    });

    // Add event listeners to quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', function() {
        const itemId = parseInt(this.getAttribute('data-id'));
        const newQuantity = parseInt(this.value);

        if (newQuantity > 0) {
          const item = cartItems.find(item => item.id === itemId);
          if (item) {
            item.quantity = newQuantity;
            updateCartOnServer();
            renderCart();
          }
        } else {
          this.value = 1;
        }
      });
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item-btn').forEach(button => {
      button.addEventListener('click', function() {
        const itemId = parseInt(this.getAttribute('data-id'));
        cartItems = cartItems.filter(item => item.id !== itemId);
        updateCartOnServer();
        renderCart();
      });
    });

    // Calculate and update totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateTotals(subtotal);
  }

  // Update totals display
  function updateTotals(subtotal) {
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
  }

  // Update cart on the server
  async function updateCartOnServer() {
    try {
      await fetch('http://localhost:3000/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser .id,
          items: cartItems,
        }),
      });
    } catch (error) {
      console.error('Error updating cart on server:', error);
    }
  }

  // Handle checkout
  checkoutBtn.addEventListener('click', async function() {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Send checkout request to the server
    try {
      await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser .id,
        }),
      });

      alert("Order placed successfully!");
      localStorage.removeItem("cartItems");
      cartItems = [];
      renderCart();
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  });

  // Toggle dropdown menu
  profileIcon.addEventListener("click", function(event) {
    event.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function(event) {
    if (!profileIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove("show");
    }
  });

  // Handle logout
  logoutButton.addEventListener("click", function(event) {
    event.preventDefault();
    sessionStorage.removeItem("currentUser ");
    window.location.href = "login.html";
  });

  // Initial fetch
  fetchCartItems();
});