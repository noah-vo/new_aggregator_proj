import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import routes from "./routes/news.js";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(rateLimit({
    max: 100, 
    message: 'You have exceeded the 100 requests in a day!', 
    headers: true,
}));
app.use(cors());
app.use(express.json());    
app.use('/api/v1/news', routes);
app.use("*", (req, res) => res.status(404).send("Not Found"));


  

const URL = process.env.MONGO_URL;
console.log("MONGO_URI from .env:", URL);


mongoose.connect(URL)
.catch(e => {
    console.error('Connection error', e.message)
    process.exit(1)
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));