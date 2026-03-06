import React from 'react';

export function formatMoney(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return String(value ?? '');
  return numberValue.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getCategory(productName) {
  const name = String(productName ?? '').toLowerCase();
  if (name.includes('laptop') || name.includes('monitor') || name.includes('tv')) return 'Electronics';
  if (name.includes('keyboard') || name.includes('mouse') || name.includes('head')) return 'Peripherals';
  if (name.includes('phone') || name.includes('mobile')) return 'Mobile';
  return 'General';
}

export function getStatus(stockQuantity) {
  const qty = Number(stockQuantity ?? 0);
  if (qty <= 0) return { key: 'out', label: 'Out of Stock', tone: 'red' };
  if (qty <= 5) return { key: 'critical', label: 'Critical', tone: 'red' };
  if (qty <= 10) return { key: 'low', label: 'Low', tone: 'yellow' };
  return { key: 'in', label: 'In Stock', tone: 'green' };
}

export function StatusBadge({ stockQuantity }) {
  const status = getStatus(stockQuantity);
  const klass =
    status.tone === 'green'
      ? 'badge badge-green badge-soft'
      : status.tone === 'yellow'
        ? 'badge badge-yellow badge-soft'
        : 'badge badge-red badge-soft';
  return <span className={klass}>{status.label}</span>;
}

export function ProductCell({ name, id }) {
  const category = getCategory(name);
  const icon = category === 'Electronics' ? '💻' : category === 'Peripherals' ? '⌨️' : category === 'Mobile' ? '📱' : '📦';
  return (
    <div className="product-name">
      <div className="product-icon" aria-hidden>
        {icon}
      </div>
      <div className="product-meta">
        <div style={{ fontWeight: 900 }}>{name}</div>
        <div className="product-sub">{category}</div>
      </div>
      {typeof id !== 'undefined' ? <span className="small" style={{ marginLeft: 10 }}>ID: {id}</span> : null}
    </div>
  );
}

export function ProgressCell({ value, max }) {
  const safeMax = Math.max(1, Number(max ?? 1));
  const safeValue = Math.max(0, Number(value ?? 0));
  const pct = Math.max(0, Math.min(100, Math.round((safeValue / safeMax) * 100)));
  const status = getStatus(safeValue);
  const toneClass = status.key === 'out' || status.key === 'critical' ? 'red' : status.key === 'low' ? 'yellow' : '';

  return (
    <div>
      <div className="small" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <span>
          {safeValue} / {safeMax}
        </span>
        <span>{pct}%</span>
      </div>
      <div className={`progress ${toneClass}`.trim()} aria-hidden>
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Sparkline({ tone = 'purple', points = [2, 4, 3, 6, 4, 7, 6] }) {
  const color = tone === 'green' ? '#22c55e' : tone === 'yellow' ? '#f59e0b' : tone === 'red' ? '#ef4444' : '#635bff';
  const width = 64;
  const height = 34;
  const padding = 3;

  const numericPoints = points.map((p) => Number(p));
  const min = Math.min(...numericPoints);
  const max = Math.max(...numericPoints);
  const span = Math.max(1, max - min);

  const stepX = (width - padding * 2) / Math.max(1, numericPoints.length - 1);
  const d = numericPoints
    .map((p, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((p - min) / span) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="trend">
      <path d={d} stroke={color} />
    </svg>
  );
}
