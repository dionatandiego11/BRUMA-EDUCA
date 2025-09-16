import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database('/tmp/database.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    // Schools
    db.run(`CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`);

    // Grades (Séries)
    db.run(`CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      school_id INTEGER NOT NULL,
      FOREIGN KEY (school_id) REFERENCES schools (id)
    )`);

    // Classes (Turmas)
    db.run(`CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grade_id INTEGER NOT NULL,
      FOREIGN KEY (grade_id) REFERENCES grades (id)
    )`);

    // Students
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      class_id INTEGER NOT NULL,
      FOREIGN KEY (class_id) REFERENCES classes (id)
    )`);

    // Teachers
    db.run(`CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`);

    // Subjects
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`);

    // Scores
    db.run(`CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      question_code TEXT NOT NULL,
      score INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students (id),
      FOREIGN KEY (teacher_id) REFERENCES teachers (id),
      FOREIGN KEY (subject_id) REFERENCES subjects (id)
    )`);

    console.log('Tables created or already exist.');
  });
}

// API Routes

// --- Schools ---
app.get('/api/schools', (req, res) => {
  db.all('SELECT * FROM schools ORDER BY name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post('/api/schools', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'School name is required' });
  }
  db.run('INSERT INTO schools (name) VALUES (?)', [name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

// --- Classes ---
app.get('/api/classes', (req, res) => {
    const { grade_id } = req.query;
    if (!grade_id) {
        return res.status(400).json({ error: 'grade_id query parameter is required' });
    }
    db.all('SELECT * FROM classes WHERE grade_id = ? ORDER BY name', [grade_id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

app.get('/api/classes/all', (req, res) => {
    db.all('SELECT * FROM classes ORDER BY name', [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json({ data: rows });
    });
});

app.post('/api/classes', (req, res) => {
    const { name, grade_id } = req.body;
    if (!name || !grade_id) {
        return res.status(400).json({ error: 'Class name and grade_id are required' });
    }
    db.run('INSERT INTO classes (name, grade_id) VALUES (?, ?)', [name, grade_id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
});

// --- Students ---
app.get('/api/students', (req, res) => {
    const { class_id } = req.query;
    if (!class_id) {
        return res.status(400).json({ error: 'class_id query parameter is required' });
    }
    db.all('SELECT * FROM students WHERE class_id = ? ORDER BY name', [class_id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

app.post('/api/students', (req, res) => {
    const { name, class_id } = req.body;
    if (!name || !class_id) {
        return res.status(400).json({ error: 'Student name and class_id are required' });
    }
    db.run('INSERT INTO students (name, class_id) VALUES (?, ?)', [name, class_id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
});

// --- Teachers, Subjects, Scores (simplified for now) ---
app.get('/api/teachers', (req, res) => {
    db.all('SELECT * FROM teachers ORDER BY name', [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json({ data: rows });
    });
});

app.post('/api/teachers', (req, res) => {
    const { name } = req.body;
    if (!name) { return res.status(400).json({ error: 'Teacher name is required' }); }
    db.run('INSERT INTO teachers (name) VALUES (?)', [name], function(err) {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.status(201).json({ id: this.lastID });
    });
});

app.get('/api/subjects', (req, res) => {
    db.all('SELECT * FROM subjects ORDER BY name', [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json({ data: rows });
    });
});

app.post('/api/subjects', (req, res) => {
    const { name } = req.body;
    if (!name) { return res.status(400).json({ error: 'Subject name is required' }); }
    db.run('INSERT INTO subjects (name) VALUES (?)', [name], function(err) {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.status(201).json({ id: this.lastID });
    });
});

app.get('/api/grades/all', (req, res) => {
    db.all('SELECT * FROM grades ORDER BY name', [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json({ data: rows });
    });
});

app.get('/api/scores', (req, res) => {
    const query = `
        SELECT
            s.id,
            st.name as student,
            t.name as teacher,
            sub.name as subject,
            sch.name as school,
            g.name as grade,
            s.question_code,
            s.score,
            s.date
        FROM scores s
        JOIN students st ON s.student_id = st.id
        JOIN teachers t ON s.teacher_id = t.id
        JOIN subjects sub ON s.subject_id = sub.id
        JOIN classes c ON st.class_id = c.id
        JOIN grades g ON c.grade_id = g.id
        JOIN schools sch ON g.school_id = sch.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json({ data: rows });
    });
});

app.post('/api/scores', (req, res) => {
    const { student_id, teacher_id, subject_id, question_code, score } = req.body;
    if (!student_id || !teacher_id || !subject_id || !question_code || score === undefined) {
        return res.status(400).json({ error: 'All score fields are required' });
    }
    const date = new Date().toISOString();
    db.run('INSERT INTO scores (student_id, teacher_id, subject_id, question_code, score, date) VALUES (?, ?, ?, ?, ?, ?)',
        [student_id, teacher_id, subject_id, question_code, score, date], function(err) {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.status(201).json({ id: this.lastID });
    });
});

// --- Grades ---
app.get('/api/grades', (req, res) => {
  const { school_id } = req.query;
  if (!school_id) {
    return res.status(400).json({ error: 'school_id query parameter is required' });
  }
  db.all('SELECT * FROM grades WHERE school_id = ? ORDER BY name', [school_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post('/api/grades', (req, res) => {
  const { name, school_id } = req.body;
  if (!name || !school_id) {
    return res.status(400).json({ error: 'Grade name and school_id are required' });
  }
  db.run('INSERT INTO grades (name, school_id) VALUES (?, ?)', [name, school_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
