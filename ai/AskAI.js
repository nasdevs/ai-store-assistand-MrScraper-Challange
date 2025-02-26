require('dotenv').config(); // Load .env variables
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../data/ebay_products.json'); // Default jika tidak ada di .env

async function askAI(question) {
    try {
        // Cek apakah file ada
        if (!fs.existsSync(DATA_PATH)) {
            throw new Error("Data file not found. Please run scraping first.");
        }

        const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
        const products = JSON.parse(rawData);

        const response = await axios.post(API_URL, {
            model: process.env.MODEL,
            messages: [
                { 
                    role: "system", 
                    content: `You are an intelligent AI shopping assistant designed to help users with their product-related inquiries. 
                    Your primary goal is to provide accurate, helpful, and structured answers to assist customers in making informed purchasing decisions.

                    You should:
                    1. **Answer User Questions Clearly** – If a user asks about product features, specifications, compatibility, authenticity, return policies, or any other details, provide clear and accurate responses.
                    2. **Provide Product Recommendations (If Requested)** – If the user is looking for suggestions, recommend relevant products with their key details.
                    3. **Assist in Decision Making** – Explain the differences between products, highlight pros and cons, and guide the user based on their needs.
                    4. **Provide Direct Purchase Links** – Always include a link to the product page for more details or to make a purchase.
                    5. **Ask for Clarifications (If Needed)** – If the user's question is vague or lacks context, politely ask for more details before responding.
                    ${process.env.MAX_TOKENS !== -1 ? `6. **Keep responses short** (max **${process.env.MAX_TOKENS} tokens**).` : ''}


                    ### **Response Format**
                    1. **Answer to the User's Question**
                    2. **Additional Information (e.g., technical specs, warranty, comparisons)**
                    3. **Relevant Product Recommendation (if applicable)**
                    4. **Direct Purchase Link for More Details**

                    Be professional yet conversational, ensuring clarity while keeping the interaction smooth and engaging.`
                },
                { 
                    role: "user", 
                    content: `Product List:\n${JSON.stringify(products, null, 2)}\n\nUser Question: ${question}` 
                }
            ]

        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ AI API Error:", error.message);
        
        throw new Error(`AI API Error: ${error.message}`);

    }
}

module.exports = askAI;
