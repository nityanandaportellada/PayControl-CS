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
    Modal
} from '../components/UI';


/*
 * Abas disponíveis.
 *
 * Categorias foi unificada
 * com Plano de Contas.
 */
type Tab =
    | 'Empresas'
    | 'Clientes'
    | 'Fornecedores'
    | 'Plano de Contas'
    | 'Contas Financeiras';


/*
 * Página principal dos cadastros.
 */
export default function RegistryPage() {
    /*
     * Empresa global.
     */
    const {
        empresas,
        empresaAtiva,
        empresaAtivaId,
        atualizarEmpresas
    } =
        useCompany();


    /*
     * Aba atual.
     */
    const [
        tab,
        setTab
    ] =
        useState<Tab>(
            'Clientes'
        );


    /*
     * Dados da empresa ativa.
     */
    const [
        clientes,
        setClientes
    ] =
        useState<Pessoa[]>(
            []
        );


    const [
        fornecedores,
        setFornecedores
    ] =
        useState<Pessoa[]>(
            []
        );


    const [
        categorias,
        setCategorias
    ] =
        useState<Categoria[]>(
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


    /*
     * Modo demonstrativo.
     */
    const [
        demo,
        setDemo
    ] =
        useState(
            false
        );


    /*
     * Modais.
     */
    const [
        openPessoa,
        setOpenPessoa
    ] =
        useState(
            false
        );


    const [
        openCadastro,
        setOpenCadastro
    ] =
        useState(
            false
        );


    /*
     * Registro selecionado.
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
     * Conta do Plano de Contas
     * sendo editada.
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
     * Conta financeira
     * sendo editada.
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
     * Carrega os dados vinculados
     * à Empresa Ativa.
     */
    async function load() {
        const [
            clientesResult,
            fornecedoresResult,
            categoriasResult,
            contasResult
        ] =
            await Promise.all([
                loadWithFallback(
                    () =>
                        api.get<
                            Pessoa[]
                        >(
                            '/api/clientes'
                        ),

                    mockClientes.filter(
                        item =>
                            !empresaAtivaId ||
                            item.empresaId ===
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
                            !empresaAtivaId ||
                            item.empresaId ===
                                empresaAtivaId
                    )
                ),

                loadWithFallback(
                    () =>
                        api.get<
                            Categoria[]
                        >(
                            '/api/plano-contas'
                        ),

                    mockCategorias.filter(
                        item =>
                            !empresaAtivaId ||
                            item.empresaId ===
                                empresaAtivaId
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
                            !empresaAtivaId ||
                            item.empresaId ===
                                empresaAtivaId
                    )
                )
            ]);


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


        setDemo(
            clientesResult.demo ||
            fornecedoresResult.demo ||
            categoriasResult.demo ||
            contasResult.demo
        );


        /*
         * Mantém a seleção quando possível.
         */
        setSelected(
            current => {
                if (
                    tab ===
                    'Fornecedores'
                ) {
                    return (
                        fornecedoresResult
                            .data
                            .find(
                                item =>
                                    item.id ===
                                    current?.id
                            )
                        ??
                        fornecedoresResult
                            .data[0]
                        ??
                        null
                    );
                }


                return (
                    clientesResult
                        .data
                        .find(
                            item =>
                                item.id ===
                                current?.id
                        )
                    ??
                    clientesResult
                        .data[0]
                    ??
                    null
                );
            }
        );
    }


    /*
     * Executa quando a página abre.
     *
     * A página também é remontada pelo App
     * sempre que a empresa ativa muda.
     */
    useEffect(() => {
        void load();
    }, []);


    /*
     * Lista usada em Cliente/Fornecedor.
     */
    const people =
        tab ===
        'Fornecedores'

            ? fornecedores

            : clientes;


    /*
     * --------------------------------------------------
     * CLIENTE / FORNECEDOR
     * --------------------------------------------------
     */
    async function createPerson(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        if (!empresaAtivaId) {
            alert(
                'Cadastre ou selecione uma empresa antes de criar este registro.'
            );

            return;
        }


        const form =
            new FormData(
                event.currentTarget
            );


        const body = {
            /*
             * Agora usa explicitamente
             * a empresa selecionada.
             */
            empresaId:
                empresaAtivaId,

            nome:
                String(
                    form.get(
                        'nome'
                    ) || ''
                ),

            cpfCnpj:
                String(
                    form.get(
                        'cpfCnpj'
                    ) || ''
                ),

            email:
                String(
                    form.get(
                        'email'
                    ) || ''
                ),

            telefone:
                String(
                    form.get(
                        'telefone'
                    ) || ''
                ),

            endereco:
                String(
                    form.get(
                        'endereco'
                    ) || ''
                ),

            observacoes:
                String(
                    form.get(
                        'observacoes'
                    ) || ''
                ),

            ativo:
                true
        };


        try {
            const endpoint =
                tab ===
                'Fornecedores'

                    ? '/api/fornecedores'

                    : '/api/clientes';


            await api.post(
                endpoint,
                body
            );


            setOpenPessoa(
                false
            );


            await load();

        } catch (error) {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Erro ao salvar cadastro.'
            );
        }
    }


    /*
     * --------------------------------------------------
     * EMPRESA
     * --------------------------------------------------
     */
    async function salvarEmpresa(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        const form =
            new FormData(
                event.currentTarget
            );


        const body = {
            nome:
                String(
                    form.get(
                        'nome'
                    ) || ''
                ),

            nomeFantasia:
                String(
                    form.get(
                        'nomeFantasia'
                    ) || ''
                ),

            cpfCnpj:
                String(
                    form.get(
                        'cpfCnpj'
                    ) || ''
                ),

            email:
                String(
                    form.get(
                        'email'
                    ) || ''
                ),

            telefone:
                String(
                    form.get(
                        'telefone'
                    ) || ''
                ),

            endereco:
                String(
                    form.get(
                        'endereco'
                    ) || ''
                ),

            ativa:
                empresaEditando
                    ?.ativa
                ??
                true
        };


        try {
            let empresaSalva:
                Empresa;


            if (empresaEditando) {
                empresaSalva =
                    await api.put<
                        Empresa
                    >(
                        `/api/empresas/${empresaEditando.id}`,
                        body
                    );

            } else {
                empresaSalva =
                    await api.post<
                        Empresa
                    >(
                        '/api/empresas',
                        body
                    );
            }


            setOpenCadastro(
                false
            );


            setEmpresaEditando(
                null
            );


            /*
             * Atualiza a lista global
             * e seleciona automaticamente
             * a empresa criada/editada.
             */
            await atualizarEmpresas(
                empresaSalva.id
            );


            await load();

        } catch (error) {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Erro ao salvar empresa.'
            );
        }
    }


    /*
     * --------------------------------------------------
     * PLANO DE CONTAS
     * --------------------------------------------------
     */
    async function salvarContaPlano(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        if (!empresaAtivaId) {
            alert(
                'Selecione uma empresa antes de cadastrar o Plano de Contas.'
            );

            return;
        }


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
                    ) || ''
                ),

            tipo:
                String(
                    form.get(
                        'tipo'
                    ) ||
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
                    ) || ''
                ),

            ativa:
                categoriaEditando
                    ?.ativa
                ??
                true
        };


        try {
            if (categoriaEditando) {
                await api.put(
                    `/api/plano-contas/${categoriaEditando.id}`,
                    body
                );

            } else {
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

        } catch (error) {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Erro ao salvar conta do Plano de Contas.'
            );
        }
    }


    /*
     * --------------------------------------------------
     * CONTAS FINANCEIRAS
     * --------------------------------------------------
     */
    async function salvarContaFinanceira(
        event:
            FormEvent<
                HTMLFormElement
            >
    ) {
        event.preventDefault();


        if (!empresaAtivaId) {
            alert(
                'Selecione uma empresa antes de cadastrar uma conta financeira.'
            );

            return;
        }


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
                    ) || ''
                ),

            tipo:
                String(
                    form.get(
                        'tipo'
                    ) || ''
                ),

            instituicao:
                String(
                    form.get(
                        'instituicao'
                    ) || ''
                ),

            agencia:
                String(
                    form.get(
                        'agencia'
                    ) || ''
                ),

            numeroConta:
                String(
                    form.get(
                        'numeroConta'
                    ) || ''
                ),

            saldoInicial:
                Number(
                    form.get(
                        'saldoInicial'
                    ) || 0
                ),

            ativa:
                contaEditando
                    ?.ativa
                ??
                true
        };


        try {
            if (contaEditando) {
                await api.put(
                    `/api/contas-financeiras/${contaEditando.id}`,
                    body
                );

            } else {
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

        } catch (error) {
            alert(
                error instanceof Error

                    ? error.message

                    : 'Erro ao salvar conta financeira.'
            );
        }
    }


    /*
     * Abre cadastro vazio.
     */
    function abrirNovoCadastro() {
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
     * Calcula o nível hierárquico
     * do Plano de Contas.
     */
    function obterNivelConta(
        conta: Categoria,

        visitados:
            Set<number> =
                new Set()
    ): number {
        if (
            !conta.categoriaPaiId
        ) {
            return 0;
        }


        if (
            visitados.has(
                conta.id
            )
        ) {
            return 0;
        }


        visitados.add(
            conta.id
        );


        const pai =
            categorias.find(
                item =>
                    item.id ===
                    conta.categoriaPaiId
            );


        if (!pai) {
            return 0;
        }


        return (
            1 +
            obterNivelConta(
                pai,
                visitados
            )
        );
    }


    /*
     * Ordena o plano pelo código.
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
                            String(
                                a.codigo ??
                                ''
                            )
                                .localeCompare(
                                    String(
                                        b.codigo ??
                                        ''
                                    ),

                                    'pt-BR',

                                    {
                                        numeric:
                                            true
                                    }
                                )
                    ),

            [
                categorias
            ]
        );


    return (
        <>

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
                                empresaAtiva.nomeFantasia ||
                                empresaAtiva.nome
                            }
                        </small>

                    )}

                </div>

            </div>


            <div className="kpi-grid four">

                <Kpi
                    icon="user"
                    label="Total de Clientes"
                    value={
                        String(
                            clientes.length
                        )
                    }
                    trend="+12,7%"
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
                    trend="+8,3%"
                />


                <Kpi
                    icon="tag"
                    label="Contas no Plano"
                    value={
                        String(
                            categorias.length
                        )
                    }
                    trend="+0,0%"
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
                    trend="+0,0%"
                />

            </div>


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
                            key={item}

                            className={
                                tab === item

                                    ? 'active'

                                    : ''
                            }

                            onClick={() => {
                                setTab(
                                    item
                                );


                                if (
                                    item ===
                                    'Clientes'
                                ) {
                                    setSelected(
                                        clientes[0] ??
                                        null
                                    );
                                }


                                if (
                                    item ===
                                    'Fornecedores'
                                ) {
                                    setSelected(
                                        fornecedores[0] ??
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


            {(
                tab ===
                    'Clientes'
                ||
                tab ===
                    'Fornecedores'
            ) ? (

                <div className="master-detail">

                    <Card
                        title={tab}

                        subtitle={
                            `Gerencie seus ${tab.toLowerCase()} e mantenha as informações atualizadas.`
                        }

                        action={

                            <Button
                                icon="plus"

                                onClick={() =>
                                    setOpenPessoa(
                                        true
                                    )
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

                        <div className="search-row">

                            <input
                                placeholder="Buscar por nome, documento, cidade ou contato..."
                            />


                            <select>

                                <option>
                                    Todos os status
                                </option>

                            </select>

                        </div>


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
                                            Localização
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

                                    {people.map(
                                        item => (

                                            <tr
                                                key={
                                                    item.id
                                                }

                                                className={
                                                    selected?.id ===
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
                                                    {item.nome}
                                                </td>

                                                <td>
                                                    {
                                                        item.cpfCnpj ||
                                                        '—'
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.endereco ||
                                                        '—'
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.telefone ||
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
                                    )}

                                </tbody>

                            </table>


                            {!people.length && (
                                <EmptyState />
                            )}

                        </div>

                    </Card>


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

                        {selected ? (

                            <div className="detail-form-preview">

                                <Field label="Nome / Razão Social">

                                    <input
                                        value={
                                            selected.nome
                                        }
                                        readOnly
                                    />

                                </Field>


                                <Field label="CPF / CNPJ">

                                    <input
                                        value={
                                            selected.cpfCnpj ??
                                            ''
                                        }
                                        readOnly
                                    />

                                </Field>


                                <Field label="E-mail">

                                    <input
                                        value={
                                            selected.email ??
                                            ''
                                        }
                                        readOnly
                                    />

                                </Field>


                                <Field label="Telefone">

                                    <input
                                        value={
                                            selected.telefone ??
                                            ''
                                        }
                                        readOnly
                                    />

                                </Field>


                                <Field label="Endereço">

                                    <input
                                        value={
                                            selected.endereco ??
                                            ''
                                        }
                                        readOnly
                                    />

                                </Field>


                                <Field label="Observações">

                                    <textarea
                                        value={
                                            selected.observacoes ??
                                            ''
                                        }
                                        readOnly
                                        rows={4}
                                    />

                                </Field>

                            </div>

                        ) : (

                            <EmptyState />

                        )}

                    </Card>

                </div>

            ) : (

                <RegistryOther

                    tab={tab}

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
                />

            )}


            <Modal
                open={
                    openPessoa
                }

                title={
                    `Novo ${
                        tab ===
                        'Fornecedores'

                            ? 'Fornecedor'

                            : 'Cliente'
                    }`
                }

                onClose={() =>
                    setOpenPessoa(
                        false
                    )
                }
            >

                <form
                    className="form-grid"
                    onSubmit={
                        createPerson
                    }
                >

                    <Field label="Nome / Razão Social">

                        <input
                            name="nome"
                            required
                        />

                    </Field>


                    <Field label="CPF / CNPJ">

                        <input
                            name="cpfCnpj"
                        />

                    </Field>


                    <Field label="E-mail">

                        <input
                            name="email"
                            type="email"
                        />

                    </Field>


                    <Field label="Telefone">

                        <input
                            name="telefone"
                        />

                    </Field>


                    <Field label="Endereço">

                        <input
                            name="endereco"
                        />

                    </Field>


                    <Field label="Observações">

                        <textarea
                            name="observacoes"
                            rows={3}
                        />

                    </Field>


                    <div className="form-actions">

                        <Button
                            variant="secondary"

                            onClick={() =>
                                setOpenPessoa(
                                    false
                                )
                            }
                        >

                            Cancelar

                        </Button>


                        <Button
                            type="submit"
                        >

                            Salvar

                        </Button>

                    </div>

                </form>

            </Modal>


            <Modal
                open={
                    openCadastro &&
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
                        >

                            {
                                empresaEditando

                                    ? 'Salvar Alterações'

                                    : 'Cadastrar Empresa'
                            }

                        </Button>

                    </div>

                </form>

            </Modal>


            <Modal
                open={
                    openCadastro &&
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

                                    .filter(
                                        item =>
                                            item.id !==
                                            categoriaEditando
                                                ?.id
                                    )

                                    .map(
                                        item => {
                                            const nivel =
                                                obterNivelConta(
                                                    item
                                                );


                                            return (

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
                                                            nivel
                                                        )
                                                    }

                                                    {
                                                        item.codigo

                                                            ? `${item.codigo} - `

                                                            : ''
                                                    }

                                                    {item.nome}

                                                </option>
                                            );
                                        }
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
                        >

                            {
                                categoriaEditando

                                    ? 'Salvar Alterações'

                                    : 'Cadastrar Conta'
                            }

                        </Button>

                    </div>

                </form>

            </Modal>


            <Modal
                open={
                    openCadastro &&
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

                            placeholder="Ex.: Itaú Empresa"

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

                            placeholder="Ex.: Banco Itaú"

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
                        />

                    </Field>


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
                        >

                            {
                                contaEditando

                                    ? 'Salvar Alterações'

                                    : 'Cadastrar Conta'
                            }

                        </Button>

                    </div>

                </form>

            </Modal>

        </>
    );
}


/*
 * Componente utilizado para:
 *
 * Empresa
 * Plano de Contas
 * Contas Financeiras
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
    onEditarContaFinanceira
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

    onEditarContaFinanceira:
        (
            conta:
                ContaFinanceira
        ) => void;
}) {
    /*
     * EMPRESAS
     */
    if (
        tab ===
        'Empresas'
    ) {
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

                            {empresas.map(
                                empresa => (

                                    <tr
                                        key={
                                            empresa.id
                                        }
                                    >

                                        <td>
                                            {empresa.nome}
                                        </td>

                                        <td>
                                            {
                                                empresa.nomeFantasia ||
                                                '—'
                                            }
                                        </td>

                                        <td>
                                            {
                                                empresa.cpfCnpj ||
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
                            )}

                        </tbody>

                    </table>


                    {!empresas.length && (

                        <EmptyState
                            text="Nenhuma empresa cadastrada."
                        />

                    )}

                </div>

            </Card>
        );
    }


    /*
     * CONTAS FINANCEIRAS
     */
    if (
        tab ===
        'Contas Financeiras'
    ) {
        return (
            <Card
                title="Contas Financeiras"

                subtitle="Cadastre bancos, caixas, poupanças e outras contas utilizadas pela empresa ativa."

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

                            {contas.map(
                                conta => (

                                    <tr
                                        key={
                                            conta.id
                                        }
                                    >

                                        <td>
                                            {conta.nome}
                                        </td>

                                        <td>
                                            {conta.tipo}
                                        </td>

                                        <td>
                                            {
                                                conta.instituicao ||
                                                '—'
                                            }
                                        </td>

                                        <td>

                                            {
                                                conta.agencia ||
                                                '—'
                                            }

                                            {' / '}

                                            {
                                                conta.numeroConta ||
                                                '—'
                                            }

                                        </td>

                                        <td>

                                            {
                                                conta.saldoInicial
                                                    .toLocaleString(
                                                        'pt-BR',

                                                        {
                                                            style:
                                                                'currency',

                                                            currency:
                                                                'BRL'
                                                        }
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

                                        </td>

                                    </tr>
                                )
                            )}

                        </tbody>

                    </table>


                    {!contas.length && (

                        <EmptyState
                            text="Nenhuma conta financeira cadastrada para a empresa ativa."
                        />

                    )}

                </div>

            </Card>
        );
    }


    /*
     * PLANO DE CONTAS
     */
    return (
        <Card
            title="Plano de Contas"

            subtitle="Organize receitas e despesas em uma estrutura hierárquica da empresa ativa."

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

                        {planoContas.map(
                            contaPlano => {
                                const pai =
                                    categorias.find(
                                        item =>
                                            item.id ===
                                            contaPlano.categoriaPaiId
                                    );


                                const nivel =
                                    obterNivelConta(
                                        contaPlano
                                    );


                                return (

                                    <tr
                                        key={
                                            contaPlano.id
                                        }
                                    >

                                        <td>
                                            {
                                                contaPlano.codigo ||
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

                                                {nivel > 0 && (
                                                    <span>
                                                        └─{' '}
                                                    </span>
                                                )}


                                                <strong>
                                                    {
                                                        contaPlano.nome
                                                    }
                                                </strong>

                                            </div>

                                        </td>


                                        <td>

                                            <Badge
                                                tone={
                                                    contaPlano.tipo ===
                                                    'Receita'

                                                        ? 'success'

                                                        : 'danger'
                                                }
                                            >

                                                {
                                                    contaPlano.tipo
                                                }

                                            </Badge>

                                        </td>


                                        <td>

                                            {
                                                pai

                                                    ? (
                                                        pai.codigo

                                                            ? `${pai.codigo} - ${pai.nome}`

                                                            : pai.nome
                                                    )

                                                    : 'Conta Raiz'
                                            }

                                        </td>


                                        <td>

                                            <Badge
                                                tone={
                                                    contaPlano.ativa

                                                        ? 'success'

                                                        : 'warning'
                                                }
                                            >

                                                {
                                                    contaPlano.ativa

                                                        ? 'Ativa'

                                                        : 'Inativa'
                                                }

                                            </Badge>

                                        </td>


                                        <td>

                                            <Button
                                                variant="ghost"

                                                onClick={() =>
                                                    onEditarContaPlano(
                                                        contaPlano
                                                    )
                                                }
                                            >

                                                Editar

                                            </Button>

                                        </td>

                                    </tr>
                                );
                            }
                        )}

                    </tbody>

                </table>


                {!planoContas.length && (

                    <EmptyState
                        text="Nenhuma conta cadastrada no Plano de Contas da empresa ativa."
                    />

                )}

            </div>

        </Card>
    );
}