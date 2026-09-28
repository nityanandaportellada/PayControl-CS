import {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    api,
    loadWithFallback
} from '../api';

import {
    useCompany
} from '../contexts/CompanyContext';

import {
    mockAlerts,
    mockContasFinanceiras,
    mockFluxo
} from '../mock';

import type {
    ContaFinanceira,
    Fluxo
} from '../types';

import {
    Badge,
    Card,
    DemoPill,
    Field,
    Kpi,
    LineChart,
    dateBR,
    money,
    statusTone
} from '../components/UI';


export default function CashFlowPage() {
    /*
     * Empresa atualmente selecionada.
     */
    const {
        empresaAtiva
    } =
        useCompany();


    /*
     * Fluxo financeiro.
     */
    const [
        fluxo,
        setFluxo
    ] =
        useState<Fluxo>(
            mockFluxo
        );


    /*
     * Contas financeiras.
     */
    const [
        contas,
        setContas
    ] =
        useState<
            ContaFinanceira[]
        >(
            mockContasFinanceiras
        );


    /*
     * Indicador de modo demo.
     */
    const [
        demo,
        setDemo
    ] =
        useState(
            false
        );


    /*
     * Conta financeira escolhida
     * para filtrar o extrato.
     */
    const [
        account,
        setAccount
    ] =
        useState(
            ''
        );


    /*
     * Carrega fluxo e contas.
     *
     * empresaId é incluído automaticamente
     * pelo api.ts.
     */
    async function load(
        id = ''
    ) {
        const suffix =
            id

                ? `?contaFinanceiraId=${id}`

                : '';


        const [
            fluxoResult,
            contasResult
        ] =
            await Promise.all([
                loadWithFallback(
                    () =>
                        api.get<
                            Fluxo
                        >(
                            `/api/fluxo-financeiro${suffix}`
                        ),

                    mockFluxo
                ),

                loadWithFallback(
                    () =>
                        api.get<
                            ContaFinanceira[]
                        >(
                            '/api/contas-financeiras'
                        ),

                    mockContasFinanceiras
                )
            ]);


        setFluxo(
            fluxoResult.data
        );


        setContas(
            contasResult.data
        );


        setDemo(
            fluxoResult.demo ||
            contasResult.demo
        );
    }


    /*
     * Carrega ao abrir a página.
     */
    useEffect(() => {
        void load();
    }, []);


    /*
     * Pontos do gráfico.
     */
    const points =
        useMemo(
            () =>
                fluxo.lancamentos.length

                    ? fluxo.lancamentos
                        .map(
                            item =>
                                item.saldo
                        )

                    : [
                        8200,
                        10200,
                        9400,
                        15800,
                        14600,
                        20650,
                        28300
                    ],

            [
                fluxo
            ]
        );


    return (
        <>

            <div className="page-title actions">

                <div>

                    <div className="title-line">

                        <h1>
                            Fluxo de Caixa
                        </h1>

                        {demo && (
                            <DemoPill />
                        )}

                    </div>


                    <p>
                        Acompanhe o extrato da conta, entradas, saídas e o saldo projetado em um só lugar.
                    </p>

                </div>


                <button className="btn btn-secondary">
                    Exportar
                </button>

            </div>


            <div className="filter-bar">

                <Field label="Período">

                    <input
                        value="01/09/2026 - 30/09/2026"
                        readOnly
                    />

                </Field>


                <Field label="Conta Financeira">

                    <select
                        value={
                            account
                        }

                        onChange={
                            event => {
                                setAccount(
                                    event.target.value
                                );

                                void load(
                                    event.target.value
                                );
                            }
                        }
                    >

                        <option value="">
                            Todas as contas
                        </option>


                        {contas.map(
                            conta => (

                                <option
                                    value={
                                        conta.id
                                    }

                                    key={
                                        conta.id
                                    }
                                >
                                    {conta.nome}
                                </option>

                            )
                        )}

                    </select>

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


                <Field label="Status">

                    <select>

                        <option>
                            Todos os status
                        </option>

                    </select>

                </Field>

            </div>


            <div className="kpi-grid five">

                <Kpi
                    icon="wallet"
                    label="Saldo Inicial"
                    value={
                        money(
                            fluxo.saldoInicial
                        )
                    }
                />


                <Kpi
                    icon="up"
                    label="Entradas"
                    value={
                        money(
                            fluxo.entradasRealizadas
                        )
                    }
                    tone="green"
                    trend="+12,5%"
                />


                <Kpi
                    icon="down"
                    label="Saídas"
                    value={
                        money(
                            fluxo.saidasRealizadas
                        )
                    }
                    tone="red"
                    trend="+6,1%"
                />


                <Kpi
                    icon="wallet"
                    label="Saldo Atual"
                    value={
                        money(
                            fluxo.saldoRealizado
                        )
                    }
                    trend="+37,0%"
                />


                <Kpi
                    icon="cash"
                    label="Saldo Projetado (30 dias)"
                    value={
                        money(
                            fluxo.saldoProjetado
                        )
                    }
                    tone="purple"
                    trend="+8,3%"
                />

            </div>


            <div className="cash-layout">

                <Card
                    title="Fluxo de Caixa no Período"

                    subtitle="Evolução do saldo com entradas, saídas e projeções."
                >

                    <LineChart
                        points={
                            points
                        }
                    />


                    <div className="mini-axis">

                        <span>
                            01/Set
                        </span>

                        <span>
                            07/Set
                        </span>

                        <span>
                            15/Set
                        </span>

                        <span>
                            22/Set
                        </span>

                        <span>
                            30/Set
                        </span>

                    </div>

                </Card>


                <Card title="Projeção de Saldo">

                    <div className="projection-list">

                        {[
                            7,
                            15,
                            30,
                            60,
                            90
                        ].map(
                            (
                                dias,
                                index
                            ) => (

                                <div
                                    key={
                                        dias
                                    }
                                >

                                    <span>
                                        Em {dias} dias
                                    </span>


                                    <b>
                                        {
                                            money(
                                                fluxo.saldoProjetado +
                                                index * 2800
                                            )
                                        }
                                    </b>


                                    <small>
                                        +{10 + index * 9},0%
                                    </small>

                                </div>
                            )
                        )}

                    </div>

                </Card>

            </div>


            <div className="cash-layout lower">

                <Card
                    title="Extrato de Lançamentos"

                    subtitle="Movimentações da conta selecionada no período."
                >

                    <div className="table-scroll">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Data
                                    </th>

                                    <th>
                                        Histórico
                                    </th>

                                    <th>
                                        Origem
                                    </th>

                                    <th>
                                        Entrada
                                    </th>

                                    <th>
                                        Saída
                                    </th>

                                    <th>
                                        Saldo
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {fluxo.lancamentos.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                `${item.id}-${index}`
                                            }
                                        >

                                            <td>
                                                {
                                                    dateBR(
                                                        item.data
                                                    )
                                                }
                                            </td>


                                            <td>
                                                {
                                                    item.descricao
                                                }
                                            </td>


                                            <td>

                                                <Badge
                                                    tone={
                                                        item.origem ===
                                                        'Receita'

                                                            ? 'success'

                                                            :
                                                        item.origem ===
                                                        'Transferência'

                                                            ? 'info'

                                                            : 'danger'
                                                    }
                                                >

                                                    {
                                                        item.origem
                                                    }

                                                </Badge>

                                            </td>


                                            <td className="num positive-text">

                                                {
                                                    item.entrada

                                                        ? money(
                                                            item.entrada
                                                        )

                                                        : '—'
                                                }

                                            </td>


                                            <td className="num negative-text">

                                                {
                                                    item.saida

                                                        ? money(
                                                            item.saida
                                                        )

                                                        : '—'
                                                }

                                            </td>


                                            <td className="num">

                                                {
                                                    money(
                                                        item.saldo
                                                    )
                                                }

                                            </td>


                                            <td>

                                                <Badge
                                                    tone={
                                                        statusTone(
                                                            item.status
                                                        )
                                                    }
                                                >

                                                    {
                                                        item.status
                                                    }

                                                </Badge>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </Card>


                <Card title="Alertas Financeiros">

                    <div className="alert-list">

                        {mockAlerts.map(
                            (
                                alerta,
                                index
                            ) => (

                                <div
                                    className={
                                        `alert alert-${alerta.level}`
                                    }

                                    key={
                                        index
                                    }
                                >

                                    <strong>
                                        {
                                            alerta.title
                                        }
                                    </strong>

                                    <span>
                                        {
                                            alerta.detail
                                        }
                                    </span>

                                </div>
                            )
                        )}

                    </div>


                    <div className="info-note">
                        Transferências entre contas da mesma empresa não afetam o resultado consolidado, mas aparecem no extrato da conta selecionada.
                    </div>

                </Card>

            </div>

        </>
    );
}