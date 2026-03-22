import React, { useState } from "react";
import { increaseStock } from "../api/inventoryApi";
import { useLocation, useNavigate } from "react-router-dom";
import { StatusBadge } from "../components/ui";

export default function IncreaseStockPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [productId, setProductId] = useState(String(location.state?.productId ?? ""));
  const [quantity, setQuantity] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const pid = Number(productId);
    if (!Number.isFinite(pid) || pid <= 0) {
      setError("Product ID is required.");
      return;
    }

    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) {
      setError("Quantity must be 1 or more.");
      return;
    }

    try {
      setLoading(true);
      const data = await increaseStock(pid, { quantity: q, referenceId: referenceId.trim() || null });
      setResult(data);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Failed to increase stock.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="section-label">Operation</div>
      <h1 className="page-title">Increase Stock</h1>

      <div className="split">
        <div className="card">
          {error ? <div className="msg msg-error">{error}</div> : null}

          <div className="card-header">
            <div>
              <div className="card-title">Stock Increase Form</div>
              <div className="card-sub">Add inventory after restock</div>
            </div>
            <span className="pill green">Restock</span>
          </div>

          <form className="form" onSubmit={onSubmit}>
            <div>
              <div className="label">Product ID</div>
              <input className="input" placeholder="e.g. 1" type="number" min="1" value={productId} onChange={(e) => setProductId(e.target.value)} />
            </div>

            <div>
              <div className="label">Quantity to Add</div>
              <div className="row" style={{ gap: 10 }}>
                <button
                  className="btn btn-outline"
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => {
                    const current = Number(quantity) || 0;
                    const next = Math.max(0, current - 1);
                    setQuantity(next ? String(next) : "");
                  }}
                >
                  −
                </button>
                <input
                  className="input"
                  style={{ maxWidth: 220, textAlign: "center" }}
                  placeholder="e.g. 5"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <button
                  className="btn btn-outline"
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => {
                    const current = Number(quantity) || 0;
                    const next = current + 1;
                    setQuantity(String(next));
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <div className="label">Reference ID (optional)</div>
              <input className="input" placeholder="e.g. RESTOCK-1001" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} />
            </div>

            <div className="row">
              <button className="btn btn-primary" disabled={loading} type="submit" style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Processing..." : "↑ Increase Stock"}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => navigate("/products")}>Back</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Result</div>
              <div className="card-sub">Stock update outcome</div>
            </div>
          </div>

          {result ? (
            <>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="small">Product</div>
                  <div style={{ fontWeight: 950 }}>#{result.productId}</div>
                </div>
                <StatusBadge stockQuantity={result.newQuantity} />
              </div>
              <div style={{ height: 12 }} />
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="small">Change</div>
                  <span className={(Number(result.changeAmount) || 0) < 0 ? "badge badge-red" : "badge badge-green"}>
                    {result.changeAmount}
                  </span>
                </div>
                <div>
                  <div className="small">New Qty</div>
                  <div style={{ fontWeight: 950 }}>{result.newQuantity}</div>
                </div>
                <div>
                  <div className="small">Reference</div>
                  <div style={{ fontWeight: 950 }}>{result.referenceId || "-"}</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "grid", placeItems: "center", minHeight: 220, textAlign: "center" }}>
              <div>
                <div className="kpi-icon" aria-hidden style={{ margin: "0 auto", background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.18)" }}>＋</div>
                <div style={{ marginTop: 12, fontWeight: 950 }}>Awaiting submission</div>
                <div className="small">Submit the form to see the result here</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
