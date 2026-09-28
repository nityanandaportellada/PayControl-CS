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
    mockFornecedores
} from '../mock';

import type {
    Categoria,
    ContaFinanceira,
    Empresa,
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
    money
} from '../components/UI';


type Tab =
    | 'Empresas'
    | 'Clientes'
    | 'Fornecedores'
    | 'Plano de Contas'
    | 'Contas Financeiras';


type StatusFilter =
    | 'Todos'
    | 'Ativos'
    | 'Inativos';


/*
 * Compara dois códigos do Plano de Contas.
 *
 * Exemplos:
 *
 * 1
 * 1.01
 * 1.02
 * 1.10
 * 2
 * 2.01
 * 10
 *
 * A comparação é feita numericamente por nível,
 * evitando a utilização de localeCompare com
 * argumentos não suportados pela configuração
 * atual do TypeScript do projeto.
 */
function compararCodigosPlano(
    codigoA?: string | null,
    codigoB?: string | null
): number {
    /*
     * Divide cada código pelos pontos.
     *
     * Exemplo:
     *
     * 2.01.03
     *
     * vira:
     *
     * [2, 1, 3]
     */
    const partesA =
        String(
            codigoA ?? ''
        )
            .split('.')
            .map(
                parte =>
                    Number(
                        parte
                    )
            );


    const partesB =
        String(
            codigoB ?? ''
        )
            .split('.')
            .map(
                parte =>
                    Number(
                        parte
                    )
            );


    /*
     * Descobre qual código possui
     * mais níveis.
     */
    const maiorQuantidade =
        Math.max(
            partesA.length,
            partesB.length
        );


    /*
     * Compara cada nível individualmente.
     */
    for (
        let indice = 0;
        indice < maiorQuantidade;
        indice++
    ) {
        const valorA =
            Number.isNaN(
                partesA[indice]
            )
                ? 0
                : partesA[indice] ?? 0;


        const valorB =
            Number.isNaN(
                partesB[indice]
            )
                ? 0
                : partesB[indice] ?? 0;


        if (valorA < valorB) {
            return -1;
        }


        if (valorA > valorB) {
            return 1;
        }
    }


    return 0;
}


/*
 * Página principal de Cadastros.
 */
