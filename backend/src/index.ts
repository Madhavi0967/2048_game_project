import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import { MongoClient, Db } from 'mongodb';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// ============================================================
// In-memory fallback data (used when MongoDB is unavailable)
// ============================================================
const inMemoryUsers: any[] = [];
const inMemoryLeaderboard = [
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

// ============================================================
// MongoDB connection
// ============================================================
let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let dbStatus: 'not-configured' | 'connecting' | 'connected' | 'failed' = 'not-configured';

const PUBLIC_DNS_SERVERS = ['8.8.8.8', '1.1.1.1', '8.8.4.4'];

async function tryConnect(uri: string, serverSelectionTimeoutMS: number): Promise<void> {
  mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS });
  await mongoClient.connect();
  db = mongoClient.db();
  await db.collection('leaderboard').createIndex({ score: -1 });
  await db.collection('leaderboard').createIndex({ boardSize: 1 });
}

async function connectToDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    dbStatus = 'not-configured';
    console.log('[DATABASE] MONGODB_URI is not set in backend/.env');
    console.log('[DATABASE] Using local in-memory storage for scores & users.');
    return;
  }

  dbStatus = 'connecting';
  let lastError: unknown = null;
  try {
    await tryConnect(uri, 5000);
    dbStatus = 'connected';
    console.log('[DATABASE] SUCCESS - Connected to MongoDB.');
    return;
  } catch (error) {
    lastError = error;
    // Some home routers / ISPs refuse SRV & TXT DNS lookups, which are required
    // for mongodb+srv:// URIs. Retry once using public DNS servers.
    const srvHost = uri.replace(/^mongodb\+srv:\/\/[^@]*@/, '').split('/')[0];
    try {
      await dns.promises.resolveSrv(`_mongodb._tcp.${srvHost}`);
    } catch {
      dns.setServers(PUBLIC_DNS_SERVERS);
      console.log('[DATABASE] Default DNS blocked SRV lookups - retrying with public DNS (8.8.8.8, 1.1.1.1)...');
      try {
        await tryConnect(uri, 5000);
        dbStatus = 'connected';
        console.log('[DATABASE] SUCCESS - Connected to MongoDB (via public DNS fallback).');
        return;
      } catch (error2) {
        lastError = error2;
      }
    }
  }

  dbStatus = 'failed';
  console.log('[DATABASE] FAILED - Could not connect to MongoDB.');
  console.log('[DATABASE] Error:', (lastError as Error)?.message ?? 'Unknown error');
  console.log('[DATABASE] Using local in-memory storage for scores & users.');
  mongoClient = null;
  db = null;
}

function getDb(): Db | null {
  return db;
}

// ============================================================
// Routes
// ============================================================

// Check database status
app.get('/api/db-status', (_req: Request, res: Response) => {
  const uriConfigured = Boolean(process.env.MONGODB_URI?.trim());
  const isConnected = dbStatus === 'connected';

  const message = isConnected
    ? 'Connected to MongoDB'
    : dbStatus === 'failed'
    ? 'MongoDB connection failed - using local storage'
    : 'Using local storage (set MONGODB_URI in backend/.env to enable MongoDB)';

  res.json({
    status: 'ok',
    databaseType: isConnected ? 'mongodb' : 'fallback',
    uriConfigured,
    isConnected,
    message,
  });
});

// GET Leaderboard entries
app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const boardSizeQuery = req.query.boardSize ? Number(req.query.boardSize) : null;
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const database = getDb();

    if (database) {
      const collection = database.collection('leaderboard');
      // Build aggregation: filter by size (optional), then keep only the highest
      // score per player, and sort by score descending.
      const pipeline: any[] = [];

      if (boardSizeQuery) {
        pipeline.push({ $match: { boardSize: boardSizeQuery } });
      }

      pipeline.push(
        {
          $sort: { score: -1, createdAt: -1 },
        },
        {
          $group: {
            _id: '$playerName',
            doc: { $first: '$$ROOT' },
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' },
        },
        {
          $sort: { score: -1, createdAt: -1 },
        },
        {
          $limit: limit,
        },
        {
          $project: { _id: 0 },
        }
      );

      const entries = await collection.aggregate(pipeline).toArray();

      return res.json({ source: 'mongodb', entries });
    }

    // Fallback in-memory
    let filtered = [...inMemoryLeaderboard];
    if (boardSizeQuery) {
      filtered = filtered.filter((e) => e.boardSize === boardSizeQuery);
    }

    // Keep the best score per player name
    const bestPerPlayer = new Map<string, any>();
    for (const e of filtered) {
      const existing = bestPerPlayer.get(e.playerName);
      if (!existing || e.score > existing.score) {
        bestPerPlayer.set(e.playerName, e);
      }
    }
    const deduped = Array.from(bestPerPlayer.values());
    deduped.sort((a, b) => b.score - a.score);

    return res.json({ source: 'local', entries: deduped.slice(0, limit) });
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

    const database = getDb();

    if (database) {
      const collection = database.collection('leaderboard');
      await collection.insertOne({ ...newEntry });
      return res.status(201).json({ source: 'mongodb', entry: newEntry });
    }

    // Fallback
    inMemoryLeaderboard.unshift(newEntry);
    inMemoryLeaderboard.sort((a, b) => b.score - a.score);
    if (inMemoryLeaderboard.length > 100) {
      inMemoryLeaderboard.length = 100;
    }

    return res.status(201).json({ source: 'local', entry: newEntry });
  } catch (error) {
    console.error('Error saving leaderboard entry:', error);
    return res.status(500).json({ error: 'Failed to save score' });
  }
});

// AUTH: Sign Up
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = String(username).trim();
    const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const userProfile = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      username: cleanUsername,
      email: cleanEmail,
      avatarColor,
      createdAt: new Date().toISOString(),
      highScore: 0,
      gamesPlayed: 0,
    };

    const database = getDb();

    if (database) {
      const usersCol = database.collection('users');
      const existing = await usersCol.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      await usersCol.insertOne({
        ...userProfile,
        password,
      });

      return res.status(201).json({ success: true, user: userProfile });
    }

    // Fallback in-memory
    const exists = inMemoryUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    inMemoryUsers.push({ ...userProfile, password });
    return res.status(201).json({ success: true, user: userProfile });
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ error: 'Failed to sign up' });
  }
});

// AUTH: Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const database = getDb();

    if (database) {
      const usersCol = database.collection('users');
      const user = await usersCol.findOne({ email: cleanEmail });
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const { password: _pw, _id: _id, ...safeUser } = user as any;
      return res.json({ success: true, user: safeUser });
    }

    // Fallback
    const user = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _pw, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Failed to log in' });
  }
});

// ============================================================
// Start server
// ============================================================
async function startServer() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log('');
    console.log('====================================================');
    console.log(`  Backend API running at  http://localhost:${PORT}`);
    console.log(`  Database status: ${
      dbStatus === 'connected'
        ? 'CONNECTED - MongoDB'
        : dbStatus === 'failed'
        ? 'FAILED - using local storage'
        : 'NOT CONFIGURED - using local storage'
    }`);
    console.log('====================================================');
    console.log('');
  });
}

startServer();
