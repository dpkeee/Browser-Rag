document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');
  let loggingEnabled = true; // Initial state in popup

  // Function to update the button text based on logging state
  function updateButtonText() {
    toggleButton.textContent = loggingEnabled ? 'Stop Logging' : 'Start Logging';
  }

  // Get the logging state from storage and update the button text
  chrome.storage.sync.get(['loggingEnabled'], (result) => {
    loggingEnabled = result.loggingEnabled === undefined ? true : result.loggingEnabled;
    updateButtonText();
  });

  toggleButton.addEventListener('click', function() {
    loggingEnabled = !loggingEnabled; // Toggle the state
    updateButtonText();

    // Send a message to the background script to toggle the logging state
    chrome.runtime.sendMessage({ command: "toggleLogging", loggingEnabled: loggingEnabled }, (response) => {
      console.log(response.result);
    });
  });

  // --- Search functionality ---
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  const searchResult = document.getElementById('searchResult');
  const API_ENDPOINT = "http://127.0.0.1:8000/search"; // Adjust if needed

  searchButton.addEventListener('click', async function() {
    const query = searchInput.value.trim();
    searchResult.textContent = "";
    if (!query) {
      searchResult.textContent = "Please enter some text to search.";
      return;
    }
    searchResult.textContent = "Searching...";
    try {
      const url = `${API_ENDPOINT}?query=${encodeURIComponent(query)}&k=1`;
      const response = await fetch(url);
      if (!response.ok) {
        searchResult.textContent = `Error: ${response.statusText}`;
        return;
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        searchResult.innerHTML = `<b>URL:</b> <a href="${data.results[0].url}" target="_blank">${data.results[0].url}</a>`;
      } else {
        searchResult.textContent = "No matching URL found.";
      }
    } catch (error) {
      searchResult.textContent = `Error: ${error.message}`;
    }
  });
});
