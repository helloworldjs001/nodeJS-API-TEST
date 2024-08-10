const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const app = express();
const PORT = 3000;

app.use(express.json());

const secretKey = 'your_secret_key';

let users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', password: bcrypt.hashSync('password1', 8) },
    { id: 2, name: 'Bob', email: 'bob@example.com', password: bcrypt.hashSync('password2', 8) },
];

// Authentication Route
app.post('/api/auth/login', [
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).send('User not found');

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) return res.status(401).send('Invalid password');

    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: 86400 });
    res.json({ auth: true, token });
});

// Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).send('No token provided');

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token');
        req.userId = decoded.id;
        next();
    });
}

// Get all users
app.get('/api/users', verifyToken, (req, res) => {
    res.json(users);
});

// Get user by ID
app.get('/api/users/:id', verifyToken, (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');
    res.json(user);
});

// Create new user
app.post('/api/users', verifyToken, [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    const user = {
        id: users.length + 1,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    };
    users.push(user);
    res.status(201).json(user);
});

// Update user by ID
app.put('/api/users/:id', verifyToken, [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');

    user.name = req.body.name;
    user.email = req.body.email;
    if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 8);
    }
    res.json(user);
});

// Delete user by ID
app.delete('/api/users/:id', verifyToken, (req, res) => {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) return res.status(404).send('User not found');

    users.splice(userIndex, 1);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
