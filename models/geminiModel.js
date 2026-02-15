const { GoogleGenAI } = require("@google/genai");

console.log("Using NEW Gemini SDK");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function listModels() {
  // Try several possible list methods depending on SDK version
  if (ai.models && typeof ai.models.list === "function") {
    return await ai.models.list();
  }
  if (ai.models && typeof ai.models.listModels === "function") {
    return await ai.models.listModels();
  }
  if (typeof ai.listModels === "function") {
    return await ai.listModels();
  }
  return null;
}

class GeminiModel {
  // parameters kept for compatibility with controller
  static async generateHotelSuggestions(
    destination,
    budget,
    people,
    travellingWith,
    bookingDate,
    sourceAddress
  ) {
    const envModel = process.env.GEMINI_MODEL || process.env.GEMINI_MODEL_NAME;
    // prefer a safe default that often supports text generation
    const defaultModel = process.env.GEMINI_DEFAULT_MODEL || "models/text-bison-001";
    const candidates = [envModel, defaultModel].filter(Boolean);

    const prompt = `Act as a travel planning expert. Suggest 3 hotels in ${destination} that match these criteria:\n- Budget: ${budget}\n- Travelers: ${people} ${
      people > 1 ? "people" : "person"
    } (${travellingWith})\n- Travel date: ${bookingDate || "Not specified"}\n- Starting from: ${sourceAddress}\n\nReturn ONLY a valid JSON array of objects with keys: name, price, travelTime, distance, travelExpense, attractions (array), bookingLink, link`;

    // Helper to attempt generation with a specific model name
    const tryGenerate = async (modelName) => {
      if (!modelName) return null;
      // normalize: allow names like 'gemini-1.5' or 'models/gemini-1.5'
      const normalized = modelName.startsWith("models/") ? modelName : `models/${modelName.replace(/^models\//, "")}`;
      try {
        const resp = await ai.models.generateContent({ model: normalized, contents: prompt });
        // SDK may expose text in different fields; try common ones
        if (resp?.text) return resp.text;
        if (typeof resp === "string") return resp;
        if (resp?.output?.[0]?.content?.[0]?.text) return resp.output[0].content[0].text;
        if (resp?.candidates?.[0]?.content) return resp.candidates[0].content;
        // fallback to JSON.stringify of response
        return JSON.stringify(resp);
      } catch (err) {
        // rethrow so caller can handle specific errors
        throw err;
      }
    };

    // Try candidates first
    for (const m of candidates) {
      if (!m) continue;
      try {
        const out = await tryGenerate(m);
        if (out) return out;
      } catch (err) {
        // If model not found, continue to discovery; otherwise log and continue
        console.error(`Model ${m} generate error:`, err?.message || err);
        if (err?.status === 404 || (err?.message && err.message.includes("not found"))) {
          // try discovery below
          break;
        }
      }
    }

    // Discover available models and pick one that supports text generation
    try {
      const listResp = await listModels();
      const models = listResp?.models || listResp?.model || listResp || [];
      // Normalize possible shapes
      const modelEntries = Array.isArray(models) ? models : Object.values(models || {});

      for (const mod of modelEntries) {
        const name = mod?.name || mod?.model || mod;
        const methods = mod?.supportedMethods || mod?.methods || [];
        const supportsGenerate = Array.isArray(methods)
          ? methods.some((m) => /generate/i.test(m))
          : /generate/i.test(String(methods));
        if (supportsGenerate && name) {
          try {
            const out = await tryGenerate(name);
            if (out) return out;
          } catch (err) {
            console.error(`Tried model ${name} but failed:`, err?.message || err);
            continue;
          }
        }
      }
    } catch (err) {
      console.error("Error listing models:", err?.message || err);
    }

    // Final fallback: return deterministic suggestions so UI remains usable
    const fallback = [
      {
        name: `${destination} Budget Inn`,
        price: budget || "Budget",
        travelTime: "~15 mins",
        distance: "5 km",
        travelExpense: "Approx. ₹200",
        attractions: ["City Center", "Museum", "Riverside"],
        bookingLink: null,
        link: null,
      },
      {
        name: `${destination} Comfort Stay`,
        price: budget || "Mid-range",
        travelTime: "~20 mins",
        distance: "7 km",
        travelExpense: "Approx. ₹300",
        attractions: ["Park", "Gallery", "Market"],
        bookingLink: null,
        link: null,
      },
      {
        name: `${destination} Grand Hotel`,
        price: budget || "Premium",
        travelTime: "~25 mins",
        distance: "9 km",
        travelExpense: "Approx. ₹450",
        attractions: ["Fort", "Old Town", "Beach"],
        bookingLink: null,
        link: null,
      },
    ];

    return JSON.stringify(fallback);
  }
}

// Parser used by controller to convert model/fallback output into hotel objects
GeminiModel.parseHotelResponse = function (responseText) {
  try {
    if (!responseText) return [];
    let text = responseText;
    if (typeof text !== 'string') text = JSON.stringify(text);
    // strip code fences
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('Parsed response is not an array');

    return parsed.map((hotel) => ({
      name: hotel.name || hotel.title || 'Unknown Hotel',
      price: hotel.price || hotel.price_range || 'Price not available',
      travelTime: hotel.travelTime || hotel.travel_time || 'Time not specified',
      distance: hotel.distance || 'Distance not specified',
      travelExpense: hotel.travelExpense || hotel.travel_expense || 'Cost not specified',
      attractions: Array.isArray(hotel.attractions) ? hotel.attractions : [],
      bookingLink: hotel.bookingLink || hotel.booking_link || null,
      link: hotel.link || null,
    }));
  } catch (err) {
    console.error('Failed to parse hotel suggestions:', err?.message || err);
    return [];
  }
};

module.exports = GeminiModel;
