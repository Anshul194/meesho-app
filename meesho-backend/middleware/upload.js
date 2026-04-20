// Import necessary modules
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads'; // Define the upload directory
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create the upload directory if it doesn't exist
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // Create a unique filename
    const extension = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Initialize multer upload
const upload = multer({ storage: storage });

module.exports = upload;
