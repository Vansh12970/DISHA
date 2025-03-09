import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import disasterKeywords from '../../config/keywords.js';
// ✅ Import disaster keywords
 

dotenv.config();

const client = new TwitterApi(process.env.BEARER_TOKEN);
const roClient = client.readOnly;

const fetchTweets = async () => {
    try {
        const query = disasterKeywords.join(" OR "); // Combine keywords for search
        const tweets = await roClient.v2.search(query, {
            "tweet.fields": "created_at,text,author_id",
            maxResults: 10, // Change to at least 10
        });

        console.log("Fetched Tweets:", tweets.data);
        return tweets.data;
    } catch (error) {
        console.error("Error fetching tweets:", error);
    }
};
export default fetchTweets; // ✅ Export function
