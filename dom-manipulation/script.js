// Initial quotes array
let quotes = [];

// DOM elements
let quoteDisplay;
let quoteAuthor;
let quoteCategoryElement;
let newQuoteBtn;
let categorySelect;
let addQuoteBtn;
let resetFormBtn;
let notification;
let exportBtn;
let importFile;

// Storage keys
const STORAGE_KEYS = {
    QUOTES: 'dynamicQuoteGenerator_quotes',
    LAST_VIEWED: 'dynamicQuoteGenerator_lastViewed',
    USER_PREFERENCES: 'dynamicQuoteGenerator_preferences'
};

// Load quotes from local storage
function loadQuotesFromStorage() {
    const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Load default quotes if no stored quotes
        quotes = [
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
        saveQuotes();
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
}

// Save last viewed quote to session storage
function saveLastViewedQuote(quote) {
    sessionStorage.setItem(STORAGE_KEYS.LAST_VIEWED, JSON.stringify(quote));
}

// Load last viewed quote from session storage
function loadLastViewedQuote() {
    const lastViewed = sessionStorage.getItem(STORAGE_KEYS.LAST_VIEWED);
    return lastViewed ? JSON.parse(lastViewed) : null;
}

// Save user preferences
function saveUserPreferences() {
    const preferences = {
        selectedCategory: categorySelect.value,
        lastVisit: new Date().toISOString()
    };
    sessionStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
}

// Load user preferences
function loadUserPreferences() {
    const preferences = sessionStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (preferences) {
        const pref = JSON.parse(preferences);
        categorySelect.value = pref.selectedCategory;
        return pref;
    }
    return null;
}

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
    
    // Save to session storage
    saveLastViewedQuote(randomQuote);
    saveUserPreferences();
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
    
    // Save to local storage
    saveQuotes();
    
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
    showNotification('Quote added successfully!');
}

// Export quotes to JSON file
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-quotes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Quotes exported successfully!');
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Validate imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid format: Expected an array of quotes');
            }
            
            // Validate each quote has required fields
            for (let quote of importedQuotes) {
                if (!quote.text || typeof quote.text !== 'string') {
                    throw new Error('Invalid quote: Missing or invalid text field');
                }
                if (!quote.category || typeof quote.category !== 'string') {
                    throw new Error('Invalid quote: Missing or invalid category field');
                }
            }
            
            quotes.push(...importedQuotes);
            saveQuotes();
            
            // Update categories dropdown
            updateCategoriesDropdown();
            
            // Reset file input
            event.target.value = '';
            
            showNotification(`Successfully imported ${importedQuotes.length} quotes!`);
            
        } catch (error) {
            console.error('Import error:', error);
            alert(`Error importing quotes: ${error.message}`);
            event.target.value = '';
        }
    };
    
    fileReader.onerror = function() {
        alert('Error reading file. Please try again.');
        event.target.value = '';
    };
    
    fileReader.readAsText(file);
}

// Update categories dropdown with all available categories
function updateCategoriesDropdown() {
    const currentCategories = Array.from(categorySelect.options).map(option => option.value);
    const allCategories = [...new Set(quotes.map(quote => quote.category))];
    
    // Add new categories that don't exist in dropdown
    allCategories.forEach(category => {
        if (!currentCategories.includes(category) && category !== 'all') {
            const newOption = document.createElement('option');
            newOption.value = category;
            newOption.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySelect.appendChild(newOption);
        }
    });
}

// Show notification
function showNotification(message) {
    notification.innerHTML = message;
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

// Create import/export section
function createImportExportSection() {
    const section = document.createElement('div');
    section.className = 'import-export-section';
    section.innerHTML = `
        <h2>Import & Export Quotes</h2>
        <div class="import-export-buttons">
            <button id="exportBtn">Export Quotes to JSON</button>
            <div class="import-group">
                <label for="importFile" class="import-label">Import Quotes from JSON:</label>
                <input type="file" id="importFile" accept=".json" />
            </div>
        </div>
    `;
    
    const container = document.querySelector('.container');
    container.appendChild(section);
    
    exportBtn = document.getElementById('exportBtn');
    importFile = document.getElementById('importFile');
}

// Create notification element
function createNotification() {
    const notificationElement = document.createElement('div');
    notificationElement.id = 'notification';
    notificationElement.className = 'notification';
    notificationElement.innerHTML = 'Notification';
    document.body.appendChild(notificationElement);
    notification = notificationElement;
}

// Create category dropdown options
function populateCategoryDropdown() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    
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

// Show last viewed quote on startup
function showLastViewedQuote() {
    const lastViewed = loadLastViewedQuote();
    if (lastViewed) {
        quoteDisplay.innerHTML = `"${lastViewed.text}"`;
        quoteAuthor.innerHTML = lastViewed.author ? `- ${lastViewed.author}` : "";
        quoteCategoryElement.innerHTML = lastViewed.category.charAt(0).toUpperCase() + lastViewed.category.slice(1);
        showNotification('Welcome back! Showing your last viewed quote.');
    }
}

// Clear all quotes (for testing)
function clearAllQuotes() {
    if (confirm('Are you sure you want to clear all quotes? This cannot be undone.')) {
        quotes = [];
        saveQuotes();
        location.reload();
    }
}

// Initialize the application
function init() {
    // Load quotes from storage first
    loadQuotesFromStorage();
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Create the form, import/export section, and notification
    createAddQuoteForm();
    createImportExportSection();
    createNotification();
    populateCategoryDropdown();
    
    // Load user preferences
    loadUserPreferences();
    
    // Add event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    resetFormBtn.addEventListener('click', resetForm);
    exportBtn.addEventListener('click', exportToJson);
    importFile.addEventListener('change', importFromJsonFile);
    
    // Show last viewed quote or random quote
    showLastViewedQuote() || showRandomQuote();
    
    // Add clear button for testing (optional)
    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = 'Clear All Quotes (Testing)';
    clearBtn.style.background = '#dc3545';
    clearBtn.style.marginTop = '10px';
    clearBtn.addEventListener('click', clearAllQuotes);
    document.querySelector('.import-export-section').appendChild(clearBtn);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);