export default function RegistryPage() {
    /*
     * Dados da Empresa Ativa Global.
     */
    const {
        empresas,
        empresaAtiva,
        empresaAtivaId,
        atualizarEmpresas
    } =
        useCompany();


    /*
     * Aba selecionada.
     */
    const [
        tab,
        setTab
    ] =
        useState<Tab>(
            'Clientes'
        );


    /*
     * Clientes da empresa ativa.
     */
    const [
        clientes,
        setClientes
    ] =
        useState<Pessoa[]>(
            []
        );


    /*
     * Fornecedores da empresa ativa.
     */
    const [
        fornecedores,
        setFornecedores
    ] =
        useState<Pessoa[]>(
            []
        );


    /*
     * Plano de Contas.
     */
    const [
        categorias,
        setCategorias
    ] =
        useState<Categoria[]>(
            []
        );


    /*
     * Contas Financeiras.
     */
    const [
        contas,
        setContas
    ] =
        useState<
            ContaFinanceira[]
        >(
            []
        );


    /*
     * Indica utilização dos dados demonstrativos.
     */
    const [
        demo,
        setDemo
    ] =
        useState(
            false
        );


    /*
     * Campo de busca para Cliente/Fornecedor.
     */
    const [
        busca,
        setBusca
    ] =
        useState(
            ''
        );


    /*
     * Filtro de status.
     */
    const [
        statusFilter,
        setStatusFilter
    ] =
        useState<StatusFilter>(
            'Todos'
        );


    /*
     * Modal de Cliente/Fornecedor.
     */
    const [
        openPessoa,
        setOpenPessoa
    ] =
        useState(
            false
        );


    /*
     * Modal dos demais cadastros.
     */
    const [
        openCadastro,
        setOpenCadastro
    ] =
        useState(
            false
        );


    /*
     * Cliente/Fornecedor sendo editado.
     */
    const [
        pessoaEditando,
        setPessoaEditando
    ] =
        useState<
            Pessoa | null
        >(
            null
        );


    /*
     * Empresa sendo editada.
     */
    const [
        empresaEditando,
        setEmpresaEditando
    ] =
        useState<
            Empresa | null
        >(
            null
        );


    /*
     * Conta do Plano de Contas sendo editada.
     */
    const [
        categoriaEditando,
        setCategoriaEditando
    ] =
        useState<
            Categoria | null
        >(
            null
        );


    /*
     * Conta Financeira sendo editada.
     */
    const [
        contaEditando,
        setContaEditando
    ] =
        useState<
            ContaFinanceira | null
        >(
            null
        );


    /*
     * Cliente ou Fornecedor selecionado.
     */
    const [
        selected,
        setSelected
    ] =
        useState<
            Pessoa | null
        >(
            null
        );


    /*
     * Evita múltiplos envios durante
     * operações de salvamento.
     */
    const [
        busy,
        setBusy
    ] =
        useState(
            false
        );


    /*
     * ============================================================
     * CARREGAMENTO DOS CADASTROS
     * ============================================================
     */

    async function load() {
        const [
            clientesResult,
            fornecedoresResult,
            categoriasResult,
            contasResult
        ] =
            await Promise.all([
                /*
                 * Clientes.
                 */
                loadWithFallback(
                    () =>
                        api.get<
                            Pessoa[]
                        >(
                            '/api/clientes'
                        ),

                    mockClientes.filter(
                        item =>
                            !empresaAtivaId
                            ||
                            item.empresaId
                            ===
                            empresaAtivaId
                    )
                ),

                /*
                 * Fornecedores.
                 */
                loadWithFallback(
                    () =>
                        api.get<
                            Pessoa[]
                        >(
                            '/api/fornecedores'
                        ),

                    mockFornecedores.filter(
                        item =>
                            !empresaAtivaId
                            ||
                            item.empresaId
                            ===
                            empresaAtivaId
                    )
                ),

                /*
                 * Plano de Contas.
                 */
                loadWithFallback(
                    () =>
                        api.get<
                            Categoria[]
                        >(
                            '/api/plano-contas'
                        ),

                    mockCategorias.filter(
                        item =>
                            !empresaAtivaId
                            ||
                            item.empresaId
                            ===
                            empresaAtivaId
                    )
                ),

                /*
                 * Contas Financeiras.
                 */
                loadWithFallback(
                    () =>
                        api.get<
                            ContaFinanceira[]
                        >(
                            '/api/contas-financeiras'
                        ),

                    mockContasFinanceiras.filter(
                        item =>
                            !empresaAtivaId
                            ||
                            item.empresaId
                            ===
                            empresaAtivaId
                    )
                )
            ]);


        /*
         * Atualiza os estados.
         */
        setClientes(
            clientesResult.data
        );


        setFornecedores(
            fornecedoresResult.data
        );


        setCategorias(
            categoriasResult.data
        );


        setContas(
            contasResult.data
        );


        /*
         * Ativa indicador demonstrativo
         * se alguma consulta usou fallback.
         */
        setDemo(
            clientesResult.demo
            ||
            fornecedoresResult.demo
            ||
            categoriasResult.demo
            ||
            contasResult.demo
        );


        /*
         * Atualiza a seleção mantendo o registro
         * atual quando ele ainda existir.
         */
        setSelected(
            atual => {
                const source =
                    tab ===
                    'Fornecedores'

                        ? fornecedoresResult.data

                        : clientesResult.data;


                return (
                    source.find(
                        item =>
                            item.id ===
                            atual?.id
                    )
                    ??
                    source[0]
                    ??
                    null
                );
            }
        );
    }


    /*
     * Carrega os dados ao abrir a página.
     */
    useEffect(
        () => {
            void load();
        },

        []
    );


    /*
     * Define qual lista será utilizada.
     */
    const people =
        tab ===
        'Fornecedores'

            ? fornecedores

            : clientes;


    /*
     * ============================================================
     * PESQUISA E FILTRO
     * ============================================================
     */

    const peopleFiltradas =
        useMemo(
            () => {
                const termo =
                    busca
                        .trim()
                        .toLowerCase();


                return people.filter(
                    pessoa => {
                        /*
                         * Busca pelos principais campos.
                         */
                        const bateBusca =
                            !termo
                            ||
                            pessoa.nome
                                .toLowerCase()
                                .includes(
                                    termo
                                )
                            ||
                            (
                                pessoa.cpfCnpj
                                ??
                                ''
                            )
                                .toLowerCase()
                                .includes(
                                    termo
                                )
                            ||
                            (
                                pessoa.email
                                ??
                                ''
                            )
                                .toLowerCase()
                                .includes(
                                    termo
                                )
                            ||
                            (
                                pessoa.telefone
                                ??
                                ''
                            )
                                .toLowerCase()
                                .includes(
                                    termo
                                )
                            ||
                            (
                                pessoa.endereco
                                ??
                                ''
                            )
                                .toLowerCase()
                                .includes(
                                    termo
                                );


                        /*
                         * Filtra pelo status.
                         */
                        const bateStatus =
                            statusFilter
                            ===
                            'Todos'

                            ||

                            (
                                statusFilter
                                ===
                                'Ativos'
                                &&
                                pessoa.ativo
                            )

                            ||

                            (
                                statusFilter
                                ===
                                'Inativos'
                                &&
                                !pessoa.ativo
                            );


                        return (
                            bateBusca
                            &&
                            bateStatus
                        );
                    }
                );
            },

            [
                people,
                busca,
                statusFilter
            ]
        );


    /*
     * ============================================================
     * ORDENAÇÃO DO PLANO DE CONTAS
     * ============================================================
     *
     * CORREÇÃO:
     *
     * A versão anterior utilizava localeCompare
     * passando três argumentos.
     *
     * A configuração atual do TypeScript reconhecia
     * somente uma assinatura com um argumento.
     *
     * Agora usamos compararCodigosPlano().
     */
    const planoContasOrdenado =
        useMemo(
            () =>
                [...categorias]
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            compararCodigosPlano(
                                a.codigo,
                                b.codigo
                            )
                    ),

            [
                categorias
            ]
        );


    /*
     * Confirma que existe Empresa Ativa.
     */
    function exigirEmpresa() {
        if (
            empresaAtivaId
        )
        {
            return true;
        }


        alert(
            'Cadastre ou selecione uma empresa antes de continuar.'
        );


        return false;
    }


    /*
     * ============================================================
     * CLIENTE / FORNECEDOR
     * ============================================================
     */

    /*
     * Cria ou atualiza Cliente/Fornecedor.
     */
    async function salvarPessoa(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        if (
            !exigirEmpresa()
        )
        {
            return;
        }


        setBusy(
            true
        );


        const form =
            new FormData(
                event.currentTarget
            );


        const body = {
            empresaId:
                empresaAtivaId,

            nome:
                String(
                    form.get(
                        'nome'
                    )
                    ||
                    ''
                ),

            cpfCnpj:
                String(
                    form.get(
                        'cpfCnpj'
                    )
                    ||
                    ''
                ),

            email:
                String(
                    form.get(
                        'email'
                    )
                    ||
                    ''
                ),

            telefone:
                String(
                    form.get(
                        'telefone'
                    )
                    ||
                    ''
                ),

            endereco:
                String(
                    form.get(
                        'endereco'
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
                ),

            ativo:
                pessoaEditando
                    ?.ativo
                ??
                true
        };


        const endpoint =
            tab ===
            'Fornecedores'

                ? '/api/fornecedores'

                : '/api/clientes';


        try {
            /*
             * Atualização.
             */
            if (
                pessoaEditando
            )
            {
                await api.put(
                    `${endpoint}/${pessoaEditando.id}`,
                    body
                );
            }
            else
            {
                /*
                 * Novo cadastro.
                 */
                await api.post(
                    endpoint,
                    body
                );
            }


            setOpenPessoa(
                false
            );


            setPessoaEditando(
                null
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

                    : 'Erro ao salvar cadastro.'
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
     * Inativa ou reativa Cliente/Fornecedor.
     */
    async function alternarPessoa(
        pessoa:
            Pessoa
    ) {
        if (
            !exigirEmpresa()
        )
        {
            return;
        }


        const endpoint =
            tab ===
            'Fornecedores'

                ? '/api/fornecedores'

                : '/api/clientes';


        try {
            await api.put(
                `${endpoint}/${pessoa.id}`,

                {
                    empresaId:
                        empresaAtivaId,

                    nome:
                        pessoa.nome,

                    cpfCnpj:
                        pessoa.cpfCnpj,

                    email:
                        pessoa.email,

                    telefone:
                        pessoa.telefone,

                    endereco:
                        pessoa.endereco,

                    observacoes:
                        pessoa.observacoes,

                    ativo:
                        !pessoa.ativo
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

                    : 'Erro ao alterar status.'
            );
        }
    }


    /*
     * Exclui Cliente ou Fornecedor.
     *
     * O backend impede a exclusão
     * quando existirem lançamentos vinculados.
     */
    async function excluirPessoa(
        pessoa:
            Pessoa
    ) {
        const entidade =
            tab ===
            'Fornecedores'

                ? 'fornecedor'

                : 'cliente';


        if (
            !confirm(
                `Excluir definitivamente o ${entidade} "${pessoa.nome}"?`
            )
        )
        {
            return;
        }


        const endpoint =
            tab ===
            'Fornecedores'

                ? '/api/fornecedores'

                : '/api/clientes';


        try {
            await api.delete(
                `${endpoint}/${pessoa.id}`
            );


            setSelected(
                null
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

                    : 'Não foi possível excluir o cadastro.'
            );
        }
    }


    /*
     * ============================================================
     * EMPRESA
     * ============================================================
     */

    /*
     * Cria ou atualiza empresa.
     */
    async function salvarEmpresa(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        setBusy(
            true
        );


        const form =
            new FormData(
                event.currentTarget
            );


        const body = {
            nome:
                String(
                    form.get(
                        'nome'
                    )
                    ||
                    ''
                ),

            nomeFantasia:
                String(
                    form.get(
                        'nomeFantasia'
                    )
                    ||
                    ''
                ),

            cpfCnpj:
                String(
                    form.get(
                        'cpfCnpj'
                    )
                    ||
                    ''
                ),

            email:
                String(
                    form.get(
                        'email'
                    )
                    ||
                    ''
                ),

            telefone:
                String(
                    form.get(
                        'telefone'
                    )
                    ||
                    ''
                ),

            endereco:
                String(
                    form.get(
                        'endereco'
                    )
                    ||
                    ''
                ),

            ativa:
                empresaEditando
                    ?.ativa
                ??
                true
        };


        try {
            const salva =
                empresaEditando

                    ? await api.put<
                        Empresa
                    >(
                        `/api/empresas/${empresaEditando.id}`,
                        body
                    )

                    : await api.post<
                        Empresa
                    >(
                        '/api/empresas',
                        body
                    );


            setOpenCadastro(
                false
            );


            setEmpresaEditando(
                null
            );


            /*
             * Atualiza o contexto global
             * e mantém a empresa salva ativa.
             */
            await atualizarEmpresas(
                salva.id
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

                    : 'Erro ao salvar empresa.'
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
     * ============================================================
     * PLANO DE CONTAS
     * ============================================================
     */

    /*
     * Cria ou atualiza conta
     * do Plano de Contas.
     */
    async function salvarContaPlano(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        if (
            !exigirEmpresa()
        )
        {
            return;
        }


        setBusy(
            true
        );


        const form =
            new FormData(
                event.currentTarget
            );


        const categoriaPai =
            form.get(
                'categoriaPaiId'
            );


        const body = {
            empresaId:
                empresaAtivaId,

            nome:
                String(
                    form.get(
                        'nome'
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
                    'Despesa'
                ),

            categoriaPaiId:
                categoriaPai

                    ? Number(
                        categoriaPai
                    )

                    : null,

            codigo:
                String(
                    form.get(
                        'codigo'
                    )
                    ||
                    ''
                ),

            ativa:
                categoriaEditando
                    ?.ativa
                ??
                true
        };


        try {
            if (
                categoriaEditando
            )
            {
                await api.put(
                    `/api/plano-contas/${categoriaEditando.id}`,
                    body
                );
            }
            else
            {
                await api.post(
                    '/api/plano-contas',
                    body
                );
            }


            setOpenCadastro(
                false
            );


            setCategoriaEditando(
                null
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

                    : 'Erro ao salvar conta do Plano de Contas.'
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
     * Inativa ou reativa conta
     * do Plano de Contas.
     */
    async function alternarContaPlano(
        conta:
            Categoria
    ) {
        try {
            await api.put(
                `/api/plano-contas/${conta.id}`,

                {
                    empresaId:
                        empresaAtivaId,

                    nome:
                        conta.nome,

                    tipo:
                        conta.tipo,

                    categoriaPaiId:
                        conta.categoriaPaiId,

                    codigo:
                        conta.codigo,

                    ativa:
                        !conta.ativa
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

                    : 'Erro ao alterar status.'
            );
        }
    }


    /*
     * Exclui conta do Plano de Contas.
     *
     * O backend deve impedir a exclusão
     * caso existam filhos ou lançamentos.
     */
    async function excluirContaPlano(
        conta:
            Categoria
    ) {
        if (
            !confirm(
                `Excluir definitivamente a conta "${conta.nome}" do Plano de Contas?`
            )
        )
        {
            return;
        }


        try {
            await api.delete(
                `/api/plano-contas/${conta.id}`
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

                    : 'Não foi possível excluir a conta.'
            );
        }
    }


    /*
     * ============================================================
     * CONTAS FINANCEIRAS
     * ============================================================
     */

    /*
     * Cria ou atualiza Conta Financeira.
     */
    async function salvarContaFinanceira(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        if (
            !exigirEmpresa()
        )
        {
            return;
        }


        setBusy(
            true
        );


        const form =
            new FormData(
                event.currentTarget
            );


        const body = {
            empresaId:
                empresaAtivaId,

            nome:
                String(
                    form.get(
                        'nome'
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
                    ''
                ),

            instituicao:
                String(
                    form.get(
                        'instituicao'
                    )
                    ||
                    ''
                ),

            agencia:
                String(
                    form.get(
                        'agencia'
                    )
                    ||
                    ''
                ),

            numeroConta:
                String(
                    form.get(
                        'numeroConta'
                    )
                    ||
                    ''
                ),

            /*
             * O saldo inicial somente pode
             * ser definido no cadastro.
             *
             * Durante a edição o valor
             * original é preservado.
             */
            saldoInicial:
                contaEditando
                    ?.saldoInicial

                ??
                Number(
                    form.get(
                        'saldoInicial'
                    )
                    ||
                    0
                ),

            ativa:
                contaEditando
                    ?.ativa
                ??
                true
        };


        try {
            if (
                contaEditando
            )
            {
                await api.put(
                    `/api/contas-financeiras/${contaEditando.id}`,
                    body
                );
            }
            else
            {
                await api.post(
                    '/api/contas-financeiras',
                    body
                );
            }


            setOpenCadastro(
                false
            );


            setContaEditando(
                null
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

                    : 'Erro ao salvar conta financeira.'
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
     * Inativa ou reativa Conta Financeira.
     */
    async function alternarContaFinanceira(
        conta:
            ContaFinanceira
    ) {
        try {
            await api.put(
                `/api/contas-financeiras/${conta.id}`,

                {
                    empresaId:
                        conta.empresaId
                        ??
                        empresaAtivaId,

                    nome:
                        conta.nome,

                    tipo:
                        conta.tipo,

                    instituicao:
                        conta.instituicao,

                    agencia:
                        conta.agencia,

                    numeroConta:
                        conta.numeroConta,

                    saldoInicial:
                        conta.saldoInicial,

                    ativa:
                        !conta.ativa
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

                    : 'Erro ao alterar status da conta.'
            );
        }
    }


    /*
     * Exclui Conta Financeira.
     *
     * O backend deverá bloquear se existirem
     * movimentações financeiras vinculadas.
     */
    async function excluirContaFinanceira(
        conta:
            ContaFinanceira
    ) {
        if (
            !confirm(
                `Excluir definitivamente a conta financeira "${conta.nome}"?`
            )
        )
        {
            return;
        }


        try {
            await api.delete(
                `/api/contas-financeiras/${conta.id}`
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

                    : 'Não foi possível excluir a conta financeira.'
            );
        }
    }


    /*
     * ============================================================
     * HIERARQUIA DO PLANO DE CONTAS
     * ============================================================
     */

    /*
     * Calcula a profundidade da conta.
     *
     * Exemplo:
     *
     * 2             nível 0
     * 2.01          nível 1
     * 2.01.01       nível 2
     */
    function obterNivelConta(
        conta:
            Categoria,

        visitados =
            new Set<number>()
    ): number {
        /*
         * Conta raiz.
         */
        if (
            !conta.categoriaPaiId
            ||
            visitados.has(
                conta.id
            )
        )
        {
            return 0;
        }


        /*
         * Evita ciclos infinitos.
         */
        visitados.add(
            conta.id
        );


        const pai =
            categorias.find(
                item =>
                    item.id ===
                    conta.categoriaPaiId
            );


        return pai

            ? 1 +
                obterNivelConta(
                    pai,
                    visitados
                )

            : 0;
    }


    /*
     * ============================================================
     * ABERTURA DOS MODAIS
     * ============================================================
     */

    /*
     * Novo Cliente/Fornecedor.
     */
    function abrirNovaPessoa() {
        if (
            !exigirEmpresa()
        )
        {
            return;
        }


        setPessoaEditando(
            null
        );


        setOpenPessoa(
            true
        );
    }


    /*
     * Novo cadastro das outras abas.
     */
    function abrirNovoCadastro() {
        if (
            tab !==
            'Empresas'
            &&
            !exigirEmpresa()
        )
        {
            return;
        }


        setEmpresaEditando(
            null
        );


        setCategoriaEditando(
            null
        );


        setContaEditando(
            null
        );


        setOpenCadastro(
            true
        );
    }


    /*
     * ============================================================
     * INTERFACE
     * ============================================================
     */

    return (
        <>

            {/*
             * Cabeçalho.
             */}
            <div className="page-title">

                <div>

                    <div className="title-line">

                        <h1>
                            Cadastros
                        </h1>


                        {demo && (
                            <DemoPill />
                        )}

                    </div>


                    <p>
                        Mantenha os dados principais do seu negócio organizados e atualizados.
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

            </div>


            {/*
             * Indicadores.
             */}
            <div className="kpi-grid four">

                <Kpi
                    icon="user"
                    label="Total de Clientes"
                    value={
                        String(
                            clientes.length
                        )
                    }
                />


                <Kpi
                    icon="truck"
                    label="Fornecedores Ativos"
                    value={
                        String(
                            fornecedores
                                .filter(
                                    item =>
                                        item.ativo
                                )
                                .length
                        )
                    }
                />


                <Kpi
                    icon="tag"
                    label="Contas no Plano"
                    value={
                        String(
                            categorias.length
                        )
                    }
                    tone="yellow"
                />


                <Kpi
                    icon="bank"
                    label="Contas Financeiras"
                    value={
                        String(
                            contas.length
                        )
                    }
                />

            </div>


            {/*
             * Abas.
             */}
            <div className="registry-tabs">

                {(
                    [
                        'Empresas',
                        'Clientes',
                        'Fornecedores',
                        'Plano de Contas',
                        'Contas Financeiras'
                    ] as Tab[]
                ).map(
                    item => (

                        <button
                            key={
                                item
                            }

                            className={
                                tab === item

                                    ? 'active'

                                    : ''
                            }

                            onClick={() => {
                                /*
                                 * Troca a aba.
                                 */
                                setTab(
                                    item
                                );


                                /*
                                 * Limpa filtros.
                                 */
                                setBusca(
                                    ''
                                );


                                setStatusFilter(
                                    'Todos'
                                );


                                /*
                                 * Define primeira pessoa
                                 * quando necessário.
                                 */
                                if (
                                    item ===
                                    'Clientes'
                                )
                                {
                                    setSelected(
                                        clientes[0]
                                        ??
                                        null
                                    );
                                }


                                if (
                                    item ===
                                    'Fornecedores'
                                )
                                {
                                    setSelected(
                                        fornecedores[0]
                                        ??
                                        null
                                    );
                                }
                            }}
                        >

                            {item}

                        </button>

                    )
                )}

            </div>


            {/*
             * ====================================================
             * CLIENTES E FORNECEDORES
             * ====================================================
             */}
            {(
                tab ===
                'Clientes'

                ||

                tab ===
                'Fornecedores'
            )
            ? (

                <div className="master-detail">

                    {/*
                     * Lista.
                     */}
                    <Card
                        title={
                            tab
                        }

                        subtitle={
                            `Gerencie seus ${tab.toLowerCase()} da empresa ativa.`
                        }

                        action={

                            <Button
                                icon="plus"

                                onClick={
                                    abrirNovaPessoa
                                }

                                disabled={
                                    !empresaAtivaId
                                }
                            >

                                Novo{' '}

                                {
                                    tab ===
                                    'Clientes'

                                        ? 'Cliente'

                                        : 'Fornecedor'
                                }

                            </Button>
                        }
                    >

                        {/*
                         * Pesquisa e filtro.
                         */}
                        <div className="search-row">

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

                                placeholder="Buscar por nome, documento, e-mail, telefone ou endereço..."
                            />


                           <select
    value={statusFilter}
    onChange={(event) => {
        const valor = event.target.value;

        if (
            valor === 'Todos' ||
            valor === 'Ativos' ||
            valor === 'Inativos'
        ) {
            setStatusFilter(valor);
        }
    }}
>
    <option value="Todos">
        Todos os status
    </option>

    <option value="Ativos">
        Ativos
    </option>

    <option value="Inativos">
        Inativos
    </option>
</select>

                        </div>


                        {/*
                         * Tabela.
                         */}
                        <div className="table-scroll">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Nome / Razão Social
                                        </th>

                                        <th>
                                            Documento
                                        </th>

                                        <th>
                                            Contato
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {
                                        peopleFiltradas.map(
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
                                                            item.nome
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            item.cpfCnpj
                                                            ||
                                                            '—'
                                                        }
                                                    </td>


                                                    <td>

                                                        {
                                                            item.telefone
                                                            ||
                                                            item.email
                                                            ||
                                                            '—'
                                                        }

                                                    </td>


                                                    <td>

                                                        <Badge
                                                            tone={
                                                                item.ativo

                                                                    ? 'success'

                                                                    : 'warning'
                                                            }
                                                        >

                                                            {
                                                                item.ativo

                                                                    ? 'Ativo'

                                                                    : 'Inativo'
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
                                !peopleFiltradas.length
                                &&
                                <EmptyState />
                            }

                        </div>

                    </Card>


                    {/*
                     * Detalhes.
                     */}
                    <Card
                        title={
                            `Dados do ${
                                tab ===
                                'Clientes'

                                    ? 'Cliente'

                                    : 'Fornecedor'
                            }`
                        }
                    >

                        {selected
                        ? (

                            <div className="detail-panel">

                                <div className="detail-title">

                                    <div>

                                        <strong>
                                            {
                                                selected.nome
                                            }
                                        </strong>


                                        <span>

                                            {
                                                selected.cpfCnpj
                                                ||
                                                'Sem documento informado'
                                            }

                                        </span>

                                    </div>


                                    <Badge
                                        tone={
                                            selected.ativo

                                                ? 'success'

                                                : 'warning'
                                        }
                                    >

                                        {
                                            selected.ativo

                                                ? 'Ativo'

                                                : 'Inativo'
                                        }

                                    </Badge>

                                </div>


                                <dl>

                                    <dt>
                                        E-mail
                                    </dt>

                                    <dd>
                                        {
                                            selected.email
                                            ||
                                            '—'
                                        }
                                    </dd>


                                    <dt>
                                        Telefone
                                    </dt>

                                    <dd>
                                        {
                                            selected.telefone
                                            ||
                                            '—'
                                        }
                                    </dd>


                                    <dt>
                                        Endereço
                                    </dt>

                                    <dd>
                                        {
                                            selected.endereco
                                            ||
                                            '—'
                                        }
                                    </dd>


                                    <dt>
                                        Observações
                                    </dt>

                                    <dd>
                                        {
                                            selected.observacoes
                                            ||
                                            '—'
                                        }
                                    </dd>

                                </dl>


                                <div className="detail-actions">

                                    {/*
                                     * Editar.
                                     */}
                                    <Button
                                        variant="secondary"

                                        onClick={() => {
                                            setPessoaEditando(
                                                selected
                                            );

                                            setOpenPessoa(
                                                true
                                            );
                                        }}
                                    >
                                        Editar
                                    </Button>


                                    {/*
                                     * Inativar/Reativar.
                                     */}
                                    <Button
                                        variant={
                                            selected.ativo

                                                ? 'secondary'

                                                : 'success'
                                        }

                                        onClick={() =>
                                            void alternarPessoa(
                                                selected
                                            )
                                        }
                                    >

                                        {
                                            selected.ativo

                                                ? 'Inativar'

                                                : 'Reativar'
                                        }

                                    </Button>


                                    {/*
                                     * Exclusão definitiva.
                                     */}
                                    <Button
                                        variant="danger"

                                        onClick={() =>
                                            void excluirPessoa(
                                                selected
                                            )
                                        }
                                    >
                                        Excluir
                                    </Button>

                                </div>

                            </div>

                        )
                        : (

                            <EmptyState />

                        )}

                    </Card>

                </div>

            )
            : (

                /*
                 * Empresas,
                 * Plano de Contas e
                 * Contas Financeiras.
                 */
                <RegistryOther

                    tab={
                        tab
                    }

                    planoContas={
                        planoContasOrdenado
                    }

                    categorias={
                        categorias
                    }

                    contas={
                        contas
                    }

                    empresas={
                        empresas
                    }

                    obterNivelConta={
                        obterNivelConta
                    }

                    onNovo={
                        abrirNovoCadastro
                    }

                    onEditarEmpresa={
                        empresa => {
                            setEmpresaEditando(
                                empresa
                            );

                            setOpenCadastro(
                                true
                            );
                        }
                    }

                    onEditarContaPlano={
                        categoria => {
                            setCategoriaEditando(
                                categoria
                            );

                            setOpenCadastro(
                                true
                            );
                        }
                    }

                    onAlternarContaPlano={
                        conta =>
                            void alternarContaPlano(
                                conta
                            )
                    }

                    onExcluirContaPlano={
                        conta =>
                            void excluirContaPlano(
                                conta
                            )
                    }

                    onEditarContaFinanceira={
                        conta => {
                            setContaEditando(
                                conta
                            );

                            setOpenCadastro(
                                true
                            );
                        }
                    }

                    onAlternarContaFinanceira={
                        conta =>
                            void alternarContaFinanceira(
                                conta
                            )
                    }

                    onExcluirContaFinanceira={
                        conta =>
                            void excluirContaFinanceira(
                                conta
                            )
                    }
                />

            )}


            {/*
             * ====================================================
             * MODAL CLIENTE / FORNECEDOR
             * ====================================================
             */}
            <Modal
                open={
                    openPessoa
                }

                title={
                    pessoaEditando

                        ? `Editar ${
                            tab ===
                            'Fornecedores'

                                ? 'Fornecedor'

                                : 'Cliente'
                        }`

                        : `Novo ${
                            tab ===
                            'Fornecedores'

                                ? 'Fornecedor'

                                : 'Cliente'
                        }`
                }

                onClose={() => {
                    setOpenPessoa(
                        false
                    );

                    setPessoaEditando(
                        null
                    );
                }}
            >

                <form
                    className="form-grid"

                    onSubmit={
                        salvarPessoa
                    }
                >

                    <Field label="Nome / Razão Social">

                        <input
                            name="nome"

                            required

                            defaultValue={
                                pessoaEditando
                                    ?.nome
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="CPF / CNPJ">

                        <input
                            name="cpfCnpj"

                            defaultValue={
                                pessoaEditando
                                    ?.cpfCnpj
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="E-mail">

                        <input
                            name="email"

                            type="email"

                            defaultValue={
                                pessoaEditando
                                    ?.email
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Telefone">

                        <input
                            name="telefone"

                            defaultValue={
                                pessoaEditando
                                    ?.telefone
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Endereço">

                        <input
                            name="endereco"

                            defaultValue={
                                pessoaEditando
                                    ?.endereco
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Observações">

                        <textarea
                            name="observacoes"

                            rows={3}

                            defaultValue={
                                pessoaEditando
                                    ?.observacoes
                                ??
                                ''
                            }
                        />

                    </Field>


                    <div className="form-actions">

                        <Button
                            variant="secondary"

                            onClick={() => {
                                setOpenPessoa(
                                    false
                                );

                                setPessoaEditando(
                                    null
                                );
                            }}
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
             * ====================================================
             * MODAL EMPRESA
             * ====================================================
             */}
            <Modal
                open={
                    openCadastro
                    &&
                    tab ===
                    'Empresas'
                }

                title={
                    empresaEditando

                        ? 'Editar Empresa'

                        : 'Nova Empresa'
                }

                onClose={() => {
                    setOpenCadastro(
                        false
                    );

                    setEmpresaEditando(
                        null
                    );
                }}
            >

                <form
                    className="form-grid"

                    onSubmit={
                        salvarEmpresa
                    }
                >

                    <Field label="Razão Social">

                        <input
                            name="nome"

                            required

                            defaultValue={
                                empresaEditando
                                    ?.nome
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Nome Fantasia">

                        <input
                            name="nomeFantasia"

                            defaultValue={
                                empresaEditando
                                    ?.nomeFantasia
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="CPF / CNPJ">

                        <input
                            name="cpfCnpj"

                            defaultValue={
                                empresaEditando
                                    ?.cpfCnpj
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="E-mail">

                        <input
                            name="email"

                            type="email"

                            defaultValue={
                                empresaEditando
                                    ?.email
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Telefone">

                        <input
                            name="telefone"

                            defaultValue={
                                empresaEditando
                                    ?.telefone
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Endereço">

                        <input
                            name="endereco"

                            defaultValue={
                                empresaEditando
                                    ?.endereco
                                ??
                                ''
                            }
                        />

                    </Field>


                    <div className="form-actions">

                        <Button
                            variant="secondary"

                            onClick={() => {
                                setOpenCadastro(
                                    false
                                );

                                setEmpresaEditando(
                                    null
                                );
                            }}
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
             * ====================================================
             * MODAL PLANO DE CONTAS
             * ====================================================
             */}
            <Modal
                open={
                    openCadastro
                    &&
                    tab ===
                    'Plano de Contas'
                }

                title={
                    categoriaEditando

                        ? 'Editar Conta do Plano'

                        : 'Nova Conta do Plano'
                }

                onClose={() => {
                    setOpenCadastro(
                        false
                    );

                    setCategoriaEditando(
                        null
                    );
                }}
            >

                <form
                    className="form-grid"

                    onSubmit={
                        salvarContaPlano
                    }
                >

                    <Field label="Código">

                        <input
                            name="codigo"

                            required

                            placeholder="Ex.: 2.01.01"

                            defaultValue={
                                categoriaEditando
                                    ?.codigo
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Nome da Conta">

                        <input
                            name="nome"

                            required

                            placeholder="Ex.: Energia Elétrica"

                            defaultValue={
                                categoriaEditando
                                    ?.nome
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Tipo">

                        <select
                            name="tipo"

                            required

                            defaultValue={
                                categoriaEditando
                                    ?.tipo
                                ??
                                'Despesa'
                            }
                        >

                            <option value="Receita">
                                Receita
                            </option>


                            <option value="Despesa">
                                Despesa
                            </option>

                        </select>

                    </Field>


                    <Field label="Conta Pai">

                        <select
                            name="categoriaPaiId"

                            defaultValue={
                                categoriaEditando
                                    ?.categoriaPaiId
                                ??
                                ''
                            }
                        >

                            <option value="">
                                Nenhuma - Conta Raiz
                            </option>


                            {
                                planoContasOrdenado

                                    /*
                                     * Evita selecionar
                                     * a própria conta como pai.
                                     */
                                    .filter(
                                        item =>
                                            item.id
                                            !==
                                            categoriaEditando?.id
                                    )

                                    .map(
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
                                                    '— '.repeat(
                                                        obterNivelConta(
                                                            item
                                                        )
                                                    )
                                                }

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


                    <div className="form-actions">

                        <Button
                            variant="secondary"

                            onClick={() => {
                                setOpenCadastro(
                                    false
                                );

                                setCategoriaEditando(
                                    null
                                );
                            }}
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
             * ====================================================
             * MODAL CONTA FINANCEIRA
             * ====================================================
             */}
            <Modal
                open={
                    openCadastro
                    &&
                    tab ===
                    'Contas Financeiras'
                }

                title={
                    contaEditando

                        ? 'Editar Conta Financeira'

                        : 'Nova Conta Financeira'
                }

                onClose={() => {
                    setOpenCadastro(
                        false
                    );

                    setContaEditando(
                        null
                    );
                }}
            >

                <form
                    className="form-grid"

                    onSubmit={
                        salvarContaFinanceira
                    }
                >

                    <Field label="Nome da Conta">

                        <input
                            name="nome"

                            required

                            defaultValue={
                                contaEditando
                                    ?.nome
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Tipo">

                        <select
                            name="tipo"

                            required

                            defaultValue={
                                contaEditando
                                    ?.tipo
                                ??
                                'Conta Corrente'
                            }
                        >

                            <option value="Conta Corrente">
                                Conta Corrente
                            </option>


                            <option value="Poupança">
                                Poupança
                            </option>


                            <option value="Caixa">
                                Caixa
                            </option>


                            <option value="Carteira Digital">
                                Carteira Digital
                            </option>

                        </select>

                    </Field>


                    <Field label="Instituição">

                        <input
                            name="instituicao"

                            defaultValue={
                                contaEditando
                                    ?.instituicao
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Agência">

                        <input
                            name="agencia"

                            defaultValue={
                                contaEditando
                                    ?.agencia
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Número da Conta">

                        <input
                            name="numeroConta"

                            defaultValue={
                                contaEditando
                                    ?.numeroConta
                                ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Saldo Inicial">

                        <input
                            name="saldoInicial"

                            type="number"

                            step="0.01"

                            defaultValue={
                                contaEditando
                                    ?.saldoInicial
                                ??
                                0
                            }

                            readOnly={
                                Boolean(
                                    contaEditando
                                )
                            }
                        />

                    </Field>


                    {/*
                     * Explicação apresentada somente
                     * durante a edição.
                     */}
                    {contaEditando && (

                        <div className="info-note">

                            O saldo inicial é definido somente no cadastro.
                            Depois disso, o saldo deve mudar por pagamentos,
                            recebimentos ou transferências.

                        </div>

                    )}


                    <div className="form-actions">

                        <Button
                            variant="secondary"

                            onClick={() => {
                                setOpenCadastro(
                                    false
                                );

                                setContaEditando(
                                    null
                                );
                            }}
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

        </>
    );
}


/*
 * ================================================================
 * COMPONENTE DOS DEMAIS CADASTROS
 * ================================================================
 *
 * Responsável por exibir:
 *
 * - Empresas;
 * - Plano de Contas;
 * - Contas Financeiras.
 */
function RegistryOther({
    tab,
    planoContas,
    categorias,
    contas,
    empresas,
    obterNivelConta,
    onNovo,
    onEditarEmpresa,
    onEditarContaPlano,
    onAlternarContaPlano,
    onExcluirContaPlano,
    onEditarContaFinanceira,
    onAlternarContaFinanceira,
    onExcluirContaFinanceira
}: {
    tab:
        Tab;

    planoContas:
        Categoria[];

    categorias:
        Categoria[];

    contas:
        ContaFinanceira[];

    empresas:
        Empresa[];

    obterNivelConta:
        (
            conta:
                Categoria
        ) => number;

    onNovo:
        () => void;

    onEditarEmpresa:
        (
            empresa:
                Empresa
        ) => void;

    onEditarContaPlano:
        (
            categoria:
                Categoria
        ) => void;

    onAlternarContaPlano:
        (
            categoria:
                Categoria
        ) => void;

    onExcluirContaPlano:
        (
            categoria:
                Categoria
        ) => void;

    onEditarContaFinanceira:
        (
            conta:
                ContaFinanceira
        ) => void;

    onAlternarContaFinanceira:
        (
            conta:
                ContaFinanceira
        ) => void;

    onExcluirContaFinanceira:
        (
            conta:
                ContaFinanceira
        ) => void;
}) {
    /*
     * ============================================================
     * EMPRESAS
     * ============================================================
     */
    if (
        tab ===
        'Empresas'
    )
    {
        return (

            <Card
                title="Empresas"

                subtitle="Cadastre e mantenha as empresas utilizadas no PayControl."

                action={

                    <Button
                        icon="plus"

                        onClick={
                            onNovo
                        }
                    >
                        Nova Empresa
                    </Button>
                }
            >

                <div className="table-scroll">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Razão Social
                                </th>


                                <th>
                                    Nome Fantasia
                                </th>


                                <th>
                                    CPF / CNPJ
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
                                empresas.map(
                                    empresa => (

                                        <tr
                                            key={
                                                empresa.id
                                            }
                                        >

                                            <td>
                                                {
                                                    empresa.nome
                                                }
                                            </td>


                                            <td>
                                                {
                                                    empresa.nomeFantasia
                                                    ||
                                                    '—'
                                                }
                                            </td>


                                            <td>
                                                {
                                                    empresa.cpfCnpj
                                                    ||
                                                    '—'
                                                }
                                            </td>


                                            <td>

                                                <Badge
                                                    tone={
                                                        empresa.ativa

                                                            ? 'success'

                                                            : 'warning'
                                                    }
                                                >

                                                    {
                                                        empresa.ativa

                                                            ? 'Ativa'

                                                            : 'Inativa'
                                                    }

                                                </Badge>

                                            </td>


                                            <td>

                                                <Button
                                                    variant="ghost"

                                                    onClick={() =>
                                                        onEditarEmpresa(
                                                            empresa
                                                        )
                                                    }
                                                >
                                                    Editar
                                                </Button>

                                            </td>

                                        </tr>

                                    )
                                )
                            }

                        </tbody>

                    </table>


                    {
                        !empresas.length
                        &&
                        <EmptyState
                            text="Nenhuma empresa cadastrada."
                        />
                    }

                </div>

            </Card>
        );
    }


    /*
     * ============================================================
     * CONTAS FINANCEIRAS
     * ============================================================
     */
    if (
        tab ===
        'Contas Financeiras'
    )
    {
        return (

            <Card
                title="Contas Financeiras"

                subtitle="Contas bancárias, caixa e carteiras da empresa ativa."

                action={

                    <Button
                        icon="plus"

                        onClick={
                            onNovo
                        }
                    >
                        Nova Conta Financeira
                    </Button>
                }
            >

                <div className="table-scroll">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Nome
                                </th>


                                <th>
                                    Tipo
                                </th>


                                <th>
                                    Instituição
                                </th>


                                <th>
                                    Agência / Conta
                                </th>


                                <th>
                                    Saldo Inicial
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
                                contas.map(
                                    conta => (

                                        <tr
                                            key={
                                                conta.id
                                            }
                                        >

                                            <td>
                                                {
                                                    conta.nome
                                                }
                                            </td>


                                            <td>
                                                {
                                                    conta.tipo
                                                }
                                            </td>


                                            <td>
                                                {
                                                    conta.instituicao
                                                    ||
                                                    '—'
                                                }
                                            </td>


                                            <td>

                                                {
                                                    conta.agencia
                                                    ||
                                                    '—'
                                                }

                                                {' / '}

                                                {
                                                    conta.numeroConta
                                                    ||
                                                    '—'
                                                }

                                            </td>


                                            <td>
                                                {
                                                    money(
                                                        conta.saldoInicial
                                                    )
                                                }
                                            </td>


                                            <td>

                                                <Badge
                                                    tone={
                                                        conta.ativa

                                                            ? 'success'

                                                            : 'warning'
                                                    }
                                                >

                                                    {
                                                        conta.ativa

                                                            ? 'Ativa'

                                                            : 'Inativa'
                                                    }

                                                </Badge>

                                            </td>


                                            <td>

                                                <div className="action-row">

                                                    {/*
                                                     * Editar.
                                                     */}
                                                    <Button
                                                        variant="ghost"

                                                        onClick={() =>
                                                            onEditarContaFinanceira(
                                                                conta
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </Button>


                                                    {/*
                                                     * Inativar/Reativar.
                                                     */}
                                                    <Button
                                                        variant="ghost"

                                                        onClick={() =>
                                                            onAlternarContaFinanceira(
                                                                conta
                                                            )
                                                        }
                                                    >

                                                        {
                                                            conta.ativa

                                                                ? 'Inativar'

                                                                : 'Reativar'
                                                        }

                                                    </Button>


                                                    {/*
                                                     * Excluir.
                                                     */}
                                                    <Button
                                                        variant="danger"

                                                        onClick={() =>
                                                            onExcluirContaFinanceira(
                                                                conta
                                                            )
                                                        }
                                                    >
                                                        Excluir
                                                    </Button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )
                            }

                        </tbody>

                    </table>


                    {
                        !contas.length
                        &&
                        <EmptyState
                            text="Nenhuma conta financeira cadastrada."
                        />
                    }

                </div>

            </Card>
        );
    }


    /*
     * ============================================================
     * PLANO DE CONTAS
     * ============================================================
     */

    return (

        <Card
            title="Plano de Contas"

            subtitle="As contas cadastradas aqui classificam receitas e despesas."

            action={

                <Button
                    icon="plus"

                    onClick={
                        onNovo
                    }
                >
                    Nova Conta
                </Button>
            }
        >

            <div className="table-scroll">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Código
                            </th>


                            <th>
                                Conta
                            </th>


                            <th>
                                Tipo
                            </th>


                            <th>
                                Conta Pai
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
                            planoContas.map(
                                conta => {
                                    /*
                                     * Localiza a conta pai.
                                     */
                                    const pai =
                                        categorias.find(
                                            item =>
                                                item.id
                                                ===
                                                conta.categoriaPaiId
                                        );


                                    /*
                                     * Calcula o nível hierárquico.
                                     */
                                    const nivel =
                                        obterNivelConta(
                                            conta
                                        );


                                    return (

                                        <tr
                                            key={
                                                conta.id
                                            }
                                        >

                                            <td>
                                                {
                                                    conta.codigo
                                                    ||
                                                    '—'
                                                }
                                            </td>


                                            <td>

                                                <div
                                                    style={{
                                                        paddingLeft:
                                                            `${nivel * 24}px`
                                                    }}
                                                >

                                                    {
                                                        nivel > 0
                                                        &&
                                                        <span>
                                                            └─{' '}
                                                        </span>
                                                    }


                                                    <strong>
                                                        {
                                                            conta.nome
                                                        }
                                                    </strong>

                                                </div>

                                            </td>


                                            <td>

                                                <Badge
                                                    tone={
                                                        conta.tipo
                                                        ===
                                                        'Receita'

                                                            ? 'success'

                                                            : 'danger'
                                                    }
                                                >

                                                    {
                                                        conta.tipo
                                                    }

                                                </Badge>

                                            </td>


                                            <td>

                                                {
                                                    pai

                                                        ? `${
                                                            pai.codigo

                                                                ? `${pai.codigo} - `

                                                                : ''
                                                        }${pai.nome}`

                                                        : 'Conta Raiz'
                                                }

                                            </td>


                                            <td>

                                                <Badge
                                                    tone={
                                                        conta.ativa

                                                            ? 'success'

                                                            : 'warning'
                                                    }
                                                >

                                                    {
                                                        conta.ativa

                                                            ? 'Ativa'

                                                            : 'Inativa'
                                                    }

                                                </Badge>

                                            </td>


                                            <td>

                                                <div className="action-row">

                                                    {/*
                                                     * Editar.
                                                     */}
                                                    <Button
                                                        variant="ghost"

                                                        onClick={() =>
                                                            onEditarContaPlano(
                                                                conta
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </Button>


                                                    {/*
                                                     * Inativar/Reativar.
                                                     */}
                                                    <Button
                                                        variant="ghost"

                                                        onClick={() =>
                                                            onAlternarContaPlano(
                                                                conta
                                                            )
                                                        }
                                                    >

                                                        {
                                                            conta.ativa

                                                                ? 'Inativar'

                                                                : 'Reativar'
                                                        }

                                                    </Button>


                                                    {/*
                                                     * Exclusão.
                                                     */}
                                                    <Button
                                                        variant="danger"

                                                        onClick={() =>
                                                            onExcluirContaPlano(
                                                                conta
                                                            )
                                                        }
                                                    >
                                                        Excluir
                                                    </Button>

                                                </div>

                                            </td>

                                        </tr>

                                    );
                                }
                            )
                        }

                    </tbody>

                </table>


                {
                    !planoContas.length
                    &&
                    <EmptyState
                        text="Nenhuma conta cadastrada no Plano de Contas."
                    />
                }

            </div>

        </Card>
    );
}