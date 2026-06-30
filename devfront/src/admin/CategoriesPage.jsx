import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api';

const defaultForm = { name: '', description: '' };

const CategoriesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);
        setCategories(categoriesRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load categories.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refreshData = async () => {
    const [categoriesRes, productsRes] = await Promise.all([api.get('/categories'), api.get('/products')]);
    setCategories(categoriesRes.data || []);
    setProducts(productsRes.data || []);
  };

  const countsByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.categoryId] = products.filter((product) => product.category?.categoryId === category.categoryId).length;
      return acc;
    }, {});
  }, [categories, products]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setIsEditing(false);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setIsEditing(true);
    setSelectedCategory(category);
    setForm({ name: category.name || '', description: category.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEditing && selectedCategory) {
        await api.put(`/categories/${selectedCategory.categoryId}`, form);
      } else {
        await api.post('/categories', form);
      }
      await refreshData();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Unable to save category.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/categories/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      await refreshData();
    } catch (err) {
      console.error(err);
      setError('Unable to delete category.');
    }
  };

  if (loading) {
    return <div className="admin-table-card">Loading categories...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-table-card">
        <div className="table-actions">
          <div>
            <h3>Categories</h3>
            <p className="admin-muted">Organize LuxeCart product catalog with category controls.</p>
          </div>
          <button className="admin-button" type="button" onClick={openCreate}>
            <Plus size={16} /> Add Category
          </button>
        </div>
        <div className="table-search">
          <input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.categoryId}>
                <td>{category.name}</td>
                <td>{countsByCategory[category.categoryId] || 0}</td>
                <td>
                  <div className="table-toolbar">
                    <button type="button" className="admin-button small" onClick={() => openEdit(category)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button type="button" className="admin-button small secondary" onClick={() => setConfirmDeleteId(category.categoryId)}>
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
            <h2>{isEditing ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
              </div>
              <div className="form-actions">
                <button type="button" className="secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
            <h2>Delete category?</h2>
            <p>This category will be removed from the archive. Products may become uncategorized.</p>
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

export default CategoriesPage;
