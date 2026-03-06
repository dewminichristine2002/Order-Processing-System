import React, { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api/inventoryApi";
import { useNavigate } from "react-router-dom";
import { ProductCell, ProgressCell, StatusBadge, formatMoney, getStatus } from "../components/ui";

export default function ProductsListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byTerm = !term
      ? products
      : products.filter((p) => {
          const id = String(p.productId ?? "");
          const name = String(p.productName ?? "").toLowerCase();
          return id.includes(term) || name.includes(term);
        });

    if (statusFilter === "all") return byTerm;
    return byTerm.filter((p) => getStatus(p.stockQuantity).key === statusFilter);
  }, [products, search, statusFilter]);

  const maxStock = useMemo(() => {
    const max = products.reduce((m, p) => Math.max(m, Number(p.stockQuantity) || 0), 0);
    return Math.max(1, max);
  }, [products]);

  const statusChips = [
    { key: "all", label: "All" },
    { key: "in", label: "In Stock" },
    { key: "low", label: "Low" },
    { key: "critical", label: "Critical" },
    { key: "out", label: "Out of Stock" },
  ];

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="section-label">Catalog</div>
          <h1 className="page-title" style={{ margin: 0 }}>Products</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/add-product")}>＋ Add Product</button>
      </div>

      <div style={{ height: 12 }} />

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              className="input"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="small" style={{ fontWeight: 900 }}>{filtered.length} of {products.length} items</div>
        </div>

        <div style={{ height: 10 }} />

        <div className="chips" role="tablist" aria-label="Status filters">
          {statusChips.map((c) => (
            <button
              key={c.key}
              type="button"
              className={c.key === statusFilter ? "chip active" : "chip"}
              onClick={() => setStatusFilter(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ height: 12 }} />

        {error ? <div className="msg msg-error">{error}</div> : null}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Stock Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Fill Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                return (
                  <tr key={p.productId}>
                    <td>{p.productId}</td>
                    <td><ProductCell name={p.productName} /></td>
                    <td>{p.stockQuantity}</td>
                    <td style={{ fontWeight: 900, color: "#635bff" }}>{formatMoney(p.price)}</td>
                    <td><StatusBadge stockQuantity={p.stockQuantity} /></td>
                    <td><ProgressCell value={p.stockQuantity} max={maxStock} /></td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/products/${p.productId}`)}>
                        👁 View
                      </button>
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
