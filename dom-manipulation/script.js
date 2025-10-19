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
let isSyncing = false;

// Storage keys
const STORAGE_KEYS = {
    QUOTES: 'dynamicQuoteGenerator_quotes',
    LAST_VIEWED: 'dynamicQuoteGenerator_lastViewed',
    USER_PREFERENCES: 'dynamicQuoteGenerator_preferences',
    SELECTED_FILTER: 'dynamicQuoteGenerator_selectedFilter',
    LAST_SYNC_TIME: 'dynamicQuoteGenerator_lastSyncTime',
    PENDING_CHANGES: 'dynamicQuoteGenerator_pendingChanges',
    SYNC_HISTORY: 'dynamicQuoteGenerator_syncHistory'
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
    syncQuotes();
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
            syncQuotes();
            
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

// Fetch quotes from mock server using GET method
async function fetchQuotesFromServer() {
    try {
        showNotification('Fetching quotes from server...');
        
        // Simulate API call with fetch GET method
        const response = await fetch(MOCK_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'mock-api-key-12345',
                'User-Agent': 'DynamicQuoteGenerator/1.0'
            }
        });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        // Create server response with simulated changes based on mock data
        const mockData = await response.json();
        const serverQuotes = [...quotes.map(quote => ({...quote}))];
        
        // Use mock data to create realistic server responses
        if (mockData && mockData.length > 0 && serverQuotes.length > 0) {
            // Randomly modify some quotes based on server data
            const randomIndex = Math.floor(Math.random() * serverQuotes.length);
            const mockQuote = mockData[Math.floor(Math.random() * Math.min(5, mockData.length))];
            
            serverQuotes[randomIndex] = {
                ...serverQuotes[randomIndex],
                text: `${serverQuotes[randomIndex].text} (Server: ${mockQuote.title.substring(0, 20)}...)`,
                lastModified: new Date().toISOString(),
                version: serverQuotes[randomIndex].version + 1,
                source: 'server'
            };
        }
        
        // Occasionally add a new quote from server using mock data
        if (Math.random() > 0.7 && mockData && mockData.length > 0) {
            const mockItem = mockData[Math.floor(Math.random() * Math.min(3, mockData.length))];
            const newServerQuote = {
                id: generateId(),
                text: `Server added: ${mockItem.body.substring(0, 50)}...`,
                author: "System",
                category: "wisdom",
                lastModified: new Date().toISOString(),
                version: 1,
                source: 'server'
            };
            serverQuotes.push(newServerQuote);
        }
        
        showNotification('Successfully fetched quotes from server!');
        return serverQuotes;
        
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
        showNotification('Failed to fetch quotes from server', 'error');
        return null;
    }
}

