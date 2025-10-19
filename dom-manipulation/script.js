// Initial quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCategory = document.getElementById('quoteCategory');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const resetFormBtn = document.getElementById('resetForm');
const notification = document.getElementById('notification');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');
const quotesGrid = document.getElementById('quotesGrid');
const quoteCount = document.getElementById('quoteCount');
const filterStatus = document.getElementById('filterStatus');

// Storage keys
const STORAGE_KEYS = {
    QUOTES: 'dynamicQuoteGenerator_quotes',
    LAST_VIEWED: 'dynamicQuoteGenerator_lastViewed',
    USER_PREFERENCES: 'dynamicQuoteGenerator_preferences',
    SELECTED_FILTER: 'dynamicQuoteGenerator_selectedFilter'
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

// Save user preferences including filter
function saveUserPreferences() {
    const preferences = {
        selectedCategory: categorySelect.value,
        selectedFilter: categoryFilter.value,
        lastVisit: new Date().toISOString()
    };
    sessionStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    localStorage.setItem(STORAGE_KEYS.SELECTED_FILTER, categoryFilter.value);
}

// Load user preferences
function loadUserPreferences() {
    const preferences = sessionStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    const savedFilter = localStorage.getItem(STORAGE_KEYS.SELECTED_FILTER);
    
    if (preferences) {
        const pref = JSON.parse(preferences);
        categorySelect.value = pref.selectedCategory;
        categoryFilter.value = pref.selectedFilter;
        return pref;
    } else if (savedFilter) {
        categoryFilter.value = savedFilter;
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
        quoteDisplay.textContent = "No quotes available for this category. Add some!";
        quoteAuthor.textContent = "";
        quoteCategory.textContent = selectedCategory;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    quoteDisplay.textContent = `"${randomQuote.text}"`;
    quoteAuthor.textContent = randomQuote.author ? `- ${randomQuote.author}` : "";
    quoteCategory.textContent = randomQuote.category.charAt(0).toUpperCase() + randomQuote.category.slice(1);
    
    // Save to session storage
    saveLastViewedQuote(randomQuote);
    saveUserPreferences();
}

// Populate categories dynamically
function populateCategories() {
    // Clear existing options except "All Categories"
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Add categories to both dropdowns
    categories.forEach(category => {
        const option1 = document.createElement('option');
        option1.value = category;
        option1.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = category;
        option2.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option2);
    });
    
    // Update stats
    updateStats();
}

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display filtered quotes
    displayQuotesGrid(filteredQuotes);
    
    // Update stats
    updateStats(selectedCategory, filteredQuotes.length);
    
    // Save filter preference
    saveUserPreferences();
}

// Display quotes in grid layout
function displayQuotesGrid(quotesToDisplay) {
    quotesGrid.innerHTML = '';
    
    if (quotesToDisplay.length === 0) {
        quotesGrid.innerHTML = '<p class="no-quotes">No quotes found for the selected category.</p>';
        return;
    }
    
    quotesToDisplay.forEach(quote => {
        const quoteCard = document.createElement('div');
        quoteCard.className = 'quote-card';
        quoteCard.innerHTML = `
            <div class="quote-card-text">"${quote.text}"</div>
            <div class="quote-card-author">${quote.author ? '- ' + quote.author : ''}</div>
            <div class="quote-card-category">${quote.category}</div>
        `;
        quotesGrid.appendChild(quoteCard);
    });
}

// Update statistics
function updateStats(selectedCategory = 'all', filteredCount = null) {
    const totalQuotes = quotes.length;
    const displayCount = filteredCount !== null ? filteredCount : totalQuotes;
    
    quoteCount.textContent = `Total Quotes: ${totalQuotes}`;
    
    if (selectedCategory === 'all') {
        filterStatus.textContent = `Showing: All quotes (${displayCount})`;
    } else {
        filterStatus.textContent = `Showing: ${selectedCategory} quotes (${displayCount})`;
    }
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
    
    // Update categories dropdown
    populateCategories();
    
    // Reset form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteAuthor').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Refresh quotes display
    filterQuotes();
    
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
            populateCategories();
            
            // Refresh quotes display
            filterQuotes();
            
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

// Show notification
function showNotification(message) {
    notification.textContent = message;
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

// Show last viewed quote on startup
function showLastViewedQuote() {
    const lastViewed = loadLastViewedQuote();
    if (lastViewed) {
        quoteDisplay.textContent = `"${lastViewed.text}"`;
        quoteAuthor.textContent = lastViewed.author ? `- ${lastViewed.author}` : "";
        quoteCategory.textContent = lastViewed.category.charAt(0).toUpperCase() + lastViewed.category.slice(1);
        showNotification('Welcome back! Showing your last viewed quote.');
        return true;
    }
    return false;
}

// Initialize the application
function init() {
    // Load quotes from storage first
    loadQuotesFromStorage();
    
    // Populate categories
    populateCategories();
    
    // Load user preferences
    loadUserPreferences();
    
    // Add event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    resetFormBtn.addEventListener('click', resetForm);
    exportBtn.addEventListener('click', exportToJson);
    importFile.addEventListener('change', importFromJsonFile);
    categoryFilter.addEventListener('change', filterQuotes);
    
    // Show last viewed quote or random quote
    if (!showLastViewedQuote()) {
        showRandomQuote();
    }
    
    // Display all quotes initially
    filterQuotes();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);