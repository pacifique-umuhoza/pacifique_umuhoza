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

  // --- ORDER CRUD STATES ---
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ customer_name: '', product_name: '', amount: '', status: 'Received' });

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

  // --- WORKING SEARCH HANDLERS ---
  const handleSearchExecute = (e) => {
    if (e) e.preventDefault();
    setActiveSearch(searchQuery.trim());
    if (!['Home', 'Investment', 'Analysis', 'Products'].includes(activeMenu)) {
      setActiveMenu('Products');
    }
  };

  const productsList = data.products || [];
  const filteredProducts = productsList.filter((p) => {
    const term = activeSearch.toLowerCase();
    if (!term) return true;
    const nameMatch = (p.name || '').toLowerCase().includes(term);
    const specsMatch = (p.specs || '').toLowerCase().includes(term);
    const priceMatch = String(p.price || '').includes(term);
    return nameMatch || specsMatch || priceMatch;
  });

  // --- PRODUCT CRUD HANDLERS ---
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
        await axios.put(`http://localhost:5000/api/dashboard/products/${editingProduct.id}`, prodForm);
      } else {
        await axios.post('http://localhost:5000/api/dashboard/products', prodForm);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchDashboard();
    } catch (err) {
      alert('Failed to save product. Check backend server.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product? Totals and charts will update.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/dashboard/products/${id}`);
      fetchDashboard();
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  // --- ORDER CRUD HANDLERS ---
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/dashboard/orders', orderForm);
      setShowOrderModal(false);
      setOrderForm({ customer_name: '', product_name: '', amount: '', status: 'Received' });
      fetchDashboard();
    } catch (err) {
      alert('Failed to add order.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/dashboard/orders/${id}`, { status: newStatus });
      fetchDashboard();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/dashboard/orders/${id}`);
      fetchDashboard();
    } catch (err) {
      alert('Failed to delete order.');
    }
  };

  const ordersList = data.orders || [];
  const usersList = data.users || [];

  // Dynamic Chart calculations
  const dynamicPeakY = Math.max(20, Math.min(130, 145 - ((data.stats?.total_income || 0) % 100)));
  const dynamicBarHeights = [
    40, Math.min(95, 30 + productsList.length * 12), 55,
    Math.min(98, 40 + ordersList.length * 10), 65,
    Math.min(90, 25 + ((data.stats?.total_income || 0) % 65)), 75, 60, 85, 50
  ];

  const menuItems = [
    { name: 'Home', icon: <Home size={16} /> },
    { name: 'Transactions', icon: <Activity size={16} />, badge: ordersList.length },
    { name: 'Sales', icon: <Users size={16} />, badge: productsList.length },
    { name: 'Products', icon: <Folder size={16} /> },
    { name: 'Members', icon: <UserCheck size={16} /> },
    { name: 'Investment', icon: <ShoppingCart size={16} /> },
    { name: 'Analysis', icon: <BarChart2 size={16} /> },
    { name: 'Reporting', icon: <FileText size={16} /> },
    { name: 'Back Accounts', icon: <CreditCard size={16} /> },
    { name: 'Admin/HR', icon: <Shield size={16} /> },
  ];

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-circle">
            <span className="b-blue"></span>
            <span className="b-green"></span>
            <span className="b-orange"></span>
          </div>
          <h4>{user.full_name}</h4>
          <p>{user.email}</p>
          <button className="btn-upgrade" onClick={() => setActiveMenu('Back Accounts')}>Upgrade</button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`nav-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.name)}
            >
              <div className="nav-left">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`nav-badge ${item.name === 'Sales' ? 'green' : 'purple'}`}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-profile-card">
          <img src={user.avatar || 'https://i.pravatar.cc/150?img=11'} alt="Profile" />
          <h5>{user.full_name} <span className="online-dot"></span></h5>
          <p className="profile-email">{user.email}</p>
          <p className="profile-plan">Your Plan : {user.plan || 'Standard'}</p>
          <button onClick={onLogout} className="btn-logout">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn-add-product" onClick={openAddProduct}>
              <Plus size={16} /> Add Product
            </button>
            <form className="search-box" onSubmit={handleSearchExecute}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim() === '') setActiveSearch('');
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveSearch(''); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 6px', color: '#94a3b8' }}
                >
                  ✕
                </button>
              )}
              <button type="submit" className="btn-search">
                Search
              </button>
            </form>
          </div>

          <div className="topbar-right">
            <div className="notif-icon" onClick={() => setActiveMenu('Transactions')}>
              <Bell size={18} color="#64748b" />
              <span className="notif-badge">{ordersList.length}</span>
            </div>
            <div className="lang-select">🇺🇸 ENG ▾</div>
            <div className="user-pill">
              <img src={user.avatar || 'https://i.pravatar.cc/150?img=11'} alt="User" />
              <span>{user.full_name} ! ▾</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>{activeMenu === 'Home' || activeMenu === 'Investment' ? 'Ecommerce Dashboard' : activeMenu}</h1>
              <span className="breadcrumb">Dashboard &gt; {activeMenu}</span>
            </div>

            <div className="filter-controls">
              <select className="filter-select">
                <option>San francisco</option>
                <option>Kigali</option>
              </select>
              <div className="timeframe-group">
                {['Day', 'Week', 'Month', 'Anual'].map((tf) => (
                  <button key={tf} className={timeframe === tf ? 'active' : ''} onClick={() => setTimeframe(tf)}>
                    {tf}
                  </button>
                ))}
              </div>
              <div className="date-nav">
                <button><ChevronLeft size={14} /></button>
                <span>{new Date().toDateString()}</span>
                <button><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>

          {/* LIVE KPI CARDS */}
          <div className="kpi-grid">
            <div className="kpi-card purple">
              <div className="kpi-top">
                <div>
                  <span className="kpi-label">NEW ORDERS</span>
                  <h2>{data.stats.new_orders.toLocaleString()}</h2>
                  <small>Active Orders: {ordersList.length}</small>
                </div>
                <div className="kpi-icon"><ShoppingBag size={18} color="#8b5cf6" /></div>
              </div>
              <svg viewBox="0 0 200 40" className="sparkline">
                <path d={`M0,30 L40,22 L80,${dynamicPeakY / 4} L120,25 L160,10 L200,20 L200,40 L0,40 Z`} fill="rgba(255,255,255,0.25)" />
                <path d={`M0,30 L40,22 L80,${dynamicPeakY / 4} L120,25 L160,10 L200,20`} fill="none" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>

            <div className="kpi-card green">
              <div className="kpi-top">
                <div>
                  <span className="kpi-label">TOTAL INCOME</span>
                  <h2>${Number(data.stats.total_income).toLocaleString()}</h2>
                  <small>Products Value: ${Number(data.stats.product_total_value).toLocaleString()}</small>
                </div>
                <div className="kpi-icon"><DollarSign size={18} color="#10b981" /></div>
              </div>
              <div className="mini-bars">
                {dynamicBarHeights.map((h, i) => (
                  <span key={i} style={{ height: `${h}%`, transition: '0.3s ease' }}></span>
                ))}
              </div>
            </div>

            <div className="kpi-card blue">
              <div className="kpi-top">
                <div>
                  <span className="kpi-label">TOTAL EXPENSE</span>
                  <h2>${Number(data.stats.total_expense).toLocaleString()}</h2>
                  <small>Increased by 7.35%</small>
                </div>
                <div className="kpi-icon"><FileSpreadsheet size={18} color="#0ea5e9" /></div>
              </div>
              <svg viewBox="0 0 200 40" className="sparkline">
                <polyline fill="none" stroke="#fff" strokeWidth="2" points="0,30 40,22 80,28 120,18 160,26 200,15" />
              </svg>
            </div>

            <div className="kpi-card orange">
              <div className="kpi-top">
                <div>
                  <span className="kpi-label">NEW USERS</span>
                  <h2>{data.stats.new_users.toLocaleString()}</h2>
                  <small>Registered Accounts: {usersList.length}</small>
                </div>
                <div className="kpi-icon"><UserPlus size={18} color="#f59e0b" /></div>
              </div>
              <div className="mini-bars">
                {dynamicBarHeights.slice().reverse().map((h, i) => (
                  <span key={i} style={{ height: `${h}%`, transition: '0.3s ease' }}></span>
                ))}
              </div>
            </div>
          </div>

          {/* VIEW ROUTING */}
          {(activeMenu === 'Home' || activeMenu === 'Investment' || activeMenu === 'Analysis') && (
            <div className="middle-grid">
              <div className="card summary-card">
                <h3>Live Summary & Revenue Curve</h3>
                <div className="summary-metrics">
                  <div>
                    <h4>${Number(data.stats.product_total_value).toLocaleString()}</h4>
                    <span>Products Total</span>
                  </div>
                  <div className="active-metric">
                    <h4>${Number(data.stats.total_income).toLocaleString()}</h4>
                    <span>Total Income</span>
                  </div>
                  <div>
                    <h4>${Number(data.stats.total_expense).toLocaleString()}</h4>
                    <span>Cost</span>
                  </div>
                  <div>
                    <h4>{productsList.length} Items</h4>
                    <span>Catalog Size</span>
                  </div>
                </div>

                <div className="area-chart-wrapper">
                  <svg viewBox="0 0 500 180" className="area-svg">
                    <line x1="30" y1="20" x2="490" y2="20" stroke="#f1f5f9" />
                    <line x1="30" y1="100" x2="490" y2="100" stroke="#f1f5f9" />
                    <path
                      d={`M35,125 C100,95 160,${dynamicPeakY} 240,95 C320,85 380,120 485,${dynamicPeakY} L485,155 L35,155 Z`}
                      fill="rgba(239, 108, 108, 0.85)"
                    />
                    <path
                      d={`M35,125 C100,95 160,${dynamicPeakY} 240,95 C320,85 380,120 485,${dynamicPeakY}`}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2.5"
                    />
                    <text x="35" y="172" fontSize="10" fill="#94a3b8">Aug</text>
                    <text x="150" y="172" fontSize="10" fill="#94a3b8">Oct</text>
                    <text x="300" y="172" fontSize="10" fill="#94a3b8">Dec</text>
                    <text x="465" y="172" fontSize="10" fill="#94a3b8">Now</text>
                  </svg>
                </div>
              </div>

              <div className="card top-products-card">
                <div className="card-header">
                  <h3>Top Selling Products {activeSearch && `(Filtered: "${activeSearch}")`}</h3>
                  <button className="btn-add-product" onClick={openAddProduct}>+ Add</button>
                </div>
                <div className="product-list">
                  {filteredProducts.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1rem 0' }}>No products found.</p>
                  ) : (
                    filteredProducts.map((prod) => (
                      <div key={prod.id} className="product-row">
                        <img src={prod.image_url} alt={prod.name} />
                        <div className="prod-info">
                          <div className="prod-title">
                            <strong>{prod.name}</strong>
                            <span className="stars">{'★'.repeat(prod.rating || 4)}</span>
                          </div>
                          <p>{prod.specs}</p>
                        </div>
                        <div className="prod-price">
                          <strong>${Number(prod.price).toFixed(2)}</strong>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => openEditProduct(prod)} className="icon-btn edit" title="Edit">
                              <Edit2 size={13} />
                            </button>
                            <button type="button" onClick={() => handleDeleteProduct(prod.id)} className="icon-btn del" title="Delete">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'Products' && (
            <div className="card">
              <div className="card-header">
                <h3>Manage Products Catalog ({filteredProducts.length})</h3>
                <button className="btn-add-product" onClick={openAddProduct}><Plus size={15} /> New Product</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Specifications</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.specs}</td>
                      <td><strong>${Number(p.price).toFixed(2)}</strong></td>
                      <td>
                        <button type="button" onClick={() => openEditProduct(p)} className="btn-sm edit">Edit</button>
                        <button type="button" onClick={() => handleDeleteProduct(p.id)} className="btn-sm del">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeMenu === 'Transactions' || activeMenu === 'Sales') && (
            <div className="card">
              <div className="card-header">
                <h3>{activeMenu} & Customer Orders ({ordersList.length})</h3>
                <button className="btn-add-product" onClick={() => setShowOrderModal(true)}>
                  <Plus size={15} /> New Order
                </button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order Code</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((ord) => (
                    <tr key={ord.id}>
                      <td><strong>{ord.order_code}</strong></td>
                      <td>{ord.customer_name}</td>
                      <td>{ord.product_name}</td>
                      <td><strong>${Number(ord.amount).toFixed(2)}</strong></td>
                      <td>
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Received">Received</option>
                          <option value="Invoice">Invoice</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                      <td>
                        <button type="button" onClick={() => handleDeleteOrder(ord.id)} className="btn-sm del">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeMenu === 'Members' || activeMenu === 'Admin/HR') && (
            <div className="card">
              <h3>Registered Store Members & Staff ({usersList.length})</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Subscription Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.full_name}</strong></td>
                      <td>{u.email}</td>
                      <td><span className="nav-badge green">{u.plan}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeMenu === 'Reporting' || activeMenu === 'Back Accounts') && (
            <div className="card">
              <h3>{activeMenu} Financial Statement</h3>
              <div className="summary-metrics" style={{ marginTop: '1rem' }}>
                <div className="active-metric">
                  <h4>${Number(data.stats.total_income).toLocaleString()}</h4>
                  <span>Gross Balance</span>
                </div>
                <div>
                  <h4>${Number(data.stats.total_expense).toLocaleString()}</h4>
                  <span>Total Expenses</span>
                </div>
                <div>
                  <h4>${Number(data.stats.total_income - data.stats.total_expense).toLocaleString()}</h4>
                  <span>Net Profit</span>
                </div>
                <div>
                  <h4>Active</h4>
                  <span>Account Status</span>
                </div>
              </div>
            </div>
          )}
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
                <button type="button" onClick={() => setShowProductModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER MODAL */}
      {showOrderModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Create New Customer Order</h3>
            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  required
                  value={orderForm.customer_name}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  value={orderForm.product_name}
                  onChange={(e) => setOrderForm({ ...orderForm, product_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={orderForm.amount}
                  onChange={(e) => setOrderForm({ ...orderForm, amount: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowOrderModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}