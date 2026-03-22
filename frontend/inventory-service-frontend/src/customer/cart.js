const CART_KEY = "inventory_cart_v1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCart() {
  const raw = window.localStorage.getItem(CART_KEY);
  const parsed = safeParse(raw);
  if (!parsed || typeof parsed !== "object") return { items: {} };

  const items = parsed.items;
  if (!items || typeof items !== "object") return { items: {} };
  return { items };
}

export function getCartCount() {
  const { items } = getCart();
  return Object.values(items).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
}

export function addToCart(productId, quantity = 1) {
  const id = String(productId);
  const qty = Math.max(1, Number(quantity) || 1);

  const cart = getCart();
  const next = {
    items: {
      ...cart.items,
      [id]: (Number(cart.items[id]) || 0) + qty,
    },
  };

  window.localStorage.setItem(CART_KEY, JSON.stringify(next));
  return next;
}
