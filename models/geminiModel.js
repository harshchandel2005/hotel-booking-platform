const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiModel {
  static async generateHotelSuggestions(destination, budget, people, travellingWith, bookingDate, sourceAddress) {
    try {
      // Get the generative model (use the model you have access to)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Act as a travel planning expert. Suggest 3-5 hotels in ${destination} that match these criteria:
        - Budget: ${budget}
        - Travelers: ${people} ${people > 1 ? 'people' : 'person'} (${travellingWith})
        - Travel date: ${bookingDate}
        - Starting from: ${sourceAddress}

        For each hotel, provide:
        1. Name
        2. Price range (per night)
        3. Travel time and distance from ${sourceAddress}
        4. Estimated travel expenses from ${sourceAddress}
        5. 3-5 nearby attractions
        6. Booking link (if available)
        7. Official website link (if available)

        Format the response as a JSON-like array of objects with these properties:
        - name
        - price
        - travelTime
        - distance
        - travelExpense
        - attractions (array)
        - bookingLink
        - link

        Return only the JSON-like array, nothing else.
      `;

      console.log("Sending prompt to Gemini:", prompt); // Debug log

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("Received response from Gemini:", text); // Debug log

      return text;
    } catch (error) {
      console.error("Error generating suggestions:", error);
      throw new Error(`Failed to generate suggestions: ${error.message}`);
    }
  }

  static parseHotelResponse(responseText) {
    try {
      // Clean the response text to make it valid JSON
      const cleanedText = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const hotels = JSON.parse(cleanedText);
      
      // Validate and format the hotels array
      if (!Array.isArray(hotels)) {
        throw new Error('Invalid response format: Expected array of hotels');
      }

      return hotels.map(hotel => ({
        name: hotel.name || 'Unknown Hotel',
        price: hotel.price || 'Price not available',
        travelTime: hotel.travelTime || 'Time not specified',
        distance: hotel.distance || 'Distance not specified',
        travelExpense: hotel.travelExpense || 'Cost not specified',
        attractions: Array.isArray(hotel.attractions) ? hotel.attractions : [],
        bookingLink: hotel.bookingLink || null,
        link: hotel.link || null
      }));
    } catch (error) {
      console.error("Error parsing response:", error); // see that the error is logged
      throw new Error(`Failed to parse hotel suggestions: ${error.message}`);
    }
  }
}

module.exports = GeminiModel;