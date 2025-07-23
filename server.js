require('dotenv').config();
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const cors = require('cors');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // cache for 1 hour

app.use(cors()); // allow requests from your frontend

const NASA_API_KEY = process.env.NASA_API_KEY; // replace with your real key

// APOD endpoint
app.get('/api/apod', async (req, res) => {
    const cacheKey = 'apod';
    const cached = cache.get(cacheKey);

    if (cached) {
        return res.json(cached);
    }

    try {
        const response = await axios.get(
            `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
        );
        cache.set(cacheKey, response.data);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch from NASA API' });
    }
});

// Mars Rover endpoint
app.get('/api/mars-rover', async (req, res) => {
    const sol = req.query.sol || 1000;
    const rover = req.query.rover || 'curiosity';
    const camera = req.query.camera; // optional

    const cacheKey = `mars-rover-${rover}-${sol}-${camera || 'all'}`;
    const cached = cache.get(cacheKey);

    if (cached) {
        return res.json(cached);
    }

    try {
        const params = {
            sol,
            api_key: NASA_API_KEY,
        };
        if (camera) {
            params.camera = camera;
        }

        const response = await axios.get(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
            { params }
        );
        cache.set(cacheKey, response.data);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch from NASA Mars Rover API' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});