# 📌 eBay Scraper & AI Assistant API

## **📖 Overview**
The eBay Scraper & AI Assistant API allows users to scrape product data from eBay, retrieve the scraped data, and ask an AI assistant for recommendations or further details about the products.

---

## **📌 Base URL**
```http
http://localhost:3000
```
> **Note:** Adjust the domain or server address when deploying to a production environment.

---

## **🚀 API Endpoints**

### **1️⃣ Start Scraping**
#### **🔹 Request**
```http
POST /start-scraping
```
**📌 Description:**  
Initiates the scraping process to extract product data from eBay based on the search URL.

**📥 Request Body:**
| Parameter  | Type   | Required | Default | Description |
|------------|--------|----------|---------|------------|
| `searchUrl` | `string` | ✅ Yes | - | The eBay search URL |
| `count` | `integer` | ❌ No | 60 | The number of products to scrape |

**📤 Example Request:**
```json
{
    "searchUrl": "https://www.ebay.com/sch/i.html?_nkw=nike&_sacat=0&_from=R40&_pgn=1",
    "count": 30
}
```

#### **✅ Response (200 - Success)**
```json
{
    "status": "success",
    "message": "Scraping completed",
    "data": {
        "totalProducts": 30
    },
    "error": null
}
```

#### **❌ Response (400 - Bad Request)**
```json
{
    "status": "error",
    "message": "Search URL is required",
    "data": null,
    "error": null
}
```
```json
{
    "status": "error",
    "message": "Max Products must be a positive number",
    "data": null,
    "error": null
}
```

---

### **2️⃣ Get Scraped Data**
#### **🔹 Request**
```http
GET /get-data
```
**📌 Description:**  
Retrieves the latest scraped eBay product data.

**📥 Request Body:**  
Not required.

#### **✅ Response (200 - Success)**
```json
{
    "status": "success",
    "message": "Data retrieved successfully",
    "data": {
        "totalProducts": 2,
        "products": [
            {
                "title": "Nike Air Force 1 Low Triple White ‘07 BRAND NEW",
                "rating": "No rating available",
                "rating_count": 0,
                "price": "USD 75.00",
                "item_shipping": "",
                "item_location": "from United States",
                "url": "https://www.ebay.com/itm/306125671038"
            }
        ]
    },
    "error": null
}
```

#### **❌ Response (404 - Not Found)**
```json
{
    "status": "error",
    "message": "Data not found. Please run scraping first",
    "data": null,
    "error": null
}
```

---

### **3️⃣ Ask AI**
#### **🔹 Request**
```http
POST /ask-ai
```
**📌 Description:**  
Asks an AI assistant questions based on the scraped eBay data.

**📥 Request Body:**
| Parameter  | Type   | Required | Default | Description |
|------------|--------|----------|---------|------------|
| `question` | `string` | ✅ Yes | - | The question related to eBay products |

**📤 Example Request:**
```json
{
    "question": "Give recommendations for cheap shoes suitable for jogging"
}
```

#### **✅ Response (200 - Success)**
```json
{
    "status": "success",
    "message": "AI response generated",
    "data": {
        "answer": "For jogging, the Nike Air Force 1 Low (USD 75) is budget-friendly, but it's a casual sneaker. The Valentine's Day edition (USD 150) is stylish but not designed for running. Consider dedicated running shoes."
    },
    "error": null
}
```

#### **❌ Response (400 - Bad Request)**
```json
{
    "status": "error",
    "message": "Question is required",
    "data": null,
    "error": null
}
```

---

## **🔧 Error Handling**
| Status Code | Status | Description |
|-------------|--------|-----------|
| `200` | `success` | Request was successfully processed. |
| `400` | `error` | Invalid request (e.g., missing or incorrectly formatted parameters). |
| `404` | `error` | Data not found (e.g., no scraped data available). |
| `500` | `error` | Internal server error (e.g., failed to read file or AI service issue). |

---

## **📌 Installation & Running the API**
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/nasdevs/ai-store-assistand-MrScraper-Challange.git
cd ai-store-assistand-MrScraper-Challange
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Configure `.env`**
Create a `.env` file and add the following configuration:
```
# Server Configuration
PORT=3000

# AI API Configuration
API_KEY=your-api-key-here
API_URL=https://yourwebsite
MODEL=model-type

# AI Token Limit (Set to -1 for unlimited tokens)
MAX_TOKENS=100
```

### **4️⃣ Run the API**
```sh
npm start
```
Or using **nodemon**:
```sh
npm run dev
```

---

## **📌 Technologies Used**
- **Node.js** – Backend runtime
- **Express.js** – REST API framework
- **Cheerio.js** – Web scraping
- **Axios** – HTTP requests
- **ExchangeRate API** – Currency conversion

---

## **📌 Project Structure**
```
/ebay-scraper-api
│-- /scrapers
│   ├── EbayScraper.js  # eBay scraping class
│-- /ai
│   ├── AskAI.js  # AI Assistant class
│-- /data
│   ├── ebay_products.json  # Scraped data
│-- server.js  # Main API
│-- .env  # Environment configuration
│-- package.json  # Project dependencies
│-- README.md  # API documentation
```