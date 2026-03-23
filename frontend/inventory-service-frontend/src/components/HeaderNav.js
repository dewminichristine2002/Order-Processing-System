import React from "react";
import { NavLink, useLocation } from "react-router-dom";

function NavItem({ to, end, icon, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? "active" : undefined)}
    >
      <span aria-hidden>{icon}</span>
      {children}
    </NavLink>
  );
}

export default function HeaderNav() {
  const location = useLocation();
  const isCustomer =
    location.pathname === "/shop" || location.pathname.startsWith("/shop/");

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-dot" aria-hidden="true" />
          <div>
            <div style={{ lineHeight: 1.1 }}>Inventory</div>
            <span className="brand-sub">SERVICE</span>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          {isCustomer ? (
            <NavItem to="/shop" icon="🛒">
              Shop
            </NavItem>
          ) : (
            <>
              <NavItem to="/shop" icon="🛒">
                Shop
              </NavItem>
              <NavItem to="/" end icon="🏠">
                Dashboard
              </NavItem>
              <NavItem to="/products" icon="▢">
                Products
              </NavItem>
              <NavItem to="/add-product" icon="＋">
                Add Product
              </NavItem>
              <NavItem to="/reduce-stock" icon="↓">
                Reduce Stock
              </NavItem>
              <NavItem to="/increase-stock" icon="↑">
                Increase Stock
              </NavItem>
              <NavItem to="/stock-updates" icon="〰">
                Stock Updates
              </NavItem>
            </>
          )}
        </nav>

        <div className="header-spacer" />
      </div>
    </header>
  );
}
