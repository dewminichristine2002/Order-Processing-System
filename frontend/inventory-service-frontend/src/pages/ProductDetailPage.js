import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProduct, fetchStockUpdates } from "../api/inventoryApi";
import { ProductCell, ProgressCell, StatusBadge, formatMoney } from "../components/ui";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [updatesPage, setUpdatesPage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetchProduct(id),
      fetchStockUpdates({ productId: id, page: 0, size: 200 }),
    ])
      .then(([p, u]) => {
        if (!mounted) return;
        setProduct(p);
        setUpdatesPage(u);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || "Failed to load product.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const updates = useMemo(() => {
    if (!updatesPage) return [];
    if (Array.isArray(updatesPage)) return updatesPage;
    return updatesPage.content || [];
  }, [updatesPage]);

  const maxStock = useMemo(() => {
    const localMax = Math.max(
      Number(product?.stockQuantity) || 0,
      ...updates.map((u) => Number(u.newQuantity) || 0)
    );
    return Math.max(1, localMax);
  }, [product, updates]);

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="section-label">Catalog</div>
          <h1 className="page-title" style={{ margin: 0 }}>Product Detail</h1>
        </div>
        <button className="btn btn-outline btn-pill" onClick={() => navigate("/products")}>Back</button>
      </div>

      <div style={{ height: 12 }} />

      {error ? <div className="msg msg-error">{error}</div> : null}

      {loading ? (
        <div className="card">Loading...</div>
      ) : !product ? (
        <div className="card">Product not found.</div>
      ) : (
        <div className="split">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Product info</div>
                <div className="card-sub">Current state</div>
              </div>
              <StatusBadge stockQuantity={product.stockQuantity} />
            </div>

            <ProductCell name={product.productName} id={product.productId} />

            <div style={{ height: 12 }} />

            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="small">Stock</div>
                <div style={{ fontWeight: 950, fontSize: 18 }}>{product.stockQuantity}</div>
              </div>
              <div>
                <div className="small">Price</div>
                <div style={{ fontWeight: 950, fontSize: 18, color: "#635bff" }}>{formatMoney(product.price)}</div>
              </div>
            </div>

            <div style={{ height: 12 }} />
            <div>
              <div className="small" style={{ marginBottom: 6 }}>Fill rate</div>
              <ProgressCell value={product.stockQuantity} max={maxStock} />
            </div>

            <div style={{ height: 14 }} />

            <div className="row">
              <button
                className="btn btn-danger"
                onClick={() => navigate("/reduce-stock", { state: { productId: product.productId } })}
              >
                ↓ Reduce Stock
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/stock-updates")}>View Updates</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Stock Update History</div>
                <div className="card-sub">Most recent events</div>
              </div>
            </div>

            {updates.length === 0 ? (
              <div className="small">No updates yet.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Change</th>
                    <th>New Qty</th>
                    <th>Status</th>
                    <th>Order ID</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <span className={(Number(u.changeAmount) || 0) < 0 ? "badge badge-red" : "badge badge-green"}>
                          {u.changeAmount}
                        </span>
                      </td>
                      <td>{u.newQuantity}</td>
                      <td><StatusBadge stockQuantity={u.newQuantity} /></td>
                      <td>{u.referenceId || "-"}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
