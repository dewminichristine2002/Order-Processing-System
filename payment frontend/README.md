# Payment Service Frontend

This is the frontend application for the Payment Service.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Features

- **Process Payment**: Create new payment entries with order ID, amount, and payment method
- **Get Payment**: Retrieve payment details by order ID

### API Integration

The frontend connects to the Payment Service backend at `http://localhost:8082`

Make sure the backend service is running before using the frontend.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.
