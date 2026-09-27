// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { ReactNode } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Icon } from './Icon';
export const money = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
export const dateBR = (v?: string | null) => v ? new Intl.DateTimeFormat('pt-BR').format(new Date(v)) : '—';
// Declara o componente/função `Card`.
export function Card({ children, className = '', title, subtitle, action }: {
    children: ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    action?: ReactNode;
}) {
    // Retorna a interface que será renderizada pelo React.
    return <section className={`card ${className}`}>{(title || action) && <div className="card-head">
<div>{title && <h3>{title}
</h3>}{subtitle && <p>{subtitle}
</p>}
</div>{action}
</div>}{children}
</section>;
}
export function Kpi({ icon, label, value, trend, tone = 'blue', hint }: {
    icon: string;
    label: string;
    value: string;
    trend?: string;
    tone?: string;
    hint?: string;
}) {
    // Retorna a interface que será renderizada pelo React.
    return <Card className="kpi">
<div className={`kpi-icon tone-${tone}`}>
<Icon name={icon}/>
</div>
<div>
<span className="kpi-label">{label}
</span>
<strong>{value}
</strong>{trend && <div className={`trend ${trend.startsWith('-') ? 'negative' : 'positive'}`}>{trend}
</div>}{hint && <small>{hint}
</small>}
</div>
</Card>;
}
export function Badge({ children, tone = 'neutral' }: {
    children: ReactNode;
    tone?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
}) { return <span className={`badge badge-${tone}`}>{children}
</span>; }
export const statusTone = (s: string): 'success' | 'danger' | 'warning' | 'info' | 'neutral' => ['Pago', 'Recebido', 'Efetivada', 'Concluído', 'Conciliado', 'Ativo'].includes(s) ? 'success' : ['Vencido', 'Cancelado'].includes(s) ? 'danger' : ['Pendente'].includes(s) ? 'warning' : ['Previsto'].includes(s) ? 'info' : 'neutral';
export function Button({ children, icon, variant = 'primary', onClick, type = 'button', disabled = false }: {
    children: ReactNode;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
}) { return <button type={type} className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={17}/>}<span>{children}
</span>
</button>; }
export function Field({ label, children }: {
    label: string;
    children: ReactNode;
}) { return <label className="field">
<span>{label}
</span>{children}
</label>; }
// Declara o componente/função `DemoPill`.
export function DemoPill() { return <span className="demo-pill">
<Icon name="info" size={14}/> dados demonstrativos</span>; }
export function EmptyState({ text = 'Nenhum registro encontrado.' }: {
    text?: string;
}) { return <div className="empty">
<Icon name="info"/>
<span>{text}
</span>
</div>; }
export function Bars({ items }: {
    items: {
        label: string;
        a: number;
        b: number;
    }[];
}) {
    const max = Math.max(1, ...items.flatMap(x => [x.a, x.b]));
    // Retorna a interface que será renderizada pelo React.
    return <div className="bars-chart">
<div className="chart-grid"/>{items.map(x => <div className="bar-group" key={x.label}>
<div className="bar-pair">
<i className="bar a" style={{ height: `${Math.max(5, x.a / max * 100)}%` }}/>
<i className="bar b" style={{ height: `${Math.max(5, x.b / max * 100)}%` }}/>
</div>
<span>{x.label}
</span>
</div>)}
</div>;
}
export function Donut({ segments, center }: {
    segments: {
        label: string;
        value: number;
        color: string;
    }[];
    center: string;
}) {
    const total = segments.reduce((a, b) => a + b.value, 0) || 1;
    let p = 0;
    const stops = segments.map(s => { const start = p; p += s.value / total * 100; return `${s.color} ${start}% ${p}%`; }).join(',');
    // Retorna a interface que será renderizada pelo React.
    return <div className="donut-wrap">
<div className="donut" style={{ background: `conic-gradient(${stops})` }}>
<div>
<strong>{center}
</strong>
<small>Total</small>
</div>
</div>
<div className="legend">{segments.map(s => <div key={s.label}>
<i style={{ background: s.color }}/>
<span>{s.label}
</span>
<b>{(s.value / total * 100).toFixed(1)}%</b>
</div>)}
</div>
</div>;
}
export function LineChart({ points }: {
    points: number[];
}) {
    const max = Math.max(...points, 1), min = Math.min(...points, 0);
    const range = max - min || 1;
    const coords = points.map((v, i) => `${i / (Math.max(points.length - 1, 1)) * 100},${88 - (v - min) / range * 72}`).join(' ');
    // Retorna a interface que será renderizada pelo React.
    return <div className="line-chart">
<svg viewBox="0 0 100 100" preserveAspectRatio="none">
<defs>
<linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stopColor="#2f73f6" stopOpacity=".24"/>
<stop offset="1" stopColor="#2f73f6" stopOpacity="0"/>
</linearGradient>
</defs>
<polyline points={`0,92 ${coords} 100,92`} fill="url(#area)" stroke="none"/>
<polyline points={coords} fill="none" stroke="#246cf0" strokeWidth="1.3" vectorEffect="non-scaling-stroke"/>{points.map((v, i) => { const x = i / (Math.max(points.length - 1, 1)) * 100, y = 88 - (v - min) / range * 72; return <circle key={i} cx={x} cy={y} r="1.8" fill="white" stroke="#246cf0" strokeWidth="1" vectorEffect="non-scaling-stroke"/>; })}
</svg>
</div>;
}
export function Modal({ open, title, onClose, children }: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}) { if (!open)
    // Retorna a interface que será renderizada pelo React.
    return null; return <div className="modal-backdrop" onMouseDown={(e: any) => { if (e.currentTarget === e.target)
    onClose(); }}>
<div className="modal">
<div className="modal-head">
<h2>{title}
</h2>
<button onClick={onClose}>
<Icon name="close"/>
</button>
</div>{children}
</div>
</div>; }
