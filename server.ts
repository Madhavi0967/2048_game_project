import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory fallback if MongoDB is not connected
let inMemoryLeaderboard = [
  {
    id: 'seed-1',
    playerName: 'TileMaster_Alex',
    score: 28460,
    highestTile: 2048,
    boardSize: 4,
    moves: 942,
    durationSeconds: 610,
    date: '2026-08-10',
  },
  {
    id: 'seed-2',
    playerName: 'GridRunner',
    score: 21980,
    highestTile: 2048,
    boardSize: 4,
    moves: 785,
    durationSeconds: 520,
    date: '2026-08-11',
  },
  {
    id: 'seed-3',
    playerName: 'QuantumSlide',
    score: 16840,
    highestTile: 1024,
    boardSize: 4,
    moves: 612,
    durationSeconds: 430,
    date: '2026-08-12',
  },
  {
    id: 'seed-4',
    playerName: 'FastPaced3x3',
    score: 3420,
    highestTile: 512,
    boardSize: 3,
    moves: 210,
    durationSeconds: 140,
    date: '2026-08-13',
  },
  {
    id: 'seed-5',
    playerName: 'MegaGrid5x5',
    score: 48900,
    highestTile: 4096,
    boardSize: 5,
    moves: 1680,
    durationSeconds: 1120,
    date: '2026-08-13',
  },
];

// Lazy MongoDB Client
let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;

async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (db) {
    return db;
  }

  if (isConnecting) {
    return null;
  }

  try {
    isConnecting = true;
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    db = mongoClient.db();
    console.log('Successfully connected to MongoDB!');
    
    // Ensure index on score and boardSize
    const collection = db.collection('leaderboard');
    await collection.createIndex({ score: -1 });
    await collection.createIndex({ boardSize: 1 });
    
    return db;
  } catch (error) {
    console.warn('MongoDB connection failed, falling back to local storage/memory:', (error as Error).message);
    mongoClient = null;
    db = null;
    return null;
  } finally {
    isConnecting = false;
  }
}

// Check database status
app.get('/api/db-status', async (_req: Request, res: Response) => {
  const uriConfigured = Boolean(process.env.MONGODB_URI);
  let isConnected = false;

  if (uriConfigured) {
    const database = await getDb();
    isConnected = Boolean(database);
  }

  res.json({
    status: 'ok',
    databaseType: isConnected ? 'mongodb' : 'fallback',
    uriConfigured,
    isConnected,
    message: isConnected
      ? 'Connected to MongoDB Atlas'
      : uriConfigured
      ? 'MongoDB URI configured but connecting or unreachable'
      : 'Using local storage (Configure MONGODB_URI to sync to MongoDB)',
  });
});

// GET Leaderboard entries
app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const boardSizeQuery = req.query.boardSize ? Number(req.query.boardSize) : null;
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const database = await getDb();

    if (database) {
      const collection = database.collection('leaderboard');
      const filter = boardSizeQuery ? { boardSize: boardSizeQuery } : {};
      const entries = await collection
        .find(filter, { projection: { _id: 0 } })
        .sort({ score: -1 })
        .limit(limit)
        .toArray();

      return res.json({
        source: 'mongodb',
        entries,
      });
    }

    // Fallback in-memory
    let filtered = [...inMemoryLeaderboard];
    if (boardSizeQuery) {
      filtered = filtered.filter((e) => e.boardSize === boardSizeQuery);
    }
    filtered.sort((a, b) => b.score - a.score);

    return res.json({
      source: 'local',
      entries: filtered.slice(0, limit),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// POST Leaderboard entry
app.post('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const { playerName, score, highestTile, boardSize, moves, durationSeconds } = req.body;

    if (!playerName || typeof score !== 'number') {
      return res.status(400).json({ error: 'Player name and valid score are required' });
    }

    const newEntry = {
      id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      playerName: String(playerName).trim().slice(0, 20) || 'Anonymous',
      score: Math.max(0, Number(score)),
      highestTile: Number(highestTile) || 2048,
      boardSize: Number(boardSize) || 4,
      moves: Number(moves) || 0,
      durationSeconds: Number(durationSeconds) || 0,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };

    const database = await getDb();

    if (database) {
      const collection = database.collection('leaderboard');
      await collection.insertOne({ ...newEntry });

      return res.status(201).json({
        source: 'mongodb',
        entry: newEntry,
      });
    }

    // Fallback
    inMemoryLeaderboard.unshift(newEntry);
    inMemoryLeaderboard.sort((a, b) => b.score - a.score);
    if (inMemoryLeaderboard.length > 100) {
      inMemoryLeaderboard = inMemoryLeaderboard.slice(0, 100);
    }

    return res.status(201).json({
      source: 'local',
      entry: newEntry,
    });
  } catch (error) {
    console.error('Error saving leaderboard entry:', error);
    return res.status(500).json({ error: 'Failed to save score' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
