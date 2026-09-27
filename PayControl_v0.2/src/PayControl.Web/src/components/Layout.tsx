// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { ReactNode } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Icon } from './Icon';
// Prepara o valor `nav` usado pela tela.
const nav = [['/', 'dashboard', 'Dashboard'], ['/contas-pagar', 'pay', 'Contas a Pagar'], ['/contas-receber', 'receive', 'Contas a Receber'], ['/fluxo-caixa', 'cash', 'Fluxo de Caixa'], ['/relatorios', 'report', 'Relatórios'], ['/cadastros', 'registry', 'Cadastros'], ['/conciliacao', 'reconcile', 'Conciliação'], ['/backups', 'backup', 'Backups']];
// Declara o componente/função `Layout`.
export function Layout({ path, navigate, children }: {
    path: string;
    navigate: (p: string) => void;
    children: ReactNode;
}) {
    // Retorna a interface que será renderizada pelo React.
    return <div className="app-shell">
<aside className="sidebar">
<button className="brand" onClick={() => navigate('/')}>
<span className="brand-bars">
<i />
<i />
<i />
</span>
<b>PayControl</b>
</button>
<nav>{nav.map(([href, icon, label]) => <button key={href} className={(path === href || (href !== '/' && path.startsWith(href))) ? 'active' : ''} onClick={() => navigate(href)}>
<Icon name={icon}/>
<span>{label}
</span>
</button>)}
</nav>
<div className="version-box">
<strong>PayControl</strong>
<span>Versão 0.2</span>
<small>Gestão financeira simplificada.</small>
</div>
</aside>
<div className="workspace">
<header className="topbar">
<button className="company-select">
<Icon name="bank" size={17}/>
<span>Empresa Exemplo Ltda.</span>
<span>⌄</span>
</button>
<button className="date-select">
<Icon name="calendar" size={17}/>
<span>01/09/2026 - 30/09/2026</span>
<span>⌄</span>
</button>
<div className="global-search">
<Icon name="search" size={18}/>
<input placeholder="Buscar lançamentos, fornecedores, clientes..."/>
</div>
<button className="notification">
<Icon name="bell"/>
<b>3</b>
</button>
<div className="avatar">PC</div>
<div className="profile">
<strong>PayControl</strong>
<small>Administrador local</small>
</div>
</header>
<main>{children}
</main>
</div>
</div>;
}
