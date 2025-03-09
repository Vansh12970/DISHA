import Tweet from '../models/tweet.js';

// Save a tweet to the database
const saveTweet = async (tweet, classification, location = null) => {
    try {
        const newTweet = new Tweet({ tweet, classification, location });
        await newTweet.save();
        console.log('Tweet saved successfully');
    } catch (error) {
        console.error('Error saving tweet:', error);
    }
};

export { saveTweet };