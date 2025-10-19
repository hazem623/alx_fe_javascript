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

// Display a random quote using createElement and appendChild
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    // Clear previous content
    while (quoteDisplay.firstChild) {
        quoteDisplay.removeChild(quoteDisplay.firstChild);
    }

    if (quotes.length === 0) {
        const noQuoteText = document.createElement('p');
        noQuoteText.textContent = 'No quotes available.';
        quoteDisplay.appendChild(noQuoteText);
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    // Create elements for quote text and category
    const quoteText = document.createElement('strong');
    quoteText.textContent = quote.text;

    const lineBreak = document.createElement('br');

    const categoryText = document.createElement('em');
    categoryText.textContent = `Category: ${quote.category}`;

    // Append elements to quoteDisplay
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(lineBreak);
    quoteDisplay.appendChild(categoryText);
}

// Create the form for adding new quotes dynamically using createElement and appendChild
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

// Add a new quote to the quotes array and update the DOM
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (quoteText && quoteCategory) {
        quotes.push({ text: quoteText, category: quoteCategory });
        saveQuotes();
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        showRandomQuote(); // Update the DOM with a random quote using createElement and appendChild
        alert('Quote added successfully!');
    } else {
        alert('Please enter both a quote and a category.');
    }
}

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    createAddQuoteForm(); // Create the form dynamically
    showRandomQuote(); // Show an initial random quote
});