require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/connectDB');

const app = express();

// Connect to Atlas
connectDB();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json()); // This allows req.body to work!

// Basic Route for Testing
app.get('/', (req, res) => res.send('Spave API is running... 🚀'));

// --- ROUTES ---
// Auth Routes: These will be accessible at http://localhost:3003/api/auth/signup
app.use('/api/auth', require('./src/routes/auth.routes')); 

// Transaction Routes: These will be accessible at http://localhost:3003/api
app.use('/api', require('./src/routes/api.routes'));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server spinning on port ${PORT}`));
