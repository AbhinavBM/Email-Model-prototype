const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.SCORE_SERVER_PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/dima806/phishing-email-detection";
const HUGGING_FACE_API_KEY = "Bearer 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";
const PHISHING_THRESHOLD = 0.5; // Adjust the threshold as needed

app.post('/receive-email', async (req, res) => {
  try {
    const emailBody = req.body.body;

    if (!emailBody) {
      return res.status(400).json({ error: 'Invalid request. Missing emailBody in the request.' });
    }

    // Fetch phishing score from the Hugging Face API
    const phishingScoreResponse = await fetchPhishingScore(emailBody);

    // Convert phishing score to boolean based on the threshold
    const isPhishing = phishingScoreResponse > PHISHING_THRESHOLD;

    // Log the responses and results
    console.log('Hugging Face Response:', phishingScoreResponse);
    console.log('Is Phishing:', isPhishing);

    // Respond to the client with the boolean result
    res.json({ isPhishing });
  } catch (error) {
    console.error('Error in fetching phishing score:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to fetch phishing score from the Hugging Face API
async function fetchPhishingScore(emailBody) {
  try {
    const response = await axios.post(HUGGING_FACE_API_URL, { inputs: emailBody }, {
      headers: {
        Authorization: HUGGING_FACE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    // Check if the response is from Hugging Face before extracting the score
    if (response.config.url === HUGGING_FACE_API_URL) {
      console.log('Hugging Face Response:', response.data);
    }

    const phishingScore = response.data[0][0].score; // Assuming the score is the first item in the array
    return phishingScore;
  } catch (error) {
    console.error('Error in fetching phishing score:', error);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
