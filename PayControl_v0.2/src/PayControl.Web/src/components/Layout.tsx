import type {
    ReactNode
} from 'react';

import {
    Icon
} from './Icon';

import {
    useCompany
} from '../contexts/CompanyContext';


/*
 * Itens do menu lateral.
 */
const nav = [
    [
        '/',
        'dashboard',
        'Dashboard'
    ],

    [
        '/contas-pagar',
        'pay',
        'Contas a Pagar'
    ],

    [
        '/contas-receber',
        'receive',
        'Contas a Receber'
    ],

    [
        '/fluxo-caixa',
        'cash',
        'Fluxo de Caixa'
    ],

    [
        '/relatorios',
        'report',
        'Relatórios'
    ],

    [
        '/cadastros',
        'registry',
        'Cadastros'
    ],

    [
        '/conciliacao',
        'reconcile',
        'Conciliação'
    ],

    [
        '/backups',
        'backup',
        'Backups'
    ]
];


/*
 * Layout principal da aplicação.
 */
export function Layout({
    path,
    navigate,
    children
}: {
    path: string;

    navigate:
        (
            path: string
        ) => void;

    children:
        ReactNode;
}) {
    /*
     * Recupera as empresas
     * do contexto global.
     */
    const {
        empresas,
        empresaAtivaId,
        selecionarEmpresa,
        carregandoEmpresas
    } =
        useCompany();


    return (
        <div className="app-shell">

            <aside className="sidebar">

                {/*
                 * Marca do sistema.
                 */}
                <button
                    className="brand"

                    onClick={() =>
                        navigate('/')
                    }
                >

                    <span className="brand-bars">
                        <i />
                        <i />
                        <i />
                    </span>

                    <b>
                        PayControl
                    </b>

                </button>


                {/*
                 * Navegação lateral.
                 */}
                <nav>

                    {nav.map(
                        (
                            [
                                href,
                                icon,
                                label
                            ]
                        ) => (

                            <button
                                key={href}

                                className={
                                    path === href ||
                                    (
                                        href !== '/' &&
                                        path.startsWith(
                                            href
                                        )
                                    )

                                        ? 'active'

                                        : ''
                                }

                                onClick={() =>
                                    navigate(
                                        href
                                    )
                                }
                            >

                                <Icon
                                    name={icon}
                                />

                                <span>
                                    {label}
                                </span>

                            </button>
                        )
                    )}

                </nav>


                {/*
                 * Identificação da versão.
                 */}
                <div className="version-box">

                    <strong>
                        PayControl
                    </strong>

                    <span>
                        Versão 0.2
                    </span>

                    <small>
                        Gestão financeira simplificada.
                    </small>

                </div>

            </aside>


            <div className="workspace">

                <header className="topbar">

                    {/*
                     * Seletor real da Empresa Ativa.
                     */}
                    <div className="company-select">

                        <Icon
                            name="bank"
                            size={17}
                        />


                        <select
                            value={
                                empresaAtivaId ??
                                ''
                            }

                            disabled={
                                carregandoEmpresas ||
                                empresas.length === 0
                            }

                            onChange={
                                event =>
                                    selecionarEmpresa(
                                        Number(
                                            event.target.value
                                        )
                                    )
                            }

                            style={{
                                border: 0,

                                outline: 0,

                                background:
                                    'transparent',

                                color:
                                    '#14284c',

                                fontWeight:
                                    600,

                                minWidth:
                                    190,

                                cursor:
                                    'pointer'
                            }}
                        >

                            {/*
                             * Nenhuma empresa cadastrada.
                             */}
                            {empresas.length === 0 && (

                                <option value="">
                                    Nenhuma empresa cadastrada
                                </option>

                            )}


                            {/*
                             * Exibe somente empresas ativas.
                             */}
                            {empresas

                                .filter(
                                    empresa =>
                                        empresa.ativa
                                )

                                .map(
                                    empresa => (

                                        <option
                                            key={
                                                empresa.id
                                            }

                                            value={
                                                empresa.id
                                            }
                                        >

                                            {
                                                empresa.nomeFantasia ||
                                                empresa.nome
                                            }

                                        </option>
                                    )
                                )}

                        </select>

                    </div>


                    <button className="date-select">

                        <Icon
                            name="calendar"
                            size={17}
                        />

                        <span>
                            01/09/2026 - 30/09/2026
                        </span>

                        <span>
                            ⌄
                        </span>

                    </button>


                    <div className="global-search">

                        <Icon
                            name="search"
                            size={18}
                        />

                        <input
                            placeholder="Buscar lançamentos, fornecedores, clientes..."
                        />

                    </div>


                    <button className="notification">

                        <Icon
                            name="bell"
                        />

                        <b>
                            3
                        </b>

                    </button>


                    <div className="avatar">
                        PC
                    </div>


                    <div className="profile">

                        <strong>
                            PayControl
                        </strong>

                        <small>
                            Administrador local
                        </small>

                    </div>

                </header>


                <main>
                    {children}
                </main>

            </div>

        </div>
    );
}