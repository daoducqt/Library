import express from 'express';
import path from 'path';
import dbConfig from './core/config/db.js';
import { createServer } from "http";
import { routes } from './src/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { autoUpdateOverdue } from './src/loan/service/loan.service.js';
import { checkDueLoans } from './src/loan/service/overDueCheck.js';
import scheduleFineGenerationJob from './src/fine/services/cronjob.js';
import { cleanupExpiredPickups } from './src/loan/service/cleanupExpiredCode.js';
import autoGenerateFine from './src/fine/services/autoGenerateFine.js';

dotenv.config();

const app = express();
const server = createServer(app);

// biên dịch
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static files
app.use('/uploads', express.static(path.join(process.cwd(), "uploads")));

// secure 
app.set("trust proxy", "loopback"); // trust first proxy
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            process.env.CLIENT_URL
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'X-Requested-With',
            'Origin',
        ],
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
        scheduleFineGenerationJob();
    })
    .catch((err) => {
        console.error("DB connection error:", err);
        process.exit(1);
    });

// cron
cron.schedule("0 * * * *", autoUpdateOverdue); // mỗi giờ quét 1 lần
checkDueLoans();
setInterval(cleanupExpiredPickups, 60 * 60 * 1000);
autoGenerateFine();
setInterval(autoGenerateFine, 5 * 60 * 1000); // Lặp lại mỗi 5 phút