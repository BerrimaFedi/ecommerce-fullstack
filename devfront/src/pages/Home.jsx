import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Shirt, Home as HomeIcon, Sparkles, Package } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import api from '../api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewItems, setReviewItems] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/categories'), api.get('/public/reviews?limit=3')])
      .then(([productsRes, categoriesRes, reviewsRes]) => {
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setReviewItems(reviewsRes.data || []);
      })
      .catch((error) => console.error('Failed to load homepage data', error))
      .finally(() => setLoading(false));
  }, []);

  const trendingProducts = products.slice(4, 10);

  const categoryIconMap = {
    electronics: Cpu,
    fashion: Shirt,
    beauty: Sparkles,
    accessories: Package,
    home: HomeIcon,
    'home & living': HomeIcon,
  };

  const reviewPlaceholder = [
    {
      quote: 'Elegant picks with a calm, premium feel.',
      name: 'Luxe customer',
      role: 'Verified buyer',
      rating: 5,
    },
    {
      quote: 'Beautifully curated and easy to shop.',
      name: 'Happy customer',
      role: 'Verified buyer',
      rating: 5,
    },
    {
      quote: 'Feels luxe without being loud.',
      name: 'Stylish shopper',
      role: 'Verified buyer',
      rating: 5,
    },
  ];
  const getCategoryIcon = (categoryName) => {
    const key = categoryName?.toLowerCase();
    return categoryIconMap[key] || Package;
  };

  return (
    <div className="container">
      <main className="home-page">
        <section className="page-header" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Modern lifestyle essentials</span>
          <h1 className="page-title" style={{ fontSize: '3.5rem', maxWidth: '800px', margin: '1rem auto' }}>
            Designed for calm routines, premium looks, and effortless moments.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Discover thoughtfully curated electronics, fashion, home, beauty and accessories built
            with a clean, modern design language.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary">
              Browse products <ArrowRight size={18} />
            </Link>
            <a href="#collections" className="btn btn-secondary">Explore collections</a>
          </div>
        </section>

      <section id="collections" style={{ margin: '4rem 0' }}>
        <div className="page-header">
          <p style={{ color: 'var(--accent-primary)', fontWeight: '600', textTransform: 'uppercase' }}>Collections</p>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>Essential categories for a polished wardrobe.</h2>
        </div>

        <div className="products-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="product-card" style={{ height: '200px' }} />
              ))
            : categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <Link
                    key={category.categoryId}
                    to={`/products?category=${category.categoryId}`}
                    className="product-card"
                    style={{ padding: '2rem', textAlign: 'center', justifyContent: 'center' }}
                  >
                    <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                      <Icon size={40} />
                    </div>
                    <h3 className="product-name">{category.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Explore premium {category.name.toLowerCase()} picks.</p>
                  </Link>
                );
              })}
        </div>
      </section>

      <section id="trending-now" style={{ margin: '4rem 0' }}>
        <div className="page-header">
          <p style={{ color: 'var(--accent-primary)', fontWeight: '600', textTransform: 'uppercase' }}>Trending Now</p>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>Styles our customers are adding to their carts.</h2>
        </div>

        <div className="products-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="product-card" style={{ height: '400px' }} />
              ))
            : trendingProducts.map((product) => (
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
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <div className="card-actions">
                      <button className="btn btn-primary" onClick={() => addToCart(product)}>
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </section>

      <section style={{ margin: '4rem 0 6rem' }}>
        <div className="page-header">
          <p style={{ color: 'var(--accent-primary)', fontWeight: '600', textTransform: 'uppercase' }}>Customer voices</p>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>Reviews that define our quiet approach to luxury.</h2>
        </div>

        <div className="products-grid">
          {(reviewItems.length ? reviewItems : reviewPlaceholder).map((review, index) => (
            <div key={index} className="product-card" style={{ padding: '2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--warning)', fontSize: '1.2rem', marginBottom: '1rem' }}>{'★'.repeat(review.rating)}</div>
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>"{review.quote}"</p>
              <div>
                <strong style={{ display: 'block', color: 'var(--accent-primary)' }}>{review.name}</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{review.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
    </div>
  );
};

export default Home;
