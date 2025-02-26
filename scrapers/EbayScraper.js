const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

class EbayScraper {
    constructor(searchUrl, maxProducts = 60) {
        this.baseUrl = this.removePageParam(searchUrl);
        this.currentPage = this.extractPageNumber(searchUrl) || 1;
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
        };
        this.maxProducts = maxProducts;
    }

    removePageParam(url) {
        return url.replace(/&_pgn=\d+/, '');
    }

    extractPageNumber(url) {
        const match = url.match(/&_pgn=(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    }

    async fetchHTML(url) {
        try {
            const response = await axios.get(url, { headers: this.headers });
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching page: ${url}`, error.message);
            return null;
        }
    }

    parseItem(element, $) {
        const title = $(element).find('.s-item__title span').text().trim();
        const rating = $(element).find('.x-star-rating span.clipped').text().trim();
        const ratingCount = parseInt($(element).find('.s-item__reviews-count span[aria-hidden="true"]').text().replace(/[()]/g, ''), 10) || 0;
        const price = $(element).find('.s-item__price').text().trim();
        let itemShipping = $(element).find('.s-item__shipping').text().trim();
        const itemLocation = $(element).find('.s-item__location').text().trim();
        const url = $(element).find('.s-item__link').attr('href');

        if (!itemShipping.toLowerCase().includes("free")) {
            itemShipping = "-";
        }

        return title && url ? {
            title,
            rating: rating || 'No rating available',
            rating_count: ratingCount,
            price,
            item_shipping: itemShipping || '-',
            item_location: itemLocation || 'Location not available',
            url
        } : null;
    }

    async scrapeList() {
        console.log(`🔍 Starting scraping from page ${this.currentPage}...`);
        let scrapedItems = [];

        while (scrapedItems.length < this.maxProducts) {
            const searchUrl = `${this.baseUrl}&_pgn=${this.currentPage}`;
            console.log(`📄 Scraping page ${this.currentPage}: ${searchUrl}`);

            const html = await this.fetchHTML(searchUrl);
            if (!html) break;

            const $ = cheerio.load(html);
            let pageItems = [];

            $('.s-item').each((index, element) => {
                if (scrapedItems.length + pageItems.length >= this.maxProducts) return false;
                const itemData = this.parseItem(element, $);
                if (itemData && itemData['title'] !== 'Shop on eBay') pageItems.push(itemData);
            });

            if (pageItems.length === 0) {
                console.log("🚫 No more products found, stopping scraping.");
                break;
            }

            scrapedItems = [...scrapedItems, ...pageItems];
            console.log(`✅ Page ${this.currentPage} done: Collected ${scrapedItems.length}/${this.maxProducts} items.`);

            this.currentPage++;
        }

        return scrapedItems;
    }

    async scrapeDetails(products) {
        console.log("\n🔍 Scraping product details...");
        let detailedProducts = [];

        for (let i = 0; i < products.length && detailedProducts.length < this.maxProducts; i++) {
            const details = await this.scrapeProductDetailFunction(products[i]);
            if (details) {
                detailedProducts.push(details);
            }
        }

        this.saveData(detailedProducts, 'ebay_products.json');
        console.log(`✅ Scraping details completed! ${detailedProducts.length} products processed.`);
        return detailedProducts;
    }

    async scrapeProductDetailFunction(product) {
        console.log(`📄 Scraping product details: ${product.title}`);
        const html = await this.fetchHTML(product.url);
        if (!html) return null;

        const $ = cheerio.load(html);
        const images = [];
        $('.ux-image-carousel-item img').each((_, el) => {
            let imgUrl = $(el).attr('data-zoom-src') || $(el).attr('src');
            if (imgUrl) images.push(imgUrl);
        });

        const condition = $('#null > div > span > span:nth-child(1) > span').text().trim() || 'Condition not available';
        const quantity = $('#qtyAvailability > span:nth-child(1)').text().trim() || 'Quantity not available';
        const sold = $('#qtyAvailability > span:nth-child(2)').text().trim() || 'No items sold';
        const description = $('div.tabs__content').text().trim() || 'Description not available';

        return {
            ...product,
            detail: { images, condition, quantity, sold, description }
        };
    }

    saveData(data, filename) {
        const filePath = path.join(__dirname, '../data', filename);
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`📂 Data saved in ${filePath}`);
    }

    async startScraping() {
        const productList = await this.scrapeList();
        if (productList.length > 0) {
            const products = await this.scrapeDetails(productList);
            return products;
        }
        return 0;
    }
}

module.exports = EbayScraper;
