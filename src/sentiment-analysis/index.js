import express from 'express';
import connectDB from './config/database.js';
import { saveTweet } from './services/tweetService.js';
import scrapeTweets from './utils/scraper.js';
import openai from './utils/openai.js';
import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the root directory
config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the database
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Example route
app.get('/', (req, res) => {
    res.send('DISHA - Disaster Information Sharing and Help Alert');
});

// Function to scrape and save tweets
const scrapeAndSaveTweets = async () => {
    try {
        const tweets = await scrapeTweets();
        for (const tweet of tweets) {
            // Analyze the tweet using OpenAI (optional)
            const { classification, location } = await analyzeTweet(tweet);

            // Save the tweet to the database
            await saveTweet(tweet, classification, location);
        }
        console.log('Scraping and saving completed at:', new Date());
    } catch (error) {
        console.error('Error during scraping and saving:', error);
    }
};

// Function to analyze a tweet using OpenAI (optional)
const analyzeTweet = async (tweet) => {
    try {
        const prompt = `Classify the following tweet as "disaster" or "non-disaster". If it's a disaster, extract the location if mentioned:\n\nTweet: "${tweet}"\n\nClassification:`;
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 50,
        });

        const result = response.data.choices[0].text.trim();
        const classification = result.includes('disaster') ? 'disaster' : 'non-disaster';

        // Extract location (basic example)
        const locationMatch = result.match(/Location:\s*(\w+)/i);
        const location = locationMatch ? locationMatch[1] : null;

        return { classification, location };
    } catch (error) {
        console.error('Error analyzing tweet:', error);
        return { classification: 'error', location: null };
    }
};

// Set up scraping interval (e.g., every 5 minutes)
const SCRAPING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
setInterval(scrapeAndSaveTweets, SCRAPING_INTERVAL);

// Initial scrape (optional)
scrapeAndSaveTweets();

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});