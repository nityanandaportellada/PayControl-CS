import {
    useEffect,
    useState
} from 'react';

import {
    Layout
} from './components/Layout';

import {
    CompanyProvider,
    useCompany
} from './contexts/CompanyContext';

import DashboardPage
    from './pages/DashboardPage';

import AccountsPayablePage
    from './pages/AccountsPayablePage';

import AccountsReceivablePage
    from './pages/AccountsReceivablePage';

import CashFlowPage
    from './pages/CashFlowPage';

import ReportsPage
    from './pages/ReportsPage';

import RegistryPage
    from './pages/RegistryPage';

import ReconciliationPage
    from './pages/ReconciliationPage';

import BackupsPage
    from './pages/BackupsPage';


/*
 * Remove a barra final da URL
 * quando ela não for a raiz.
 */
function normalize(
    path: string
) {
    return path.length > 1

        ? path.replace(
            /\/$/,
            ''
        )

        : path;
}


/*
 * Parte interna da aplicação.
 *
 * Este componente já consegue
 * acessar a Empresa Ativa Global.
 */
function AppContent() {
    /*
     * Caminho atual.
     */
    const [
        path,
        setPath
    ] =
        useState(
            () =>
                normalize(
                    location.pathname
                )
        );


    /*
     * Recupera informações da
     * empresa global.
     */
    const {
        empresaAtivaId,
        carregandoEmpresas
    } =
        useCompany();


    /*
     * Detecta os botões voltar
     * e avançar do navegador.
     */
    useEffect(() => {
        const handlePopState =
            () => {
                setPath(
                    normalize(
                        location.pathname
                    )
                );
            };


        addEventListener(
            'popstate',
            handlePopState
        );


        return () => {
            removeEventListener(
                'popstate',
                handlePopState
            );
        };

    }, []);


    /*
     * Navegação interna do sistema.
     */
    function navigate(
        newPath: string
    ) {
        history.pushState(
            {},
            '',
            newPath
        );


        setPath(
            normalize(
                newPath
            )
        );


        scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }


    /*
     * A chave muda toda vez que
     * a empresa ativa muda.
     *
     * Dessa forma a página atual
     * é desmontada e carregada novamente.
     *
     * Isso faz os useEffect executarem
     * novas consultas já com empresaId.
     */
    const companyKey =
        empresaAtivaId ??
        'sem-empresa';


    /*
     * Página que será renderizada.
     */
    let page;


    /*
     * Aguarda a inicialização
     * do contexto de empresas.
     */
    if (carregandoEmpresas) {
        page = (
            <div className="page-title">

                <div>

                    <h1>
                        PayControl
                    </h1>

                    <p>
                        Carregando empresas...
                    </p>

                </div>

            </div>
        );

    } else if (
        path ===
        '/contas-pagar'
    ) {
        page = (
            <AccountsPayablePage
                key={companyKey}
            />
        );

    } else if (
        path ===
        '/contas-receber'
    ) {
        page = (
            <AccountsReceivablePage
                key={companyKey}
            />
        );

    } else if (
        path ===
        '/fluxo-caixa'
    ) {
        page = (
            <CashFlowPage
                key={companyKey}
            />
        );

    } else if (
        path ===
        '/relatorios'
    ) {
        page = (
            <ReportsPage
                key={companyKey}
            />
        );

    } else if (
        path ===
        '/cadastros'
    ) {
        page = (
            <RegistryPage
                key={companyKey}
            />
        );

    } else if (
        path ===
        '/conciliacao'
    ) {
        page = (
            <ReconciliationPage
                key={companyKey}
            />
        );

    } else if (
        path ===
        '/backups'
    ) {
        /*
         * Backup pertence à instalação inteira,
         * e não somente a uma empresa.
         */
        page = (
            <BackupsPage />
        );

    } else {
        page = (
            <DashboardPage
                key={companyKey}
                navigate={navigate}
            />
        );
    }


    /*
     * Layout principal.
     */
    return (
        <Layout
            path={path}
            navigate={navigate}
        >
            {page}
        </Layout>
    );
}


/*
 * Ponto principal da aplicação.
 *
 * O CompanyProvider envolve tudo
 * para disponibilizar empresa ativa
 * em qualquer tela.
 */
export default function App() {
    return (
        <CompanyProvider>

            <AppContent />

        </CompanyProvider>
    );
}