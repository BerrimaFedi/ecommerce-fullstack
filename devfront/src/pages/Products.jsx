import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    api.get('/products')
      .then((response) => setProducts(response.data))
      .catch((error) => {
        console.error('Unable to load products', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [
    'All',
    ...Array.from(new Set(products.map((product) => product.category?.name || 'Uncategorized'))),
  ], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryName = product.category?.name || 'Uncategorized';
      const matchesCategory = selectedCategory === 'All' || categoryName === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || (product.description || '').toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  if (loading) {
    return (
      <div className="container" style={{ margin: '4rem auto' }}>
        <div className="products-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="product-card" style={{ height: '280px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '4rem auto' }}>
      <section className="product-sheet">
        <div className="product-header-top">
          <div>
            <p className="section-label">Curated Collection</p>
            <h1 className="section-title">Discover refined favorites.</h1>
          </div>
          <div className="product-filter-row">
            <input
              type="search"
              className="form-control"
              placeholder="Search premium products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-control filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="category-chips">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.productId} className="product-card">
              <Link to={`/product/${product.productId}`} style={{ textDecoration: 'none' }}>
                <div className="product-image-container">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
                    alt={product.name}
                    className="product-image"
                  />
                </div>
              </Link>
              <div className="product-details">
                <span className="product-category">{product.category?.name || 'Uncategorized'}</span>
                <div className="product-info-row">
                  <h3 className="product-name">{product.name}</h3>
                  <span className="product-price">${product.price.toFixed(2)}</span>
                </div>
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={() => addToCart(product)}>
                    <ShoppingCart size={16} /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="empty-state-card">
              <h3>No matching products found.</h3>
              <p>Try a different search term or category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
