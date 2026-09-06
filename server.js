const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'ganti-teks-ini-dengan-teks-rahasia-milikmu-sendiri',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // sesi bertahan 8 jam
}));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true }
});

// ============================================================
// MIDDLEWARE PENJAGA
// ============================================================
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Belum login.' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang boleh melakukan ini.' });
  }
  next();
}

// Penjaga khusus untuk halaman HTML (redirect, bukan JSON error)
function requireAuthPage(req, res, next) {
  if (!req.session.user) return res.redirect('/login.html');
  next();
}
function requireAdminPage(req, res, next) {
  if (!req.session.user) return res.redirect('/login.html');
  if (req.session.user.role !== 'admin') return res.redirect('/index.html');
  next();
}

// ============================================================
// AUTH — login, logout, cek sesi
// ============================================================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ success: true, username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, username: req.session.user.username, role: req.session.user.role });
  } else {
    res.json({ loggedIn: false });
  }
});

app.put('/api/account', requireAuth, async (req, res) => {
  const { newUsername, newPassword } = req.body;

  if (!newUsername && !newPassword) {
    return res.status(400).json({ error: 'Tidak ada perubahan yang diisi.' });
  }

  try {
    if (newUsername) {
      await pool.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, req.session.user.id]);
      req.session.user.username = newUsername;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.session.user.id]);
    }

    res.json({ success: true, username: req.session.user.username });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username ini sudah dipakai orang lain.' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
  }
});

// ============================================================
// HALAMAN — index.html bebas diakses siapa saja, admin.html tetap dijaga
// ============================================================
app.get('/admin.html', requireAdminPage, (req, res) => res.sendFile(__dirname + '/public/admin.html'));
app.get('/operators.html', requireAdminPage, (req, res) => res.sendFile(__dirname + '/public/operators.html'));

// ============================================================
// REGISTER — akun baru otomatis jadi role "viewer".
// Akun "admin" sengaja HANYA bisa dibuat lewat create-user.js
// (dijalankan manual di server), supaya orang lain tidak bisa
// mendaftar sendiri jadi admin.
// ============================================================
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hash, 'viewer']
    );
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username ini sudah dipakai.' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
  }
});

// ============================================================
// API DATA — GET boleh siapa saja (termasuk yang belum login),
// tulis-data (POST/PUT/DELETE) tetap khusus admin
// ============================================================
app.get('/api/entities', async (req, res) => {
  const [entities] = await pool.query('SELECT * FROM entities');
  const [paragraphs] = await pool.query('SELECT * FROM lore_paragraphs ORDER BY paragraph_order');
  const [operators] = await pool.query('SELECT * FROM operators');

  const result = entities.map(e => ({
    ...e,
    lore: paragraphs.filter(p => p.entity_id === e.id).map(p => p.content),
    operators: operators.filter(o => o.entity_id === e.id)
  }));

  res.json(result);
});

app.post('/api/entities', requireAdmin, async (req, res) => {
  const { id, name, category, region, pos_x, pos_y, lore } = req.body;

  if (!id || !name || !category) {
    return res.status(400).json({ error: 'ID, nama, dan kategori wajib diisi.' });
  }

  try {
    await pool.query(
      'INSERT INTO entities (id, name, category, region, pos_x, pos_y) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, category, region || null, pos_x ?? null, pos_y ?? null]
    );

    for (let i = 0; i < (lore || []).length; i++) {
      await pool.query(
        'INSERT INTO lore_paragraphs (entity_id, paragraph_order, content) VALUES (?, ?, ?)',
        [id, i, lore[i]]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'ID ini sudah dipakai entitas lain.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/entities/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, category, region, pos_x, pos_y, lore } = req.body;

  try {
    await pool.query(
      'UPDATE entities SET name=?, category=?, region=?, pos_x=?, pos_y=? WHERE id=?',
      [name, category, region || null, pos_x ?? null, pos_y ?? null, id]
    );

    await pool.query('DELETE FROM lore_paragraphs WHERE entity_id=?', [id]);
    for (let i = 0; i < (lore || []).length; i++) {
      await pool.query(
        'INSERT INTO lore_paragraphs (entity_id, paragraph_order, content) VALUES (?, ?, ?)',
        [id, i, lore[i]]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/entities/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM lore_paragraphs WHERE entity_id=?', [id]);
    await pool.query('DELETE FROM entities WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/operators', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM operators ORDER BY entity_id, name');
  res.json(rows);
});

app.post('/api/operators', requireAdmin, async (req, res) => {
  const { entity_id, name, image_url, detail_image_url, description, connection_type, connection_description } = req.body;

  if (!entity_id || !name) {
    return res.status(400).json({ error: 'Entitas dan nama operator wajib diisi.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO operators (entity_id, name, image_url, detail_image_url, description, connection_type, connection_description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [entity_id, name, image_url || null, detail_image_url || null, description || null, connection_type || null, connection_description || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/operators/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { entity_id, name, image_url, detail_image_url, description, connection_type, connection_description } = req.body;

  try {
    await pool.query(
      'UPDATE operators SET entity_id=?, name=?, image_url=?, detail_image_url=?, description=?, connection_type=?, connection_description=? WHERE id=?',
      [entity_id, name, image_url || null, detail_image_url || null, description || null, connection_type || null, connection_description || null, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/operators/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM operators WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static('public'));

app.listen(3000, () => console.log('Server jalan di http://localhost:3000'));
