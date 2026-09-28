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
    mockClientes,
    mockContasFinanceiras,
    mockReceitas
} from '../mock';

import type {
    Categoria,
    ContaFinanceira,
    Pessoa,
    Receita
} from '../types';

import {
    Badge,
    Bars,
    Button,
    Card,
    DemoPill,
    Donut,
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


export default function AccountsReceivablePage() {
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
            Receita[]
        >(
            []
        );


    const [
        clientes,
        setClientes
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
            Receita | null
        >(
            null
        );


    const [
        editing,
        setEditing
    ] =
        useState<
            Receita | null
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
        openRecebimento,
        setOpenRecebimento
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
        tipoFiltro,
        setTipoFiltro
    ] =
        useState(
            'Todos'
        );


    const [
        clienteFiltro,
        setClienteFiltro
    ] =
        useState(
            ''
        );


    async function reload() {
        const [
            lancamentos,
            clientesResult,
            categoriasResult,
            contasResult
        ] =
            await Promise.all([
                loadWithFallback(
                    () =>
                        api.get<
                            Receita[]
                        >(
                            '/api/contas-receber'
                        ),

                    mockReceitas.filter(
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
                            '/api/clientes'
                        ),

                    mockClientes.filter(
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
                            '/api/plano-contas?tipo=Receita'
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
                            'Receita'
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


        setClientes(
            clientesResult
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
                        'Receita'
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
            clientesResult.demo
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


                        const tipoOk =
                            tipoFiltro
                            ===
                            'Todos'

                            ||

                            item.tipo
                            ===
                            tipoFiltro;


                        const clienteOk =
                            !clienteFiltro

                            ||

                            item.clienteId
                            ===
                            Number(
                                clienteFiltro
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
                                clientes,
                                item.clienteId
                            )
                                .toLowerCase()
                                .includes(
                                    termo
                                );


                        return (
                            statusOk
                            &&
                            tipoOk
                            &&
                            clienteOk
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
                tipoFiltro,
                clienteFiltro,
                clientes
            ]
        );


    const totalAberto =
        items

            .filter(
                item =>
                    item.status
                    !==
                    'Recebido'
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


    const totalRecebido =
        items

            .filter(
                item =>
                    item.status
                    ===
                    'Recebido'
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


    const previsao =
        items

            .filter(
                item =>
                    item.status
                    ===
                    'Previsto'
                    ||
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


    const typeBars =
        useMemo(
            () =>
                [
                    'Venda',
                    'Serviço',
                    'Outros'
                ]
                .map(
                    tipo => ({
                        label:
                            tipo,

                        a:
                            items
                                .filter(
                                    item =>
                                        item.tipo
                                        ===
                                        tipo
                                        &&
                                        item.status
                                        ===
                                        'Recebido'
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
                                ),

                        b:
                            items
                                .filter(
                                    item =>
                                        item.tipo
                                        ===
                                        tipo
                                        &&
                                        item.status
                                        !==
                                        'Recebido'
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
                                )
                    })
                ),

            [
                items
            ]
        );


    function novaReceita() {
        if (
            !empresaAtivaId
        )
        {
            alert(
                'Selecione uma empresa antes de criar uma conta a receber.'
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


    function editarReceita(
        item:
            Receita
    ) {
        if (
            item.status
            ===
            'Recebido'
            ||
            item.status
            ===
            'Cancelado'
        )
        {
            alert(
                'Receita recebida ou cancelada não pode ser editada. Faça o estorno quando aplicável.'
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
            clienteId:
                Number(
                    form.get(
                        'clienteId'
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

            tipo:
                String(
                    form.get(
                        'tipo'
                    )
                    ||
                    'Venda'
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

            formaRecebimento:
                String(
                    form.get(
                        'formaRecebimento'
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
            if (
                editing
            )
            {
                await api.patch(
                    `/api/contas-receber/${editing.id}`,
                    base
                );
            }
            else
            {
                await api.post(
                    '/api/contas-receber',

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
                                'Receber',

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
                                base.clienteId,

                            fornecedorId:
                                null,

                            categoriaId:
                                base.categoriaId,

                            contaFinanceiraId:
                                base.contaFinanceiraId,

                            tipoReceita:
                                base.tipo,

                            formaPagamento:
                                base.formaRecebimento,

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

                    : 'Erro ao salvar conta a receber.'
            );
        }
        finally
        {
            setBusy(
                false
            );
        }
    }


    async function receber(
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
                `/api/contas-receber/${selected.id}/receber`,

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

                    /*
                     * LiquidarRequest do backend utiliza
                     * o nome formaPagamento mesmo quando
                     * a operação é um recebimento.
                     */
                    formaPagamento:
                        String(
                            form.get(
                                'formaRecebimento'
                            )
                            ||
                            ''
                        )
                }
            );


            setOpenRecebimento(
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

                    : 'Erro ao registrar recebimento.'
            );
        }
    }


    async function estornar(
        item:
            Receita
    ) {
        if (
            !confirm(
                `Estornar o recebimento de "${item.descricao}"?`
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
                `/api/contas-receber/${item.id}/estornar`,

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

                    : 'Erro ao estornar recebimento.'
            );
        }
    }


    async function excluir(
        item:
            Receita
    ) {
        if (
            !confirm(
                `Excluir a receita "${item.descricao}"?`
            )
        )
        {
            return;
        }


        try {
            await api.delete(
                `/api/contas-receber/${item.id}`
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

                    : 'Não foi possível excluir a receita.'
            );
        }
    }


    return (
        <>

            <div className="page-title actions">

                <div>

                    <div className="title-line">

                        <h1>
                            Contas a Receber
                        </h1>

                        {demo && (
                            <DemoPill />
                        )}

                    </div>


                    <p>
                        Gerencie vendas, serviços, clientes, parcelamentos e recebimentos.
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
                            novaReceita
                        }
                    >
                        Nova Receita
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

                        placeholder="Descrição, documento ou cliente"
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

                        <option value="Previsto">
                            Previsto
                        </option>

                        <option value="Vencido">
                            Vencido
                        </option>

                        <option value="Recebido">
                            Recebido
                        </option>

                        <option value="Cancelado">
                            Cancelado
                        </option>

                    </select>

                </Field>


                <Field label="Tipo">

                    <select
                        value={
                            tipoFiltro
                        }

                        onChange={
                            event =>
                                setTipoFiltro(
                                    event.target.value
                                )
                        }
                    >

                        <option value="Todos">
                            Todos
                        </option>

                        <option value="Venda">
                            Venda
                        </option>

                        <option value="Serviço">
                            Serviço
                        </option>

                        <option value="Outros">
                            Outros
                        </option>

                    </select>

                </Field>


                <Field label="Cliente">

                    <select
                        value={
                            clienteFiltro
                        }

                        onChange={
                            event =>
                                setClienteFiltro(
                                    event.target.value
                                )
                        }
                    >

                        <option value="">
                            Todos
                        </option>


                        {
                            clientes.map(
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

            </div>


            <div className="kpi-grid four">

                <Kpi
                    icon="receive"
                    label="Total a Receber"
                    value={
                        money(
                            totalAberto
                        )
                    }
                />


                <Kpi
                    icon="check"
                    label="Recebido"
                    value={
                        money(
                            totalRecebido
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
                    icon="cash"
                    label="Previsão"
                    value={
                        money(
                            previsao
                        )
                    }
                />

            </div>


            <div className="receivable-charts">

                <Card
                    title="Receitas por Tipo"

                    subtitle="Recebidas x previstas"
                >

                    <Bars
                        items={
                            typeBars
                        }
                    />

                </Card>


                <Card title="Receitas por Plano de Contas">

    <Donut
        center={
            money(
                totalAberto
                +
                totalRecebido
            )
        }

        segments={
            (
                categorias.length > 0

                    ? categorias

                    : [
                        {
                            id: 0,
                            empresaId: empresaAtivaId,
                            nome: 'Receitas',
                            tipo: 'Receita',
                            categoriaPaiId: null,
                            codigo: null,
                            ativa: true
                        }
                    ]
            )
                .slice(
                    0,
                    5
                )
                .map(
                    (
                        categoria,
                        index
                    ) => {
                        /*
                         * Soma todas as receitas
                         * vinculadas a esta conta
                         * do Plano de Contas.
                         */
                        const valorCategoria =
                            items
                                .filter(
                                    item =>
                                        item.categoriaId
                                        ===
                                        categoria.id
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


                        /*
                         * Cores utilizadas pelo gráfico.
                         */
                        const cores = [
                            '#2f73f6',
                            '#16a985',
                            '#7453e8',
                            '#f4b83f',
                            '#94a3b8'
                        ];


                        return {
                            label:
                                categoria.nome,

                            /*
                             * O gráfico precisa de um valor
                             * mínimo para conseguir renderizar
                             * quando ainda não há receitas.
                             */
                            value:
                                valorCategoria > 0
                                    ? valorCategoria
                                    : 1,

                            /*
                             * Caso o índice ultrapasse
                             * a quantidade prevista de cores,
                             * utiliza a última cor.
                             */
                            color:
                                cores[index]
                                ??
                                '#94a3b8'
                        };
                    }
                )
        }
    />

</Card>

            </div>


            <div className="master-detail">

                <Card
                    title="Contas a Receber"

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
                                        Cliente
                                    </th>

                                    <th>
                                        Tipo
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
                                                            clientes,
                                                            item.clienteId
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.tipo
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

                                                <td className="num positive-text">

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


                <Card title="Detalhes da Receita">

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
                                                clientes,
                                                selected.clienteId
                                            )
                                        }

                                        {' · '}

                                        {
                                            selected.tipo
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
                                    Recebimento
                                </dt>

                                <dd>
                                    {
                                        dateBR(
                                            selected.dataRecebimento
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
                                        selected.formaRecebimento
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

                                <dd className="positive-text">
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
                                    'Previsto'

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
                                                editarReceita(
                                                    selected
                                                )
                                            }
                                        >
                                            Editar
                                        </Button>


                                        <Button
                                            variant="success"

                                            onClick={() =>
                                                setOpenRecebimento(
                                                    true
                                                )
                                            }
                                        >
                                            Receber
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
                                    'Recebido'
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
                                            Estornar Recebimento
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

                        ? 'Editar Conta a Receber'

                        : 'Nova Conta a Receber'
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


                    <Field label="Tipo">

                        <select
                            name="tipo"

                            defaultValue={
                                editing
                                    ?.tipo
                                ??
                                'Venda'
                            }
                        >

                            <option value="Venda">
                                Venda
                            </option>

                            <option value="Serviço">
                                Serviço
                            </option>

                            <option value="Outros">
                                Outros
                            </option>

                        </select>

                    </Field>


                    <Field label="Cliente">

                        <select
                            name="clienteId"

                            defaultValue={
                                editing
                                    ?.clienteId
                                ??
                                ''
                            }
                        >

                            <option value="">
                                Sem cliente
                            </option>


                            {
                                clientes.map(
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
                                Definir no recebimento
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


                    <Field label="Forma de Recebimento">

                        <select
                            name="formaRecebimento"

                            defaultValue={
                                editing
                                    ?.formaRecebimento
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
             * MODAL RECEBIMENTO
             */}

            <Modal
                open={
                    openRecebimento
                    &&
                    Boolean(
                        selected
                    )
                }

                title="Registrar Recebimento"

                onClose={() =>
                    setOpenRecebimento(
                        false
                    )
                }
            >

                <form
                    className="form-grid"

                    onSubmit={
                        receber
                    }
                >

                    <Field label="Data do Recebimento">

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


                    <Field label="Forma de Recebimento">

                        <select
                            name="formaRecebimento"

                            defaultValue={
                                selected
                                    ?.formaRecebimento
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
                                setOpenRecebimento(
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
                            Confirmar Recebimento
                        </Button>

                    </div>

                </form>

            </Modal>

        </>
    );
}