import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-mvp-key-12345';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: any;

function setupDatabase() {
  db = new Database('./database.sqlite');
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id TEXT PRIMARY KEY,
      name TEXT,
      location TEXT,
      fees INTEGER,
      rating REAL,
      placement_percent INTEGER,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      college_id TEXT,
      name TEXT,
      duration TEXT,
      fees INTEGER,
      FOREIGN KEY(college_id) REFERENCES colleges(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      college_id TEXT,
      user_name TEXT,
      comment TEXT,
      rating REAL,
      FOREIGN KEY(college_id) REFERENCES colleges(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_colleges (
      user_id TEXT,
      college_id TEXT,
      PRIMARY KEY (user_id, college_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(college_id) REFERENCES colleges(id)
    );
  `);

  // Patch for course descriptions
  try {
    const columns = db.pragma('table_info(courses)');
    if (!columns.some((c: any) => c.name === 'description')) {
      db.exec('ALTER TABLE courses ADD COLUMN description TEXT');
      db.prepare("UPDATE courses SET description = 'A comprehensive program covering core foundations and specialized topics in ' || name").run();
    }
  } catch (e) {
    console.error('Migration error:', e);
  }

    const count = db.prepare(`SELECT COUNT(*) as count FROM colleges`).get();
  if (count.count === 0) {
    const colleges = [
      { id: '1', name: 'Indian Institute of Technology (IIT) Bombay', location: 'Mumbai, Maharashtra', fees: 250000, rating: 4.9, placement_percent: 98, description: 'One of the premier engineering institutes in India.' },
      { id: '2', name: 'Indian Institute of Technology (IIT) Delhi', location: 'New Delhi, Delhi', fees: 230000, rating: 4.8, placement_percent: 96, description: 'Top public technical and research university.' },
      { id: '3', name: 'Birla Institute of Technology and Science (BITS)', location: 'Pilani, Rajasthan', fees: 500000, rating: 4.7, placement_percent: 95, description: 'A premier private engineering institute.' },
      { id: '4', name: 'National Institute of Technology (NIT) Trichy', location: 'Trichy, Tamil Nadu', fees: 180000, rating: 4.6, placement_percent: 94, description: 'One of the oldest and largest NITs.' },
      { id: '5', name: 'Vellore Institute of Technology (VIT)', location: 'Vellore, Tamil Nadu', fees: 350000, rating: 4.3, placement_percent: 85, description: 'A prominent private educational institution.' },
      { id: '6', name: 'Indian Institute of Technology (IIT) Madras', location: 'Chennai, Tamil Nadu', fees: 220000, rating: 4.9, placement_percent: 97, description: 'Known for excellent research facilities and the serene campus.' },
      { id: '7', name: 'Indian Institute of Technology (IIT) Kanpur', location: 'Kanpur, Uttar Pradesh', fees: 215000, rating: 4.8, placement_percent: 95, description: 'Famous for its strong alumni network and academic rigor.' },
      { id: '8', name: 'Indian Institute of Technology (IIT) Kharagpur', location: 'Kharagpur, West Bengal', fees: 235000, rating: 4.7, placement_percent: 93, description: 'The oldest IIT with a vast campus and diverse course offerings.' },
      { id: '9', name: 'National Institute of Technology (NIT) Surathkal', location: 'Surathkal, Karnataka', fees: 175000, rating: 4.5, placement_percent: 92, description: 'Located near the beach, it offers a great blend of academics and campus life.' },
      { id: '10', name: 'National Institute of Technology (NIT) Warangal', location: 'Warangal, Telangana', fees: 170000, rating: 4.6, placement_percent: 93, description: 'Top-tier NIT with excellent chemical and metallurgical engineering departments.' },
      { id: '11', name: 'Delhi Technological University (DTU)', location: 'New Delhi, Delhi', fees: 190000, rating: 4.5, placement_percent: 90, description: 'Formerly DCE, known for producing top tech leaders and entrepreneurs.' },
      { id: '12', name: 'Jadavpur University', location: 'Kolkata, West Bengal', fees: 25000, rating: 4.8, placement_percent: 91, description: 'Highly affordable with an unmatched RoI (Return on Investment).' },
      { id: '13', name: 'Anna University, College of Engineering Guindy', location: 'Chennai, Tamil Nadu', fees: 60000, rating: 4.4, placement_percent: 88, description: 'One of the oldest and most prestigious state universities in India.' },
      { id: '14', name: 'Manipal Institute of Technology (MIT)', location: 'Manipal, Karnataka', fees: 400000, rating: 4.3, placement_percent: 86, description: 'Vibrant student life and great overall exposure.' },
      { id: '15', name: 'SRM Institute of Science and Technology', location: 'Chennai, Tamil Nadu', fees: 380000, rating: 4.1, placement_percent: 82, description: 'Large campus with students from all over the country.' },
      { id: '16', name: 'K L Deemed to be University', location: 'Guntur, Andhra Pradesh', fees: 250000, rating: 4.4, placement_percent: 90, description: 'Recognized as a Deemed University, offering highly accredited programs and excellent placement records.' }
    ];

    const insertCollege = db.prepare(`INSERT INTO colleges (id, name, location, fees, rating, placement_percent, description) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const c of colleges) {
      insertCollege.run(c.id, c.name, c.location, c.fees, c.rating, c.placement_percent, c.description);
    }

    const courses = [
      { id: 'c1', college_id: '1', name: 'B.Tech in Computer Science', duration: '4 Years', fees: 250000 },
      { id: 'c2', college_id: '1', name: 'B.Tech in Mechanical Engineering', duration: '4 Years', fees: 230000 },
      { id: 'c3', college_id: '2', name: 'B.Tech in Computer Science', duration: '4 Years', fees: 230000 },
      { id: 'c4', college_id: '3', name: 'B.E. in Computer Science', duration: '4 Years', fees: 500000 },
      { id: 'c5', college_id: '4', name: 'B.Tech in Electronics', duration: '4 Years', fees: 180000 },
      { id: 'c6', college_id: '5', name: 'B.Tech in Information Technology', duration: '4 Years', fees: 350000 },
      { id: 'c7', college_id: '6', name: 'B.Tech in Aerospace Engineering', duration: '4 Years', fees: 220000 },
      { id: 'c8', college_id: '7', name: 'B.Tech in Civil Engineering', duration: '4 Years', fees: 215000 },
      { id: 'c9', college_id: '12', name: 'B.E. in Production Engineering', duration: '4 Years', fees: 25000 },
      { id: 'c10', college_id: '14', name: 'B.Tech in AI & Data Science', duration: '4 Years', fees: 400000 },
      { id: 'c11', college_id: '16', name: 'B.Tech in Computer Science', duration: '4 Years', fees: 250000 }
    ];

    const insertCourse = db.prepare(`INSERT INTO courses (id, college_id, name, duration, fees, description) VALUES (?, ?, ?, ?, ?, ?)`);
    for (const c of courses) {
      const description = `A comprehensive program covering core foundations and specialized topics in ${c.name}`;
      insertCourse.run(c.id, c.college_id, c.name, c.duration, c.fees, description);
    }

    const reviews = [
      { id: 'r1', college_id: '1', user_name: 'Rahul K.', comment: 'Amazing campus and faculties.', rating: 5.0 },
      { id: 'r2', college_id: '1', user_name: 'Aditya S.', comment: 'Tough curriculum but worth it.', rating: 4.5 },
      { id: 'r3', college_id: '3', user_name: 'Priya M.', comment: 'Great placements and zero attendance policy is cool.', rating: 4.8 },
      { id: 'r4', college_id: '5', user_name: 'Nikhil R.', comment: 'Crowded but good infrastructure.', rating: 4.0 },
      { id: 'r5', college_id: '6', user_name: 'Sneha P.', comment: 'Deer walking around campus is a common sight!', rating: 4.9 },
      { id: 'r6', college_id: '12', user_name: 'Ashok B.', comment: 'Best ROI in the country, hands down.', rating: 5.0 },
      { id: 'r7', college_id: '14', user_name: 'Vinay T.', comment: 'Festivals are amazing here.', rating: 4.2 }
    ];

    const insertReview = db.prepare(`INSERT INTO reviews (id, college_id, user_name, comment, rating) VALUES (?, ?, ?, ?, ?)`);
    for (const r of reviews) {
      insertReview.run(r.id, r.college_id, r.user_name, r.comment, r.rating);
    }
  }
}

async function startServer() {
  setupDatabase();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---
  
  // List Locations
  app.get('/api/locations', (req, res) => {
    try {
      const rows = db.prepare('SELECT DISTINCT location FROM colleges').all();
      const locations = rows.map((r: any) => r.location).sort();
      res.json({ locations });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });

  // --- Auth Middleware ---
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- Auth Routes ---
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Missing fields' });
        return;
      }
      
      const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existing) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }

      const id = Date.now().toString();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(id, name, email, hashedPassword);
      
      const token = jwt.sign({ id, name, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id, name, email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
         res.status(401).json({ error: 'Invalid email or password' });
         return;
      }

      const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({ user: (req as any).user });
  });

  // --- Saved Colleges Routes ---
  app.get('/api/saved', authMiddleware, (req, res) => {
    try {
      const userId = (req as any).user.id;
      const savedColleges = db.prepare(`
        SELECT c.* FROM colleges c
        JOIN saved_colleges sc ON c.id = sc.college_id
        WHERE sc.user_id = ?
      `).all(userId);
      res.json({ colleges: savedColleges });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch saved colleges' });
    }
  });

  app.post('/api/saved/:collegeId', authMiddleware, (req, res) => {
    try {
      const userId = (req as any).user.id;
      const collegeId = req.params.collegeId;
      db.prepare('INSERT OR IGNORE INTO saved_colleges (user_id, college_id) VALUES (?, ?)').run(userId, collegeId);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to save college' });
    }
  });

  app.delete('/api/saved/:collegeId', authMiddleware, (req, res) => {
    try {
      const userId = (req as any).user.id;
      const collegeId = req.params.collegeId;
      db.prepare('DELETE FROM saved_colleges WHERE user_id = ? AND college_id = ?').run(userId, collegeId);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to remove saved college' });
    }
  });

  // List Colleges
  app.get('/api/colleges', (req, res) => {
    try {
      const { search, location, limit = 50, offset = 0 } = req.query;
      
      let queryStr = 'SELECT * FROM colleges WHERE 1=1';
      const params: any[] = [];
      
      if (search) {
        queryStr += ' AND name LIKE ?';
        params.push('%' + search + '%');
      }
      
      if (location) {
        queryStr += ' AND location LIKE ?';
        params.push('%' + location + '%');
      }
      
      if (req.query.maxFees) {
        queryStr += ' AND fees <= ?';
        params.push(Number(req.query.maxFees));
      }
      
      queryStr += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));
      
      const colleges = db.prepare(queryStr).all(...params);
      
      // Also get total count for pagination
      let countQueryStr = 'SELECT COUNT(*) as count FROM colleges WHERE 1=1';
      const countParams: any[] = [];
      if (search) {
        countQueryStr += ' AND name LIKE ?';
        countParams.push('%' + search + '%');
      }
      if (location) {
        countQueryStr += ' AND location LIKE ?';
        countParams.push('%' + location + '%');
      }
      if (req.query.maxFees) {
        countQueryStr += ' AND fees <= ?';
        countParams.push(Number(req.query.maxFees));
      }
      const totalCount = db.prepare(countQueryStr).get(...countParams);

      res.json({ colleges, total: totalCount.count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch colleges' });
    }
  });

  // Compare Colleges
  app.get('/api/colleges/compare', (req, res) => {
    try {
      const idsParam = req.query.ids as string;
      if (!idsParam) {
        res.status(400).json({ error: 'Missing ids parameter' });
        return;
      }
      const ids = idsParam.split(',').slice(0, 3); // Max 3
      const placeholders = ids.map(() => '?').join(',');
      const colleges = db.prepare(`SELECT * FROM colleges WHERE id IN (${placeholders})`).all(...ids);
      res.json({ colleges });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch colleges for comparison' });
    }
  });

  // Get College Details
  app.get('/api/colleges/:id', (req, res) => {
    try {
      const college = db.prepare('SELECT * FROM colleges WHERE id = ?').get(req.params.id);
      if (!college) {
        res.status(404).json({ error: 'College not found' });
        return;
      }
      const courses = db.prepare('SELECT * FROM courses WHERE college_id = ?').all(req.params.id);
      const reviews = db.prepare('SELECT * FROM reviews WHERE college_id = ?').all(req.params.id);
      res.json({ college, courses, reviews });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch college details' });
    }
  });


  // --- Vite Middleware for Development ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
