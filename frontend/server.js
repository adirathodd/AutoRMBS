// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Allow cross-origin for local dev
app.use(cors());

// Serve the static HTML/CSS/JS from current directory (or 'templates')
app.use(express.static(__dirname + "/templates/"));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Home route -> serve inputs.html or redirect
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'inputs.html'));
});

// Upload Route
app.post('/upload', upload.single('pdf-upload'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const pdfPath = req.file.path; // e.g. uploads/filename.pdf
  console.log(`Received PDF: ${pdfPath}`);

  // Spawn scrape.py, pass PDF path
  const pythonProcess = spawn('python', [
    path.join(__dirname, 'scrape.py'),
    pdfPath
  ]);

  let result = '';
  let errorOutput = '';

  // Collect STDOUT
  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  // Collect STDERR
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.error(data.toString());
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: 'Error processing PDF',
        details: errorOutput.trim()
      });
    }

    // Attempt to parse JSON from Python's output
    let parsedJSON;
    try {
      parsedJSON = JSON.parse(result.trim());
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      return res.status(500).json({
        error: 'JSON parse error',
        details: err.message,
        rawOutput: result
      });
    }

    const excelDownloadLink = '/download/excel?file=output.xlsx';

    parsedJSON.excelDownload = excelDownloadLink;

    res.json(parsedJSON);
  });
});

// Download Route for the Excel
app.get('/download/excel', (req, res) => {
  // We pass ?file=output.xlsx (default)
  const file = req.query.file || 'output.xlsx';
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Excel file not found');
  }

  // Download the file
  res.download(filePath, file, (err) => {
    if (err) {
      console.error('Error sending Excel file:', err);
    }
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});