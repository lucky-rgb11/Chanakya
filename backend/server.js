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
        name: 'Cotton Kurta',
        image: 'https://images.unsplash.com/photo-1520975685569-6b1b6f8f6d9b?auto=format&fit=crop&w=800&q=80',
        category: 'Apparel',
        price: 799,
        description: 'Comfortable handloom cotton kurta for everyday wear.',
        stock: 30,
      },
      {
        _id: '2',
        name: 'Canvas Jhola Bag',
        image: 'https://images.unsplash.com/photo-1508337196892-7b0d3b0f0b2c?auto=format&fit=crop&w=800&q=80',
        category: 'Bags',
        price: 499,
        description: 'Durable canvas bag inspired by traditional Indian jholas.',
        stock: 25,
      },
      {
        _id: '3',
        name: 'Kolhapuri Chappal',
        image: 'https://images.unsplash.com/photo-1528701800489-476f7d3d4f3a?auto=format&fit=crop&w=800&q=80',
        category: 'Footwear',
        price: 1299,
        description: 'Handcrafted leather Kolhapuri chappals with classic styling.',
        stock: 20,
      },
      {
        _id: '4',
        name: 'Brass Diya Lamp',
        image: 'https://images.unsplash.com/photo-1556912990-9f8c1a1a6b4d?auto=format&fit=crop&w=800&q=80',
        category: 'Home',
        price: 399,
        description: 'Traditional brass diya to brighten your home during festivals.',
        stock: 40,
      },
    ];
    userStore = [{ _id: 'admin', name: 'Vibhor Sihag', email: 'vibhorsihag@gmail.com', password: bcrypt.hashSync('admin123', 10), isAdmin: true }];
  }
};

connectDB();

const seedData = async () => {
  if (dbReady) {
    const count = await Product.countDocuments();
    if (count === 0) {
      const products = [
          {
            name: 'Cotton Kurta',
            image: 'https://images.unsplash.com/photo-1520975685569-6b1b6f8f6d9b?auto=format&fit=crop&w=800&q=80',
            category: 'Apparel',
            price: 799,
            description: 'Comfortable handloom cotton kurta for everyday wear.',
            stock: 30,
          },
          {
            name: 'Canvas Jhola Bag',
            image: 'https://images.unsplash.com/photo-1508337196892-7b0d3b0f0b2c?auto=format&fit=crop&w=800&q=80',
            category: 'Bags',
            price: 499,
            description: 'Durable canvas bag inspired by traditional Indian jholas.',
            stock: 25,
          },
          {
            name: 'Kolhapuri Chappal',
            image: 'https://images.unsplash.com/photo-1528701800489-476f7d3d4f3a?auto=format&fit=crop&w=800&q=80',
            category: 'Footwear',
            price: 1299,
            description: 'Handcrafted leather Kolhapuri chappals with classic styling.',
            stock: 20,
          },
          {
            name: 'Brass Diya Lamp',
            image: 'https://images.unsplash.com/photo-1556912990-9f8c1a1a6b4d?auto=format&fit=crop&w=800&q=80',
            category: 'Home',
            price: 399,
            description: 'Traditional brass diya to brighten your home during festivals.',
            stock: 40,
          },
        ];

      await Product.insertMany(products);
    }

    const adminExists = await User.findOne({ email: 'vibhorsihag@gmail.com' });
    if (!adminExists) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({ name: 'Vibhor Sihag', email: 'vibhorsihag@gmail.com', password: hashed, isAdmin: true });
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

app.post('/api/orders', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const orderTotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  if (!dbReady) {
    return res.json({ success: true, message: 'Order placed successfully (fallback)', order: { items, total: orderTotal } });
  }

  res.json({ success: true, message: 'Order placed successfully', order: { items, total: orderTotal } });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
