const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

class GeminiModel {
    constructor() {
        this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAi.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 2000
            }
        });
    }

    async generateHotelSuggestions(destination, budget, people, travelParty, bookingDate, sourceAddress) {
        let budgetRange;
        switch (budget) {
            case 'low': budgetRange = "$50 - $100 per night"; break;
            case 'medium': budgetRange = "$100 - $200 per night"; break;
            case 'high': budgetRange = "$200+ per night"; break;
            default: budgetRange = "a reasonable price";
        }

        const prompt = `
            Suggest 3 to 5 hotels in ${destination} that are suitable for ${people} people traveling as ${travelParty}, 
            with a potential booking date around ${bookingDate}. The budget range is ${budgetRange}. 
            
            For each hotel, provide:
            1. Hotel name
            2. Price per night (format: "$X - $Y" or "$X+")
            3. 1-2 nearby attractions (comma separated)
            4. Official hotel website link
            5. Travel expense estimate from ${sourceAddress} (include both taxi and public transport options)
            6. Direct booking link from reputable platform (Booking.com, Expedia, etc.)
            
            Present each hotel in this exact format:
            Hotel Name: [Full Hotel Name]
            Price: [Price Range]
            Attractions: [Attraction1, Attraction2]
            Link: [Hotel Website URL]
            Travel Expense: [From ${sourceAddress}: Taxi $XX-$YY, Public Transport $ZZ]
            Booking Link: [Booking Platform URL]
            
            Important:
            - Calculate travel costs specifically from ${sourceAddress}
            - Include distance and estimated travel time
            - Provide realistic transportation options
            - Ensure all 6 elements are included for each hotel
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            
            let responseText;
            if (typeof response.text === 'function') {
                responseText = await response.text();
            } else {
                responseText = response.toString();
            }

            if (!responseText) {
                throw new Error("Empty response from API");
            }

            return responseText;
        } catch (error) {
            console.error("Error generating suggestions:", error);
            throw new Error(`Failed to generate suggestions: ${error.message}`);
        }
    }

    parseHotelResponse(responseText) {
        if (!responseText || typeof responseText !== 'string') {
            console.error("Invalid response received:", responseText);
            return [];
        }

        const hotels = [];
        const hotelBlocks = responseText.split('\n\n').filter(block => block.trim());

        hotelBlocks.forEach(block => {
            const lines = block.split('\n').map(line => line.trim()).filter(line => line);
            const hotel = {
                name: '',
                price: '',
                attractions: [],
                link: '',
                travelExpense: '',
                bookingLink: ''
            };

            lines.forEach(line => {
                if (line.startsWith('Hotel Name:')) {
                    hotel.name = line.replace('Hotel Name:', '').trim();
                } else if (line.startsWith('Price:')) {
                    hotel.price = line.replace('Price:', '').trim();
                } else if (line.startsWith('Attractions:')) {
                    hotel.attractions = line.replace('Attractions:', '').split(',').map(a => a.trim());
                } else if (line.startsWith('Link:')) {
                    hotel.link = this.sanitizeUrl(line.replace('Link:', '').trim());
                } else if (line.startsWith('Travel Expense:')) {
                    hotel.travelExpense = line.replace('Travel Expense:', '').trim();
                } else if (line.startsWith('Booking Link:')) {
                    hotel.bookingLink = this.sanitizeUrl(line.replace('Booking Link:', '').trim());
                }
            });

            if (hotel.name && hotel.price) {
                hotels.push(hotel);
            }
        });

        return hotels;
    }

    sanitizeUrl(url) {
        if (!url) return '';
        if (!url.startsWith('http')) {
            return `https://${url}`;
        }
        return url;
    }
}

module.exports = new GeminiModel();