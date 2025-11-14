import express from 'express';
import dbConfig from './core/config/db.js';
import { createServer } from "http";
import { routes } from './src/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
console.log(">>> Loaded PORT from .env:", process.env.PORT);

const app = express();
const server = createServer(app);

// biên dịch
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// secure 
app.set("trust proxy", "loopback"); // trust first proxy
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
         // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: [
    //   'Content-Type',
    //   'Authorization',
    //   'Accept',
    //   'X-Requested-With',
    //   'Origin',
    // ],
    })
);

// routes
routes(app);

// connect 

const PORT = process.env.PORT || 3001;
dbConfig
    .connectDb()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("DB connection error:", err);
        process.exit(1);
    });