require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
// Enhanced CORS configuration

const app = express();
app.use(cors({
    origin: ['https://pbms-frontend.onrender.com', 'http://localhost:3000'], // Add your frontend URLs
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
  app.use(express.json());
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://consultancy-kqm2.onrender.com/api/product/list";

// Product and Website Knowledge Base
const websiteKnowledge = {
    general: [
      {
        question: /about|what is pbms|company info/i,
        answer: "PBMS is a premium bearing solutions provider offering high-quality industrial bearings with nationwide shipping across India."
      },
      {
        question: /contact|address|phone|email/i,
        answer: "You can reach us at:\n- Phone: +91 XXXX XXX XXX\n- Email: info@pbms.com\n- Address: PBMS Headquarters, Industrial Area, Mumbai, India"
      },
      // Add 20+ more general questions here...
    ],
    products: [
      {
        question: /types of bearings|what bearings do you have|products available/i,
        answer: "We specialize in:\n1. Ball Bearings\n2. Roller Bearings\n3. Linear Bearings\n4. Mounted Bearings\n5. Bearing Units\nVisit our products page for details!"
      },
      {
        question: /quality|material|durability/i,
        answer: "All PBMS bearings are made from premium-grade steel with ISO 9001 certification, offering minimum 50,000 hours of operation."
      },
      // Add 30+ product questions here...
    ],
    orders: [
      {
        question: /how to order|purchase|buy/i,
        answer: "Ordering is simple:\n1. Browse products\n2. Add to cart\n3. Checkout\n4. Make payment\n5. Receive confirmation"
      },
      {
        question: /payment options|credit card|upi|cash on delivery/i,
        answer: "We accept:\n- Credit/Debit Cards\n- Net Banking\n- UPI\n- PayPal\n- Cash on Delivery (COD)"
      },
      // Add 20+ order questions here...
    ],
    shipping: [
      {
        question: /shipping time|delivery duration|when will i receive/i,
        answer: "Standard delivery takes 3-5 business days. Express shipping available for metro cities (1-2 days)."
      },
      {
        question: /shipping cost|delivery charges/i,
        answer: "Free shipping on orders above ₹2000. Below ₹2000, a flat ₹100 shipping charge applies."
      },
      // Add 15+ shipping questions here...
    ],
    technical: [
      {
        question: /specifications|technical details|size chart/i,
        answer: "Complete technical specifications are available on each product page, including dimensions, load capacity, and speed ratings."
      },
      {
        question: /installation|how to fit|maintenance/i,
        answer: "We provide detailed installation guides with each purchase. Basic maintenance involves regular lubrication and cleanliness."
      },
      // Add 15+ technical questions here...
    ]
  };

// Determine if product/backend fetch is needed
function needsBackendCall(message) {
  const backendKeywords = [
    'bearing', 'product', 'price', 'stock', 'available',
    'under', 'below', '₹', 'rs.', 'show', 'list', 'buy'
  ];
  return backendKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );
}

// Extract filters (price, search term)
function extractFilters(message) {
  const priceMatch = message.match(/under ₹?(\d+)|below ₹?(\d+)|rs\.? (\d+)|₹(\d+)/i);
  return {
    maxPrice: priceMatch ? parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4]) : null,
    searchTerm: message.toLowerCase().includes('bearing') ? 'bearing' :
      message.toLowerCase().includes('product') ? 'product' : null,
  };
}

// Gemini chat function
async function runChat(userMessage, backendData = null) {
    try {
      // First check if we have a predefined answer
      const predefinedAnswer = checkKnowledgeBase(userMessage);
      if (predefinedAnswer) {
        return predefinedAnswer;
      }
  
      // If no predefined answer, use Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const chat = model.startChat({
        history: [{
          role: "user",
          parts: [{ text: "You are PBMS Bearing Solutions expert assistant. Be concise and helpful." }]
        }]
      });
  
      let prompt = `Customer asked: "${userMessage}"\n\n`;
      
      if (backendData) {
        prompt += `Product data: ${JSON.stringify(backendData)}\n\n`;
        prompt += `Provide specific information about these products.`;
      } else {
        prompt += `Answer this question about PBMS bearing solutions.`;
      }
  
      const result = await chat.sendMessage(prompt);
      return result.response.text();
      
    } catch (error) {
      console.error("Chat error:", error);
      return "I couldn't process your request. Please contact our support team for assistance.";
    }
  }
  
  function checkKnowledgeBase(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check all knowledge categories
    for (const category in websiteKnowledge) {
      for (const item of websiteKnowledge[category]) {
        if (item.question.test(lowerMessage)) {
          return item.answer;
        }
      }
    }
    return null;
  }

// Chatbot endpoint
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!needsBackendCall(userMessage)) {
      const reply = await runChat(userMessage);
      return res.json({ reply });
    }

    const filters = extractFilters(userMessage);
    const backendResponse = await axios.get(BACKEND_API_URL, {
      params: { maxPrice: filters.maxPrice, search: filters.searchTerm }
    });

    const reply = await runChat(userMessage, backendResponse.data);
    res.json({ reply });

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({
      reply: "Our chatbot service is currently unavailable. Please try again later."
    });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Gemini-powered Chatbot API is running!');
});
app.options('/chat', cors());
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});