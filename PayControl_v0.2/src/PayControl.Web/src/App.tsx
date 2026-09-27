// Importa as funções, componentes ou dados utilizados por este módulo.
import { useEffect, useState } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Layout } from './components/Layout';
// Importa as funções, componentes ou dados utilizados por este módulo.
import DashboardPage from './pages/DashboardPage';
// Importa as funções, componentes ou dados utilizados por este módulo.
import AccountsPayablePage from './pages/AccountsPayablePage';
// Importa as funções, componentes ou dados utilizados por este módulo.
import AccountsReceivablePage from './pages/AccountsReceivablePage';
// Importa as funções, componentes ou dados utilizados por este módulo.
import CashFlowPage from './pages/CashFlowPage';
// Importa as funções, componentes ou dados utilizados por este módulo.
import ReportsPage from './pages/ReportsPage';
// Importa as funções, componentes ou dados utilizados por este módulo.
import RegistryPage from './pages/RegistryPage';
// Importa as funções, componentes ou dados utilizados por este módulo.
import ReconciliationPage from './pages/ReconciliationPage';
// Importa as funções, componentes ou dados utilizados por este módulo.
import BackupsPage from './pages/BackupsPage';
// Declara o componente/função `normalize`.
function normalize(p: string) { return p.length > 1 ? p.replace(/\/$/, '') : p; }
// Declara o componente/função `App`.
export default function App() {
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [path, setPath] = useState(() => normalize(location.pathname));
    // Executa este efeito quando o componente é carregado ou quando suas dependências mudam.
    useEffect(() => { const f = () => setPath(normalize(location.pathname)); addEventListener('popstate', f); return () => removeEventListener('popstate', f); }, []);
    // Prepara o valor `navigate` usado pela tela.
    const navigate = (p: string) => { history.pushState({}, '', p); setPath(normalize(p)); scrollTo({ top: 0, behavior: 'smooth' }); };
    // Prepara o valor `page` usado pela tela.
    const page = path === '/contas-pagar' ? <AccountsPayablePage /> : path === '/contas-receber' ? <AccountsReceivablePage /> : path === '/fluxo-caixa' ? <CashFlowPage /> : path === '/relatorios' ? <ReportsPage /> : path === '/cadastros' ? <RegistryPage /> : path === '/conciliacao' ? <ReconciliationPage /> : path === '/backups' ? <BackupsPage /> : <DashboardPage navigate={navigate}/>;
    // Retorna a interface que será renderizada pelo React.
    return <Layout path={path} navigate={navigate}>{page}
</Layout>;
}
