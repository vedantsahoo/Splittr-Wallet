import db from '../db.js';
// In-memory active user session tracker (defaults to null for redirecting to login by default)
let currentUserId = null;
export function getCurrentUserId() {
    return currentUserId;
}
// GET /api/auth/me
export const getMe = (req, res) => {
    try {
        if (!currentUserId) {
            return res.json({ isAuthenticated: false, user: null });
        }
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId);
        if (!user) {
            currentUserId = null;
            return res.json({ isAuthenticated: false, user: null });
        }
        res.json({
            user: {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                email: user.email,
                phone: user.phone,
                walletId: user.wallet_id,
            },
            dailyLimit: user.daily_limit,
            monthlyLimit: user.monthly_limit,
            isAuthenticated: true
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// POST /api/auth/login
export const login = (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Look up user by email
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            // Specifically return unregistered error status to prompt signup redirect in UI
            return res.status(404).json({ error: 'unregistered', message: 'Email is not registered. Please sign up.' });
        }
        // Match password
        if (user.password !== password) {
            return res.status(401).json({ error: 'invalid_password', message: 'Incorrect password. Please try again.' });
        }
        // Set session active user
        currentUserId = user.id;
        res.json({
            user: {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                email: user.email,
                phone: user.phone,
                walletId: user.wallet_id,
            },
            dailyLimit: user.daily_limit,
            monthlyLimit: user.monthly_limit,
            isAuthenticated: true
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// POST /api/auth/register
export const register = (req, res) => {
    const { firstName, lastName, phone, email, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: 'all_fields_required', message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'passwords_mismatch', message: 'Passwords do not match' });
    }
    const registerTransaction = db.transaction(() => {
        // Check if email already registered
        const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
        if (existing) {
            throw new Error('email_taken');
        }
        const newUserId = Date.now().toString();
        const walletId = `SW-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const fullName = `${firstName} ${lastName}`;
        // 1. Insert user
        db.prepare(`
      INSERT INTO users (id, name, email, phone, wallet_id, password, daily_limit, monthly_limit)
      VALUES (?, ?, ?, ?, ?, ?, 500000, 5000000)
    `).run(newUserId, fullName, email, phone, walletId, password);
        // 2. Seed starter balances for the new user
        const insertBal = db.prepare('INSERT INTO wallet_balances (user_id, currency, symbol, amount, flag) VALUES (?, ?, ?, ?, ?)');
        insertBal.run(newUserId, 'INR', '₹', 10000.0, '🇮🇳');
        insertBal.run(newUserId, 'USD', '$', 100.0, '🇺🇸');
        insertBal.run(newUserId, 'EUR', '€', 50.0, '🇪🇺');
        // 3. Add new user as a contact to all existing users, and add existing users as contacts to new user
        const allExistingUsers = db.prepare('SELECT * FROM users WHERE id != ?').all(newUserId);
        const insertContact = db.prepare('INSERT INTO contacts (id, user_id, name, phone, initials, color) VALUES (?, ?, ?, ?, ?, ?)');
        const colors = ['#10B981', '#9966FF', '#F59E0B', '#EF4444', '#0D9488', '#EC4899', '#3B82F6', '#14B8A6'];
        allExistingUsers.forEach(u => {
            // Add the new user to this existing user's contacts
            const newInitials = firstName[0] + (lastName ? lastName[0] : '');
            const color1 = colors[Math.floor(Math.random() * colors.length)];
            insertContact.run(`c-${u.id}-${newUserId}`, u.id, fullName, phone, newInitials.toUpperCase(), color1);
            // Add this existing user to the new user's contacts
            const initials = u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
            const color2 = colors[Math.floor(Math.random() * colors.length)];
            insertContact.run(`c-${newUserId}-${u.id}`, newUserId, u.name, u.phone || '', initials, color2);
        });
        // 4. Insert welcome funding transaction
        db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, currency, description, date, category, status)
      VALUES (?, ?, 'wallet_funding', 10000, 'INR', 'Welcome Bonus Added', ?, 'Wallet', 'completed')
    `).run(`welcome-${newUserId}`, newUserId, new Date().toISOString().split('T')[0]);
        return { id: newUserId, name: fullName, email, phone, walletId };
    });
    try {
        const newUser = registerTransaction();
        // Auto login after registration
        currentUserId = newUser.id;
        res.json({
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                walletId: newUser.walletId,
            },
            dailyLimit: 500000,
            monthlyLimit: 5000000,
            isAuthenticated: true
        });
    }
    catch (error) {
        if (error.message === 'email_taken') {
            return res.status(400).json({ error: 'email_taken', message: 'Email address is already in use' });
        }
        res.status(500).json({ error: 'registration_failed', message: error.message });
    }
};
// POST /api/auth/logout
export const logout = (req, res) => {
    currentUserId = null;
    res.json({ success: true });
};
// PUT /api/auth/profile
export const updateProfile = (req, res) => {
    try {
        if (!currentUserId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { name, email, phone, avatar } = req.body;
        db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name), 
          email = COALESCE(?, email), 
          phone = COALESCE(?, phone), 
          avatar = COALESCE(?, avatar) 
      WHERE id = ?
    `).run(name || null, email || null, phone || null, avatar || null, currentUserId);
        const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId);
        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            avatar: updatedUser.avatar,
            email: updatedUser.email,
            phone: updatedUser.phone,
            walletId: updatedUser.wallet_id,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// PUT /api/auth/limits
export const updateLimits = (req, res) => {
    try {
        if (!currentUserId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { dailyLimit, monthlyLimit } = req.body;
        db.prepare('UPDATE users SET daily_limit = ?, monthly_limit = ? WHERE id = ?')
            .run(dailyLimit, monthlyLimit, currentUserId);
        res.json({ dailyLimit, monthlyLimit });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
