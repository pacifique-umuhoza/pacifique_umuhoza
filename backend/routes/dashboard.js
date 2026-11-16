import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Home, Activity, Users, Folder, UserCheck, ShoppingCart,
  BarChart2, FileText, CreditCard, Shield, Bell, Search,
  Plus, ShoppingBag, DollarSign, FileSpreadsheet, UserPlus,
  ChevronLeft, ChevronRight, LogOut, Edit2, Trash2
} from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('Home');
  const [timeframe, setTimeframe] = useState('Week');

  // --- SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // --- PRODUCT CRUD STATES (CREATE / UPDATE) ---
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({ name: '', specs: '', price: '', rating: 5 });

  const [data, setData] = useState({
    stats: { new_orders: 35673, total_income: 14966, total_expense: 26526, new_users: 32566, product_total_value: 0 },
    products: [],
    orders: [],
    users: []
  });

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dashboard/overview');
      setData({
        stats: res.data.stats || { new_orders: 35673, total_income: 14966, total_expense: 26526, new_users: 32566, product_total_value: 0 },
        products: res.data.products || [],
        orders: res.data.orders || [],
        users: res.data.users || []
      });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // --- SEARCH HANDLERS ---
  const handleSearchExecute = () => {
    setActiveSearch(searchQuery);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchExecute();
    }
  };

  const productsList = data.products || [];
  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
    p.specs.toLowerCase().includes(activeSearch.toLowerCase())
  );

  // --- EDIT / UPDATE HANDLERS ---
  const openAddProduct = () => {
    setEditingProduct(null);
    setProdForm({ name: '', specs: 'USB, wireless • White • Hands-free', price: '', rating: 5 });
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name,
      specs: prod.specs,
      price: prod.price,
      rating: prod.rating || 4
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // UPDATE Existing Product
        await axios.put(`http://localhost:5000/api/dashboard/products/${editingProduct.id}`, prodForm);
      } else {
        // CREATE New Product
        await axios.post('http://localhost:5000/api/dashboard/products', prodForm);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchDashboard(); // Refreshes lists and live totals
    } catch (err) {
      alert('Failed to save product. Check backend server.');
    }
  };

  return (
    <div className="dashboard-layout">
      {/* MAIN CONTENT WRAPPER */}
      <div className="main-wrapper" style={{ width: '100%' }}>
        
        {/* TOP BAR WITH WORKING SEARCH */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn-add-product" onClick={openAddProduct}>
              <Plus size={16} /> Add Product
            </button>
            <div className="search-box">
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') setActiveSearch('');
                }}
                onKeyDown={handleKeyDown}
              />
              <button type="button" className="btn-search" onClick={handleSearchExecute}>
                Search
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {/* TOP SELLING PRODUCTS WITH EDIT BUTTON */}
          <div className="card top-products-card">
            <div className="card-header">
              <h3>Top Selling Products</h3>
            </div>
            <div className="product-list">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="product-row">
                  <img src={prod.image_url} alt={prod.name} style={{ width: 40, height: 40, borderRadius: 6 }} />
                  <div className="prod-info">
                    <div className="prod-title">
                      <strong>{prod.name}</strong>
                    </div>
                    <p>{prod.specs}</p>
                  </div>
                  <div className="prod-price">
                    <strong>${Number(prod.price).toFixed(2)}</strong>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => openEditProduct(prod)} className="icon-btn edit" title="Edit Product">
                        <Edit2 size={13} /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* PRODUCT CREATE / UPDATE MODAL */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Specifications</label>
                <input
                  type="text"
                  value={prodForm.specs}
                  onChange={(e) => setProdForm({ ...prodForm, specs: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={prodForm.price}
                  onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowProductModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}