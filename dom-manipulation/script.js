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

// Server simulation variables
const MOCK_API_URL = 'https://jsonplaceholder.typicode.com/posts';
let lastSyncTime = null;
let syncInterval = null;
let pendingChanges = false;

// Storage keys
const STORAGE_KEYS = {
    QUOTES: 'dynamicQuoteGenerator_quotes',
    LAST_VIEWED: 'dynamicQuoteGenerator_lastViewed',
    USER_PREFERENCES: 'dynamicQuoteGenerator_preferences',
    SELECTED_FILTER: 'dynamicQuoteGenerator_selectedFilter',
    LAST_SYNC_TIME: 'dynamicQuoteGenerator_lastSyncTime',
    PENDING_CHANGES: 'dynamicQuoteGenerator_pendingChanges'
};

// Load quotes from local storage
function loadQuotesFromStorage() {
    const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Load default quotes if no stored quotes
        quotes = [
            { 
                id: generateId(),
                text: "The only way to do great work is to love what you do.", 
                author: "Steve Jobs", 
                category: "inspiration",
                lastModified: new Date().toISOString(),
                version: 1
            },
            { 
                id: generateId(),
                text: "Innovation distinguishes between a leader and a follower.", 
                author: "Steve Jobs", 
                category: "success",
                lastModified: new Date().toISOString(),
                version: 1
            },
            { 
                id: generateId(),
                text: "Your time is limited, so don't waste it living someone else's life.", 
                author: "Steve Jobs", 
                category: "life",
                lastModified: new Date().toISOString(),
                version: 1
            }
        ];
        saveQuotes();
    }
    
    // Load sync state
    lastSyncTime = localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
    pendingChanges = localStorage.getItem(STORAGE_KEYS.PENDING_CHANGES) === 'true';
}

// Generate unique ID for quotes
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    pendingChanges = true;
    localStorage.setItem(STORAGE_KEYS.PENDING_CHANGES, 'true');
    updateSyncStatus();
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
            <div class="quote-card-meta">
                <small>Modified: ${new Date(quote.lastModified).toLocaleDateString()}</small>
                ${quote.conflict ? '<span class="conflict-badge">Conflict</span>' : ''}
            </div>
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
        id: generateId(),
        text: newQuoteText,
        author: newQuoteAuthor || "Anonymous",
        category: newQuoteCategory,
        lastModified: new Date().toISOString(),
        version: 1
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
    
    // Sync with server
    syncWithServer();
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
            
            // Add IDs and metadata to imported quotes
            const processedQuotes = importedQuotes.map(quote => ({
                ...quote,
                id: quote.id || generateId(),
                lastModified: quote.lastModified || new Date().toISOString(),
                version: quote.version || 1
            }));
            
            quotes.push(...processedQuotes);
            saveQuotes();
            
            // Update categories dropdown
            populateCategories();
            
            // Refresh quotes display
            filterQuotes();
            
            // Reset file input
            event.target.value = '';
            
            showNotification(`Successfully imported ${importedQuotes.length} quotes!`);
            
            // Sync with server
            syncWithServer();
            
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

// Simulate server sync
async function syncWithServer() {
    try {
        showNotification('Syncing with server...');
        
        // Simulate server response with random data changes
        const serverQuotes = await fetchServerQuotes();
        
        if (serverQuotes && serverQuotes.length > 0) {
            const conflicts = mergeQuotes(serverQuotes);
            
            if (conflicts.length > 0) {
                showConflictResolution(conflicts);
            } else {
                showNotification('Sync completed successfully!');
            }
        }
        
        // Update sync status
        lastSyncTime = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, lastSyncTime);
        pendingChanges = false;
        localStorage.setItem(STORAGE_KEYS.PENDING_CHANGES, 'false');
        updateSyncStatus();
        
        // Refresh display
        populateCategories();
        filterQuotes();
        
    } catch (error) {
        console.error('Sync error:', error);
        showNotification('Sync failed. Will retry later.', 'error');
    }
}

// Fetch quotes from mock server
async function fetchServerQuotes() {
    // Simulate API call with random delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate server response with some changes
    const serverQuotes = [...quotes.map(quote => ({...quote}))];
    
    // Randomly modify some quotes to simulate server changes
    if (Math.random() > 0.5 && serverQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * serverQuotes.length);
        serverQuotes[randomIndex] = {
            ...serverQuotes[randomIndex],
            text: serverQuotes[randomIndex].text + " (Server Update)",
            lastModified: new Date().toISOString(),
            version: serverQuotes[randomIndex].version + 1
        };
    }
    
    // Occasionally add a new quote from server
    if (Math.random() > 0.7) {
        serverQuotes.push({
            id: generateId(),
            text: "This quote was added by the server during sync.",
            author: "System",
            category: "system",
            lastModified: new Date().toISOString(),
            version: 1
        });
    }
    
    return serverQuotes;
}

