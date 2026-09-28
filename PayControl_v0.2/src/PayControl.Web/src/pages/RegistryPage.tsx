import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { api, loadWithFallback } from '../api';

import {
    mockCategorias,
    mockClientes,
    mockContasFinanceiras,
    mockEmpresas,
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
 * Define as abas disponíveis na tela de Cadastros.
 *
 * "Categorias" foi removida.
 *
 * O Plano de Contas passa a ser a estrutura única
 * utilizada para classificar receitas e despesas.
 */
type Tab =
    | 'Empresas'
    | 'Clientes'
    | 'Fornecedores'
    | 'Plano de Contas'
    | 'Contas Financeiras';


/*
 * Componente principal da página Cadastros.
 */
export default function RegistryPage() {

    /*
     * Aba atualmente selecionada.
     */
    const [tab, setTab] =
        useState<Tab>('Clientes');


    /*
     * Dados carregados da API.
     */
    const [clientes, setClientes] =
        useState<Pessoa[]>([]);

    const [fornecedores, setFornecedores] =
        useState<Pessoa[]>([]);

    const [categorias, setCategorias] =
        useState<Categoria[]>([]);

    const [contas, setContas] =
        useState<ContaFinanceira[]>([]);

    const [empresas, setEmpresas] =
        useState<Empresa[]>([]);


    /*
     * Indica se os dados demonstrativos
     * estão sendo utilizados.
     */
    const [demo, setDemo] =
        useState(false);


    /*
     * Controla o modal de Cliente
     * e Fornecedor.
     */
    const [openPessoa, setOpenPessoa] =
        useState(false);


    /*
     * Controla os modais de:
     *
     * - Empresa;
     * - Plano de Contas;
     * - Conta Financeira.
     */
    const [openCadastro, setOpenCadastro] =
        useState(false);


    /*
     * Cliente ou fornecedor selecionado.
     */
    const [selected, setSelected] =
        useState<Pessoa | null>(null);


    /*
     * Empresa atualmente sendo editada.
     *
     * Quando for null, significa que será
     * criada uma nova empresa.
     */
    const [empresaEditando, setEmpresaEditando] =
        useState<Empresa | null>(null);


    /*
     * Conta do Plano de Contas
     * atualmente sendo editada.
     */
    const [categoriaEditando, setCategoriaEditando] =
        useState<Categoria | null>(null);


    /*
     * Conta financeira atualmente
     * sendo editada.
     */
    const [contaEditando, setContaEditando] =
        useState<ContaFinanceira | null>(null);


    /*
     * --------------------------------------------------
     * CARREGAMENTO DOS DADOS
     * --------------------------------------------------
     */


    /*
     * Busca os cadastros necessários para a tela.
     */
    async function load() {

        const [
            clientesResult,
            fornecedoresResult,
            categoriasResult,
            contasResult,
            empresasResult
        ] = await Promise.all([

            /*
             * Carrega os clientes.
             */
            loadWithFallback(
                () => api.get<Pessoa[]>('/api/clientes'),
                mockClientes
            ),

            /*
             * Carrega os fornecedores.
             */
            loadWithFallback(
                () => api.get<Pessoa[]>('/api/fornecedores'),
                mockFornecedores
            ),

            /*
             * O Plano de Contas passa a ser
             * a única interface de manutenção
             * das categorias financeiras.
             *
             * No backend, /api/plano-contas
             * utiliza a mesma estrutura da
             * antiga rota /api/categorias.
             */
            loadWithFallback(
                () => api.get<Categoria[]>('/api/plano-contas'),
                mockCategorias
            ),

            /*
             * Carrega as contas financeiras.
             */
            loadWithFallback(
                () =>
                    api.get<ContaFinanceira[]>(
                        '/api/contas-financeiras'
                    ),
                mockContasFinanceiras
            ),

            /*
             * Carrega as empresas.
             */
            loadWithFallback(
                () => api.get<Empresa[]>('/api/empresas'),
                mockEmpresas
            )
        ]);


        /*
         * Atualiza os estados da página.
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

        setEmpresas(
            empresasResult.data
        );


        /*
         * Marca a página como demonstrativa
         * caso alguma consulta tenha utilizado
         * os mocks.
         */
        setDemo(
            clientesResult.demo ||
            fornecedoresResult.demo ||
            categoriasResult.demo ||
            contasResult.demo ||
            empresasResult.demo
        );


        /*
         * Seleciona automaticamente o primeiro
         * cliente quando nenhum estiver selecionado.
         */
        setSelected(
            atual =>
                atual ??
                clientesResult.data[0] ??
                null
        );
    }


    /*
     * Executa o carregamento quando
     * a página é aberta.
     */
    useEffect(() => {

        void load();

    }, []);


    /*
     * Define qual lista será utilizada
     * na tabela de pessoas.
     */
    const people =
        tab === 'Fornecedores'
            ? fornecedores
            : clientes;


    /*
     * --------------------------------------------------
     * CLIENTES E FORNECEDORES
     * --------------------------------------------------
     */


    /*
     * Cadastra Cliente ou Fornecedor.
     */
    async function createPerson(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        const form =
            new FormData(
                event.currentTarget
            );


        /*
         * ATENÇÃO:
         *
         * Por enquanto é utilizada a primeira
         * empresa cadastrada.
         *
         * Isso será substituído posteriormente
         * pela Empresa Ativa Global.
         */
        const body = {

            empresaId:
                empresas[0]?.id ?? null,

            nome:
                String(
                    form.get('nome') || ''
                ),

            cpfCnpj:
                String(
                    form.get('cpfCnpj') || ''
                ),

            email:
                String(
                    form.get('email') || ''
                ),

            telefone:
                String(
                    form.get('telefone') || ''
                ),

            endereco:
                String(
                    form.get('endereco') || ''
                ),

            observacoes:
                String(
                    form.get('observacoes') || ''
                ),

            ativo: true
        };


        try {

            /*
             * Escolhe o endpoint conforme
             * a aba utilizada.
             */
            const endpoint =
                tab === 'Fornecedores'
                    ? '/api/fornecedores'
                    : '/api/clientes';


            /*
             * Envia o cadastro.
             */
            await api.post(
                endpoint,
                body
            );


            /*
             * Fecha o modal.
             */
            setOpenPessoa(false);


            /*
             * Atualiza os dados da tela.
             */
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
     * EMPRESAS
     * --------------------------------------------------
     */


    /*
     * Cria ou atualiza uma empresa.
     */
    async function salvarEmpresa(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        const form =
            new FormData(
                event.currentTarget
            );


        const body = {

            nome:
                String(
                    form.get('nome') || ''
                ),

            nomeFantasia:
                String(
                    form.get('nomeFantasia') || ''
                ),

            cpfCnpj:
                String(
                    form.get('cpfCnpj') || ''
                ),

            email:
                String(
                    form.get('email') || ''
                ),

            telefone:
                String(
                    form.get('telefone') || ''
                ),

            endereco:
                String(
                    form.get('endereco') || ''
                ),

            ativa:
                empresaEditando?.ativa ??
                true
        };


        try {

            /*
             * Atualiza uma empresa existente.
             */
            if (empresaEditando) {

                await api.put(
                    `/api/empresas/${empresaEditando.id}`,
                    body
                );

            } else {

                /*
                 * Cria uma nova empresa.
                 */
                await api.post(
                    '/api/empresas',
                    body
                );
            }


            /*
             * Limpa os estados do modal.
             */
            setOpenCadastro(false);

            setEmpresaEditando(null);


            /*
             * Atualiza a tela.
             */
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


    /*
     * Cria ou atualiza uma conta
     * dentro do Plano de Contas.
     *
     * Internamente o backend continua
     * utilizando a entidade Categoria.
     *
     * Dessa forma, cada conta cadastrada
     * aqui também pode ser utilizada como
     * categoria em receitas e despesas.
     */
    async function salvarContaPlano(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        const form =
            new FormData(
                event.currentTarget
            );


        /*
         * Recupera a conta pai selecionada.
         */
        const categoriaPai =
            form.get(
                'categoriaPaiId'
            );


        /*
         * Monta os dados enviados para a API.
         */
        const body = {

            /*
             * Temporariamente utiliza
             * a primeira empresa cadastrada.
             */
            empresaId:
                empresas[0]?.id ?? null,

            /*
             * Nome da conta.
             *
             * Exemplos:
             *
             * Receitas
             * Vendas
             * Serviços
             * Despesas Administrativas
             * Energia
             */
            nome:
                String(
                    form.get('nome') || ''
                ),

            /*
             * Define se a conta pertence
             * ao grupo de Receita ou Despesa.
             */
            tipo:
                String(
                    form.get('tipo') ||
                    'Despesa'
                ),

            /*
             * Permite criar hierarquia.
             *
             * Exemplo:
             *
             * 2 - Despesas
             *     2.01 - Administrativas
             *         2.01.01 - Energia
             */
            categoriaPaiId:
                categoriaPai
                    ? Number(
                        categoriaPai
                    )
                    : null,

            /*
             * Código contábil/gerencial.
             */
            codigo:
                String(
                    form.get('codigo') || ''
                ),

            /*
             * Mantém o status atual durante edição.
             */
            ativa:
                categoriaEditando?.ativa ??
                true
        };


        try {

            /*
             * Atualiza uma conta existente.
             */
            if (categoriaEditando) {

                await api.put(
                    `/api/plano-contas/${categoriaEditando.id}`,
                    body
                );

            } else {

                /*
                 * Cria uma nova conta.
                 */
                await api.post(
                    '/api/plano-contas',
                    body
                );
            }


            /*
             * Fecha o modal.
             */
            setOpenCadastro(false);


            /*
             * Limpa o item em edição.
             */
            setCategoriaEditando(null);


            /*
             * Atualiza a listagem.
             */
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


    /*
     * Cria ou atualiza uma conta financeira.
     */
    async function salvarContaFinanceira(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        const form =
            new FormData(
                event.currentTarget
            );


        const body = {

            empresaId:
                empresas[0]?.id ?? null,

            nome:
                String(
                    form.get('nome') || ''
                ),

            tipo:
                String(
                    form.get('tipo') || ''
                ),

            instituicao:
                String(
                    form.get('instituicao') || ''
                ),

            agencia:
                String(
                    form.get('agencia') || ''
                ),

            numeroConta:
                String(
                    form.get('numeroConta') || ''
                ),

            saldoInicial:
                Number(
                    form.get('saldoInicial') ||
                    0
                ),

            ativa:
                contaEditando?.ativa ??
                true
        };


        try {

            /*
             * Atualiza uma conta existente.
             */
            if (contaEditando) {

                await api.put(
                    `/api/contas-financeiras/${contaEditando.id}`,
                    body
                );

            } else {

                /*
                 * Cria uma nova conta financeira.
                 */
                await api.post(
                    '/api/contas-financeiras',
                    body
                );
            }


            setOpenCadastro(false);

            setContaEditando(null);


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
     * --------------------------------------------------
     * ABERTURA DOS MODAIS
     * --------------------------------------------------
     */


    /*
     * Abre o modal para criação
     * de um novo cadastro.
     */
    function abrirNovoCadastro() {

        setEmpresaEditando(null);

        setCategoriaEditando(null);

        setContaEditando(null);

        setOpenCadastro(true);
    }


    /*
     * Inicia a edição de uma empresa.
     */
    function editarEmpresa(
        empresa: Empresa
    ) {

        setEmpresaEditando(
            empresa
        );

        setOpenCadastro(true);
    }


    /*
     * Inicia a edição de uma conta
     * do Plano de Contas.
     */
    function editarContaPlano(
        categoria: Categoria
    ) {

        setCategoriaEditando(
            categoria
        );

        setOpenCadastro(true);
    }


    /*
     * Inicia a edição de uma
     * conta financeira.
     */
    function editarContaFinanceira(
        conta: ContaFinanceira
    ) {

        setContaEditando(
            conta
        );

        setOpenCadastro(true);
    }


    /*
     * --------------------------------------------------
     * FUNÇÕES DO PLANO DE CONTAS
     * --------------------------------------------------
     */


    /*
     * Calcula o nível hierárquico
     * de uma conta.
     *
     * Exemplo:
     *
     * Receitas             nível 0
     *   Vendas             nível 1
     *     Venda Produto A  nível 2
     */
    function obterNivelConta(
        conta: Categoria,
        visitados: Set<number> = new Set()
    ): number {

        /*
         * Conta sem pai está no nível raiz.
         */
        if (!conta.categoriaPaiId) {

            return 0;
        }


        /*
         * Evita um possível ciclo acidental
         * na estrutura do plano.
         */
        if (visitados.has(conta.id)) {

            return 0;
        }


        /*
         * Registra a conta como visitada.
         */
        visitados.add(
            conta.id
        );


        /*
         * Procura a conta pai.
         */
        const pai =
            categorias.find(
                item =>
                    item.id ===
                    conta.categoriaPaiId
            );


        /*
         * Caso o pai não exista,
         * considera a conta como raiz.
         */
        if (!pai) {

            return 0;
        }


        /*
         * Soma um nível e continua
         * subindo na hierarquia.
         */
        return (
            1 +
            obterNivelConta(
                pai,
                visitados
            )
        );
    }


    /*
     * Organiza o Plano de Contas
     * pelo código cadastrado.
     *
     * O parâmetro numeric permite ordenar:
     *
     * 1
     * 1.01
     * 1.02
     * 2
     * 2.01
     */
    const planoContasOrdenado =
        [...categorias].sort(
            (a, b) =>
                String(
                    a.codigo ?? ''
                ).localeCompare(
                    String(
                        b.codigo ?? ''
                    ),
                    'pt-BR',
                    {
                        numeric: true
                    }
                )
        );


    /*
     * --------------------------------------------------
     * INTERFACE
     * --------------------------------------------------
     */

    return (
        <>

            {/*
             * Cabeçalho da página.
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
                        Mantenha os dados principais do seu negócio
                        organizados e atualizados.
                    </p>

                </div>

            </div>


            {/*
             * Indicadores gerais.
             */}
            <div className="kpi-grid four">

                <Kpi
                    icon="user"
                    label="Total de Clientes"
                    value={String(clientes.length)}
                    trend="+12,7%"
                />

                <Kpi
                    icon="truck"
                    label="Fornecedores Ativos"
                    value={
                        String(
                            fornecedores.filter(
                                item => item.ativo
                            ).length
                        )
                    }
                    trend="+8,3%"
                />

                <Kpi
                    icon="tag"
                    label="Contas no Plano"
                    value={String(categorias.length)}
                    trend="+0,0%"
                    tone="yellow"
                />

                <Kpi
                    icon="bank"
                    label="Contas Financeiras"
                    value={String(contas.length)}
                    trend="+0,0%"
                />

            </div>


            {/*
             * Abas disponíveis.
             *
             * Categorias foi removida.
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
                            key={item}
                            className={
                                tab === item
                                    ? 'active'
                                    : ''
                            }
                            onClick={() => {

                                setTab(item);


                                /*
                                 * Atualiza a pessoa selecionada
                                 * ao alternar Cliente/Fornecedor.
                                 */
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


            {/*
             * CLIENTES E FORNECEDORES
             */}
            {(
                tab === 'Clientes' ||
                tab === 'Fornecedores'
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
                                    setOpenPessoa(true)
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
                                                key={item.id}
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
                                        value={selected.nome}
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


                                <div className="detail-actions">

                                    <Button>
                                        Salvar
                                    </Button>

                                </div>

                            </div>

                        ) : (

                            <EmptyState />

                        )}

                    </Card>

                </div>

            ) : (

                /*
                 * Exibe Empresa,
                 * Plano de Contas ou
                 * Conta Financeira.
                 */
                <RegistryOther

                    tab={tab}

                    planoContas={planoContasOrdenado}

                    categorias={categorias}

                    contas={contas}

                    empresas={empresas}

                    obterNivelConta={
                        obterNivelConta
                    }

                    onNovo={
                        abrirNovoCadastro
                    }

                    onEditarEmpresa={
                        editarEmpresa
                    }

                    onEditarContaPlano={
                        editarContaPlano
                    }

                    onEditarContaFinanceira={
                        editarContaFinanceira
                    }
                />
            )}


            {/*
             * --------------------------------------------------
             * MODAL CLIENTE / FORNECEDOR
             * --------------------------------------------------
             */}
            <Modal
                open={openPessoa}
                title={
                    `Novo ${
                        tab ===
                        'Fornecedores'
                            ? 'Fornecedor'
                            : 'Cliente'
                    }`
                }
                onClose={() =>
                    setOpenPessoa(false)
                }
            >

                <form
                    className="form-grid"
                    onSubmit={createPerson}
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
                                setOpenPessoa(false)
                            }
                        >
                            Cancelar
                        </Button>


                        <Button type="submit">
                            Salvar
                        </Button>

                    </div>

                </form>

            </Modal>


            {/*
             * --------------------------------------------------
             * MODAL EMPRESA
             * --------------------------------------------------
             */}
            <Modal
                open={
                    openCadastro &&
                    tab === 'Empresas'
                }
                title={
                    empresaEditando
                        ? 'Editar Empresa'
                        : 'Nova Empresa'
                }
                onClose={() => {

                    setOpenCadastro(false);

                    setEmpresaEditando(null);
                }}
            >

                <form
                    className="form-grid"
                    onSubmit={salvarEmpresa}
                >

                    <Field label="Razão Social">

                        <input
                            name="nome"
                            required
                            defaultValue={
                                empresaEditando?.nome ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Nome Fantasia">

                        <input
                            name="nomeFantasia"
                            defaultValue={
                                empresaEditando?.nomeFantasia ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="CPF / CNPJ">

                        <input
                            name="cpfCnpj"
                            defaultValue={
                                empresaEditando?.cpfCnpj ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="E-mail">

                        <input
                            name="email"
                            type="email"
                            defaultValue={
                                empresaEditando?.email ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Telefone">

                        <input
                            name="telefone"
                            defaultValue={
                                empresaEditando?.telefone ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Endereço">

                        <input
                            name="endereco"
                            defaultValue={
                                empresaEditando?.endereco ??
                                ''
                            }
                        />

                    </Field>


                    <div className="form-actions">

                        <Button
                            variant="secondary"
                            onClick={() => {

                                setOpenCadastro(false);

                                setEmpresaEditando(null);
                            }}
                        >
                            Cancelar
                        </Button>


                        <Button type="submit">

                            {
                                empresaEditando
                                    ? 'Salvar Alterações'
                                    : 'Cadastrar Empresa'
                            }

                        </Button>

                    </div>

                </form>

            </Modal>


            {/*
             * --------------------------------------------------
             * MODAL PLANO DE CONTAS
             * --------------------------------------------------
             */}
            <Modal
                open={
                    openCadastro &&
                    tab === 'Plano de Contas'
                }
                title={
                    categoriaEditando
                        ? 'Editar Conta do Plano'
                        : 'Nova Conta do Plano'
                }
                onClose={() => {

                    setOpenCadastro(false);

                    setCategoriaEditando(null);
                }}
            >

                <form
                    className="form-grid"
                    onSubmit={salvarContaPlano}
                >

                    <Field label="Código">

                        <input
                            name="codigo"
                            placeholder="Ex.: 2.01.01"
                            defaultValue={
                                categoriaEditando?.codigo ??
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
                                categoriaEditando?.nome ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Tipo">

                        <select
                            name="tipo"
                            required
                            defaultValue={
                                categoriaEditando?.tipo ??
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
                                    ?.categoriaPaiId ??
                                ''
                            }
                        >

                            <option value="">
                                Nenhuma - Conta Raiz
                            </option>


                            {planoContasOrdenado

                                /*
                                 * Evita que uma conta
                                 * seja pai dela mesma.
                                 */
                                .filter(
                                    item =>
                                        item.id !==
                                        categoriaEditando?.id
                                )

                                .map(
                                    item => {

                                        const nivel =
                                            obterNivelConta(
                                                item
                                            );


                                        return (

                                            <option
                                                key={item.id}
                                                value={item.id}
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
                                )}

                        </select>

                    </Field>


                    <div className="form-actions">

                        <Button
                            variant="secondary"
                            onClick={() => {

                                setOpenCadastro(false);

                                setCategoriaEditando(null);
                            }}
                        >
                            Cancelar
                        </Button>


                        <Button type="submit">

                            {
                                categoriaEditando
                                    ? 'Salvar Alterações'
                                    : 'Cadastrar Conta'
                            }

                        </Button>

                    </div>

                </form>

            </Modal>


            {/*
             * --------------------------------------------------
             * MODAL CONTA FINANCEIRA
             * --------------------------------------------------
             */}
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

                    setOpenCadastro(false);

                    setContaEditando(null);
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
                                contaEditando?.nome ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Tipo">

                        <select
                            name="tipo"
                            required
                            defaultValue={
                                contaEditando?.tipo ??
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
                                contaEditando?.instituicao ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Agência">

                        <input
                            name="agencia"
                            defaultValue={
                                contaEditando?.agencia ??
                                ''
                            }
                        />

                    </Field>


                    <Field label="Número da Conta">

                        <input
                            name="numeroConta"
                            defaultValue={
                                contaEditando?.numeroConta ??
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
                                contaEditando?.saldoInicial ??
                                0
                            }
                        />

                    </Field>


                    <div className="form-actions">

                        <Button
                            variant="secondary"
                            onClick={() => {

                                setOpenCadastro(false);

                                setContaEditando(null);
                            }}
                        >
                            Cancelar
                        </Button>


                        <Button type="submit">

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
 * --------------------------------------------------
 * OUTROS CADASTROS
 * --------------------------------------------------
 *
 * Exibe:
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
    onEditarContaFinanceira
}: {

    tab: Tab;

    planoContas: Categoria[];

    categorias: Categoria[];

    contas: ContaFinanceira[];

    empresas: Empresa[];

    obterNivelConta: (
        conta: Categoria
    ) => number;

    onNovo: () => void;

    onEditarEmpresa: (
        empresa: Empresa
    ) => void;

    onEditarContaPlano: (
        categoria: Categoria
    ) => void;

    onEditarContaFinanceira: (
        conta: ContaFinanceira
    ) => void;

}) {


    /*
     * --------------------------------------------------
     * EMPRESAS
     * --------------------------------------------------
     */
    if (tab === 'Empresas') {

        return (

            <Card
                title="Empresas"
                subtitle="Cadastre e mantenha as empresas utilizadas no PayControl."
                action={

                    <Button
                        icon="plus"
                        onClick={onNovo}
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

                                    <tr key={empresa.id}>

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
     * --------------------------------------------------
     * CONTAS FINANCEIRAS
     * --------------------------------------------------
     */
    if (
        tab ===
        'Contas Financeiras'
    ) {

        return (

            <Card
                title="Contas Financeiras"
                subtitle="Cadastre bancos, caixas, poupanças e outras contas utilizadas pela empresa."
                action={

                    <Button
                        icon="plus"
                        onClick={onNovo}
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

                                    <tr key={conta.id}>

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
                                                            style: 'currency',
                                                            currency: 'BRL'
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
                            text="Nenhuma conta financeira cadastrada."
                        />

                    )}

                </div>

            </Card>
        );
    }


    /*
     * --------------------------------------------------
     * PLANO DE CONTAS
     * --------------------------------------------------
     */

    return (

        <Card
            title="Plano de Contas"
            subtitle="Organize receitas e despesas em uma estrutura hierárquica. As contas cadastradas aqui são utilizadas como categorias dos lançamentos financeiros."
            action={

                <Button
                    icon="plus"
                    onClick={onNovo}
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

                                /*
                                 * Localiza a conta pai.
                                 */
                                const pai =
                                    categorias.find(
                                        item =>
                                            item.id ===
                                            contaPlano.categoriaPaiId
                                    );


                                /*
                                 * Descobre o nível da conta
                                 * na hierarquia.
                                 */
                                const nivel =
                                    obterNivelConta(
                                        contaPlano
                                    );


                                return (

                                    <tr
                                        key={contaPlano.id}
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
                        text="Nenhuma conta cadastrada no Plano de Contas."
                    />

                )}

            </div>

        </Card>
    );
}