import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_INVENTORY_API_BASE_URL || "http://localhost:8080",
  timeout: 15000,
});

export async function fetchProducts() {
  const res = await api.get("/inventory");
  return res.data;
}

export async function fetchProduct(productId) {
  const res = await api.get(`/inventory/${productId}`);
  return res.data;
}

export async function createProduct(payload) {
  const res = await api.post("/inventory/products", payload);
  return res.data;
}

export async function updateProduct(productId, payload) {
  const res = await api.put(`/inventory/products/${productId}`, payload);
  return res.data;
}

export async function deleteProduct(productId) {
  await api.delete(`/inventory/products/${productId}`);
}

export async function reduceStock(productId, payload) {
  const res = await api.put(`/inventory/reduce-stock/${productId}`, payload);
  return res.data;
}

export async function increaseStock(productId, payload) {
  const res = await api.put(`/inventory/increase-stock/${productId}`, payload);
  return res.data;
}

export async function fetchStockUpdates({ productId, page = 0, size = 200 } = {}) {
  const params = { page, size };
  if (productId !== undefined && productId !== null && productId !== "") {
    params.productId = productId;
  }
  const res = await api.get("/inventory/stock-updates", { params });
  return res.data;
}
