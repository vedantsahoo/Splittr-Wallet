import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../splittr.db');
const db = new Database(dbPath);
// Enable foreign keys
db.pragma('foreign_keys = ON');
// Initialize database schema
export function initDB() {
    // Drop and recreate if schema is outdated (e.g. no contacts table)
    try {
        db.prepare('SELECT 1 FROM contacts LIMIT 1').get();
    }
    catch (e) {
        console.log('Outdated schema or new database. Recreating tables...');
        db.exec(`
      DROP TABLE IF EXISTS contacts;
      DROP TABLE IF EXISTS group_expense_shares;
      DROP TABLE IF EXISTS group_expenses;
      DROP TABLE IF EXISTS group_members;
      DROP TABLE IF EXISTS groups;
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS wallet_balances;
      DROP TABLE IF EXISTS savings_goals;
      DROP TABLE IF EXISTS users;
    `);
    }
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      wallet_id TEXT,
      password TEXT NOT NULL DEFAULT 'password123',
      daily_limit REAL DEFAULT 500000,
      monthly_limit REAL DEFAULT 5000000
    );

    CREATE TABLE IF NOT EXISTS wallet_balances (
      user_id TEXT NOT NULL,
      currency TEXT NOT NULL,
      symbol TEXT NOT NULL,
      amount REAL NOT NULL,
      flag TEXT NOT NULL,
      PRIMARY KEY (user_id, currency),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'wallet_funding', 'received', 'sent', 'withdrawal', 'group_expense', 'group_settlement'
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      sender_name TEXT,
      recipient_name TEXT,
      user_avatar TEXT,
      group_name TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      currency TEXT NOT NULL,
      total_expenses REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id TEXT,
      member_id TEXT,
      name TEXT NOT NULL,
      initials TEXT NOT NULL,
      balance REAL DEFAULT 0,
      PRIMARY KEY (group_id, member_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_expenses (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_by TEXT NOT NULL, -- member_id
      paid_by_name TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      split_type TEXT DEFAULT 'equal',
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_expense_shares (
      expense_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      amount REAL NOT NULL,
      PRIMARY KEY (expense_id, member_id),
      FOREIGN KEY (expense_id) REFERENCES group_expenses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target REAL NOT NULL,
      current REAL NOT NULL,
      currency TEXT NOT NULL,
      color TEXT,
      deadline TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      initials TEXT NOT NULL,
      color TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
    // Seed default users if not exists
    const userExists = db.prepare('SELECT 1 FROM users WHERE id = ?').get('1');
    if (!userExists) {
        const insertUser = db.prepare(`
      INSERT INTO users (id, name, avatar, email, phone, wallet_id, password, daily_limit, monthly_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        insertUser.run('1', 'Vedant Sahu', 'https://avatars.githubusercontent.com/u/156448866?v=4', 'vedantvibhusahu1234567@gmail.com', '+91 7007248526', 'SW-7007248526', 'ved123', 500000, 5000000);
        insertUser.run('2', 'Animesh Sahu', null, 'Sahuanimesh6690@gmail.com', '+91 6306207782', 'SW-6306207782', 'ani6690', 500000, 5000000);
        insertUser.run('3', 'Priya Kapoor', null, 'priya@gmail.com', '+91 8888888888', 'SW-22222222', 'priya123', 500000, 5000000);
        insertUser.run('4', 'Amit Verma', null, 'amit@gmail.com', '+91 7777777777', 'SW-33333333', 'amit123', 500000, 5000000);
        insertUser.run('5', 'Sneha Gupta', null, 'sneha@gmail.com', '+91 6666666666', 'SW-44444444', 'sneha123', 500000, 5000000);
        insertUser.run('6', 'Neha Patel', null, 'neha@gmail.com', '+91 5555555555', 'SW-55555555', 'neha123', 500000, 5000000);
    }
    // Seed default balances if not exists
    const balanceCount = db.prepare('SELECT COUNT(*) as count FROM wallet_balances').get();
    if (balanceCount.count === 0) {
        const insertBal = db.prepare('INSERT INTO wallet_balances (user_id, currency, symbol, amount, flag) VALUES (?, ?, ?, ?, ?)');
        // User 1
        insertBal.run('1', 'INR', '₹', 695730.50, '🇮🇳');
        insertBal.run('1', 'USD', '$', 1250.0, '🇺🇸');
        insertBal.run('1', 'EUR', '€', 890.75, '🇪🇺');
        // User 2
        insertBal.run('2', 'INR', '₹', 150000.0, '🇮🇳');
        insertBal.run('2', 'USD', '$', 500.0, '🇺🇸');
        insertBal.run('2', 'EUR', '€', 200.0, '🇪🇺');
        // Seed for remaining users
        for (let id = 3; id <= 6; id++) {
            insertBal.run(id.toString(), 'INR', '₹', 50000.0, '🇮🇳');
            insertBal.run(id.toString(), 'USD', '$', 300.0, '🇺🇸');
            insertBal.run(id.toString(), 'EUR', '€', 100.0, '🇪🇺');
        }
    }
    // Seed default transactions if not exists
    const transactionCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
    if (transactionCount.count === 0) {
        const insertTx = db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, currency, description, date, category, status, sender_name, recipient_name, user_avatar, group_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        // User 1 default transactions
        insertTx.run('1', '1', 'wallet_funding', 670250, 'INR', 'Added via UPI', '2026-06-19', 'Wallet', 'completed', null, null, null, null);
        insertTx.run('2', '1', 'received', 5000, 'INR', 'From Rahul Sharma', '2026-06-16', 'Transfer', 'completed', 'Rahul Sharma', null, 'RS', null);
        insertTx.run('3', '1', 'group_expense', 1800, 'INR', 'Dinner at Biryani House', '2026-06-15', 'Food', 'completed', null, null, null, 'Flatmates');
        insertTx.run('4', '1', 'sent', 2500, 'INR', 'To Priya Kapoor', '2026-06-14', 'Transfer', 'completed', null, 'Priya Kapoor', 'PK', null);
        insertTx.run('5', '1', 'wallet_funding', 10000, 'INR', 'Added via UPI', '2026-06-12', 'Wallet', 'completed', null, null, null, null);
        insertTx.run('6', '1', 'group_expense', 4500, 'INR', 'Goa Trip - Hotel Booking', '2026-06-10', 'Travel', 'completed', null, null, null, 'Goa Trip');
        insertTx.run('7', '1', 'sent', 1200, 'INR', 'To Amit Verma', '2026-06-08', 'Transfer', 'completed', null, 'Amit Verma', 'AV', null);
        insertTx.run('8', '1', 'group_settlement', 600, 'INR', 'Settled with Rahul', '2026-06-07', 'Settlement', 'completed', null, 'Rahul Sharma', null, null);
        insertTx.run('9', '1', 'received', 3500, 'INR', 'From Sneha Gupta', '2026-06-05', 'Transfer', 'completed', 'Sneha Gupta', null, 'SG', null);
        insertTx.run('10', '1', 'group_expense', 2200, 'INR', 'Movie Night - IMAX Tickets', '2026-06-03', 'Entertainment', 'completed', null, null, null, 'College Friends');
        insertTx.run('11', '1', 'withdrawal', 5000, 'INR', 'Withdrawn to Bank', '2026-06-01', 'Wallet', 'completed', null, null, null, null);
        // Basic wallet funding transaction for others
        for (let id = 2; id <= 6; id++) {
            insertTx.run(`t-${id}`, id.toString(), 'wallet_funding', 50000, 'INR', 'Initial Balance Seeding', '2026-06-01', 'Wallet', 'completed', null, null, null, null);
        }
    }
    // Seed default groups if not exists
    const groupCount = db.prepare('SELECT COUNT(*) as count FROM groups').get();
    if (groupCount.count === 0) {
        // Group 1
        db.prepare('INSERT INTO groups (id, name, icon, color, currency, total_expenses) VALUES (?, ?, ?, ?, ?, ?)')
            .run('1', 'Flatmates', '🏠', '#10B981', 'INR', 5000);
        const insertMember = db.prepare('INSERT INTO group_members (group_id, member_id, name, initials, balance) VALUES (?, ?, ?, ?, ?)');
        insertMember.run('1', '1', 'You', 'VS', 1250);
        insertMember.run('1', '2', 'Rahul Sharma', 'RS', -1250);
        insertMember.run('1', '3', 'Priya Kapoor', 'PK', 0);
        insertMember.run('1', '4', 'Amit Verma', 'AV', 0);
        const insertExpense = db.prepare(`
      INSERT INTO group_expenses (id, group_id, description, amount, paid_by, paid_by_name, date, category, split_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const insertShare = db.prepare('INSERT INTO group_expense_shares (expense_id, member_id, member_name, amount) VALUES (?, ?, ?, ?)');
        insertExpense.run('e1', '1', 'Dinner at Biryani House', 1800, '2', 'Rahul Sharma', '2026-06-15', 'Food & Dining', 'equal');
        insertShare.run('e1', '1', 'You', 450);
        insertShare.run('e1', '2', 'Rahul Sharma', 450);
        insertShare.run('e1', '3', 'Priya Kapoor', 450);
        insertShare.run('e1', '4', 'Amit Verma', 450);
        insertExpense.run('e2', '1', 'Monthly Groceries', 3200, '1', 'You', '2026-06-10', 'Groceries', 'equal');
        insertShare.run('e2', '1', 'You', 800);
        insertShare.run('e2', '2', 'Rahul Sharma', 800);
        insertShare.run('e2', '3', 'Priya Kapoor', 800);
        insertShare.run('e2', '4', 'Amit Verma', 800);
        // Group 2
        db.prepare('INSERT INTO groups (id, name, icon, color, currency, total_expenses) VALUES (?, ?, ?, ?, ?, ?)')
            .run('2', 'Goa Trip', '🏖️', '#10B981', 'INR', 14400);
        insertMember.run('2', '1', 'You', 'VS', -2200);
        insertMember.run('2', '2', 'Rahul Sharma', 'RS', 2200);
        insertMember.run('2', '5', 'Sneha Gupta', 'SG', 0);
        insertExpense.run('e3', '2', 'Hotel Booking - 3 Nights', 12000, '2', 'Rahul Sharma', '2026-06-10', 'Travel', 'equal');
        insertShare.run('e3', '1', 'You', 4000);
        insertShare.run('e3', '2', 'Rahul Sharma', 4000);
        insertShare.run('e3', '5', 'Sneha Gupta', 4000);
        insertExpense.run('e4', '2', 'Scooter Rental', 2400, '1', 'You', '2026-06-08', 'Transportation', 'equal');
        insertShare.run('e4', '1', 'You', 800);
        insertShare.run('e4', '2', 'Rahul Sharma', 800);
        insertShare.run('e4', '5', 'Sneha Gupta', 800);
        // Group 3
        db.prepare('INSERT INTO groups (id, name, icon, color, currency, total_expenses) VALUES (?, ?, ?, ?, ?, ?)')
            .run('3', 'College Friends', '🎓', '#F59E0B', 'INR', 3300);
        insertMember.run('3', '1', 'You', 'VS', 550);
        insertMember.run('3', '2', 'Rahul Sharma', 'RS', 0);
        insertMember.run('3', '6', 'Neha Patel', 'NP', -550);
        insertExpense.run('e5', '3', 'Movie Night - IMAX Tickets', 3300, '1', 'You', '2026-06-03', 'Entertainment', 'equal');
        insertShare.run('e5', '1', 'You', 1100);
        insertShare.run('e5', '2', 'Rahul Sharma', 1100);
        insertShare.run('e5', '6', 'Neha Patel', 1100);
        // Group 4
        db.prepare('INSERT INTO groups (id, name, icon, color, currency, total_expenses) VALUES (?, ?, ?, ?, ?, ?)')
            .run('4', 'Birthday Bash', '🎉', '#EC4899', 'INR', 0);
        insertMember.run('4', '1', 'You', 'VS', 0);
        insertMember.run('4', '3', 'Priya Kapoor', 'PK', 0);
        insertMember.run('4', '5', 'Sneha Gupta', 'SG', 0);
    }
    // Seed default savings goals if not exists
    const goalCount = db.prepare('SELECT COUNT(*) as count FROM savings_goals').get();
    if (goalCount.count === 0) {
        const insertGoal = db.prepare('INSERT INTO savings_goals (id, user_id, name, target, current, currency, color, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        insertGoal.run('1', '1', 'New iPhone', 90000, 45000, 'INR', '#10B981', '2026-09-01');
        insertGoal.run('2', '1', 'Goa Trip Fund', 30000, 22000, 'INR', '#10B981', '2026-07-15');
        insertGoal.run('3', '1', 'Emergency Fund', 100000, 35000, 'INR', '#F59E0B', null);
        insertGoal.run('4', '2', 'Emergency Fund', 50000, 10000, 'INR', '#F59E0B', null);
    }
    // Seed default contacts if not exists
    const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get();
    if (contactCount.count === 0) {
        const insertContact = db.prepare('INSERT INTO contacts (id, user_id, name, phone, initials, color) VALUES (?, ?, ?, ?, ?, ?)');
        insertContact.run('c1', '1', 'Animesh Sahu', '+91 6306207782', 'AS', '#10B981');
        insertContact.run('c2', '1', 'Vaishnavi Gupta', '+91 9118761113', 'VG', '#14B8A6');
        insertContact.run('c3', '1', 'Aradhana Chaudhary', '+91 9454420370', 'AC', '#9966FF');
        insertContact.run('c4', '1', 'Sanjeevni Singh', '+91 8004698021', 'SS', '#10B981');
        insertContact.run('c5', '1', 'Ansh Verma', '+91 76543 21098', 'AV', '#F59E0B');
        insertContact.run('c6', '1', 'Neha Singh', '+91 65432 10987', 'NS', '#EF4444');
        insertContact.run('c7', '1', 'Siddhima Saxena', '+91 9479202055', 'SS', '#0D9488');
        insertContact.run('c8', '1', 'Siddharth Srivastav', '+91 8120860675', 'SS', '#EC4899');
        insertContact.run('c9', '1', 'Anamika Yadav', '+91 8109152336', 'AY', '#3B82F6');
    }
}
export default db;
