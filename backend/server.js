import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jhola';

let dbReady = false;
let productStore = [];
let userStore = [];

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    dbReady = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB unavailable, using in-memory fallback:', error.message);
    productStore = [
      {
        _id: '1',
        name: 'Urban Tote',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        category: 'Bags',
        price: 49,
        description: 'A sleek everyday tote for commuting and errands.',
        stock: 18,
      },
      {
        _id: '2',
        name: 'Trail Backpack',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        category: 'Accessories',
        price: 79,
        description: 'Weather-ready backpack with plenty of storage.',
        stock: 12,
      },
      {
        _id: '3',
        name: 'Luna Sneakers',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
        category: 'Footwear',
        price: 89,
        description: 'Lightweight comfort sneakers with premium cushioning.',
        stock: 15,
      },
      {
        _id: '4',
        name: 'Glow Lamp',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        category: 'Home',
        price: 39,
        description: 'Warm ambient lighting for cozy corners.',
        stock: 9,
      },
    ];
    userStore = [{ _id: 'admin', name: 'Admin', email: 'admin@jhola.com', password: bcrypt.hashSync('admin123', 10), isAdmin: true }];
  }
};

connectDB();

const seedData = async () => {
  if (dbReady) {
    const count = await Product.countDocuments();
    if (count === 0) {
      const products = [
        {
          name: 'Urban Tote',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          category: 'Bags',
          price: 49,
          description: 'A sleek everyday tote for commuting and errands.',
          stock: 18,
        },
        {
          name: 'Trail Backpack',
          image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
          category: 'Accessories',
          price: 79,
          description: 'Weather-ready backpack with plenty of storage.',
          stock: 12,
        },
        {
          name: 'Luna Sneakers',
          image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
          category: 'Footwear',
          price: 89,
          description: 'Lightweight comfort sneakers with premium cushioning.',
          stock: 15,
        },
        {
          name: 'Glow Lamp',
          image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
          category: 'Home',
          price: 39,
          description: 'Warm ambient lighting for cozy corners.',
          stock: 9,
        },
      ];

      await Product.insertMany(products);
    }

    const adminExists = await User.findOne({ email: 'admin@jhola.com' });
    if (!adminExists) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({ name: 'Admin', email: 'admin@jhola.com', password: hashed, isAdmin: true });
    }
  }
};

seedData();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Jhola API is live' });
});

app.get('/api/products', async (req, res) => {
  const { search = '', category = '', maxPrice = '' } = req.query;

  if (!dbReady) {
    const filtered = productStore.filter((item) => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || item.category === category;
      const matchesPrice = !maxPrice || item.price <= Number(maxPrice);
      return matchesSearch && matchesCategory && matchesPrice;
    });
    return res.json(filtered);
  }

  const filters = {};

  if (search) {
    filters.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    filters.category = category;
  }

  if (maxPrice) {
    filters.price = { $lte: Number(maxPrice) };
  }

  const products = await Product.find(filters).sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!dbReady) {
    const user = userStore.find((item) => item.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1d',
  });

  res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
});

const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  if (!dbReady) {
    const product = { ...req.body, _id: `${Date.now()}` };
    productStore = [product, ...productStore];
    return res.status(201).json(product);
  }

  const product = await Product.create(req.body);
  res.status(201).json(product);
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  if (!dbReady) {
    productStore = productStore.map((item) => item._id === req.params.id ? { ...item, ...req.body } : item);
    return res.json(productStore.find((item) => item._id === req.params.id));
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  if (!dbReady) {
    productStore = productStore.filter((item) => item._id !== req.params.id);
    return res.json({ success: true });
  }

  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
