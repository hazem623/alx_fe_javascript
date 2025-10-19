let quotes = [
    { id: Date.now() + Math.random(), text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { id: Date.now() + Math.random(), text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { id: Date.now() + Math.random(), text: "Stay hungry, stay foolish.", category: "Motivation" }
];

const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; // Mock API

// Load quotes from localStorage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Fetch quotes from server
async function fetchServerQuotes() {
    try {
        const response = await fetch(serverUrl);
        const serverData = await response.json();
        // Map mock data to quote format (use title as category, body as text, id as id)
        return serverData.map(item => ({
            id: item.id,
            text: item.body,
            category: item.title
        }));
    } catch (error) {
        console.error('Error fetching server quotes:', error);
        return [];
    }
}

// Post new quote to server (simulate)
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            body: JSON.stringify({ title: quote.category, body: quote.text }),
            headers: { 'Content-type': 'application/json; charset=UTF-8' },
        });
        const newServerQuote = await response.json();
        // Update local quote with server ID
        quote.id = newServerQuote.id;
    } catch (error) {
        console.error('Error posting quote:', error);
    }
}

// Sync local with server
async function syncWithServer(manual = false) {
    const serverQuotes = await fetchServerQuotes();
    let conflicts = [];
    let newFromServer = 0;

    // Simple conflict resolution: server precedence
    serverQuotes.forEach(serverQuote => {
        const localIndex = quotes.findIndex(q => q.id === serverQuote.id);
        if (localIndex > -1) {
            // Conflict if different
            if (quotes[localIndex].text !== serverQuote.text || quotes[localIndex].category !== serverQuote.category) {
                conflicts.push({
                    local: quotes[localIndex],
                    server: serverQuote
                });
                // Server wins
                quotes[localIndex] = serverQuote;
            }
        } else {
            // New from server
            quotes.push(serverQuote);
            newFromServer++;
        }
    });

    // Post new local quotes to server
    for (let quote of quotes) {
        if (!serverQuotes.some(sq => sq.id === quote.id)) {
            await postQuoteToServer(quote);
        }
    }

    saveQuotes();
    populateCategories();
    filterQuotes();

    // Notification
    let message = '';
    if (conflicts.length > 0) {
        message += `${conflicts.length} conflicts resolved (server precedence). `;
        if (manual) {
            // Manual resolution option
            const resolveManual = confirm('Conflicts detected. Do you want to review them?');
            if (resolveManual) {
                conflicts.forEach(conf => {
                    const choice = prompt(`Conflict for ID ${conf.server.id}:\nLocal: ${conf.local.text} (${conf.local.category})\nServer: ${conf.server.text} (${conf.server.category})\nEnter 'local' to keep local, else server wins.`);
                    if (choice === 'local') {
                        const index = quotes.findIndex(q => q.id === conf.server.id);
                        quotes[index] = conf.local;
                    }
                });
                saveQuotes();
                populateCategories();
                filterQuotes();
            }
        }
    }
    if (newFromServer > 0) {
        message += `${newFromServer} new quotes from server.`;
    }
    if (message) {
        showNotification(message);
    } else if (manual) {
        showNotification('Data is up to date.');
    }
}

// Function to show a random quote
function showRandomQuote(filteredQuotes = quotes) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = 'No quotes available.';
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `<strong>${quote.text}</strong><br><em>Category: ${quote.category}</em>`;
    // Save the last viewed quote to sessionStorage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Function to create add quote form
function createAddQuoteForm() {
    const formContainer = document.getElementById('quoteForm');
    // Clear previous content
    while (formContainer.firstChild) {
        formContainer.removeChild(formContainer.firstChild);
    }

    // Create form elements
    const quoteInput = document.createElement('input');
    quoteInput.id = 'newQuoteText';
    quoteInput.type = 'text';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';

    const addButton = document.createElement('button');
    addButton.id = 'addQuoteBtn';
    addButton.textContent = 'Add Quote';

    // Append elements to form container
    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);

    // Add event listener to the Add Quote button
    addButton.addEventListener('click', addQuote);
}

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (quoteText && quoteCategory) {
        const newQuote = { id: Date.now() + Math.random(), text: quoteText, category: quoteCategory };
        quotes.push(newQuote);
        saveQuotes();
        postQuoteToServer(newQuote); // Sync new quote to server
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        populateCategories(); // Update categories if new one added
        filterQuotes(); // Update the DOM based on current filter
        alert('Quote added successfully!');
    } else {
        alert('Please enter both a quote and a category.');
    }
}

// Populate categories in the dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
    // Restore last selected category
    const lastCategory = localStorage.getItem('lastCategory');
    if (lastCategory) {
        categoryFilter.value = lastCategory;
    }
}

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('lastCategory', selectedCategory); // Save last selected category
    let filteredQuotes = quotes;
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }
    showRandomQuote(filteredQuotes);
}

// Export quotes to JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'quotes.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        // Add IDs if not present
        importedQuotes.forEach(q => {
            if (!q.id) q.id = Date.now() + Math.random();
        });
        quotes.push(...importedQuotes);
        saveQuotes();
        importedQuotes.forEach(postQuoteToServer); // Sync imported to server
        populateCategories(); // Update categories after import
        alert('Quotes imported successfully!');
        filterQuotes();
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', filterQuotes);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
document.getElementById('syncButton').addEventListener('click', () => syncWithServer(true));

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    createAddQuoteForm();
    populateCategories();
    const lastViewed = sessionStorage.getItem('lastViewedQuote');
    if (lastViewed) {
        const quote = JSON.parse(lastViewed);
        document.getElementById('quoteDisplay').innerHTML = `<strong>${quote.text}</strong><br><em>Category: ${quote.category}</em>`;
    } else {
        filterQuotes();
    }
    syncWithServer(); // Initial sync
    setInterval(syncWithServer, 30000); // Periodic sync every 30 seconds
});