// Send quotes to server using POST method
async function sendQuotesToServer() {
    try {
        showNotification('Sending quotes to server...');
        
        // Prepare data for server
        const quotesToSend = quotes.map(quote => ({
            id: quote.id,
            text: quote.text,
            author: quote.author,
            category: quote.category,
            version: quote.version,
            lastModified: quote.lastModified
        }));
        
        // Simulate POST request to server
        const response = await fetch(MOCK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'mock-api-key-12345',
                'User-Agent': 'DynamicQuoteGenerator/1.0',
                'X-Sync-Timestamp': new Date().toISOString()
            },
            body: JSON.stringify({
                quotes: quotesToSend,
                clientId: 'quote-generator-' + generateId(),
                syncType: 'full-sync',
                timestamp: new Date().toISOString()
            })
        });
        
        // Simulate network delay for POST request
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 1000));
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const serverResponse = await response.json();
        
        // Simulate server processing and response
        showNotification('Quotes successfully sent to server!');
        return {
            success: true,
            receivedQuotes: quotesToSend.length,
            serverTimestamp: new Date().toISOString(),
            message: 'Sync completed successfully'
        };
        
    } catch (error) {
        console.error('Error sending quotes to server:', error);
        showNotification('Failed to send quotes to server', 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

// Main sync function - handles complete synchronization process
async function syncQuotes() {
    if (isSyncing) {
        showNotification('Sync already in progress...', 'info');
        return;
    }
    
    try {
        isSyncing = true;
        updateSyncStatus();
        
        showNotification('Starting quote synchronization...', 'info');
        
        // Record sync start time
        const syncStartTime = new Date().toISOString();
        
        // Step 1: Check if we have pending changes to send
        const hasPendingChanges = pendingChanges || quotes.some(quote => !quote.synced);
        
        if (hasPendingChanges) {
            // Send local changes to server
            const sendResult = await sendQuotesToServer();
            
            if (!sendResult.success) {
                throw new Error(`Failed to send quotes: ${sendResult.error}`);
            }
            
            // Mark quotes as synced
            quotes.forEach(quote => {
                quote.synced = true;
            });
            saveQuotes();
        }
        
        // Step 2: Fetch latest quotes from server
        const serverQuotes = await fetchQuotesFromServer();
        
        if (serverQuotes) {
            // Step 3: Merge server quotes with local quotes
            const conflicts = await mergeQuotesWithServer(serverQuotes);
            
            // Step 4: Handle conflicts if any
            if (conflicts.length > 0) {
                await handleSyncConflicts(conflicts);
            } else {
                showNotification('Quote synchronization completed successfully!');
            }
            
            // Record successful sync
            recordSyncHistory({
                timestamp: syncStartTime,
                type: 'full_sync',
                quotesSent: hasPendingChanges ? quotes.length : 0,
                quotesReceived: serverQuotes.length,
                conflicts: conflicts.length,
                status: 'success'
            });
            
        } else {
            showNotification('Sync completed - no updates from server', 'info');
            
            // Record sync with no updates
            recordSyncHistory({
                timestamp: syncStartTime,
                type: 'send_only',
                quotesSent: hasPendingChanges ? quotes.length : 0,
                quotesReceived: 0,
                conflicts: 0,
                status: 'success'
            });
        }
        
        // Update sync status
        lastSyncTime = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, lastSyncTime);
        pendingChanges = false;
        localStorage.setItem(STORAGE_KEYS.PENDING_CHANGES, 'false');
        
    } catch (error) {
        console.error('Sync error:', error);
        showNotification(`Sync failed: ${error.message}`, 'error');
        
        // Record failed sync
        recordSyncHistory({
            timestamp: new Date().toISOString(),
            type: 'failed',
            quotesSent: 0,
            quotesReceived: 0,
            conflicts: 0,
            status: 'failed',
            error: error.message
        });
        
    } finally {
        isSyncing = false;
        updateSyncStatus();
        
        // Refresh display
        populateCategories();
        filterQuotes();
    }
}

// Enhanced merge function for quotes
async function mergeQuotesWithServer(serverQuotes) {
    const conflicts = [];
    const mergedQuotes = [];
    const quoteMap = new Map();
    
    // Add all server quotes to map
    serverQuotes.forEach(quote => {
        quoteMap.set(quote.id, { ...quote, source: 'server', synced: true });
    });
    
    // Merge with local quotes
    quotes.forEach(localQuote => {
        const serverQuote = quoteMap.get(localQuote.id);
        
        if (serverQuote) {
            // Quote exists in both local and server
            const localTime = new Date(localQuote.lastModified);
            const serverTime = new Date(serverQuote.lastModified);
            
            // Check if there's a conflict (different content but similar timestamps)
            const hasConflict = (
                (localQuote.text !== serverQuote.text || localQuote.author !== serverQuote.author) &&
                Math.abs(serverTime - localTime) < 60000 // Within 1 minute
            );
            
            if (serverTime > localTime && serverQuote.version >= localQuote.version) {
                // Server version is newer - use server data
                mergedQuotes.push(serverQuote);
                
                if (hasConflict) {
                    conflicts.push({
                        id: localQuote.id,
                        local: localQuote,
                        server: serverQuote,
                        resolved: false,
                        type: 'version_conflict'
                    });
                }
            } else if (localTime > serverTime && localQuote.version >= serverQuote.version) {
                // Local version is newer - keep local
                mergedQuotes.push({ ...localQuote, synced: true });
            } else {
                // Equal timestamps/versions but different content - conflict
                mergedQuotes.push(localQuote);
                if (hasConflict) {
                    conflicts.push({
                        id: localQuote.id,
                        local: localQuote,
                        server: serverQuote,
                        resolved: false,
                        type: 'content_conflict'
                    });
                }
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

// Handle sync conflicts
async function handleSyncConflicts(conflicts) {
    return new Promise((resolve) => {
        if (conflicts.length === 0) {
            resolve();
            return;
        }
        
        const conflictModal = document.createElement('div');
        conflictModal.className = 'conflict-modal';
        conflictModal.innerHTML = `
            <div class="conflict-modal-content">
                <h3>Synchronization Conflicts</h3>
                <p>Found ${conflicts.length} conflict(s) during sync. Please resolve:</p>
                <div class="conflicts-list">
                    ${conflicts.map((conflict, index) => `
                        <div class="conflict-item">
                            <h4>Conflict ${index + 1} (${conflict.type})</h4>
                            <div class="conflict-comparison">
                                <div class="version local-version">
                                    <h5>Local Version</h5>
                                    <p>"${conflict.local.text}"</p>
                                    <small>Author: ${conflict.local.author || 'Unknown'}</small>
                                    <br>
                                    <small>Modified: ${new Date(conflict.local.lastModified).toLocaleString()}</small>
                                </div>
                                <div class="version server-version">
                                    <h5>Server Version</h5>
                                    <p>"${conflict.server.text}"</p>
                                    <small>Author: ${conflict.server.author || 'Unknown'}</small>
                                    <br>
                                    <small>Modified: ${new Date(conflict.server.lastModified).toLocaleString()}</small>
                                </div>
                            </div>
                            <div class="conflict-options">
                                <label>
                                    <input type="radio" name="resolve-${conflict.id}" value="local" ${index === 0 ? 'checked' : ''}>
                                    Keep Local Version
                                </label>
                                <label>
                                    <input type="radio" name="resolve-${conflict.id}" value="server">
                                    Use Server Version
                                </label>
                                <label>
                                    <input type="radio" name="resolve-${conflict.id}" value="merge">
                                    Merge Both
                                </label>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="conflict-actions">
                    <button id="resolveAllConflicts" class="btn-primary">Resolve All</button>
                    <button id="autoResolveConflicts" class="btn-secondary">Auto-Resolve (Use Server)</button>
                    <button id="cancelSync" class="btn-cancel">Cancel Sync</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(conflictModal);
        
        // Event listeners for conflict resolution
        document.getElementById('resolveAllConflicts').addEventListener('click', () => {
            resolveConflictsManually(conflicts);
            document.body.removeChild(conflictModal);
            resolve();
        });
        
        document.getElementById('autoResolveConflicts').addEventListener('click', () => {
            resolveConflictsAutomatically(conflicts);
            document.body.removeChild(conflictModal);
            resolve();
        });
        
        document.getElementById('cancelSync').addEventListener('click', () => {
            document.body.removeChild(conflictModal);
            showNotification('Sync cancelled by user', 'info');
            resolve();
        });
    });
}

// Resolve conflicts manually based on user selection
function resolveConflictsManually(conflicts) {
    let resolvedCount = 0;
    
    conflicts.forEach(conflict => {
        const selectedOption = document.querySelector(`input[name="resolve-${conflict.id}"]:checked`);
        
        if (selectedOption) {
            const selectedVersion = selectedOption.value;
            let resolvedQuote;
            
            if (selectedVersion === 'merge') {
                // Merge both versions
                resolvedQuote = {
                    ...conflict.local,
                    text: `${conflict.local.text} [Merged: ${conflict.server.text.substring(0, 30)}...]`,
                    lastModified: new Date().toISOString(),
                    version: Math.max(conflict.local.version, conflict.server.version) + 1
                };
            } else {
                resolvedQuote = selectedVersion === 'server' ? conflict.server : conflict.local;
            }
            
            // Update the quote in the array
            const index = quotes.findIndex(q => q.id === conflict.id);
            if (index !== -1) {
                quotes[index] = {
                    ...resolvedQuote,
                    lastModified: new Date().toISOString(),
                    version: Math.max(conflict.local.version, conflict.server.version) + 1,
                    conflict: false,
                    synced: true
                };
                resolvedCount++;
            }
        }
    });
    
    saveQuotes();
    showNotification(`Manually resolved ${resolvedCount} conflict(s)!`);
}

// Automatically resolve conflicts (server wins)
function resolveConflictsAutomatically(conflicts) {
    conflicts.forEach(conflict => {
        const index = quotes.findIndex(q => q.id === conflict.id);
        if (index !== -1) {
            quotes[index] = {
                ...conflict.server,
                lastModified: new Date().toISOString(),
                version: Math.max(conflict.local.version, conflict.server.version) + 1,
                conflict: false,
                synced: true
            };
        }
    });
    
    saveQuotes();
    showNotification(`Automatically resolved ${conflicts.length} conflict(s) using server versions.`);
}

// Record sync history
function recordSyncHistory(syncData) {
    let syncHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.SYNC_HISTORY) || '[]');
    
    syncHistory.unshift({
        ...syncData,
        id: generateId()
    });
    
    // Keep only last 10 sync records
    syncHistory = syncHistory.slice(0, 10);
    
    localStorage.setItem(STORAGE_KEYS.SYNC_HISTORY, JSON.stringify(syncHistory));
}

// Fetch quotes from mock server (alternative implementation)
async function fetchServerQuotes() {
    return await fetchQuotesFromServer();
}

// Simulate server sync (legacy function - now uses syncQuotes)
async function syncWithServer() {
    return await syncQuotes();
}

// Show conflict resolution UI (legacy function)
function showConflictResolution(conflicts) {
    handleSyncConflicts(conflicts);
}

// Resolve conflicts based on user selection (legacy function)
function resolveConflicts(conflicts) {
    resolveConflictsManually(conflicts);
}

// Update sync status display
function updateSyncStatus() {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        syncStatus.innerHTML = `
            <span class="sync-indicator ${isSyncing ? 'syncing' : pendingChanges ? 'pending' : 'synced'}">
                ${isSyncing ? '🔄' : pendingChanges ? '⏳' : '✅'} 
                ${isSyncing ? 'Syncing...' : pendingChanges ? 'Changes pending sync' : 'Synced'}
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
    manualSyncBtn.addEventListener('click', syncQuotes);
    document.querySelector('.import-export-buttons').appendChild(manualSyncBtn);
    
    // Show last viewed quote or random quote
    if (!showLastViewedQuote()) {
        showRandomQuote();
    }
    
    // Display all quotes initially
    filterQuotes();
    
    // Start periodic sync (every 30 seconds)
    syncInterval = setInterval(syncQuotes, 30000);
    
    // Initial sync
    setTimeout(syncQuotes, 2000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);