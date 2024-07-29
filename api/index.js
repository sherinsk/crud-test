const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Set up storage with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the folder where images will be stored
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Define the filename with the original name and a timestamp to avoid collisions
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      // Send a success response
      res.json({ message: `File uploaded successfully: ${req.file.filename}` });
    } catch (err) {
      // Handle any unexpected errors
      console.error(err);
      res.status(500).json({ error: 'An error occurred while uploading the file.' });
    }
  });
  
  // Check if file was uploaded

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
