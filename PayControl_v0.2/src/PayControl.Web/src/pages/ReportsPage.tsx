import {
    useEffect,
    useState
} from 'react';

import {
    api,
    apiUrl,
    loadWithFallback
} from '../api';

import {
    useCompany
} from '../contexts/CompanyContext';

import {
    Bars,
    Card,
    DemoPill,
    Donut,
    Field,
    Kpi,
    money
} from '../components/UI';


type Resumo = {
    receitaTotal?:
        number;

    despesaTotal?:
        number;

    lucroPrejuizo?:
        number;

    receitas?:
        number
        |
        {
            total?: number;
            recebidas?: number;
            previstas?: number;
        };

    despesas?:
        number
        |
        {
            total?: number;
            pagas?: number;
            pendentes?: number;
        };

    resultado?:
        number;

    resultadoRealizado?:
        number;

    resultadoProjetado?:
        number;
};


/*
 * Dados utilizados somente
 * quando o backend estiver indisponível.
 */
const resumoFallback:
    Resumo =
{
    receitaTotal:
        46200,

    despesaTotal:
        33750,

    lucroPrejuizo:
        12450
};


export default function ReportsPage() {
    /*
     * Empresa ativa.
     */
    const {
        empresaAtiva
    } =
        useCompany();


    /*
     * Resumo financeiro.
     */
    const [
        resumo,
        setResumo
    ] =
        useState<Resumo>(
            resumoFallback
        );


    /*
     * Indicador do modo demo.
     */
    const [
        demo,
        setDemo
    ] =
        useState(
            false
        );


    /*
     * Relatório selecionado.
     */
    const [
        tab,
        setTab
    ] =
        useState(
            'Resumo Financeiro'
        );


    /*
     * Busca o resumo da empresa ativa.
     *
     * empresaId é incluído automaticamente
     * pela camada api.ts.
     */
    useEffect(() => {
        void (
            async () => {
                const result =
                    await loadWithFallback(
                        () =>
                            api.get<
                                Resumo
                            >(
                                '/api/relatorios/resumo'
                            ),

                        resumoFallback
                    );


                setResumo(
                    result.data
                );


                setDemo(
                    result.demo
                );
            }
        )();
    }, []);


    /*
     * Normaliza os diferentes formatos
     * retornados pelo backend.
     */
    const receitas =
        resumo.receitaTotal
        ??
        (
            typeof resumo.receitas ===
            'number'

                ? resumo.receitas

                : resumo.receitas
                    ?.total
        )
        ??
        46200;


    const despesas =
        resumo.despesaTotal
        ??
        (
            typeof resumo.despesas ===
            'number'

                ? resumo.despesas

                : resumo.despesas
                    ?.total
        )
        ??
        33750;


    const resultado =
        resumo.lucroPrejuizo
        ??
        resumo.resultado
        ??
        resumo.resultadoProjetado
        ??
        receitas -
        despesas;


    /*
     * Tipos de relatórios exibidos.
     */
    const reports = [
        'Resumo Financeiro',
        'Fluxo de Caixa',
        'Receitas',
        'Despesas',
        'Receita Bruta Mensal',
        'DRE Gerencial',
        'Inadimplência',
        'Projeções',
        'Receitas por Cliente',
        'Despesas por Fornecedor'
    ];


    return (
        <>

            <div className="page-title">

                <div>

                    <div className="title-line">

                        <h1>
                            Relatórios
                        </h1>

                        {demo && (
                            <DemoPill />
                        )}

                    </div>


                    <p>
                        Análises e exportações para uma gestão mais estratégica do seu negócio.
                    </p>

                </div>

            </div>


            <div className="report-tabs">

                {reports.map(
                    report => (

                        <button
                            key={
                                report
                            }

                            onClick={() =>
                                setTab(
                                    report
                                )
                            }

                            className={
                                tab === report

                                    ? 'active'

                                    : ''
                            }
                        >

                            {report}


                            <small>

                                {
                                    report ===
                                    'Resumo Financeiro'

                                        ? 'Visão geral do período'

                                        :
                                    report.includes(
                                        'Receitas'
                                    )

                                        ? 'Análise de receitas'

                                        :
                                    report.includes(
                                        'Despesas'
                                    )

                                        ? 'Análise de despesas'

                                        : 'Relatório gerencial'
                                }

                            </small>

                        </button>
                    )
                )}

            </div>


            <div className="filter-bar report-filter">

                <Field label="Período">

                    <input
                        value="01/09/2026 - 30/09/2026"
                        readOnly
                    />

                </Field>


                <Field label="Empresa">

                    <input
                        value={
                            empresaAtiva
                                ?.nomeFantasia
                            ||
                            empresaAtiva
                                ?.nome
                            ||
                            'Nenhuma empresa selecionada'
                        }

                        readOnly
                    />

                </Field>


                <Field label="Categoria">

                    <select>

                        <option>
                            Todas as categorias
                        </option>

                    </select>

                </Field>


                <Field label="Cliente">

                    <select>

                        <option>
                            Todos os clientes
                        </option>

                    </select>

                </Field>


                <a
                    className="btn btn-secondary"

                    /*
                     * apiUrl inclui empresaId.
                     */
                    href={
                        apiUrl(
                            '/api/relatorios/pdf/resumo'
                        )
                    }

                    target="_blank"

                    rel="noreferrer"
                >

                    Exportar PDF

                </a>


                <a
                    className="btn btn-secondary"

                    /*
                     * CSV também recebe empresaId.
                     */
                    href={
                        apiUrl(
                            '/api/relatorios/exportar/resumo'
                        )
                    }

                    target="_blank"

                    rel="noreferrer"
                >

                    Exportar CSV

                </a>

            </div>


            <div className="kpi-grid four">

                <Kpi
                    icon="up"
                    label="Receita Total"
                    value={
                        money(
                            receitas
                        )
                    }
                    tone="green"
                    trend="+15,2%"
                />


                <Kpi
                    icon="down"
                    label="Despesa Total"
                    value={
                        money(
                            despesas
                        )
                    }
                    tone="red"
                    trend="+6,1%"
                />


                <Kpi
                    icon="cash"
                    label="Lucro / Prejuízo"
                    value={
                        money(
                            resultado
                        )
                    }
                    trend="+37,0%"
                />


                <Kpi
                    icon="warning"
                    label="Inadimplência"
                    value="4,8%"
                    tone="yellow"
                    trend="-2,1 p.p."
                />

            </div>


            <div className="reports-grid">

                <Card
                    className="span-2"

                    title="Receitas x Despesas"

                    subtitle="Comparativo mensal no período selecionado."
                >

                    <Bars
                        items={[
                            {
                                label: 'Abr',
                                a: 32400,
                                b: 24800
                            },

                            {
                                label: 'Mai',
                                a: 36200,
                                b: 27900
                            },

                            {
                                label: 'Jun',
                                a: 34800,
                                b: 29400
                            },

                            {
                                label: 'Jul',
                                a: 42600,
                                b: 31200
                            },

                            {
                                label: 'Ago',
                                a: 39500,
                                b: 32100
                            },

                            {
                                label: 'Set',
                                a: receitas,
                                b: despesas
                            }
                        ]}
                    />

                </Card>


                <Card title="DRE Gerencial Simplificada">

                    <div className="dre">

                        <div>

                            <span>
                                Receita Bruta
                            </span>

                            <b>
                                {
                                    money(
                                        receitas *
                                        1.14
                                    )
                                }
                            </b>

                        </div>


                        <div>

                            <span>
                                Deduções e Impostos
                            </span>

                            <b className="negative-text">

                                -
                                {
                                    money(
                                        receitas *
                                        0.14
                                    )
                                }

                            </b>

                        </div>


                        <div className="highlight">

                            <span>
                                Receita Líquida
                            </span>

                            <b>
                                {
                                    money(
                                        receitas
                                    )
                                }
                            </b>

                        </div>


                        <div>

                            <span>
                                Custos dos Produtos/Serviços
                            </span>

                            <b className="negative-text">

                                -
                                {
                                    money(
                                        despesas *
                                        0.55
                                    )
                                }

                            </b>

                        </div>


                        <div>

                            <span>
                                Despesas Operacionais
                            </span>

                            <b className="negative-text">

                                -
                                {
                                    money(
                                        despesas *
                                        0.45
                                    )
                                }

                            </b>

                        </div>


                        <div className="highlight">

                            <span>
                                Resultado do Período
                            </span>

                            <b className="positive-text">

                                {
                                    money(
                                        resultado
                                    )
                                }

                            </b>

                        </div>

                    </div>

                </Card>


                <Card title="Composição">

                    <Donut
                        center={
                            money(
                                receitas
                            )
                        }

                        segments={[
                            {
                                label:
                                    'Vendas',

                                value:
                                    23000,

                                color:
                                    '#2f73f6'
                            },

                            {
                                label:
                                    'Serviços',

                                value:
                                    15000,

                                color:
                                    '#16a985'
                            },

                            {
                                label:
                                    'Consultoria',

                                value:
                                    6200,

                                color:
                                    '#7453e8'
                            },

                            {
                                label:
                                    'Outros',

                                value:
                                    2000,

                                color:
                                    '#f4b83f'
                            }
                        ]}
                    />

                </Card>

            </div>


            <Card title="Detalhamento das Receitas e Despesas">

                <div className="table-scroll">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Mês
                                </th>

                                <th>
                                    Receitas
                                </th>

                                <th>
                                    Despesas
                                </th>

                                <th>
                                    Lucro / Prejuízo
                                </th>

                                <th>
                                    Margem
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                [
                                    [
                                        'Abril/2026',
                                        32400,
                                        24800
                                    ],

                                    [
                                        'Maio/2026',
                                        36200,
                                        27900
                                    ],

                                    [
                                        'Junho/2026',
                                        34800,
                                        29400
                                    ],

                                    [
                                        'Julho/2026',
                                        42600,
                                        31200
                                    ],

                                    [
                                        'Agosto/2026',
                                        39500,
                                        32100
                                    ],

                                    [
                                        'Setembro/2026',
                                        receitas,
                                        despesas
                                    ]
                                ].map(
                                    (
                                        [
                                            mes,
                                            receita,
                                            despesa
                                        ]
                                    ) => {
                                        const receitaNumero =
                                            Number(
                                                receita
                                            );


                                        const despesaNumero =
                                            Number(
                                                despesa
                                            );


                                        const lucro =
                                            receitaNumero -
                                            despesaNumero;


                                        const margem =
                                            receitaNumero

                                                ? (
                                                    lucro /
                                                    receitaNumero
                                                ) *
                                                100

                                                : 0;


                                        return (

                                            <tr
                                                key={
                                                    String(
                                                        mes
                                                    )
                                                }
                                            >

                                                <td>
                                                    {
                                                        String(
                                                            mes
                                                        )
                                                    }
                                                </td>


                                                <td className="positive-text">

                                                    {
                                                        money(
                                                            receitaNumero
                                                        )
                                                    }

                                                </td>


                                                <td className="negative-text">

                                                    {
                                                        money(
                                                            despesaNumero
                                                        )
                                                    }

                                                </td>


                                                <td>
                                                    {
                                                        money(
                                                            lucro
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        margem
                                                            .toFixed(
                                                                1
                                                            )
                                                    }
                                                    %
                                                </td>

                                            </tr>
                                        );
                                    }
                                )
                            }

                        </tbody>

                    </table>

                </div>

            </Card>

        </>
    );
}