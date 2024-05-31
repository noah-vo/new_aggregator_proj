// routes/news.js
import express from "express";
import axios from "axios";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get("/", async (req, res) => {
    try {
        const { category = 'business', pageSize = 10, summarize = 'false' } = req.query;

        const newsResponse = await axios.get(`https://newsapi.org/v2/top-headlines`, {
            params: {
                country: 'us',
                category,
                pageSize,
                apiKey: process.env.NEWS_API_KEY
            }
        });

        let articles = newsResponse.data.articles;

        if (summarize === 'true') {
            articles = await Promise.all(articles.map(async (article) => {
                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: `Summarize this news, make it informative, condensed, and engaging: ${article.description}` }],
                    max_tokens: 100,
                });
                return { 
                    ...article, 
                    summary: response.choices[0].message.content.trim() 
                };
            }));
        }

        res.json(articles);
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Rate limit exceeded. Please try again later.');
        } else {
            console.error('An error occurred:', error.message);
        }
        res.status(500).send('An error occurred while fetching news');
    }
});

export default router;
