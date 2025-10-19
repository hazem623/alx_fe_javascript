let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" }
];

// Load quotes from localStorage when the page loads
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
        quotes.push({ text: quoteText, category: quoteCategory });
        saveQuotes();
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
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories(); // Update categories after import
        alert('Quotes imported successfully!');
        filterQuotes();
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', filterQuotes); // Use filterQuotes to respect current filter
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

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
});