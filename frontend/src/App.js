import "./App.css";
import { useMemo, useState } from "react";

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://localhost:8084");

  const [createForm, setCreateForm] = useState({
    orderId: "",
    deliveryAddress: "",
    shipmentStatus: "SHIPPED",
  });

  const [updateForm, setUpdateForm] = useState({
    shipmentId: "",
    shipmentStatus: "DELIVERED",
  });

  const [searchOrderId, setSearchOrderId] = useState("");
  const [allShipments, setAllShipments] = useState([]);
  const [searchedShipment, setSearchedShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const normalizedBaseUrl = useMemo(
    () => apiBaseUrl.trim().replace(/\/$/, ""),
    [apiBaseUrl],
  );

  const showMessage = (text) => {
    setMessage(text);
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateChange = (event) => {
    const { name, value } = event.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  const createShipment = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSearchedShipment(null);

    try {
      const response = await fetch(`${normalizedBaseUrl}/shipping/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: Number(createForm.orderId),
          deliveryAddress: createForm.deliveryAddress,
          shipmentStatus: createForm.shipmentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`Create failed with status ${response.status}`);
      }

      const created = await response.json();
      showMessage(
        `Shipment created successfully. shipmentId=${created.shipmentId}`,
      );

      setCreateForm({
        orderId: "",
        deliveryAddress: "",
        shipmentStatus: "SHIPPED",
      });

      await fetchAllShipments();
    } catch (error) {
      showMessage(`Create shipment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllShipments = async () => {
    const response = await fetch(`${normalizedBaseUrl}/shipping`);
    if (!response.ok) {
      throw new Error(`Fetch all failed with status ${response.status}`);
    }
    const data = await response.json();
    setAllShipments(Array.isArray(data) ? data : (data?.value ?? []));
  };

  const handleGetAll = async () => {
    setLoading(true);
    setSearchedShipment(null);

    try {
      await fetchAllShipments();
      showMessage("Loaded all shipments.");
    } catch (error) {
      showMessage(`Get all shipments failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByOrderId = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/shipping/${searchOrderId}`,
      );
      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }
      const data = await response.json();
      setSearchedShipment(data);
      showMessage(`Shipment found for orderId=${searchOrderId}.`);
    } catch (error) {
      setSearchedShipment(null);
      showMessage(`Search shipment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${normalizedBaseUrl}/shipping/update-status/${updateForm.shipmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shipmentStatus: updateForm.shipmentStatus }),
        },
      );

      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }

      const updated = await response.json();
      showMessage(
        `Shipment status updated. shipmentId=${updated.shipmentId}, status=${updated.shipmentStatus}`,
      );
      await fetchAllShipments();
    } catch (error) {
      showMessage(`Update shipment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="container">
        <h1>Shipping Service Dashboard</h1>

        <section className="card">
          <h2>API Configuration</h2>
          <label htmlFor="apiBaseUrl">Shipping API Base URL</label>
          <input
            id="apiBaseUrl"
            type="text"
            value={apiBaseUrl}
            onChange={(event) => setApiBaseUrl(event.target.value)}
            placeholder="http://localhost:8084"
          />
        </section>

        <div className="grid">
          <section className="card">
            <h2>Create Shipment</h2>
            <form onSubmit={createShipment}>
              <label htmlFor="orderId">Order ID</label>
              <input
                id="orderId"
                name="orderId"
                type="number"
                value={createForm.orderId}
                onChange={handleCreateChange}
                required
              />

              <label htmlFor="deliveryAddress">Delivery Address</label>
              <input
                id="deliveryAddress"
                name="deliveryAddress"
                type="text"
                value={createForm.deliveryAddress}
                onChange={handleCreateChange}
                required
              />

              <label htmlFor="shipmentStatus">Shipment Status</label>
              <select
                id="shipmentStatus"
                name="shipmentStatus"
                value={createForm.shipmentStatus}
                onChange={handleCreateChange}
              >
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>

              <button type="submit" disabled={loading}>
                Create Shipment
              </button>
            </form>
          </section>

          <section className="card">
            <h2>Search Shipment by Order ID</h2>
            <form onSubmit={handleSearchByOrderId}>
              <label htmlFor="searchOrderId">Order ID</label>
              <input
                id="searchOrderId"
                type="number"
                value={searchOrderId}
                onChange={(event) => setSearchOrderId(event.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                Search
              </button>
            </form>

            {searchedShipment && (
              <div className="result-box">
                <p>
                  <strong>Shipment ID:</strong> {searchedShipment.shipmentId}
                </p>
                <p>
                  <strong>Order ID:</strong> {searchedShipment.orderId}
                </p>
                <p>
                  <strong>Status:</strong> {searchedShipment.shipmentStatus}
                </p>
                <p>
                  <strong>Address:</strong> {searchedShipment.deliveryAddress}
                </p>
              </div>
            )}
          </section>

          <section className="card">
            <h2>Update Shipment Status</h2>
            <form onSubmit={handleUpdateStatus}>
              <label htmlFor="shipmentId">Shipment ID</label>
              <input
                id="shipmentId"
                name="shipmentId"
                type="number"
                value={updateForm.shipmentId}
                onChange={handleUpdateChange}
                required
              />

              <label htmlFor="updateStatus">New Status</label>
              <select
                id="updateStatus"
                name="shipmentStatus"
                value={updateForm.shipmentStatus}
                onChange={handleUpdateChange}
              >
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>

              <button type="submit" disabled={loading}>
                Update Status
              </button>
            </form>
          </section>
        </div>

        <section className="card">
          <div className="card-head">
            <h2>All Shipments</h2>
            <button type="button" onClick={handleGetAll} disabled={loading}>
              Refresh List
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Delivery Address</th>
                  <th>Shipment Date</th>
                </tr>
              </thead>
              <tbody>
                {allShipments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty">
                      No shipments loaded yet.
                    </td>
                  </tr>
                ) : (
                  allShipments.map((shipment) => (
                    <tr key={shipment.shipmentId}>
                      <td>{shipment.shipmentId}</td>
                      <td>{shipment.orderId}</td>
                      <td>{shipment.shipmentStatus}</td>
                      <td>{shipment.deliveryAddress}</td>
                      <td>{shipment.shipmentDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}

export default App;
