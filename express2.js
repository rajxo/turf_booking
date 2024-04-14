// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/formDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schema for the form data
const FormSchema = new mongoose.Schema({
  city: String,
  email: String,
  mobile: String,
  preAmount: Number
});

// Create a model
const FormModel = mongoose.model('Form', FormSchema);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Use body-parser middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle form submission
app.post('/submit', async (req, res) => {
  try {
    const formData = req.body;
    const newFormData = new FormModel(formData);
    await newFormData.save();
    console.log(req.body);
    res.status(201).send('Form submitted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