// Merge server quotes with local quotes
function mergeQuotes(serverQuotes) {
    const conflicts = [];
    const mergedQuotes = [];
    const quoteMap = new Map();
    
    // Add all server quotes to map
    serverQuotes.forEach(quote => {
        quoteMap.set(quote.id, { ...quote, source: 'server' });
    });
    
    // Merge with local quotes
    quotes.forEach(localQuote => {
        const serverQuote = quoteMap.get(localQuote.id);
        
        if (serverQuote) {
            // Quote exists in both local and server
            const localTime = new Date(localQuote.lastModified);
            const serverTime = new Date(serverQuote.lastModified);
            
            if (serverTime > localTime && serverQuote.version > localQuote.version) {
                // Server version is newer - use server data
                mergedQuotes.push(serverQuote);
                
                if (localQuote.text !== serverQuote.text) {
                    conflicts.push({
                        id: localQuote.id,
                        local: localQuote,
                        server: serverQuote,
                        resolved: false
                    });
                }
            } else {
                // Local version is newer or same - keep local
                mergedQuotes.push(localQuote);
            }
            
            quoteMap.delete(localQuote.id);
        } else {
            // Quote only exists locally
            mergedQuotes.push(localQuote);
        }
    });
    
    // Add quotes that only exist on server
    quoteMap.forEach(serverQuote => {
        mergedQuotes.push(serverQuote);
    });
    
    // Update quotes array
    quotes = mergedQuotes;
    saveQuotes();
    
    return conflicts;
}

// Show conflict resolution UI
function showConflictResolution(conflicts) {
    const conflictModal = document.createElement('div');
    conflictModal.className = 'conflict-modal';
    conflictModal.innerHTML = `
        <div class="conflict-modal-content">
            <h3>Data Conflicts Detected</h3>
            <p>We found ${conflicts.length} conflict(s) during sync. Please review and resolve:</p>
            <div class="conflicts-list">
                ${conflicts.map((conflict, index) => `
                    <div class="conflict-item">
                        <h4>Conflict ${index + 1}</h4>
                        <div class="conflict-options">
                            <div class="option">
                                <label>
                                    <input type="radio" name="resolve-${conflict.id}" value="server" checked>
                                    <strong>Server Version:</strong> "${conflict.server.text}"
                                </label>
                            </div>
                            <div class="option">
                                <label>
                                    <input type="radio" name="resolve-${conflict.id}" value="local">
                                    <strong>Local Version:</strong> "${conflict.local.text}"
                                </label>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="conflict-actions">
                <button id="resolveConflicts" class="btn-primary">Resolve Conflicts</button>
                <button id="ignoreConflicts" class="btn-secondary">Ignore for Now</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(conflictModal);
    
    // Add event listeners
    document.getElementById('resolveConflicts').addEventListener('click', () => {
        resolveConflicts(conflicts);
        document.body.removeChild(conflictModal);
    });
    
    document.getElementById('ignoreConflicts').addEventListener('click', () => {
        document.body.removeChild(conflictModal);
        showNotification('Conflicts ignored. They will be flagged for later resolution.');
    });
}

// Resolve conflicts based on user selection
function resolveConflicts(conflicts) {
    conflicts.forEach(conflict => {
        const selectedOption = document.querySelector(`input[name="resolve-${conflict.id}"]:checked`);
        
        if (selectedOption) {
            const selectedVersion = selectedOption.value;
            const resolvedQuote = selectedVersion === 'server' ? conflict.server : conflict.local;
            
            // Update the quote in the array
            const index = quotes.findIndex(q => q.id === conflict.id);
            if (index !== -1) {
                quotes[index] = {
                    ...resolvedQuote,
                    lastModified: new Date().toISOString(),
                    version: Math.max(conflict.local.version, conflict.server.version) + 1,
                    conflict: false
                };
            }
        }
    });
    
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification('Conflicts resolved successfully!');
}

// Update sync status display
function updateSyncStatus() {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        syncStatus.innerHTML = `
            <span class="sync-indicator ${pendingChanges ? 'pending' : 'synced'}">
                ${pendingChanges ? '⏳' : '✅'} 
                ${pendingChanges ? 'Changes pending sync' : 'Synced'}
            </span>
            ${lastSyncTime ? `<small>Last sync: ${new Date(lastSyncTime).toLocaleString()}</small>` : ''}
        `;
    }
}

// Create sync status element
function createSyncStatus() {
    const syncStatus = document.createElement('div');
    syncStatus.id = 'syncStatus';
    syncStatus.className = 'sync-status';
    
    const container = document.querySelector('.container');
    container.insertBefore(syncStatus, container.firstChild);
    
    updateSyncStatus();
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification show ${type}`;
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
    
    // Create sync status
    createSyncStatus();
    
    // Add event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    resetFormBtn.addEventListener('click', resetForm);
    exportBtn.addEventListener('click', exportToJson);
    importFile.addEventListener('change', importFromJsonFile);
    categoryFilter.addEventListener('change', filterQuotes);
    
    // Manual sync button
    const manualSyncBtn = document.createElement('button');
    manualSyncBtn.id = 'manualSync';
    manualSyncBtn.textContent = '🔄 Sync Now';
    manualSyncBtn.addEventListener('click', syncWithServer);
    document.querySelector('.import-export-buttons').appendChild(manualSyncBtn);
    
    // Show last viewed quote or random quote
    if (!showLastViewedQuote()) {
        showRandomQuote();
    }
    
    // Display all quotes initially
    filterQuotes();
    
    // Start periodic sync (every 30 seconds)
    syncInterval = setInterval(syncWithServer, 30000);
    
    // Initial sync
    setTimeout(syncWithServer, 2000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);