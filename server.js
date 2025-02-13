const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Add CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files with proper MIME types
app.use('/templates', express.static('templates'));
app.use('/templates/css', express.static('templates/css'));
app.use('/templates/images', express.static('templates/images'));
app.use('/js', express.static('js'));
app.use('/static', express.static('static'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = 'uploads';
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Root route should redirect to templates/index.html
app.get('/', (req, res) => {
    res.redirect('/templates/index.html');
});

// Upload route
app.post('/upload', upload.single('pdf-upload'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const pdfPath = req.file.path;
        console.log(`File saved to: ${pdfPath}`);

        // Run Python script using child process
        const pythonProcess = spawn('python', ['multiple.py', pdfPath]);
        
        let result = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
            console.log('Python output:', data.toString());
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error('Python error:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            console.log('Python process exited with code:', code);
            console.log('Final output:', result);
            
            if (code !== 0) {
                return res.status(500).json({ 
                    error: "Error processing PDF",
                    details: errorOutput
                });
            }
            try {
                const output = JSON.parse(result.trim());
                res.json({ 
                    pdf_text: output.text,
                    price: output.price,
                    error: output.error
                });
            } catch (error) {
                res.status(500).json({ 
                    error: "Error parsing output",
                    details: error.message,
                    output: result,
                    errorOutput: errorOutput
                });
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: `An error occurred`,
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 