import "./App.css";
import { useEffect, useState } from "react";

const DEFAULT_API_BASE_URL =
  process.env.REACT_APP_SHIPPING_API_BASE_URL || "http://localhost:8084";

const STATUS_OPTIONS = ["SHIPPED", "DELIVERED"];

const initialManualShipmentForm = {
  orderId: "",
  customerName: "",
  contactNumber: "",
  deliveryAddress: "",
  email: "",
  shipmentStatus: "SHIPPED",
};

const initialStatusForm = {
  shipmentId: "",
  orderId: "",
  shipmentStatus: "DELIVERED",
};

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function statusTone(status) {
  if (status === "DELIVERED") {
    return "success";
  }

  if (status === "SHIPPED") {
    return "accent";
  }

  return "neutral";
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" &&
        (payload.message || payload.error || payload.title)) ||
      (typeof payload === "string" && payload) ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return payload;
}

async function requestJson(apiBaseUrl, path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
}

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL);
  const [manualShipmentForm, setManualShipmentForm] = useState(
    initialManualShipmentForm,
  );
  const [orderLookupId, setOrderLookupId] = useState("");
  const [shipmentLookupOrderId, setShipmentLookupOrderId] = useState("");
  const [createFromOrderId, setCreateFromOrderId] = useState("");
  const [assignmentOrderId, setAssignmentOrderId] = useState("");
  const [deliveryPerson, setDeliveryPerson] = useState("");
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [orderDetails, setOrderDetails] = useState(null);
  const [focusedShipment, setFocusedShipment] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [statusMessage, setStatusMessage] = useState({
    tone: "neutral",
    text: "Connect the UI to the shipping backend and manage shipments here.",
  });
  const [pendingAction, setPendingAction] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  async function loadShipments() {
    const data = await requestJson(apiBaseUrl, "/shipping", { headers: {} });
    setShipments(Array.isArray(data) ? data : []);
    return data;
  }

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      setPendingAction("dashboard");
      try {
        const data = await requestJson(apiBaseUrl, "/shipping", { headers: {} });
        if (!ignore) {
          setShipments(Array.isArray(data) ? data : []);
          setStatusMessage({
            tone: "success",
            text: "Shipment board loaded from the backend.",
          });
        }
      } catch (error) {
        if (!ignore) {
          setStatusMessage({
            tone: "danger",
            text: error.message,
          });
        }
      } finally {
        if (!ignore) {
          setPendingAction("");
        }
      }
    }

    bootstrap();

    return () => {
      ignore = true;
    };
  }, [apiBaseUrl, refreshToken]);

  const deliveredCount = shipments.filter(
    (shipment) => shipment.shipmentStatus === "DELIVERED",
  ).length;
  const assignedCount = shipments.filter(
    (shipment) => shipment.deliveryPerson && shipment.deliveryPerson.trim(),
  ).length;

  function updateStatusMessage(tone, text) {
    setStatusMessage({ tone, text });
  }

  function handleManualFormChange(event) {
    const { name, value } = event.target;
    setManualShipmentForm((current) => ({ ...current, [name]: value }));
  }

  function handleStatusFormChange(event) {
    const { name, value } = event.target;
    setStatusForm((current) => ({ ...current, [name]: value }));
  }

  async function handleManualShipmentCreate(event) {
    event.preventDefault();
    setPendingAction("manual-create");

    try {
      const createdShipment = await requestJson(apiBaseUrl, "/shipping/create", {
        method: "POST",
        body: JSON.stringify({
          orderId: Number(manualShipmentForm.orderId),
          customerName: manualShipmentForm.customerName,
          contactNumber: manualShipmentForm.contactNumber,
          deliveryAddress: manualShipmentForm.deliveryAddress,
          email: manualShipmentForm.email,
          shipmentStatus: manualShipmentForm.shipmentStatus,
        }),
      });

      setManualShipmentForm(initialManualShipmentForm);
      setFocusedShipment(createdShipment);
      await loadShipments();
      updateStatusMessage(
        "success",
        `Shipment ${createdShipment.shipmentId} created for order ${createdShipment.orderId}.`,
      );
    } catch (error) {
      updateStatusMessage("danger", error.message);
    } finally {
      setPendingAction("");
    }
  }

  async function handleCreateFromOrder(event) {
    event.preventDefault();
    setPendingAction("create-from-order");

    try {
      const createdShipment = await requestJson(
        apiBaseUrl,
        `/shipping/from-order/${createFromOrderId}`,
        {
          method: "POST",
        },
      );

      setCreateFromOrderId("");
      setFocusedShipment(createdShipment);
      await loadShipments();
      updateStatusMessage(
        "success",
        `Shipment ${createdShipment.shipmentId} created from order ${createdShipment.orderId}.`,
      );
    } catch (error) {
      updateStatusMessage("danger", error.message);
    } finally {
      setPendingAction("");
    }
  }

  async function handleOrderLookup(event) {
    event.preventDefault();
    setPendingAction("order-lookup");

    try {
      const data = await requestJson(
        apiBaseUrl,
        `/shipping/order-details/${orderLookupId}`,
        {
          headers: {},
        },
      );
      setOrderDetails(data);
      updateStatusMessage(
        "success",
        `Loaded order details for order ${data.orderId}.`,
      );
    } catch (error) {
      setOrderDetails(null);
      updateStatusMessage("danger", error.message);
    } finally {
      setPendingAction("");
    }
  }

  async function handleShipmentLookup(event) {
    event.preventDefault();
    setPendingAction("shipment-lookup");

    try {
      const data = await requestJson(
        apiBaseUrl,
        `/shipping/${shipmentLookupOrderId}`,
        {
          headers: {},
        },
      );
      setFocusedShipment(data);
      updateStatusMessage(
        "success",
        `Loaded shipment ${data.shipmentId} for order ${data.orderId}.`,
      );
    } catch (error) {
      setFocusedShipment(null);
      updateStatusMessage("danger", error.message);
    } finally {
      setPendingAction("");
    }
  }

  async function handleAssignDeliveryPerson(event) {
    event.preventDefault();
    setPendingAction("assign-delivery");

    try {
      const updatedShipment = await requestJson(
        apiBaseUrl,
        `/shipping/assign-delivery/order/${assignmentOrderId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            deliveryPerson,
          }),
        },
      );

      setAssignmentOrderId("");
      setDeliveryPerson("");
      setFocusedShipment(updatedShipment);
      await loadShipments();
      updateStatusMessage(
        "success",
        `Assigned ${updatedShipment.deliveryPerson} to order ${updatedShipment.orderId}.`,
      );
    } catch (error) {
      updateStatusMessage("danger", error.message);
    } finally {
      setPendingAction("");
    }
  }

  async function handleShipmentStatusUpdate(event) {
    event.preventDefault();
    setPendingAction("update-status");

    const path = statusForm.shipmentId
      ? `/shipping/update-status/${statusForm.shipmentId}`
      : `/shipping/update-status/order/${statusForm.orderId}`;

    try {
      const updatedShipment = await requestJson(apiBaseUrl, path, {
        method: "PUT",
        body: JSON.stringify({
          shipmentStatus: statusForm.shipmentStatus,
        }),
      });

      setStatusForm(initialStatusForm);
      setFocusedShipment(updatedShipment);
      await loadShipments();
      updateStatusMessage(
        "success",
        `Shipment ${updatedShipment.shipmentId} moved to ${updatedShipment.shipmentStatus}.`,
      );
    } catch (error) {
      updateStatusMessage("danger", error.message);
    } finally {
      setPendingAction("");
    }
  }

  async function handleRefreshBoard() {
    setRefreshToken((current) => current + 1);
  }

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <main className="app-container">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">CTSE shipping operations</p>
            <h1>Frontend aligned to your shipping backend</h1>
            <p className="hero-text">
              Manage shipment creation, track order-linked delivery state, and
              operate directly against the Spring endpoints exposed under
              <code>/shipping</code>.
            </p>
          </div>

          <div className="hero-stats">
            <article className="metric-card">
              <span className="metric-label">Total Shipments</span>
              <strong>{shipments.length}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Delivered</span>
              <strong>{deliveredCount}</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Assigned Couriers</span>
              <strong>{assignedCount}</strong>
            </article>
          </div>
        </section>

        <section className="status-bar">
          <div>
            <span className="status-label">API base URL</span>
            <input
              className="api-input"
              value={apiBaseUrl}
              onChange={(event) => setApiBaseUrl(event.target.value)}
            />
          </div>
          <div className={`banner banner-${statusMessage.tone}`}>
            {pendingAction
              ? `Running ${pendingAction.replaceAll("-", " ")}...`
              : statusMessage.text}
          </div>
        </section>

        <section className="workspace-grid">
          <article className="panel panel-highlight">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Order service bridge</p>
                <h2>Inspect order details</h2>
              </div>
            </div>
            <form className="stack-form" onSubmit={handleOrderLookup}>
              <label htmlFor="orderLookupId">Order ID</label>
              <input
                id="orderLookupId"
                type="number"
                value={orderLookupId}
                onChange={(event) => setOrderLookupId(event.target.value)}
                required
              />
              <button type="submit" disabled={Boolean(pendingAction)}>
                Fetch Order Details
              </button>
            </form>

            {orderDetails && (
              <div className="info-card">
                <div className="info-row">
                  <span>Customer</span>
                  <strong>{orderDetails.customerName}</strong>
                </div>
                <div className="info-row">
                  <span>Status</span>
                  <strong className={`status-pill ${statusTone(orderDetails.status)}`}>
                    {orderDetails.status || "UNKNOWN"}
                  </strong>
                </div>
                <div className="info-row">
                  <span>Contact</span>
                  <strong>{orderDetails.contactNumber}</strong>
                </div>
                <div className="info-row">
                  <span>Email</span>
                  <strong>{orderDetails.email}</strong>
                </div>
                <div className="info-row">
                  <span>Address</span>
                  <strong>{orderDetails.deliveryAddress}</strong>
                </div>
              </div>
            )}
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Fast path</p>
                <h2>Create shipment from order</h2>
              </div>
            </div>
            <form className="stack-form" onSubmit={handleCreateFromOrder}>
              <label htmlFor="createFromOrderId">Order ID</label>
              <input
                id="createFromOrderId"
                type="number"
                value={createFromOrderId}
                onChange={(event) => setCreateFromOrderId(event.target.value)}
                required
              />
              <button type="submit" disabled={Boolean(pendingAction)}>
                Create From Order
              </button>
            </form>
            <p className="helper-text">
              Uses <code>POST /shipping/from-order/{"{orderId}"}</code> and
              inherits customer details from the order service.
            </p>
          </article>

          <article className="panel panel-wide">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Manual entry</p>
                <h2>Create shipment with full payload</h2>
              </div>
            </div>
            <form className="form-grid" onSubmit={handleManualShipmentCreate}>
              <label>
                Order ID
                <input
                  name="orderId"
                  type="number"
                  value={manualShipmentForm.orderId}
                  onChange={handleManualFormChange}
                  required
                />
              </label>
              <label>
                Customer Name
                <input
                  name="customerName"
                  type="text"
                  value={manualShipmentForm.customerName}
                  onChange={handleManualFormChange}
                  required
                />
              </label>
              <label>
                Contact Number
                <input
                  name="contactNumber"
                  type="text"
                  value={manualShipmentForm.contactNumber}
                  onChange={handleManualFormChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={manualShipmentForm.email}
                  onChange={handleManualFormChange}
                  required
                />
              </label>
              <label className="span-2">
                Delivery Address
                <textarea
                  name="deliveryAddress"
                  rows="3"
                  value={manualShipmentForm.deliveryAddress}
                  onChange={handleManualFormChange}
                  required
                />
              </label>
              <label>
                Shipment Status
                <select
                  name="shipmentStatus"
                  value={manualShipmentForm.shipmentStatus}
                  onChange={handleManualFormChange}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions span-2">
                <button type="submit" disabled={Boolean(pendingAction)}>
                  Create Shipment
                </button>
              </div>
            </form>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Tracking</p>
                <h2>Find shipment by order</h2>
              </div>
            </div>
            <form className="stack-form" onSubmit={handleShipmentLookup}>
              <label htmlFor="shipmentLookupOrderId">Order ID</label>
              <input
                id="shipmentLookupOrderId"
                type="number"
                value={shipmentLookupOrderId}
                onChange={(event) =>
                  setShipmentLookupOrderId(event.target.value)
                }
                required
              />
              <button type="submit" disabled={Boolean(pendingAction)}>
                Fetch Shipment
              </button>
            </form>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Delivery desk</p>
                <h2>Assign delivery person</h2>
              </div>
            </div>
            <form className="stack-form" onSubmit={handleAssignDeliveryPerson}>
              <label htmlFor="assignmentOrderId">Order ID</label>
              <input
                id="assignmentOrderId"
                type="number"
                value={assignmentOrderId}
                onChange={(event) => setAssignmentOrderId(event.target.value)}
                required
              />
              <label htmlFor="deliveryPerson">Delivery Person</label>
              <input
                id="deliveryPerson"
                type="text"
                value={deliveryPerson}
                onChange={(event) => setDeliveryPerson(event.target.value)}
                required
              />
              <button type="submit" disabled={Boolean(pendingAction)}>
                Assign Courier
              </button>
            </form>
          </article>

          <article className="panel panel-highlight">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Status control</p>
                <h2>Update shipment status</h2>
              </div>
            </div>
            <form className="stack-form" onSubmit={handleShipmentStatusUpdate}>
              <label htmlFor="statusShipmentId">Shipment ID</label>
              <input
                id="statusShipmentId"
                name="shipmentId"
                type="number"
                value={statusForm.shipmentId}
                onChange={handleStatusFormChange}
                placeholder="Use this or order ID"
              />
              <label htmlFor="statusOrderId">Order ID</label>
              <input
                id="statusOrderId"
                name="orderId"
                type="number"
                value={statusForm.orderId}
                onChange={handleStatusFormChange}
                placeholder="Fallback when shipment ID is empty"
              />
              <label htmlFor="shipmentStatus">New Status</label>
              <select
                id="shipmentStatus"
                name="shipmentStatus"
                value={statusForm.shipmentStatus}
                onChange={handleStatusFormChange}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={
                  Boolean(pendingAction) ||
                  (!statusForm.shipmentId && !statusForm.orderId)
                }
              >
                Update Status
              </button>
            </form>
          </article>
        </section>

        <section className="board-section">
          <article className="panel shipment-focus">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Focused shipment</p>
                <h2>Selected shipment details</h2>
              </div>
            </div>
            {focusedShipment ? (
              <div className="detail-grid">
                <div className="info-row">
                  <span>Shipment ID</span>
                  <strong>{focusedShipment.shipmentId}</strong>
                </div>
                <div className="info-row">
                  <span>Order ID</span>
                  <strong>{focusedShipment.orderId}</strong>
                </div>
                <div className="info-row">
                  <span>Status</span>
                  <strong
                    className={`status-pill ${statusTone(
                      focusedShipment.shipmentStatus,
                    )}`}
                  >
                    {focusedShipment.shipmentStatus}
                  </strong>
                </div>
                <div className="info-row">
                  <span>Courier</span>
                  <strong>{focusedShipment.deliveryPerson || "Not assigned"}</strong>
                </div>
                <div className="info-row">
                  <span>Customer</span>
                  <strong>{focusedShipment.customerName}</strong>
                </div>
                <div className="info-row">
                  <span>Contact</span>
                  <strong>{focusedShipment.contactNumber}</strong>
                </div>
                <div className="info-row span-2">
                  <span>Address</span>
                  <strong>{focusedShipment.deliveryAddress}</strong>
                </div>
                <div className="info-row">
                  <span>Shipment Date</span>
                  <strong>{formatDateTime(focusedShipment.shipmentDate)}</strong>
                </div>
                <div className="info-row">
                  <span>Estimated Delivery</span>
                  <strong>
                    {formatDateTime(focusedShipment.estimatedDelivery)}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                Run a lookup, create a shipment, or update a record to inspect
                its full payload here.
              </div>
            )}
          </article>

          <article className="panel shipment-board">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Live board</p>
                <h2>All shipments</h2>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={handleRefreshBoard}
                disabled={Boolean(pendingAction)}
              >
                Refresh Board
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Shipment</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Courier</th>
                    <th>Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-cell">
                        No shipments available.
                      </td>
                    </tr>
                  ) : (
                    shipments.map((shipment) => (
                      <tr
                        key={shipment.shipmentId}
                        onClick={() => setFocusedShipment(shipment)}
                      >
                        <td>{shipment.shipmentId}</td>
                        <td>{shipment.orderId}</td>
                        <td>{shipment.customerName}</td>
                        <td>
                          <span
                            className={`status-pill ${statusTone(
                              shipment.shipmentStatus,
                            )}`}
                          >
                            {shipment.shipmentStatus}
                          </span>
                        </td>
                        <td>{shipment.deliveryPerson || "-"}</td>
                        <td>{formatDateTime(shipment.estimatedDelivery)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;
