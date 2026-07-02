import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import authRouter from './routes/auth.js';
import walletRouter from './routes/wallet.js';
import groupRouter from './routes/groups.js';

dotenv.config();

// Initialize DB and Seed Data
initDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/groups', groupRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Splittr Server is running on http://localhost:${PORT}`);
});
