// Initial quotes array
let quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "success" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "motivation" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "wisdom" },
    { text: "Whoever is happy will make others happy too.", author: "Anne Frank", category: "life" },
    { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi", category: "inspiration" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "motivation" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "success" },
    { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon", category: "life" }
];

// DOM elements
let quoteDisplay;
let quoteAuthor;
let quoteCategoryElement;
let newQuoteBtn;
let categorySelect;
let addQuoteBtn;
let resetFormBtn;
let notification;

// Display a random quote
function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    let filteredQuotes;
    
    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "No quotes available for this category. Add some!";
        quoteAuthor.innerHTML = "";
        quoteCategoryElement.innerHTML = selectedCategory;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    quoteDisplay.innerHTML = `"${randomQuote.text}"`;
    quoteAuthor.innerHTML = randomQuote.author ? `- ${randomQuote.author}` : "";
    quoteCategoryElement.innerHTML = randomQuote.category.charAt(0).toUpperCase() + randomQuote.category.slice(1);
}

// Add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteAuthor = document.getElementById('newQuoteAuthor').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim().toLowerCase();
    
    if (!newQuoteText || !newQuoteCategory) {
        alert("Please fill in both the quote and category fields.");
        return;
    }
    
    const newQuote = {
        text: newQuoteText,
        author: newQuoteAuthor || "Anonymous",
        category: newQuoteCategory
    };
    
    quotes.push(newQuote);
    
    // Update category dropdown if new category
    const categoryOptions = Array.from(categorySelect.options).map(option => option.value);
    if (!categoryOptions.includes(newQuoteCategory) && newQuoteCategory !== 'all') {
        const newOption = document.createElement('option');
        newOption.value = newQuoteCategory;
        newOption.textContent = newQuoteCategory.charAt(0).toUpperCase() + newQuoteCategory.slice(1);
        categorySelect.appendChild(newOption);
    }
    
    // Reset form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteAuthor').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Show notification
    showNotification();
}

// Show notification
function showNotification() {
    notification.innerHTML = 'Quote added successfully!';
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Reset form
function resetForm() {
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteAuthor').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

// Create the form for adding quotes
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'add-quote-form';
    
    const heading = document.createElement('h2');
    heading.innerHTML = 'Add Your Own Quote';
    formContainer.appendChild(heading);
    
    // Quote text input
    const quoteGroup = document.createElement('div');
    quoteGroup.className = 'form-group';
    quoteGroup.innerHTML = `
        <input type="text" id="newQuoteText" placeholder="Enter a new quote" />
    `;
    formContainer.appendChild(quoteGroup);
    
    // Author input
    const authorGroup = document.createElement('div');
    authorGroup.className = 'form-group';
    authorGroup.innerHTML = `
        <input type="text" id="newQuoteAuthor" placeholder="Enter quote author (optional)" />
    `;
    formContainer.appendChild(authorGroup);
    
    // Category input
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'form-group';
    categoryGroup.innerHTML = `
        <input type="text" id="newQuoteCategory" placeholder="Enter quote category" />
    `;
    formContainer.appendChild(categoryGroup);
    
    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'form-buttons';
    buttonContainer.innerHTML = `
        <button id="addQuoteBtn">Add Quote</button>
        <button id="resetForm">Reset Form</button>
    `;
    formContainer.appendChild(buttonContainer);
    
    // Add to the container after the controls
    const container = document.querySelector('.container');
    const controls = document.querySelector('.controls');
    container.insertBefore(formContainer, controls.nextSibling);
    
    // Store references to buttons
    addQuoteBtn = document.getElementById('addQuoteBtn');
    resetFormBtn = document.getElementById('resetForm');
}

// Create notification element
function createNotification() {
    const notificationElement = document.createElement('div');
    notificationElement.id = 'notification';
    notificationElement.className = 'notification';
    notificationElement.innerHTML = 'Quote added successfully!';
    document.body.appendChild(notificationElement);
    notification = notificationElement;
}

// Create category dropdown options
function populateCategoryDropdown() {
    const categories = ['all', 'inspiration', 'motivation', 'success', 'life', 'wisdom'];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.innerHTML = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
}

// Initialize DOM elements
function initializeDOMElements() {
    quoteDisplay = document.getElementById('quoteText');
    quoteAuthor = document.getElementById('quoteAuthor');
    quoteCategoryElement = document.getElementById('quoteCategory');
    newQuoteBtn = document.getElementById('newQuote');
    categorySelect = document.getElementById('categorySelect');
}

// Initialize the application
function init() {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Create the form and notification
    createAddQuoteForm();
    createNotification();
    populateCategoryDropdown();
    
    // Add event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    resetFormBtn.addEventListener('click', resetForm);
    
    // Initialize with a random quote
    showRandomQuote();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);