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
    mockCategorias,
    mockContasFinanceiras,
    mockContasPagar,
    mockFornecedores
} from '../mock';

import type {
    Categoria,
    ContaFinanceira,
    ContaPagar,
    Pessoa
} from '../types';

import {
    Badge,
    Button,
    Card,
    DemoPill,
    EmptyState,
    Field,
    Kpi,
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


const inputDate =
    (
        value?:
            string | null
    ) =>
        value

            ? value.slice(
                0,
                10
            )

            : '';


function proximaData(
    dataBase:
        string,

    frequencia:
        string
) {
    const data =
        new Date(
            `${dataBase}T12:00:00`
        );


    switch (
        frequencia
    )
    {
        case 'Semanal':

            data.setDate(
                data.getDate()
                +
                7
            );

            break;


        case 'Bimestral':

            data.setMonth(
                data.getMonth()
                +
                2
            );

            break;


        case 'Trimestral':

            data.setMonth(
                data.getMonth()
                +
                3
            );

            break;


        case 'Semestral':

            data.setMonth(
                data.getMonth()
                +
                6
            );

            break;


        case 'Anual':

            data.setFullYear(
                data.getFullYear()
                +
                1
            );

            break;


        default:

            data.setMonth(
                data.getMonth()
                +
                1
            );

            break;
    }


    return data
        .toISOString()
        .slice(
            0,
            10
        );
}


export default function AccountsPayablePage() {
    const {
        empresaAtiva,
        empresaAtivaId
    } =
        useCompany();


    const [
        items,
        setItems
    ] =
        useState<
            ContaPagar[]
        >(
            []
        );


    const [
        fornecedores,
        setFornecedores
    ] =
        useState<
            Pessoa[]
        >(
            []
        );


    const [
        categorias,
        setCategorias
    ] =
        useState<
            Categoria[]
        >(
            []
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
        demo,
        setDemo
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


    const [
        selected,
        setSelected
    ] =
        useState<
            ContaPagar | null
        >(
            null
        );


    const [
        editing,
        setEditing
    ] =
        useState<
            ContaPagar | null
        >(
            null
        );


    const [
        openLancamento,
        setOpenLancamento
    ] =
        useState(
            false
        );


    const [
        openPagamento,
        setOpenPagamento
    ] =
        useState(
            false
        );


    const [
        busca,
        setBusca
    ] =
        useState(
            ''
        );


    const [
        statusFiltro,
        setStatusFiltro
    ] =
        useState(
            'Todos'
        );


    const [
        fornecedorFiltro,
        setFornecedorFiltro
    ] =
        useState(
            ''
        );


    const [
        categoriaFiltro,
        setCategoriaFiltro
    ] =
        useState(
            ''
        );


    /*
     * Carrega os lançamentos e
     * cadastros auxiliares.
     */
    async function reload() {
        const [
            lancamentos,
            fornecedoresResult,
            categoriasResult,
            contasResult
        ] =
            await Promise.all([
                loadWithFallback(
                    () =>
                        api.get<
                            ContaPagar[]
                        >(
                            '/api/contas-pagar'
                        ),

                    mockContasPagar.filter(
                        item =>
                            !empresaAtivaId
                            ||
                            item.empresaId
                            ===
                            empresaAtivaId
                    )
                ),

                loadWithFallback(
                    () =>
                        api.get<
                            Pessoa[]
                        >(
                            '/api/fornecedores'
                        ),

                    mockFornecedores.filter(
                        item =>
                            (
                                !empresaAtivaId
                                ||
                                item.empresaId
                                ===
                                empresaAtivaId
                            )
                            &&
                            item.ativo
                    )
                ),

                loadWithFallback(
                    () =>
                        api.get<
                            Categoria[]
                        >(
                            '/api/plano-contas?tipo=Despesa'
                        ),

                    mockCategorias.filter(
                        item =>
                            (
                                !empresaAtivaId
                                ||
                                item.empresaId
                                ===
                                empresaAtivaId
                            )
                            &&
                            item.tipo
                            ===
                            'Despesa'
                            &&
                            item.ativa
                    )
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
                )
            ]);


        setItems(
            lancamentos.data
        );


        setFornecedores(
            fornecedoresResult
                .data
                .filter(
                    item =>
                        item.ativo
                )
        );


        setCategorias(
            categoriasResult
                .data
                .filter(
                    item =>
                        item.ativa
                        &&
                        item.tipo
                        ===
                        'Despesa'
                )
        );


        setContas(
            contasResult
                .data
                .filter(
                    item =>
                        item.ativa
                )
        );


        setDemo(
            lancamentos.demo
            ||
            fornecedoresResult.demo
            ||
            categoriasResult.demo
            ||
            contasResult.demo
        );


        setSelected(
            atual =>
                lancamentos.data.find(
                    item =>
                        item.id
                        ===
                        atual?.id
                )
                ??
                lancamentos.data[0]
                ??
                null
        );
    }


    useEffect(
        () => {
            void reload();
        },

        []
    );


    const lookup =
        (
            lista:
                {
                    id:
                        number;

                    nome:
                        string;
                }[],

            id?:
                number | null
        ) =>
            lista.find(
                item =>
                    item.id
                    ===
                    id
            )
            ?.nome
            ??
            '—';


    /*
     * Filtros da tela.
     */
    const filtrados =
        useMemo(
            () => {
                const termo =
                    busca
                        .trim()
                        .toLowerCase();


                return items.filter(
                    item => {
                        const statusOk =
                            statusFiltro
                            ===
                            'Todos'

                            ||

                            item.status
                            ===
                            statusFiltro;


                        const fornecedorOk =
                            !fornecedorFiltro

                            ||

                            item.fornecedorId
                            ===
                            Number(
                                fornecedorFiltro
                            );


                        const categoriaOk =
                            !categoriaFiltro

                            ||

                            item.categoriaId
                            ===
                            Number(
                                categoriaFiltro
                            );


                        const buscaOk =
                            !termo

                            ||

                            item.descricao
                                .toLowerCase()
                                .includes(
                                    termo
                                )

                            ||

                            (
                                item.numeroDocumento
                                ??
                                ''
                            )
                                .toLowerCase()
                                .includes(
                                    termo
                                )

                            ||

                            lookup(
                                fornecedores,
                                item.fornecedorId
                            )
                                .toLowerCase()
                                .includes(
                                    termo
                                );


                        return (
                            statusOk
                            &&
                            fornecedorOk
                            &&
                            categoriaOk
                            &&
                            buscaOk
                        );
                    }
                );
            },

            [
                items,
                busca,
                statusFiltro,
                fornecedorFiltro,
                categoriaFiltro,
                fornecedores
            ]
        );


    const totalAberto =
        items

            .filter(
                item =>
                    item.status
                    !==
                    'Pago'
                    &&
                    item.status
                    !==
                    'Cancelado'
            )

            .reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    item.valor,

                0
            );


    const totalPago =
        items

            .filter(
                item =>
                    item.status
                    ===
                    'Pago'
            )

            .reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    item.valor,

                0
            );


    const totalVencido =
        items

            .filter(
                item =>
                    item.status
                    ===
                    'Vencido'
            )

            .reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    item.valor,

                0
            );


    const proximosSeteDias =
        items

            .filter(
                item => {
                    if (
                        item.status
                        !==
                        'Pendente'
                    )
                    {
                        return false;
                    }


                    const vencimento =
                        new Date(
                            `${inputDate(item.dataVencimento)}T12:00:00`
                        );


                    const limite =
                        new Date();


                    limite.setHours(
                        23,
                        59,
                        59,
                        999
                    );


                    limite.setDate(
                        limite.getDate()
                        +
                        7
                    );


                    return (
                        vencimento
                        <=
                        limite
                    );
                }
            )

            .reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    item.valor,

                0
            );


    function novaConta() {
        if (
            !empresaAtivaId
        )
        {
            alert(
                'Selecione uma empresa antes de criar uma conta a pagar.'
            );

            return;
        }


        setEditing(
            null
        );


        setOpenLancamento(
            true
        );
    }


    function editarConta(
        item:
            ContaPagar
    ) {
        if (
            item.status
            ===
            'Pago'
            ||
            item.status
            ===
            'Cancelado'
        )
        {
            alert(
                'Conta paga ou cancelada não pode ser editada. Faça o estorno quando aplicável.'
            );

            return;
        }


        setEditing(
            item
        );


        setOpenLancamento(
            true
        );
    }


    /*
     * Cria ou edita uma conta.
     */
    async function salvar(
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
                'Selecione uma empresa.'
            );

            return;
        }


        setBusy(
            true
        );


        const form =
            new FormData(
                event.currentTarget
            );


        const parcelas =
            Number(
                form.get(
                    'parcelas'
                )
                ||
                1
            );


        const frequencia =
            String(
                form.get(
                    'frequenciaRecorrencia'
                )
                ||
                ''
            );


        const vencimento =
            String(
                form.get(
                    'dataVencimento'
                )
                ||
                ''
            );


        /*
         * Para evitar que um mesmo valor seja
         * simultaneamente parcelado e recorrente.
         */
        if (
            !editing
            &&
            parcelas > 1
            &&
            frequencia
        )
        {
            alert(
                'Use parcelamento ou recorrência. Para evitar duplicidade financeira, não utilize os dois ao mesmo tempo.'
            );


            setBusy(
                false
            );


            return;
        }


        const base = {
            fornecedorId:
                Number(
                    form.get(
                        'fornecedorId'
                    )
                )
                ||
                null,

            categoriaId:
                Number(
                    form.get(
                        'categoriaId'
                    )
                )
                ||
                null,

            contaFinanceiraId:
                Number(
                    form.get(
                        'contaFinanceiraId'
                    )
                )
                ||
                null,

            descricao:
                String(
                    form.get(
                        'descricao'
                    )
                    ||
                    ''
                ),

            valor:
                Number(
                    form.get(
                        'valor'
                    )
                    ||
                    0
                ),

            dataEmissao:
                String(
                    form.get(
                        'dataEmissao'
                    )
                    ||
                    ''
                ),

            dataVencimento:
                vencimento,

            formaPagamento:
                String(
                    form.get(
                        'formaPagamento'
                    )
                    ||
                    ''
                ),

            numeroDocumento:
                String(
                    form.get(
                        'numeroDocumento'
                    )
                    ||
                    ''
                ),

            serieDocumento:
                String(
                    form.get(
                        'serieDocumento'
                    )
                    ||
                    ''
                ),

            chaveFiscal:
                String(
                    form.get(
                        'chaveFiscal'
                    )
                    ||
                    ''
                ),

            observacoes:
                String(
                    form.get(
                        'observacoes'
                    )
                    ||
                    ''
                )
        };


        try {
            /*
             * Edição.
             */
            if (
                editing
            )
            {
                await api.patch(
                    `/api/contas-pagar/${editing.id}`,
                    base
                );
            }
            else
            {
                /*
                 * Novo lançamento.
                 */
                await api.post(
                    '/api/contas-pagar',

                    {
                        empresaId:
                            empresaAtivaId,

                        ...base,

                        parcelas,

                        frequenciaRecorrencia:
                            null,

                        recorrenciaAte:
                            null
                    }
                );


                /*
                 * Caso seja recorrente,
                 * cria a regra de recorrência.
                 */
                if (
                    frequencia
                )
                {
                    await api.post(
                        '/api/recorrencias',

                        {
                            empresaId:
                                empresaAtivaId,

                            natureza:
                                'Pagar',

                            descricao:
                                base.descricao,

                            valor:
                                base.valor,

                            frequencia,

                            proximaData:
                                proximaData(
                                    vencimento,
                                    frequencia
                                ),

                            dataFim:
                                String(
                                    form.get(
                                        'recorrenciaAte'
                                    )
                                    ||
                                    ''
                                )
                                ||
                                null,

                            clienteId:
                                null,

                            fornecedorId:
                                base.fornecedorId,

                            categoriaId:
                                base.categoriaId,

                            contaFinanceiraId:
                                base.contaFinanceiraId,

                            tipoReceita:
                                null,

                            formaPagamento:
                                base.formaPagamento,

                            ativa:
                                true
                        }
                    );
                }
            }


            setOpenLancamento(
                false
            );


            setEditing(
                null
            );


            await reload();
        }
        catch (
            error
        )
        {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Erro ao salvar conta a pagar.'
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
     * Registra o pagamento.
     */
    async function pagar(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        if (
            !selected
        )
        {
            return;
        }


        const form =
            new FormData(
                event.currentTarget
            );


        try {
            await api.post(
                `/api/contas-pagar/${selected.id}/pagar`,

                {
                    data:
                        String(
                            form.get(
                                'data'
                            )
                            ||
                            hoje()
                        ),

                    contaFinanceiraId:
                        Number(
                            form.get(
                                'contaFinanceiraId'
                            )
                        )
                        ||
                        null,

                    formaPagamento:
                        String(
                            form.get(
                                'formaPagamento'
                            )
                            ||
                            ''
                        )
                }
            );


            setOpenPagamento(
                false
            );


            await reload();
        }
        catch (
            error
        )
        {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Erro ao registrar pagamento.'
            );
        }
    }


    /*
     * Estorna o pagamento.
     */
    async function estornar(
        item:
            ContaPagar
    ) {
        if (
            !confirm(
                `Estornar o pagamento de "${item.descricao}"?`
            )
        )
        {
            return;
        }


        const motivo =
            prompt(
                'Motivo do estorno (opcional):'
            )
            ??
            '';


        try {
            await api.post(
                `/api/contas-pagar/${item.id}/estornar`,

                {
                    motivo
                }
            );


            await reload();
        }
        catch (
            error
        )
        {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Erro ao estornar pagamento.'
            );
        }
    }


    /*
     * Exclui somente lançamentos ainda
     * não liquidados.
     */
    async function excluir(
        item:
            ContaPagar
    ) {
        if (
            !confirm(
                `Excluir a conta "${item.descricao}"?`
            )
        )
        {
            return;
        }


        try {
            await api.delete(
                `/api/contas-pagar/${item.id}`
            );


            setSelected(
                null
            );


            await reload();
        }
        catch (
            error
        )
        {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Não foi possível excluir a conta.'
            );
        }
    }


    return (
        <>

            <div className="page-title actions">

                <div>

                    <div className="title-line">

                        <h1>
                            Contas a Pagar
                        </h1>

                        {demo && (
                            <DemoPill />
                        )}

                    </div>


                    <p>
                        Gerencie despesas, fornecedores, vencimentos, parcelamentos e pagamentos.
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
                        icon="plus"

                        onClick={
                            novaConta
                        }
                    >
                        Nova Conta
                    </Button>

                </div>

            </div>


            <div className="filter-bar">

                <Field label="Buscar">

                    <input
                        value={
                            busca
                        }

                        onChange={
                            event =>
                                setBusca(
                                    event.target.value
                                )
                        }

                        placeholder="Descrição, documento ou fornecedor"
                    />

                </Field>


                <Field label="Status">

                    <select
                        value={
                            statusFiltro
                        }

                        onChange={
                            event =>
                                setStatusFiltro(
                                    event.target.value
                                )
                        }
                    >

                        <option value="Todos">
                            Todos
                        </option>

                        <option value="Pendente">
                            Pendente
                        </option>

                        <option value="Vencido">
                            Vencido
                        </option>

                        <option value="Pago">
                            Pago
                        </option>

                        <option value="Cancelado">
                            Cancelado
                        </option>

                    </select>

                </Field>


                <Field label="Fornecedor">

                    <select
                        value={
                            fornecedorFiltro
                        }

                        onChange={
                            event =>
                                setFornecedorFiltro(
                                    event.target.value
                                )
                        }
                    >

                        <option value="">
                            Todos
                        </option>


                        {
                            fornecedores.map(
                                item => (

                                    <option
                                        key={
                                            item.id
                                        }

                                        value={
                                            item.id
                                        }
                                    >
                                        {
                                            item.nome
                                        }
                                    </option>

                                )
                            )
                        }

                    </select>

                </Field>


                <Field label="Plano de Contas">

                    <select
                        value={
                            categoriaFiltro
                        }

                        onChange={
                            event =>
                                setCategoriaFiltro(
                                    event.target.value
                                )
                        }
                    >

                        <option value="">
                            Todas
                        </option>


                        {
                            categorias.map(
                                item => (

                                    <option
                                        key={
                                            item.id
                                        }

                                        value={
                                            item.id
                                        }
                                    >

                                        {
                                            item.codigo

                                                ? `${item.codigo} - `

                                                : ''
                                        }

                                        {
                                            item.nome
                                        }

                                    </option>

                                )
                            )
                        }

                    </select>

                </Field>

            </div>


            <div className="kpi-grid four">

                <Kpi
                    icon="pay"
                    label="Total em Aberto"
                    value={
                        money(
                            totalAberto
                        )
                    }
                />


                <Kpi
                    icon="check"
                    label="Pago"
                    value={
                        money(
                            totalPago
                        )
                    }
                    tone="green"
                />


                <Kpi
                    icon="warning"
                    label="Vencido"
                    value={
                        money(
                            totalVencido
                        )
                    }
                    tone="red"
                />


                <Kpi
                    icon="calendar"
                    label="Próximos 7 Dias"
                    value={
                        money(
                            proximosSeteDias
                        )
                    }
                    tone="yellow"
                />

            </div>


            <div className="master-detail">

                <Card
                    title="Contas a Pagar"

                    subtitle={
                        `${filtrados.length} registros encontrados`
                    }
                >

                    <div className="table-scroll">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Vencimento
                                    </th>

                                    <th>
                                        Descrição
                                    </th>

                                    <th>
                                        Fornecedor
                                    </th>

                                    <th>
                                        Plano de Contas
                                    </th>

                                    <th>
                                        Parcela
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Valor
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {
                                    filtrados.map(
                                        item => (

                                            <tr
                                                key={
                                                    item.id
                                                }

                                                className={
                                                    selected?.id
                                                    ===
                                                    item.id

                                                        ? 'selected'

                                                        : ''
                                                }

                                                onClick={() =>
                                                    setSelected(
                                                        item
                                                    )
                                                }
                                            >

                                                <td>
                                                    {
                                                        dateBR(
                                                            item.dataVencimento
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.descricao
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        lookup(
                                                            fornecedores,
                                                            item.fornecedorId
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        lookup(
                                                            categorias,
                                                            item.categoriaId
                                                        )
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        item.parcelaNumero
                                                    }

                                                    /

                                                    {
                                                        item.parcelaTotal
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

                                                <td className="num negative-text">

                                                    {
                                                        money(
                                                            item.valor
                                                        )
                                                    }

                                                </td>

                                            </tr>

                                        )
                                    )
                                }

                            </tbody>

                        </table>


                        {
                            !filtrados.length
                            &&
                            <EmptyState />
                        }

                    </div>

                </Card>


                <Card title="Detalhes da Conta">

                    {selected
                    ? (

                        <div className="detail-panel">

                            <div className="detail-title">

                                <div>

                                    <strong>
                                        {
                                            selected.descricao
                                        }
                                    </strong>

                                    <span>
                                        {
                                            lookup(
                                                fornecedores,
                                                selected.fornecedorId
                                            )
                                        }
                                    </span>

                                </div>


                                <Badge
                                    tone={
                                        statusTone(
                                            selected.status
                                        )
                                    }
                                >

                                    {
                                        selected.status
                                    }

                                </Badge>

                            </div>


                            <dl>

                                <dt>
                                    Emissão
                                </dt>

                                <dd>
                                    {
                                        dateBR(
                                            selected.dataEmissao
                                        )
                                    }
                                </dd>


                                <dt>
                                    Vencimento
                                </dt>

                                <dd>
                                    {
                                        dateBR(
                                            selected.dataVencimento
                                        )
                                    }
                                </dd>


                                <dt>
                                    Pagamento
                                </dt>

                                <dd>
                                    {
                                        dateBR(
                                            selected.dataPagamento
                                        )
                                    }
                                </dd>


                                <dt>
                                    Plano de Contas
                                </dt>

                                <dd>
                                    {
                                        lookup(
                                            categorias,
                                            selected.categoriaId
                                        )
                                    }
                                </dd>


                                <dt>
                                    Conta Financeira
                                </dt>

                                <dd>
                                    {
                                        lookup(
                                            contas,
                                            selected.contaFinanceiraId
                                        )
                                    }
                                </dd>


                                <dt>
                                    Forma
                                </dt>

                                <dd>
                                    {
                                        selected.formaPagamento
                                        ||
                                        '—'
                                    }
                                </dd>


                                <dt>
                                    Documento
                                </dt>

                                <dd>
                                    {
                                        selected.numeroDocumento
                                        ||
                                        '—'
                                    }
                                </dd>


                                <dt>
                                    Valor
                                </dt>

                                <dd className="negative-text">
                                    {
                                        money(
                                            selected.valor
                                        )
                                    }
                                </dd>

                            </dl>


                            <div className="detail-actions">

                                {(
                                    selected.status
                                    ===
                                    'Pendente'

                                    ||

                                    selected.status
                                    ===
                                    'Vencido'
                                )
                                && (
                                    <>

                                        <Button
                                            variant="secondary"

                                            onClick={() =>
                                                editarConta(
                                                    selected
                                                )
                                            }
                                        >
                                            Editar
                                        </Button>


                                        <Button
                                            variant="success"

                                            onClick={() =>
                                                setOpenPagamento(
                                                    true
                                                )
                                            }
                                        >
                                            Pagar
                                        </Button>


                                        <Button
                                            variant="danger"

                                            onClick={() =>
                                                void excluir(
                                                    selected
                                                )
                                            }
                                        >
                                            Excluir
                                        </Button>

                                    </>
                                )}


                                {
                                    selected.status
                                    ===
                                    'Pago'
                                    &&
                                    (

                                        <Button
                                            variant="secondary"

                                            onClick={() =>
                                                void estornar(
                                                    selected
                                                )
                                            }
                                        >
                                            Estornar Pagamento
                                        </Button>

                                    )
                                }

                            </div>

                        </div>

                    )
                    : (

                        <EmptyState />

                    )}

                </Card>

            </div>


            {/*
             * MODAL CRIAÇÃO / EDIÇÃO
             */}

            <Modal
                open={
                    openLancamento
                }

                title={
                    editing

                        ? 'Editar Conta a Pagar'

                        : 'Nova Conta a Pagar'
                }

                onClose={() => {
                    setOpenLancamento(
                        false
                    );

                    setEditing(
                        null
                    );
                }}
            >

                <form
                    className="form-grid"

                    onSubmit={
                        salvar
                    }
                >

                    <Field label="Descrição">

                        <input
                            name="descricao"

                            required

                            defaultValue={
                                editing
                                    ?.descricao
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Valor">

                        <input
                            name="valor"

                            type="number"

                            step="0.01"

                            min="0.01"

                            required

                            defaultValue={
                                editing
                                    ?.valor
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Fornecedor">

                        <select
                            name="fornecedorId"

                            defaultValue={
                                editing
                                    ?.fornecedorId
                                ??
                                ''
                            }
                        >

                            <option value="">
                                Sem fornecedor
                            </option>


                            {
                                fornecedores.map(
                                    item => (

                                        <option
                                            key={
                                                item.id
                                            }

                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.nome
                                            }
                                        </option>

                                    )
                                )
                            }

                        </select>

                    </Field>


                    <Field label="Plano de Contas">

                        <select
                            name="categoriaId"

                            defaultValue={
                                editing
                                    ?.categoriaId
                                ??
                                ''
                            }
                        >

                            <option value="">
                                Selecione
                            </option>


                            {
                                categorias.map(
                                    item => (

                                        <option
                                            key={
                                                item.id
                                            }

                                            value={
                                                item.id
                                            }
                                        >

                                            {
                                                item.codigo

                                                    ? `${item.codigo} - `

                                                    : ''
                                            }

                                            {
                                                item.nome
                                            }

                                        </option>

                                    )
                                )
                            }

                        </select>

                    </Field>


                    <Field label="Conta Financeira">

                        <select
                            name="contaFinanceiraId"

                            defaultValue={
                                editing
                                    ?.contaFinanceiraId
                                ??
                                ''
                            }
                        >

                            <option value="">
                                Definir no pagamento
                            </option>


                            {
                                contas.map(
                                    item => (

                                        <option
                                            key={
                                                item.id
                                            }

                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.nome
                                            }
                                        </option>

                                    )
                                )
                            }

                        </select>

                    </Field>


                    <Field label="Emissão">

                        <input
                            name="dataEmissao"

                            type="date"

                            required

                            defaultValue={
                                inputDate(
                                    editing
                                        ?.dataEmissao
                                )
                                ||
                                hoje()
                            }
                        />

                    </Field>


                    <Field label="Vencimento">

                        <input
                            name="dataVencimento"

                            type="date"

                            required

                            defaultValue={
                                inputDate(
                                    editing
                                        ?.dataVencimento
                                )
                                ||
                                hoje()
                            }
                        />

                    </Field>


                    <Field label="Forma de Pagamento">

                        <select
                            name="formaPagamento"

                            defaultValue={
                                editing
                                    ?.formaPagamento
                                ??
                                'Transferência Bancária'
                            }
                        >

                            <option>
                                Transferência Bancária
                            </option>

                            <option>
                                PIX
                            </option>

                            <option>
                                Boleto
                            </option>

                            <option>
                                Cartão
                            </option>

                            <option>
                                Dinheiro
                            </option>

                        </select>

                    </Field>


                    <Field label="Número do Documento">

                        <input
                            name="numeroDocumento"

                            defaultValue={
                                editing
                                    ?.numeroDocumento
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Série">

                        <input
                            name="serieDocumento"

                            defaultValue={
                                editing
                                    ?.serieDocumento
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Chave Fiscal">

                        <input
                            name="chaveFiscal"

                            defaultValue={
                                editing
                                    ?.chaveFiscal
                                ??
                                ''
                            }
                        />

                    </Field>


                    {!editing && (
                        <>

                            <Field label="Parcelas">

                                <input
                                    name="parcelas"

                                    type="number"

                                    min="1"

                                    max="360"

                                    defaultValue="1"
                                />

                            </Field>


                            <Field label="Recorrência">

                                <select
                                    name="frequenciaRecorrencia"

                                    defaultValue=""
                                >

                                    <option value="">
                                        Não recorrente
                                    </option>

                                    <option value="Semanal">
                                        Semanal
                                    </option>

                                    <option value="Mensal">
                                        Mensal
                                    </option>

                                    <option value="Bimestral">
                                        Bimestral
                                    </option>

                                    <option value="Trimestral">
                                        Trimestral
                                    </option>

                                    <option value="Semestral">
                                        Semestral
                                    </option>

                                    <option value="Anual">
                                        Anual
                                    </option>

                                </select>

                            </Field>


                            <Field label="Recorrência até">

                                <input
                                    name="recorrenciaAte"

                                    type="date"
                                />

                            </Field>

                        </>
                    )}


                    <Field label="Observações">

                        <textarea
                            name="observacoes"

                            rows={3}

                            defaultValue={
                                editing
                                    ?.observacoes
                                ??
                                ''
                            }
                        />

                    </Field>


                    <div className="form-actions">

                        <Button
                            variant="secondary"

                            onClick={() =>
                                setOpenLancamento(
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
                            Salvar
                        </Button>

                    </div>

                </form>

            </Modal>


            {/*
             * MODAL PAGAMENTO
             */}

            <Modal
                open={
                    openPagamento
                    &&
                    Boolean(
                        selected
                    )
                }

                title="Registrar Pagamento"

                onClose={() =>
                    setOpenPagamento(
                        false
                    )
                }
            >

                <form
                    className="form-grid"

                    onSubmit={
                        pagar
                    }
                >

                    <Field label="Data do Pagamento">

                        <input
                            name="data"

                            type="date"

                            required

                            defaultValue={
                                hoje()
                            }
                        />

                    </Field>


                    <Field label="Conta Financeira">

                        <select
                            name="contaFinanceiraId"

                            required

                            defaultValue={
                                selected
                                    ?.contaFinanceiraId
                                ??
                                ''
                            }
                        >

                            <option value="">
                                Selecione
                            </option>


                            {
                                contas.map(
                                    item => (

                                        <option
                                            key={
                                                item.id
                                            }

                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.nome
                                            }
                                        </option>

                                    )
                                )
                            }

                        </select>

                    </Field>


                    <Field label="Forma de Pagamento">

                        <select
                            name="formaPagamento"

                            defaultValue={
                                selected
                                    ?.formaPagamento
                                ??
                                'Transferência Bancária'
                            }
                        >

                            <option>
                                Transferência Bancária
                            </option>

                            <option>
                                PIX
                            </option>

                            <option>
                                Boleto
                            </option>

                            <option>
                                Cartão
                            </option>

                            <option>
                                Dinheiro
                            </option>

                        </select>

                    </Field>


                    <div className="form-actions">

                        <Button
                            variant="secondary"

                            onClick={() =>
                                setOpenPagamento(
                                    false
                                )
                            }
                        >
                            Cancelar
                        </Button>


                        <Button
                            type="submit"

                            variant="success"
                        >
                            Confirmar Pagamento
                        </Button>

                    </div>

                </form>

            </Modal>

        </>
    );
}