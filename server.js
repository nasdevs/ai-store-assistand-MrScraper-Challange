const express = require('express');
const EbayScraper = require('./scrapers/EbayScraper');
const askAI = require('./ai/AskAI');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Standarisasi response format
const responseFormat = (status, message, data = null, error = null) => ({
    status,
    message,
    data,
    error
});

// **POST /start-scraping**
app.post('/start-scraping', async (req, res, next) => {
    try {
        const { searchUrl, count = 60} = req.body;

        if (!searchUrl) {
            return res.status(400).json(responseFormat("error", "Search URL is required"));
        }

        const maxProducts = Number(count);
        if (isNaN(maxProducts) || maxProducts <= 0) {
            return res.status(400).json(responseFormat("error", "maxProducts must be a positive number"));
        }

        const scraper = new EbayScraper(searchUrl, maxProducts);
        const products = await scraper.startScraping();

        res.status(200).json(responseFormat("success", "Scraping completed", { totalProducts: products.length}));
    } catch (error) {
        next(error);
    }
});

// **GET /get-data**
app.get('/get-data', async (req, res, next) => {
    try {
        const filePath = path.join(__dirname, 'data', 'ebay_products.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json(responseFormat("error", "Data not found. Please run scraping first"));
        }

        let rawData;
        try {
            rawData = fs.readFileSync(filePath, 'utf-8');
        } catch (readError) {
            return res.status(500).json(responseFormat("error", "Error reading data file", null, readError.message));
        }

        if (!rawData.trim()) {
            return res.status(404).json(responseFormat("error", "Data file is empty. Please re-run scraping"));
        }

        let products;
        try {
            products = JSON.parse(rawData);
        } catch (parseError) {
            return res.status(500).json(responseFormat("error", "Error parsing JSON file", null, parseError.message));
        }

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(404).json(responseFormat("error", "No products found. Please run scraping again"));
        }

        res.status(200).json(responseFormat("success", "Data retrieved successfully", { totalProducts: products.length, products }));
    } catch (error) {
        next(error);
    }
});

// **POST /ask-ai**
app.post('/ask-ai', async (req, res, next) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json(responseFormat("error", "Question is required"));
        }

        const answer = await askAI(question);
        res.status(200).json(responseFormat("success", "AI response generated", { answer }));
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json(responseFormat("error", "Internal Server Error", null, err.message));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
