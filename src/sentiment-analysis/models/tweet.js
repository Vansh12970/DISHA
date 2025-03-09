import mongoose from 'mongoose';

// Define the schema for tweets
const tweetSchema = new mongoose.Schema({
    tweet: String,
    classification: String,
    location: String,
});

// Create the model
const Tweet = mongoose.model('Tweet', tweetSchema);

export default Tweet;