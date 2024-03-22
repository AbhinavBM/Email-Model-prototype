const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/dima806/phishing-email-detection";
const HUGGING_FACE_API_KEY = "Bearer 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";
const PHISHING_THRESHOLD = 0.5; // Adjust the threshold as needed

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file
const morgan = require('morgan'); // Import morgan

// Set up Express app
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

// Replace with your correct MongoDB connection URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mailApp';

// Connect to MongoDB (update authentication based on your provider)
mongoose.connect(mongoURI);

const db = mongoose.connection;
app.use(morgan('dev')); // Use morgan middleware for logging HTTP requests

// Define MongoDB schema
const emailSchema = new mongoose.Schema({
    sender: String,
    recipient: String,
    subject: String,
    body: String,
    timestamp: { type: Date, default: Date.now },
    phishing: Boolean
});

const Email = mongoose.model('Email', emailSchema);

// Middleware for parsing JSON
app.use(bodyParser.json());

// Route to display all emails
app.get('/emails', async (req, res) => {
  try {
    // Fetch all emails from MongoDB
    const emails = await Email.find();
    res.json(emails);
    console.log(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to display phishing emails
app.get('/phishing-emails', async (req, res) => {
  try {
    // Fetch phishing emails from MongoDB
    const phishingEmails = await Email.find({ phishing: true });
    res.json(phishingEmails);
  } catch (error) {
    console.error('Error fetching phishing emails:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to display non-phishing emails
app.get('/non-phishing-emails', async (req, res) => {
  try {
    // Fetch non-phishing emails from MongoDB
    const nonPhishingEmails = await Email.find({ phishing: false });
    res.json(nonPhishingEmails);
  } catch (error) {
    console.error('Error fetching non-phishing emails:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Route to handle incoming emails from the mail server
app.post('/receive-email', async (req, res) => {
  try {
    // Step 1: Validate and handle incoming data
    const receivedEmail = req.body;
    console.log(receivedEmail);

    if (!isValidEmail(receivedEmail)) {
      // Respond with bad request if the email is invalid
      return res.status(400).send('Invalid email data.');
    }

    // Step 2: Perform phishing detection
    const phishingDetectionResult = await performPhishingDetection(receivedEmail.body);
    console.log('Hugging Face Response:', phishingDetectionResult);

    // Step 3: Store the email in MongoDB
    const emailToStore = {
      sender: receivedEmail.sender,
      recipient: receivedEmail.recipient,
      subject: receivedEmail.subject,
      body: receivedEmail.body,
      timestamp: new Date(),
      phishing: phishingDetectionResult,
    };

    await storeEmailInMongoDB(emailToStore);

    // Step 4: Respond to the mail server
    res.status(200).send('Email processed successfully.');
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Function to validate incoming email data
function isValidEmail(email) {
  return email && email.sender && email.recipient && email.subject && email.body;
}

// Function to perform phishing detection using Hugging Face API
async function performPhishingDetection(emailBody) {
  try {
    const response = await axios.post(HUGGING_FACE_API_URL, { inputs: emailBody }, {
      headers: {
        Authorization: HUGGING_FACE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    // Log the Hugging Face response
    console.log('Hugging Face Response:', response.data);

    // Extract the phishing score from the response
    const phishingScore = response.data[0][0].score; // Assuming the score is the first item in the array

    // Log the phishing score
    console.log('Phishing Score:', phishingScore);

    // Convert phishing score to boolean based on the threshold
    const isPhishing = phishingScore > PHISHING_THRESHOLD;

    // Log whether it's phishing or not
    console.log('Is Phishing:', isPhishing);

    return isPhishing;
  } catch (error) {
    console.error('Error in phishing detection:', error);
    // Handle error or return a default value
    throw new Error('Phishing detection failed: ' + error.message);
  }
}

// Function to store the email in MongoDB
async function storeEmailInMongoDB(email) {
  try {
    // Create a new Email document
    const newEmail = new Email(email);

    // Save the document to the database
    await newEmail.save();
  } catch (error) {
    console.error('Error storing email in MongoDB:', error);
    // Handle error
    throw error;
  }
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
