const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');

const frontendPath = path.join(__dirname, '../frontend');

app.use(express.static(frontendPath));
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

async function sendImageToColab(filePath) {
    const form = new FormData();
    form.append('image', fs.createReadStream(filePath));
  
    try {
        const COLAB_URL = process.env.COLAB_URL || 'https://unsanctionable-imperiously-micha.ngrok-free.dev';
        const response = await axios.post(`${COLAB_URL}/process_image`, form, {
            headers: {
                ...form.getHeaders(),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending image to Colab:', error.message);
        throw error;
    }
}

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file received' });
        }

        const imagePath = path.join(__dirname, 'uploads', req.file.filename);

        const result = await sendImageToColab(imagePath);

        if (result) {
            const { image, draw, predictions = [] } = result;
            res.json({ image, draw, predictions });
        } else {
            res.status(500).json({ error: 'Invalid response from Colab' });
        }
    } catch (error) {
        console.error('Error in /upload endpoint:', error.message);
        res.status(500).json({ error: 'Error processing image' });
    }
});


app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => console.log(`Server running on port at http://localhost:${port}`));
