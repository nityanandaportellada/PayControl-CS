import {
    useEffect,
    useMemo,
    useState
} from 'react';

import type {
    FormEvent
} from 'react';

import {
    api,
    loadWithFallback
} from '../api';

import {
    useCompany
} from '../contexts/CompanyContext';

import {
    mockContasFinanceiras,
    mockFluxo
} from '../mock';

import type {
    AlertItem,
    ContaFinanceira,
    Fluxo,
    Transferencia
} from '../types';

import {
    Badge,
    Button,
    Card,
    DemoPill,
    EmptyState,
    Field,
    Kpi,
    LineChart,
    Modal,
    dateBR,
    money,
    statusTone
} from '../components/UI';


const hoje =
    () =>
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


export default function CashFlowPage() {
    const {
        empresaAtiva,
        empresaAtivaId
    } =
        useCompany();


    const [
        fluxo,
        setFluxo
    ] =
        useState<Fluxo>(
            mockFluxo
        );


    const [
        contas,
        setContas
    ] =
        useState<
            ContaFinanceira[]
        >(
            []
        );


    const [
        transferencias,
        setTransferencias
    ] =
        useState<
            Transferencia[]
        >(
            []
        );


    const [
        alertas,
        setAlertas
    ] =
        useState<
            AlertItem[]
        >(
            []
        );


    const [
        demo,
        setDemo
    ] =
        useState(
            false
        );


    const [
        account,
        setAccount
    ] =
        useState(
            ''
        );


    const [
        openTransferencia,
        setOpenTransferencia
    ] =
        useState(
            false
        );


    const [
        busy,
        setBusy
    ] =
        useState(
            false
        );


    /*
     * Carrega fluxo, contas e transferências.
     */
    async function load(
        contaFinanceiraId =
            account
    ) {
        const suffix =
            contaFinanceiraId

                ? `?contaFinanceiraId=${contaFinanceiraId}`

                : '';


        const [
            fluxoResult,
            contasResult,
            transferenciasResult,
            alertasResult
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

                    mockContasFinanceiras.filter(
                        item =>
                            (
                                !empresaAtivaId
                                ||
                                item.empresaId
                                ===
                                empresaAtivaId
                            )
                            &&
                            item.ativa
                    )
                ),

                loadWithFallback(
                    () =>
                        api.get<
                            Transferencia[]
                        >(
                            `/api/transferencias${suffix}`
                        ),

                    [] as Transferencia[]
                ),

                loadWithFallback(
                    () =>
                        api.get<
                            AlertItem[]
                        >(
                            '/api/dashboard/alertas'
                        ),

                    [] as AlertItem[]
                )
            ]);


        setFluxo(
            fluxoResult.data
        );


        setContas(
            contasResult
                .data
                .filter(
                    item =>
                        item.ativa
                )
        );


        setTransferencias(
            transferenciasResult.data
        );


        setAlertas(
            alertasResult.data
        );


        setDemo(
            fluxoResult.demo
            ||
            contasResult.demo
            ||
            transferenciasResult.demo
            ||
            alertasResult.demo
        );
    }


    useEffect(
        () => {
            void load(
                ''
            );
        },

        []
    );


    const points =
        useMemo(
            () =>
                fluxo.lancamentos.length

                    ? fluxo.lancamentos.map(
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


    const nomeConta =
        (
            id:
                number
        ) =>
            contas.find(
                conta =>
                    conta.id
                    ===
                    id
            )
            ?.nome
            ??
            `Conta ${id}`;


    /*
     * Cria transferência.
     */
    async function criarTransferencia(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        if (
            !empresaAtivaId
        )
        {
            alert(
                'Selecione uma empresa antes de realizar uma transferência.'
            );

            return;
        }


        const form =
            new FormData(
                event.currentTarget
            );


        const origem =
            Number(
                form.get(
                    'contaOrigemId'
                )
            );


        const destino =
            Number(
                form.get(
                    'contaDestinoId'
                )
            );


        const valor =
            Number(
                form.get(
                    'valor'
                )
            );


        if (
            !origem
            ||
            !destino
        )
        {
            alert(
                'Selecione a conta de origem e a conta de destino.'
            );

            return;
        }


        if (
            origem
            ===
            destino
        )
        {
            alert(
                'A conta de origem deve ser diferente da conta de destino.'
            );

            return;
        }


        if (
            valor <= 0
        )
        {
            alert(
                'Informe um valor maior que zero.'
            );

            return;
        }


        setBusy(
            true
        );


        try {
            await api.post(
                '/api/transferencias',

                {
                    empresaId:
                        empresaAtivaId,

                    contaOrigemId:
                        origem,

                    contaDestinoId:
                        destino,

                    valor,

                    data:
                        String(
                            form.get(
                                'data'
                            )
                            ||
                            hoje()
                        ),

                    descricao:
                        String(
                            form.get(
                                'descricao'
                            )
                            ||
                            ''
                        )
                }
            );


            setOpenTransferencia(
                false
            );


            await load();
        }
        catch (
            error
        )
        {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Erro ao realizar transferência.'
            );
        }
        finally
        {
            setBusy(
                false
            );
        }
    }


    /*
     * Cancela uma transferência.
     */
    async function cancelarTransferencia(
        transferencia:
            Transferencia
    ) {
        if (
            !confirm(
                `Cancelar a transferência de ${money(transferencia.valor)}?`
            )
        )
        {
            return;
        }


        const motivo =
            prompt(
                'Motivo do cancelamento (opcional):'
            )
            ??
            '';


        try {
            await api.post(
                `/api/transferencias/${transferencia.id}/cancelar`,

                {
                    motivo
                }
            );


            await load();
        }
        catch (
            error
        )
        {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Erro ao cancelar transferência.'
            );
        }
    }


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
                        Acompanhe entradas, saídas, saldos e transferências entre contas.
                    </p>


                    {empresaAtiva && (

                        <small>
                            Empresa ativa:{' '}

                            {
                                empresaAtiva.nomeFantasia
                                ||
                                empresaAtiva.nome
                            }
                        </small>

                    )}

                </div>


                <div className="action-row">

                    <Button
                        icon="cash"

                        onClick={() => {
                            if (
                                contas.length
                                <
                                2
                            )
                            {
                                alert(
                                    'Cadastre pelo menos duas contas financeiras ativas para realizar transferências.'
                                );

                                return;
                            }


                            setOpenTransferencia(
                                true
                            );
                        }}
                    >
                        Nova Transferência
                    </Button>

                </div>

            </div>


            <div className="filter-bar">

                <Field label="Conta Financeira">

                    <select
                        value={
                            account
                        }

                        onChange={
                            event => {
                                const value =
                                    event.target.value;


                                setAccount(
                                    value
                                );


                                void load(
                                    value
                                );
                            }
                        }
                    >

                        <option value="">
                            Todas as contas
                        </option>


                        {
                            contas.map(
                                conta => (

                                    <option
                                        value={
                                            conta.id
                                        }

                                        key={
                                            conta.id
                                        }
                                    >
                                        {
                                            conta.nome
                                        }
                                    </option>

                                )
                            )
                        }

                    </select>

                </Field>


                <Field label="Empresa">

                    <input
                        value={
                            empresaAtiva?.nomeFantasia
                            ||
                            empresaAtiva?.nome
                            ||
                            'Nenhuma empresa selecionada'
                        }

                        readOnly
                    />

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
                />


                <Kpi
                    icon="wallet"
                    label="Saldo Atual"
                    value={
                        money(
                            fluxo.saldoRealizado
                        )
                    }
                />


                <Kpi
                    icon="cash"
                    label="Saldo Projetado"
                    value={
                        money(
                            fluxo.saldoProjetado
                        )
                    }
                    tone="purple"
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
                            Início
                        </span>

                        <span>
                            Período
                        </span>

                        <span>
                            Hoje
                        </span>

                        <span>
                            Projeção
                        </span>

                    </div>

                </Card>


                <Card title="Resumo de Transferências">

                    <div className="projection-list">

                        <div>

                            <span>
                                Transferências registradas
                            </span>

                            <b>
                                {
                                    transferencias.length
                                }
                            </b>

                        </div>


                        <div>

                            <span>
                                Efetivadas
                            </span>

                            <b>
                                {
                                    transferencias.filter(
                                        item =>
                                            item.status
                                            ===
                                            'Efetivada'
                                    )
                                    .length
                                }
                            </b>

                        </div>


                        <div>

                            <span>
                                Canceladas
                            </span>

                            <b>
                                {
                                    transferencias.filter(
                                        item =>
                                            item.status
                                            ===
                                            'Cancelada'
                                    )
                                    .length
                                }
                            </b>

                        </div>

                    </div>


                    <div className="info-note">

                        Transferências movimentam saldos entre contas da mesma empresa,
                        mas não são receita nem despesa.

                    </div>

                </Card>

            </div>


            <Card
                title="Extrato de Lançamentos"

                subtitle="Pagamentos, recebimentos e transferências da empresa ativa."
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

                            {
                                fluxo.lancamentos.map(
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
                                                        item.origem
                                                        ===
                                                        'Receita'

                                                            ? 'success'

                                                            : item.origem
                                                            ===
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
                                )
                            }

                        </tbody>

                    </table>


                    {
                        !fluxo.lancamentos.length
                        &&
                        <EmptyState />
                    }

                </div>

            </Card>


            <Card title="Transferências entre Contas">

                <div className="table-scroll">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Data
                                </th>

                                <th>
                                    Origem
                                </th>

                                <th>
                                    Destino
                                </th>

                                <th>
                                    Descrição
                                </th>

                                <th>
                                    Valor
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Ações
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                transferencias.map(
                                    item => (

                                        <tr
                                            key={
                                                item.id
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
                                                    nomeConta(
                                                        item.contaOrigemId
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    nomeConta(
                                                        item.contaDestinoId
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.descricao
                                                    ||
                                                    'Transferência entre contas'
                                                }
                                            </td>

                                            <td>
                                                {
                                                    money(
                                                        item.valor
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

                                            <td>

                                                {
                                                    item.status
                                                    !==
                                                    'Cancelada'

                                                    ? (

                                                        <Button
                                                            variant="danger"

                                                            onClick={() =>
                                                                void cancelarTransferencia(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            Cancelar
                                                        </Button>

                                                    )

                                                    : '—'
                                                }

                                            </td>

                                        </tr>

                                    )
                                )
                            }

                        </tbody>

                    </table>


                    {
                        !transferencias.length
                        &&
                        <EmptyState
                            text="Nenhuma transferência registrada."
                        />
                    }

                </div>

            </Card>


            <Card title="Alertas Financeiros">

                <div className="alert-list">

                    {
                        alertas.map(
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
                        )
                    }


                    {
                        !alertas.length
                        &&
                        <EmptyState
                            text="Nenhum alerta financeiro para a empresa ativa."
                        />
                    }

                </div>

            </Card>


            {/*
             * MODAL TRANSFERÊNCIA
             */}

            <Modal
                open={
                    openTransferencia
                }

                title="Nova Transferência entre Contas"

                onClose={() =>
                    setOpenTransferencia(
                        false
                    )
                }
            >

                <form
                    className="form-grid"

                    onSubmit={
                        criarTransferencia
                    }
                >

                    <Field label="Conta de Origem">

                        <select
                            name="contaOrigemId"

                            required

                            defaultValue=""
                        >

                            <option value="">
                                Selecione
                            </option>


                            {
                                contas.map(
                                    conta => (

                                        <option
                                            key={
                                                conta.id
                                            }

                                            value={
                                                conta.id
                                            }
                                        >
                                            {
                                                conta.nome
                                            }
                                        </option>

                                    )
                                )
                            }

                        </select>

                    </Field>


                    <Field label="Conta de Destino">

                        <select
                            name="contaDestinoId"

                            required

                            defaultValue=""
                        >

                            <option value="">
                                Selecione
                            </option>


                            {
                                contas.map(
                                    conta => (

                                        <option
                                            key={
                                                conta.id
                                            }

                                            value={
                                                conta.id
                                            }
                                        >
                                            {
                                                conta.nome
                                            }
                                        </option>

                                    )
                                )
                            }

                        </select>

                    </Field>


                    <Field label="Valor">

                        <input
                            name="valor"

                            type="number"

                            min="0.01"

                            step="0.01"

                            required
                        />

                    </Field>


                    <Field label="Data">

                        <input
                            name="data"

                            type="date"

                            required

                            defaultValue={
                                hoje()
                            }
                        />

                    </Field>


                    <Field label="Descrição">

                        <input
                            name="descricao"

                            placeholder="Ex.: Reforço de caixa"
                        />

                    </Field>


                    <div className="form-actions">

                        <Button
                            variant="secondary"

                            onClick={() =>
                                setOpenTransferencia(
                                    false
                                )
                            }
                        >
                            Cancelar
                        </Button>


                        <Button
                            type="submit"

                            disabled={
                                busy
                            }
                        >
                            Transferir
                        </Button>

                    </div>

                </form>

            </Modal>

        </>
    );
}