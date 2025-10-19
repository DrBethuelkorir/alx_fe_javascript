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
        const quoteDisplay = document.getElementById('quoteText');
        const quoteAuthor = document.getElementById('quoteAuthor');
        const quoteCategory = document.getElementById('quoteCategory');
        const newQuoteBtn = document.getElementById('newQuote');
        const categorySelect = document.getElementById('categorySelect');
        const addQuoteBtn = document.getElementById('addQuoteBtn');
        const resetFormBtn = document.getElementById('resetForm');
        const notification = document.getElementById('notification');

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

        // Event listeners
        newQuoteBtn.addEventListener('click', showRandomQuote);
        addQuoteBtn.addEventListener('click', addQuote);
        resetFormBtn.addEventListener('click', resetForm);

        // Initialize with a random quote
        showRandomQuote();
  