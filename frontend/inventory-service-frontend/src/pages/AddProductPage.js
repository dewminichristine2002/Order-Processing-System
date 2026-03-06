import React, { useEffect, useState } from "react";
import { createProduct, fetchProducts } from "../api/inventoryApi";
import { useNavigate } from "react-router-dom";
import { formatMoney } from "../components/ui";

export default function AddProductPage() {
  const navigate = useNavigate();

  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const [suggestedId, setSuggestedId] = useState(null);

  useEffect(() => {
    // Optional productId behavior: if user leaves it empty, we generate next id based on current max.
    fetchProducts()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const maxId = list.reduce((m, p) => Math.max(m, Number(p.productId) || 0), 0);
        setSuggestedId(maxId + 1);
      })
      .catch(() => {
        setSuggestedId(null);
      });
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    if (!productName.trim()) {
      setError("Product Name is required.");
      return;
    }

    const q = Number(stockQuantity);
    if (!Number.isFinite(q) || q < 0) {
      setError("Stock Quantity must be 0 or more.");
      return;
    }

    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) {
      setError("Price must be 0 or more.");
      return;
    }

    const id = productId.trim() ? Number(productId) : suggestedId;
    if (!Number.isFinite(id) || id <= 0) {
      setError("Product ID is required (enter a valid ID). ");
      return;
    }

    try {
      setLoading(true);
      await createProduct({
        productId: id,
        productName: productName.trim(),
        stockQuantity: q,
        price: p,
      });
      setOk("Product created successfully.");
      setTimeout(() => navigate("/products"), 800);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="section-label">Catalog</div>
      <h1 className="page-title">Add Product</h1>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Product Information</div>
            <div className="card-sub">Create a new catalog entry</div>
          </div>
          <span className="pill">New Entry</span>
        </div>

        {error ? <div className="msg msg-error">{error}</div> : null}
        {ok ? <div className="msg msg-ok">{ok}</div> : null}

        <form className="form" onSubmit={onSubmit}>
          <div>
            <div className="label">Product ID (optional)</div>
            <input
              className="input"
              placeholder={suggestedId ? `Leave empty to use ${suggestedId}` : "Enter product id"}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
            <div className="small">Backend requires a productId. If you leave this empty, the UI will use the next available id.</div>
          </div>

          <div>
            <div className="label">Product Name</div>
            <input className="input" placeholder='e.g. Samsung 32" Monitor' value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>

          <div className="two-col">
            <div>
              <div className="label">Stock Quantity</div>
              <input className="input" placeholder="e.g. 100" type="number" min="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
            </div>

            <div>
              <div className="label">Price (USD)</div>
              <input className="input" placeholder="e.g. 299.99" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              {price ? <div className="small">Preview: {formatMoney(price)}</div> : null}
            </div>
          </div>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <button className="btn btn-primary" disabled={loading} type="submit" style={{ flex: 1, justifyContent: "center" }}>
              {loading ? "Creating..." : "＋ Create Product"}
            </button>
            <button className="btn btn-outline" type="button" onClick={() => navigate("/products")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
