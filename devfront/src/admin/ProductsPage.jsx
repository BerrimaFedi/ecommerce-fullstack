import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import api from '../api';

const defaultForm = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  categoryId: '',
  imageUrl: '',
};

const ProductsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load products.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refreshProducts = async () => {
    const response = await api.get('/products');
    setProducts(response.data || []);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedProducts = useMemo(() => {
    const filtered = products.filter((product) =>
      [product.name, product.category?.name, product.price?.toString()].some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase()),
      ),
    );

    const valueFor = (product) => {
      if (sortKey === 'category') return product.category?.name ?? '';
      return product[sortKey] ?? '';
    };

    return filtered.sort((a, b) => {
      const left = valueFor(a);
      const right = valueFor(b);
      if (typeof left === 'number' && typeof right === 'number') {
        return sortDirection === 'asc' ? left - right : right - left;
      }
      return sortDirection === 'asc'
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });
  }, [products, search, sortKey, sortDirection]);

  const openCreate = () => {
    setIsEditing(false);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stockQuantity: product.stockQuantity || '',
      categoryId: product.category?.categoryId || '',
      imageUrl: product.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      imageUrl: form.imageUrl,
      category: { categoryId: Number(form.categoryId) },
    };

    try {
      if (isEditing && selectedProduct) {
        await api.put(`/products/${selectedProduct.productId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      await refreshProducts();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Unable to save product.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/products/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      await refreshProducts();
    } catch (err) {
      console.error(err);
      setError('Unable to delete product.');
    }
  };

  if (loading) {
    return <div className="admin-table-card">Loading products...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-table-card">
        <div className="table-actions">
          <div>
            <h3>Products</h3>
            <p className="admin-muted">Manage LuxeCart product catalog, stock levels, and pricing.</p>
          </div>
          <button className="admin-button" type="button" onClick={openCreate}>
            <Plus size={16} /> Add Product
          </button>
        </div>
        <div className="table-search">
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Product</th>
              <th onClick={() => handleSort('category')}>Category</th>
              <th onClick={() => handleSort('price')}>Price</th>
              <th onClick={() => handleSort('stockQuantity')}>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => (
              <tr key={product.productId}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/64'}
                      alt={product.name}
                      style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover' }}
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <p className="admin-muted" style={{ margin: 0 }}>{product.description?.slice(0, 50)}...</p>
                    </div>
                  </div>
                </td>
                <td>{product.category?.name || 'Uncategorized'}</td>
                <td>${Number(product.price || 0).toFixed(2)}</td>
                <td>{product.stockQuantity}</td>
                <td>
                  <div className="table-toolbar">
                    <button type="button" className="admin-button small" onClick={() => openEdit(product)}>
                      <Edit3 size={14} /> Edit
                    </button>
                    <button type="button" className="admin-button small secondary" onClick={() => setConfirmDeleteId(product.productId)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <div className="admin-panel" style={{ marginTop: '1rem', color: '#dc2626' }}>{error}</div>}
      </div>

      {modalOpen && (
        <div className="overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
            <h2>{isEditing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required />
              </div>
              <div className="form-field">
                <label>Price</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Stock Quantity</label>
                <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Image URL</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
            <h2>Delete product?</h2>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button type="button" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
