const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions)); // includes pre-flight OPTIONS handling

// ── View Engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // support PUT & DELETE from HTML forms

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ───────────────────────────────────────────────────────────────────
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const apiCarRoutes = require('./routes/apiCarRoutes');
const apiBookingRoutes = require('./routes/apiBookingRoutes');
const authRoutes = require('./routes/authRoutes');

// View routes
app.get('/', (req, res) => res.render('index', { title: 'Home' }));
app.use('/cars', carRoutes);
app.use('/bookings', bookingRoutes);

// Auth view routes
app.get('/auth/login', (req, res) => res.render('auth/login', { title: 'Đăng nhập' }));
app.get('/auth/register', (req, res) => res.render('auth/register', { title: 'Đăng ký' }));

// Admin view routes
app.get('/admin/users', (req, res) => res.render('admin/users', { title: 'Quản lý Users' }));

// REST API routes (JSON)
app.use('/api/auth', authRoutes);
app.use('/api/cars', apiCarRoutes);
app.use('/api/bookings', apiBookingRoutes);

// ── MongoDB Connection ───────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/viet_car_rental';

mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
    }
    res.status(404).render('error', { message: `Page not found: ${req.originalUrl}` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(500).json({ error: err.message });
    }
    res.status(500).render('error', { message: err.message });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
