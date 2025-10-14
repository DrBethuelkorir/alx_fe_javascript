    let quotes = [
            { text: "The only way to do great work is to love what you do.", category: "Inspiration", author: "Steve Jobs" },
            { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership", author: "Steve Jobs" },
            { text: "Your time is limited, so don't waste it living someone else's life.", category: "Life", author: "Steve Jobs" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams", author: "Eleanor Roosevelt" },
            { text: "It is during our darkest moments that we must focus to see the light.", category: "Perseverance", author: "Aristotle" },
            { text: "Whoever is happy will make others happy too.", category: "Happiness", author: "Anne Frank" },
            { text: "You must be the change you wish to see in the world.", category: "Change", author: "Mahatma Gandhi" },
            { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", category: "Love", author: "Mother Teresa" },
            { text: "The only thing we have to fear is fear itself.", category: "Courage", author: "Franklin D. Roosevelt" },
            { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Innovation", author: "Ralph Waldo Emerson" }
        ];


       function showRandomQuote() {
    let randomIndex = Math.floor(Math.random() * quotes.length);
    let quote = quotes[randomIndex];
    const quoteContainer = document.getElementById("quoteDisplay");
    
    quoteContainer.innerHTML = "<p>\"" + quote.text + "\"</p>" +
                              "<p><em>— " + quote.author + "</em></p>" +
                              "<small>Category: " + quote.category + "</small>";
}