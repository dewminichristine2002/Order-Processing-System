# Inventory Service Frontend

## Pages
- Dashboard: `/`
- Products list: `/products`
- Product detail: `/products/:id`
- Add product: `/add-product`
- Reduce stock: `/reduce-stock`
- Stock updates: `/stock-updates`

## Configure API URL
Set `.env`:

- `REACT_APP_INVENTORY_API_BASE_URL=http://localhost:8080`

If your backend runs in Docker on `8085`:

- `REACT_APP_INVENTORY_API_BASE_URL=http://localhost:8085`

## Run
```powershell
cd frontend/inventory-service-frontend
npm install
npm start
```
