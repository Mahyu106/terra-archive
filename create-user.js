/* ============================================================
   create-user.js
   -------------------------------------------------------------
   Script sekali-jalan untuk membuat akun login (admin/viewer).
   Password otomatis di-hash, TIDAK disimpan polos di database.

   Cara pakai: node create-user.js
   Lalu ikuti pertanyaan yang muncul di terminal.
============================================================ */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'terra_archive'
  });

  const username = (await ask('Username: ')).trim();
  const password = await ask('Password: ');
  let role = (await ask('Role (admin/viewer): ')).trim().toLowerCase();

  if (role !== 'admin' && role !== 'viewer') {
    console.log('Role harus "admin" atau "viewer". Dibatalkan.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hash, role]
    );
    console.log(`✔ User "${username}" (${role}) berhasil dibuat!`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Username ini sudah dipakai. Coba username lain.');
    } else {
      console.error('Gagal membuat user:', err.message);
    }
  }

  process.exit(0);
}

main();
