import React, { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api/inventoryApi";
import { useNavigate } from "react-router-dom";
import { ProductCell, ProgressCell, Sparkline, StatusBadge, formatMoney, getStatus } from "../components/ui";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0);
    const totalValue = products.reduce(
      (sum, p) => sum + (Number(p.stockQuantity) || 0) * (Number(p.price) || 0),
      0
    );
    const lowStock = products.filter((p) => (Number(p.stockQuantity) || 0) <= 5 && (Number(p.stockQuantity) || 0) > 0).length;
    const outOfStock = products.filter((p) => (Number(p.stockQuantity) || 0) === 0).length;

    return [
      { label: "Total Products", value: totalProducts, note: `${totalProducts} SKUs tracked`, icon: "▢", tone: "purple", points: [3, 4, 5, 4, 6, 7, 7] },
      { label: "Total Stock", value: totalStock, note: `${formatMoney(totalValue)} value`, icon: "⬡", tone: "purple", points: [2, 3, 4, 4, 5, 6, 6] },
      { label: "Low Stock Alerts", value: lowStock, note: "needs reorder soon", icon: "⚡", tone: "yellow", points: [2, 3, 2, 4, 3, 4, 3] },
      { label: "Out of Stock", value: outOfStock, note: "products unavailable", icon: "✕", tone: "red", points: [2, 2, 2, 2, 2, 2, 2] },
    ];
  }, [products]);

  const maxStock = useMemo(() => {
    const max = products.reduce((m, p) => Math.max(m, Number(p.stockQuantity) || 0), 0);
    return Math.max(1, max);
  }, [products]);

  const recent = useMemo(() => {
    return [...products]
      .sort((a, b) => (Number(b.stockQuantity) || 0) - (Number(a.stockQuantity) || 0))
      .slice(0, 5);
  }, [products]);

  const distribution = useMemo(() => {
    const counts = { in: 0, low: 0, critical: 0, out: 0 };
    for (const p of products) {
      counts[getStatus(p.stockQuantity).key] += 1;
    }
    return counts;
  }, [products]);

  return (
    <div>
      <div className="section-label">Overview</div>
      <h1 className="page-title">Dashboard</h1>

      {error ? <div className="msg msg-error">{error}</div> : null}

      {loading ? (
        <div className="card">Loading...</div>
      ) : (
        <>
          <div className="grid-4">
            {kpis.map((k) => (
              <div key={k.label} className="card">
                <div className="kpi-row">
                  <div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-note">{k.note}</div>
                  </div>
                  <div style={{ display: "grid", justifyItems: "end", gap: 8 }}>
                    <div className="kpi-icon" aria-hidden="true">{k.icon}</div>
                    <Sparkline tone={k.tone} points={k.points} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 12 }} />

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 950 }}>Recent products (top 5)</h2>
                <div className="small">Sorted by stock quantity</div>
              </div>
              <button className="btn btn-outline btn-pill" onClick={() => navigate("/products")}>See all</button>
            </div>

            <div style={{ height: 10 }} />

            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Fill Rate</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr
                    key={p.productId}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/products/${p.productId}`)}
                  >
                    <td>#{p.productId}</td>
                    <td><ProductCell name={p.productName} /></td>
                    <td>{p.stockQuantity}</td>
                    <td style={{ fontWeight: 900, color: "#635bff" }}>{formatMoney(p.price)}</td>
                    <td><StatusBadge stockQuantity={p.stockQuantity} /></td>
                    <td><ProgressCell value={p.stockQuantity} max={maxStock} /></td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${p.productId}`);
                        }}
                        aria-label={`View product ${p.productId}`}
                        title="View"
                      >
                        👁 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ height: 12 }} />

          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Stock Distribution</div>
                  <div className="card-sub">Current inventory health</div>
                </div>
              </div>

              {(
                [
                  { label: "In Stock", key: "in", tone: "" },
                  { label: "Low Stock", key: "low", tone: "yellow" },
                  { label: "Critical", key: "critical", tone: "red" },
                  { label: "Out of Stock", key: "out", tone: "red" },
                ]
              ).map((r) => {
                const total = Math.max(1, products.length);
                const count = distribution[r.key] || 0;
                const pct = Math.round((count / total) * 100);
                const klass = r.tone ? `progress ${r.tone}` : "progress";
                return (
                  <div key={r.key} style={{ marginTop: 10 }}>
                    <div className="small" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{r.label}</span>
                      <span style={{ fontWeight: 900 }}>{count}</span>
                    </div>
                    <div className={klass} aria-hidden>
                      <div style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Quick Actions</div>
                  <div className="card-sub">Common tasks</div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <button className="btn btn-outline" type="button" onClick={() => navigate("/add-product")} style={{ textAlign: "left", padding: 14 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div className="row">
                      <span className="product-icon" aria-hidden style={{ width: 34, height: 34 }}>＋</span>
                      <div>
                        <div style={{ fontWeight: 950 }}>Add a new product</div>
                        <div className="small">Expand your catalog</div>
                      </div>
                    </div>
                    <span aria-hidden>→</span>
                  </div>
                </button>

                <button className="btn btn-outline" type="button" onClick={() => navigate("/reduce-stock")} style={{ textAlign: "left", padding: 14 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div className="row">
                      <span className="product-icon" aria-hidden style={{ width: 34, height: 34, background: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.14)" }}>↓</span>
                      <div>
                        <div style={{ fontWeight: 950 }}>Reduce stock</div>
                        <div className="small">Process an order payment</div>
                      </div>
                    </div>
                    <span aria-hidden>→</span>
                  </div>
                </button>

                <button className="btn btn-outline" type="button" onClick={() => navigate("/stock-updates")} style={{ textAlign: "left", padding: 14 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div className="row">
                      <span className="product-icon" aria-hidden style={{ width: 34, height: 34, background: "rgba(59,130,246,0.10)", borderColor: "rgba(59,130,246,0.14)" }}>〰</span>
                      <div>
                        <div style={{ fontWeight: 950 }}>View stock updates</div>
                        <div className="small">Track inventory changes</div>
                      </div>
                    </div>
                    <span aria-hidden>→</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
