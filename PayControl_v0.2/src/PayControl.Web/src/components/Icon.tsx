// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { ReactNode } from 'react';
// Prepara o valor `paths` usado pela tela.
const paths: Record<string, ReactNode> = {
    dashboard: <>
<path d="M3 11 12 4l9 7"/>
<path d="M5 10v10h14V10"/>
<path d="M9 20v-6h6v6"/>
</>,
    pay: <>
<rect x="4" y="3" width="16" height="18" rx="2"/>
<path d="M8 7h8M8 11h8M8 15h5"/>
<path d="m16 16 2 2 3-4"/>
</>,
    receive: <>
<circle cx="12" cy="12" r="9"/>
<path d="M16 8h-5a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H8M12 6v12"/>
</>,
    cash: <>
<path d="M4 19V5M4 19h16"/>
<path d="m7 15 4-4 3 2 5-6"/>
</>,
    report: <>
<path d="M6 2h9l4 4v16H6z"/>
<path d="M14 2v5h5M9 12h6M9 16h6"/>
</>,
    registry: <>
<circle cx="9" cy="8" r="3"/>
<path d="M3 20c0-4 2-6 6-6s6 2 6 6M17 8h4M19 6v4"/>
</>,
    reconcile: <>
<path d="M4 7h13l-3-3M20 17H7l3 3"/>
</>,
    backup: <>
<path d="M6 19a4 4 0 0 1 0-8 6 6 0 0 1 11-2 5 5 0 0 1 1 10H6z"/>
<path d="m12 12 3 3h-2v4h-2v-4H9z"/>
</>,
    search: <>
<circle cx="11" cy="11" r="7"/>
<path d="m20 20-4-4"/>
</>,
    bell: <>
<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>
</>,
    calendar: <>
<rect x="3" y="5" width="18" height="16" rx="2"/>
<path d="M8 3v4M16 3v4M3 10h18"/>
</>,
    plus: <>
<path d="M12 5v14M5 12h14"/>
</>,
    upload: <>
<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>
</>,
    download: <>
<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>
</>,
    filter: <>
<path d="M4 5h16l-6 7v6l-4 2v-8z"/>
</>,
    wallet: <>
<rect x="3" y="6" width="18" height="13" rx="2"/>
<path d="M16 10h5v5h-5a2 2 0 0 1 0-5zM7 6V4h10v2"/>
</>,
    up: <>
<path d="M12 19V5M6 11l6-6 6 6"/>
</>,
    down: <>
<path d="M12 5v14M6 13l6 6 6-6"/>
</>,
    warning: <>
<path d="m12 3 10 18H2z"/>
<path d="M12 9v5M12 18h.01"/>
</>,
    user: <>
<circle cx="12" cy="8" r="4"/>
<path d="M4 21c0-5 3-8 8-8s8 3 8 8"/>
</>,
    bank: <>
<path d="m3 9 9-5 9 5M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M4 19h16M3 22h18"/>
</>,
    tag: <>
<path d="M20 13 11 22 2 13V4h9z"/>
<circle cx="7" cy="9" r="1.5"/>
</>,
    truck: <>
<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/>
<circle cx="7" cy="18" r="2"/>
<circle cx="18" cy="18" r="2"/>
</>,
    close: <>
<path d="m6 6 12 12M18 6 6 18"/>
</>,
    check: <>
<path d="m5 12 4 4L19 6"/>
</>,
    edit: <>
<path d="m4 20 4-1 10-10-3-3L5 16zM13 7l3 3"/>
</>,
    trash: <>
<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>
</>,
    menu: <>
<circle cx="5" cy="12" r="1"/>
<circle cx="12" cy="12" r="1"/>
<circle cx="19" cy="12" r="1"/>
</>,
    info: <>
<circle cx="12" cy="12" r="9"/>
<path d="M12 11v6M12 7h.01"/>
</>,
    refresh: <>
<path d="M20 6v6h-6M4 18v-6h6"/>
<path d="M18 9a7 7 0 0 0-12-3l-2 2M6 15a7 7 0 0 0 12 3l2-2"/>
</>,
};
// Declara o componente/função `Icon`.
export function Icon({ name, size = 20, className = '' }: {
    name: string;
    size?: number;
    className?: string;
}) {
    // Retorna a interface que será renderizada pelo React.
    return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.info}
</svg>;
}
