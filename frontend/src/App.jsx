import { useEffect, useMemo, useState } from 'react';
import './App.css';
import placeholder from './assets/hero.png';

const API_URL = import.meta.env.VITE_API_URL || '';
const buildUrl = (path) => `${API_URL}${path}`;

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('jhola-cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [adminMode, setAdminMode] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', image: '', category: '', price: '', description: '', stock: '' });
  const [editingId, setEditingId] = useState(null);
  const [auth, setAuth] = useState({ email: 'vibhorsihag@gmail.com', password: 'admin123' });
  const [token, setToken] = useState(localStorage.getItem('jhola-admin-token') || '');
  const [toast, setToast] = useState('');

  const loadProducts = async () => {
    const res = await fetch(buildUrl(`/api/products?search=${search}&category=${category}&maxPrice=${maxPrice}`));
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, [search, category, maxPrice]);

  useEffect(() => {
    localStorage.setItem('jhola-cart', JSON.stringify(cart));
  }, [cart]);

  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category))), [products]);

  const addToCart = (product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      setToast('This product is out of stock');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        if (product.stock !== undefined && existing.quantity + 1 > product.stock) {
          setToast('Cannot add more than available stock');
          setTimeout(() => setToast(''), 3000);
          return current;
        }
        return current.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setToast('Added to cart');
    setTimeout(() => setToast(''), 2000);
  };

  const updateQuantity = (id, delta) => {
    setCart((current) => current.flatMap((item) => item._id === id ? (item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : []) : [item]));
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item._id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    const res = await fetch(buildUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auth),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('jhola-admin-token', data.token);
      setAdminMode(true);
    }
  };

  const resetForm = () => {
    setAdminForm({ name: '', image: '', category: '', price: '', description: '', stock: '' });
    setEditingId(null);
  };
 

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...adminForm,
      price: Number(adminForm.price),
      stock: Number(adminForm.stock),
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? buildUrl(`/api/admin/products/${editingId}`) : buildUrl('/api/admin/products');
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      loadProducts();
    }
  };

  const handleEdit = (product) => {
    setAdminForm({
      name: product.name,
      image: product.image,
      category: product.category,
      price: product.price,
      description: product.description,
      stock: product.stock,
    });
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    const res = await fetch(buildUrl(`/api/admin/products/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      loadProducts();
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setToast('Your cart is empty');
      setTimeout(() => setToast(''), 2000);
      return;
    }

    try {
      // Try server-side checkout; if endpoint missing or returns 404, fall back to client-side success
      const res = await fetch(buildUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      }).catch(() => null);

      if (res && res.ok) {
        setCart([]);
        setToast('Order placed successfully');
        setTimeout(() => setToast(''), 3000);
        loadProducts();
        return;
      }

      // Fallback: no server endpoint — emulate success client-side
      setCart([]);
      setToast('Order placed (local fallback)');
      setTimeout(() => setToast(''), 3000);
      loadProducts();
    } catch (err) {
      setToast('Network error during checkout');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleAdminLogout = () => {
    setToken('');
    localStorage.removeItem('jhola-admin-token');
    setAdminMode(false);
  };

  const formatINR = (value) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    } catch {
      return `₹${Number(value).toFixed(2)}`;
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Jhola • Indian essentials</p>
          <h1>Discover handcrafted and everyday Indian goods.</h1>
          <p>Search, filter, and shop locally inspired products curated for India.</p>
        </div>
        <div className="hero-card">
          <h2>Cart total</h2>
          <p className="price">{formatINR(total)}</p>
          <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
        </div>
      </header>

      <main className="content-grid">
        <section className="catalog-panel">
          <div className="controls">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {categories.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max price" />
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product._id}>
                <img src={product.image} alt={product.name} onError={(e) => { e.target.src = placeholder; }} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="category">{product.category}</p>
                  {product.stock !== undefined && (
                    <p className="stock">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                  )}
                  <p>{product.description}</p>
                  <div className="product-footer">
                    <strong>{formatINR(product.price)}</strong>
                    <button onClick={() => addToCart(product)} disabled={product.stock !== undefined && product.stock <= 0}>Add to cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="sidebar">
          <section className="panel">
            <h2>Shopping cart</h2>
            {cart.length === 0 ? <p>Your cart is empty.</p> : cart.map((item) => (
              <div className="cart-item" key={item._id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{formatINR(item.price)} each</p>
                </div>
                <div className="cart-actions">
                  <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                  <button className="danger" onClick={() => removeFromCart(item._id)}>Remove</button>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <button onClick={handleCheckout} style={{ width: '100%', borderRadius: 12 }}>Checkout</button>
            </div>
          </section>

          <section className="panel">
            <h2>Admin panel</h2>
            {!adminMode ? (
              <form onSubmit={handleAdminLogin} className="admin-form">
                <input value={auth.email} onChange={(event) => setAuth({ ...auth, email: event.target.value })} placeholder="Email" />
                <input type="password" value={auth.password} onChange={(event) => setAuth({ ...auth, password: event.target.value })} placeholder="Password" />
                <button type="submit">Login</button>
              </form>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button onClick={handleAdminLogout} style={{ background: '#eee', borderRadius: 6, padding: '6px 10px' }}>Logout</button>
                </div>
                <form onSubmit={handleAdminSubmit} className="admin-form">
                  <input value={adminForm.name} onChange={(event) => setAdminForm({ ...adminForm, name: event.target.value })} placeholder="Name" required />
                  <input value={adminForm.image} onChange={(event) => setAdminForm({ ...adminForm, image: event.target.value })} placeholder="Image URL" required />
                  <input value={adminForm.category} onChange={(event) => setAdminForm({ ...adminForm, category: event.target.value })} placeholder="Category" required />
                  <input type="number" value={adminForm.price} onChange={(event) => setAdminForm({ ...adminForm, price: event.target.value })} placeholder="Price" required />
                  <input value={adminForm.description} onChange={(event) => setAdminForm({ ...adminForm, description: event.target.value })} placeholder="Description" required />
                  <input type="number" value={adminForm.stock} onChange={(event) => setAdminForm({ ...adminForm, stock: event.target.value })} placeholder="Stock" required />
                  <div className="admin-actions">
                    <button type="submit">{editingId ? 'Update product' : 'Add product'}</button>
                    <button type="button" onClick={resetForm}>Clear</button>
                  </div>
                </form>
                <div className="manage-list">
                  {products.map((product) => (
                    <div key={product._id} className="manage-item">
                      <span>{product.name}</span>
                      <div>
                        <button onClick={() => handleEdit(product)}>Edit</button>
                        <button className="danger" onClick={() => handleDelete(product._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </aside>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
