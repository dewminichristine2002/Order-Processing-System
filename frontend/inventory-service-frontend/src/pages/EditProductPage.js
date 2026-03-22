import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProduct, updateProduct } from "../api/inventoryApi";
import { formatMoney } from "../components/ui";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const productId = useMemo(() => Number(id), [id]);

  const [productName, setProductName] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingProduct(true);
    setError("");

    fetchProduct(productId)
      .then((p) => {
        if (!mounted) return;
        setProductName(String(p?.productName ?? ""));
        setStockQuantity(String(p?.stockQuantity ?? ""));
        setPrice(String(p?.price ?? ""));
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || "Failed to load product.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingProduct(false);
      });

    return () => {
      mounted = false;
    };
  }, [productId]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) {
      setError("Price must be 0 or more.");
      return;
    }

    // Price-only edits: keep name + stock unchanged, but still send them
    // because the backend request requires all fields.
    if (!productName.trim()) {
      setError("Product Name is missing. Please reload the page.");
      return;
    }

    const q = Number(stockQuantity);
    if (!Number.isFinite(q) || q < 0) {
      setError("Stock Quantity is missing. Please reload the page.");
      return;
    }

    try {
      setLoading(true);
      await updateProduct(productId, {
        productName: productName.trim(),
        stockQuantity: q,
        price: p,
      });
      setOk("Product updated successfully.");
      setTimeout(() => navigate(`/products/${productId}`), 600);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="section-label">Catalog</div>
      <h1 className="page-title">Edit Product</h1>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Product Information</div>
            <div className="card-sub">Update this catalog entry</div>
          </div>
          <span className="pill">ID: {productId}</span>
        </div>

        {error ? <div className="msg msg-error">{error}</div> : null}
        {ok ? <div className="msg msg-ok">{ok}</div> : null}

        {loadingProduct ? (
          <div>Loading...</div>
        ) : (
          <form className="form" onSubmit={onSubmit}>
            <div>
              <div className="label">Product Name</div>
              <input
                className="input"
                placeholder='e.g. Samsung 32" Monitor'
                value={productName}
                disabled
                readOnly
                aria-readonly="true"
              />
            </div>

            <div className="two-col">
              <div>
                <div className="label">Stock Quantity</div>
                <input
                  className="input"
                  placeholder="e.g. 100"
                  type="number"
                  min="0"
                  value={stockQuantity}
                  disabled
                  readOnly
                  aria-readonly="true"
                />
              </div>

              <div>
                <div className="label">Price (LKR)</div>
                <input
                  className="input"
                  placeholder="e.g. 299.99"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                {price ? <div className="small">Preview: {formatMoney(price)}</div> : null}
              </div>
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button
                className="btn btn-primary"
                disabled={loading}
                type="submit"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => navigate(`/products/${productId}`)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
