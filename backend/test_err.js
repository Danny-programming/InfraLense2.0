const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const express = require('express');
const fetch = require('node-fetch') || require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;

if (hasCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

const storage = hasCloudinary ? new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'infralense_complaints',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
}) : multer.diskStorage({});

const upload = multer({ storage: storage });

app.post('/test', upload.single('image'), (req, res) => res.json('OK'));

app.use((err, req, res, next) => {
    console.error("🔥 MULTER/CLOUDINARY ERROR CAUGHT:", err);
    res.status(500).json({ err: err.message, stack: err.stack });
});

app.listen(9999, async () => {
    try {
        const FormData = require('form-data');
        const fd = new FormData();
        // Fallback file to upload so we don't crash reading it
        const filePath = path.join(__dirname, 'test_models.js'); // just taking any small file
        if (fs.existsSync('pothole_test_img.png')) {
            fd.append('image', fs.createReadStream('pothole_test_img.png'));
        } else {
            fs.writeFileSync('temp.jpg', 'fake image');
            fd.append('image', fs.createReadStream('temp.jpg'));
        }

        const fetchFn = (typeof fetch === 'function') ? fetch : require('node-fetch');

        let response;
        if (fetchFn) {
            response = await fetchFn('http://localhost:9999/test', {
                method: 'POST',
                body: fd
            });
            const data = await response.json();
            console.log("RESPONSE:", data);
        } else {
            console.log("FETCH function not found");
        }
    } catch (e) {
        console.error("REQUEST ERROR:", e);
    } finally {
        process.exit(0);
    }
});
