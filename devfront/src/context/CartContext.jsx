import React, { createContext, useState, useEffect, useRef, useContext, useCallback } from 'react';
import api from '../api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const normalizeCartItem = (item) => ({
    id: item.panierItemId ?? item.id ?? item.product?.productId ?? item.productId,
    productId: item.product?.productId ?? item.productId,
    name: item.product?.name ?? item.name,
    image: item.product?.imageUrl ?? item.image,
    price: Number(item.product?.price ?? item.price ?? 0),
    quantity: item.quantity ?? 1,
  });

  const persistCart = (items) => {
    setCartItems(items);
    localStorage.setItem('luxeCartItems', JSON.stringify(items));
  };

  const notify = (message) => {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  };

  const fetchCart = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get('/panier');
      const serverItems = response.data?.items || [];
      const normalizedCart = serverItems.map(normalizeCartItem);
      persistCart(normalizedCart);
    } catch (error) {
      console.error('Failed to load cart', error);
      notify('Unable to load your cart.');
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get('/commandes');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders', error);
      notify('Unable to load your order history.');
    }
  }, [user]);

  const syncLocalCartToServer = useCallback(async (localItems) => {
    if (!user || localItems.length === 0) return;

    try {
      for (const item of localItems) {
        await api.post('/panier/add', null, {
          params: {
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }
    } catch (error) {
      console.error('Failed to sync local cart to server', error);
    }
  }, [user]);

  useEffect(() => {
    const storedCart = localStorage.getItem('luxeCartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading) return;

    const loadUserData = async () => {
      setLoading(true);
      const localCart = JSON.parse(localStorage.getItem('luxeCartItems') || '[]');
      if (localCart.length > 0) {
        await syncLocalCartToServer(localCart);
      }
      await Promise.all([fetchCart(), fetchOrders()]);
      setLoading(false);
    };

    if (user) {
      loadUserData();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [authLoading, user, fetchCart, fetchOrders, syncLocalCartToServer]);

  const addToCart = async (product, quantity = 1) => {
    if (!product) return;

    if (user) {
      setLoading(true);
      try {
        await api.post('/panier/add', null, {
          params: { productId: product.productId, quantity },
        });
        await fetchCart();
        notify(`${product.name} added to cart`);
      } catch (error) {
        console.error('Failed to add item to cart', error);
        notify('Unable to add item to cart.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const existingItem = cartItems.find((item) => item.productId === product.productId);
    const nextItems = existingItem
      ? cartItems.map((item) => item.productId === product.productId ? { ...item, quantity: item.quantity + quantity } : item)
      : [...cartItems, {
        id: product.productId,
        productId: product.productId,
        name: product.name,
        image: product.imageUrl,
        price: Number(product.price ?? 0),
        quantity,
      }];

    persistCart(nextItems);
    notify(`${product.name} added to cart`);
  };

  const updateCartItemQuantity = async (cartItemId, quantity) => {
    if (user) {
      setLoading(true);
      try {
        await api.put(`/panier/item/${cartItemId}`, null, {
          params: { quantity },
        });
        await fetchCart();
        notify('Cart quantity updated');
      } catch (error) {
        console.error('Failed to update cart quantity', error);
        notify('Unable to update cart quantity.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const nextItems = cartItems.reduce((acc, item) => {
      if (item.id === cartItemId) {
        if (quantity > 0) {
          acc.push({ ...item, quantity });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

    persistCart(nextItems);
    notify('Cart quantity updated');
  };

  const removeFromCart = async (cartItemId) => {
    if (user) {
      setLoading(true);
      try {
        await api.delete(`/panier/item/${cartItemId}`);
        await fetchCart();
        notify('Item removed from cart');
      } catch (error) {
        console.error('Failed to remove item from cart', error);
        notify('Unable to remove item.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const nextItems = cartItems.filter((item) => item.id !== cartItemId);
    persistCart(nextItems);
    notify('Item removed from cart');
  };

  const clearCart = async () => {
    if (user) {
      setLoading(true);
      try {
        await api.delete('/panier/clear');
        persistCart([]);
        notify('Cart cleared');
      } catch (error) {
        console.error('Failed to clear cart', error);
        notify('Unable to clear cart.');
      } finally {
        setLoading(false);
      }
      return;
    }

    persistCart([]);
    notify('Cart cleared');
  };

  const createOrder = async (shippingAddress) => {
    if (!user) {
      throw new Error('You must be logged in to place an order.');
    }

    setLoading(true);
    try {
      const response = await api.post('/commandes/checkout', null, {
        params: { shippingAddress },
      });
      await Promise.all([fetchCart(), fetchOrders()]);
      notify('Order placed successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to create order', error);
      notify('Unable to place order.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CartContext.Provider
        value={{
          cartItems,
          orders,
          loading,
          addToCart,
          removeFromCart,
          clearCart,
          createOrder,
          updateCartItemQuantity,
          notify,
        }}
      >
        {children}
      </CartContext.Provider>
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </>
  );
};
