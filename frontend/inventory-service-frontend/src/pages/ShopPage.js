import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../api/inventoryApi";
import { ProductCell, StatusBadge, formatMoney, getStatus } from "../components/ui";
import { addToCart, getCartCount } from "../customer/cart";

export default function ShopPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(() => getCartCount());
  const [notice, setNotice] = useState("");
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProducts()
      .then((data) => {
        if (!mounted) return;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || "Failed to load products.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => {
      const name = String(p.productName ?? "").toLowerCase();
      return name.includes(term);
    });
  }, [products, search]);

  const availabilityLabel = (stockQuantity) => {
    const key = getStatus(stockQuantity).key;
    if (key === "out") return "Unavailable";
    return "Available";
  };

  const onAddToCart = (productId) => {
    addToCart(productId, 1);
    setCartCount(getCartCount());
    setNotice("Added to cart.");
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(""), 1500);
  };

  return (
    <div>
      <div className="section-label">Customer</div>
      <h1 className="page-title">Shop</h1>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              className="input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="small" style={{ fontWeight: 900 }}>
            {filtered.length} items • Cart: {cartCount}
          </div>
        </div>

        <div style={{ height: 12 }} />

        {error ? <div className="msg msg-error">{error}</div> : null}
        {notice ? <div className="msg">{notice}</div> : null}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                return (
                  <tr key={p.productId}>
                    <td>
                      <ProductCell name={p.productName} id={p.productId} />
                    </td>
                    <td style={{ fontWeight: 900 }}>{formatMoney(p.price)}</td>
                    <td>{availabilityLabel(p.stockQuantity)}</td>
                    <td>
                      <StatusBadge stockQuantity={p.stockQuantity} />
                    </td>
                    <td>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <button
                          className="btn btn-sm"
                          disabled={(Number(p.stockQuantity) || 0) <= 0}
                          onClick={() => onAddToCart(p.productId)}
                        >
                          🛒 Add to Cart
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate(`/shop/products/${p.productId}`)}
                        >
                          👁 View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
