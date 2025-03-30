document.addEventListener("DOMContentLoaded", async function () {
  // Check if user is logged in
  const currentUserJSON = sessionStorage.getItem("currentUser");
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

  // Fetch transactions from the server
  async function fetchTransactions() {
    try {
      const response = await fetch(`http://localhost:3000/api/transactions?userId=${currentUser .id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const transactions = await response.json();
      renderTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  // Render transactions
  function renderTransactions(transactionsToRender) {
    transactionsContainer.innerHTML = "";

    if (transactionsToRender.length === 0) {
      transactionsContainer.innerHTML = '<div class="no-transactions">No transactions found</div>';
      return;
    }

    transactionsToRender.forEach(transaction => {
      const transactionItem = document.createElement("div");
      transactionItem.className = "transaction-item";
      
      transactionItem.innerHTML = `
        <div class="transaction-cell">${transaction.txn_id}</div>
        <div class="transaction-cell">${transaction.vegetable_name}</div>
        <div class="transaction-cell">${transaction.date}</div>
        <div class="transaction-cell">${transaction.weight} kg</div>
        <div class="transaction-cell">₹${transaction.earning.toFixed(2)}</div>
      `;
      
      transactionsContainer.appendChild(transactionItem);
    });
  }

  // Initial fetch
  fetchTransactions();
});