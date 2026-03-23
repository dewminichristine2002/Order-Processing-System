import React, { useEffect, useMemo, useState } from "react";
import { fetchProducts, fetchStockUpdates } from "../api/inventoryApi";
import { ProductCell, StatusBadge } from "../components/ui";

export default function StockUpdatesPage() {
  const [productId, setProductId] = useState("");
  const [reason, setReason] = useState("ALL");
  const [pageData, setPageData] = useState(null);
  const [productMap, setProductMap] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load(pid) {
    setLoading(true);
    setError("");
    fetchStockUpdates({ productId: pid, page: 0, size: 200 })
      .then((d) => setPageData(d))
      .catch((e) => setError(e?.response?.data?.message || e.message || "Failed to load stock updates."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load("");

    fetchProducts()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const map = {};
        for (const p of list) {
          map[String(p.productId)] = p.productName;
        }
        setProductMap(map);
      })
      .catch(() => {
        setProductMap({});
      });
  }, []);

  const updates = useMemo(() => {
    if (!pageData) return [];
    if (Array.isArray(pageData)) return pageData;
    return pageData.content || [];
  }, [pageData]);

  const visibleUpdates = useMemo(() => {
    if (reason === "ALL") return updates;
    return updates.filter((u) => String(u.reason || "").toUpperCase() === reason);
  }, [updates, reason]);

  const stats = useMemo(() => {
    const total = visibleUpdates.length;
    const unitsReduced = visibleUpdates.reduce((sum, u) => {
      const delta = Number(u.changeAmount) || 0;
      return sum + (delta < 0 ? Math.abs(delta) : 0);
    }, 0);
    const orders = new Set(visibleUpdates.map((u) => String(u.referenceId || "")).filter(Boolean));
    const products = new Set(visibleUpdates.map((u) => String(u.productId || "")).filter(Boolean));
    return {
      total,
      unitsReduced,
      ordersProcessed: orders.size,
      productsAffected: products.size,
    };
  }, [visibleUpdates]);

  return (
    <div>
      <div className="section-label">Ledger</div>
      <h1 className="page-title">Stock Updates</h1>

      <div className="mini-card-grid">
        <div className="card">
          <div className="kpi-row">
            <div>
              <div className="kpi-label">Total Events</div>
              <div className="kpi-value">{stats.total}</div>
            </div>
            <div className="kpi-icon" aria-hidden>〰</div>
          </div>
        </div>
        <div className="card">
          <div className="kpi-row">
            <div>
              <div className="kpi-label">Units Reduced</div>
              <div className="kpi-value">{stats.unitsReduced}</div>
            </div>
            <div className="kpi-icon" aria-hidden style={{ background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.14)" }}>↓</div>
          </div>
        </div>
        <div className="card">
          <div className="kpi-row">
            <div>
              <div className="kpi-label">Orders Processed</div>
              <div className="kpi-value">{stats.ordersProcessed}</div>
            </div>
            <div className="kpi-icon" aria-hidden style={{ background: "rgba(59,130,246,0.10)", borderColor: "rgba(59,130,246,0.14)" }}>➤</div>
          </div>
        </div>
        <div className="card">
          <div className="kpi-row">
            <div>
              <div className="kpi-label">Products Affected</div>
              <div className="kpi-value">{stats.productsAffected}</div>
            </div>
            <div className="kpi-icon" aria-hidden>▢</div>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <div style={{ minWidth: 240 }}>
              <input className="input" placeholder="Filter by Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
            </div>
            <div className="chips">
              <button type="button" className={reason === "ALL" ? "chip active" : "chip"} onClick={() => setReason("ALL")}>All Reasons</button>
              <button type="button" className={reason === "REDUCE_STOCK" ? "chip active" : "chip"} onClick={() => setReason("REDUCE_STOCK")}>REDUCE STOCK</button>
            </div>
          </div>

          <div className="row">
            <button className="btn btn-primary" onClick={() => load(productId.trim())}>Filter</button>
            <button className="btn btn-outline" onClick={() => { setProductId(""); setReason("ALL"); load(""); }}>Reset</button>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {error ? <div className="msg msg-error">{error}</div> : null}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Change</th>
                <th>New Qty</th>
                <th>Status After</th>
                <th>Reason</th>
                <th>Order ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleUpdates.map((u, index) => (
                <tr key={u.id ?? index}>
                  <td>{u.id ?? index + 1}</td>
                  <td>
                    <ProductCell
                      name={productMap[String(u.productId)] || `Product #${u.productId}`}
                      id={u.productId}
                    />
                  </td>
                  <td>
                    <span className={(Number(u.changeAmount) || 0) < 0 ? "badge badge-red" : "badge badge-green"}>
                      {u.changeAmount}
                    </span>
                  </td>
                  <td style={{ fontWeight: 950 }}>{u.newQuantity}</td>
                  <td><StatusBadge stockQuantity={u.newQuantity} /></td>
                  <td><span className="badge badge-gray badge-soft">{String(u.reason || "-").replace(/_/g, " ")}</span></td>
                  <td style={{ fontWeight: 900, color: "#635bff" }}>{u.referenceId || "-"}</td>
                  <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && visibleUpdates.length === 0 ? <div className="small">No stock updates found.</div> : null}
      </div>
    </div>
  );
}
