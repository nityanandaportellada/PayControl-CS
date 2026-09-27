// Importa as funções, componentes ou dados utilizados por este módulo.
import { FormEvent, useEffect, useState } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { api, loadWithFallback } from '../api';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { mockCategorias, mockClientes, mockContasFinanceiras, mockEmpresas, mockFornecedores } from '../mock';
// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { Categoria, ContaFinanceira, Empresa, Pessoa } from '../types';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Badge, Button, Card, DemoPill, EmptyState, Field, Kpi, Modal } from '../components/UI';
type Tab = 'Clientes' | 'Fornecedores' | 'Categorias' | 'Contas Financeiras' | 'Empresas' | 'Plano de Contas';
// Declara o componente/função `RegistryPage`.
export default function RegistryPage() {
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [tab, setTab] = useState<Tab>('Clientes'), [clientes, setClientes] = useState<Pessoa[]>([]), [fornecedores, setFornecedores] = useState<Pessoa[]>([]), [categorias, setCategorias] = useState<Categoria[]>([]), [contas, setContas] = useState<ContaFinanceira[]>([]), [empresas, setEmpresas] = useState<Empresa[]>([]), [demo, setDemo] = useState(false), [open, setOpen] = useState(false), [selected, setSelected] = useState<Pessoa | null>(null);
        async function load() { const [a, b, c, d, e] = await Promise.all([loadWithFallback(() => api.get<Pessoa[]>('/api/clientes'), mockClientes), loadWithFallback(() => api.get<Pessoa[]>('/api/fornecedores'), mockFornecedores), loadWithFallback(() => api.get<Categoria[]>('/api/categorias'), mockCategorias), loadWithFallback(() => api.get<ContaFinanceira[]>('/api/contas-financeiras'), mockContasFinanceiras), loadWithFallback(() => api.get<Empresa[]>('/api/empresas'), mockEmpresas)]);
    setClientes(a.data);
    setFornecedores(b.data);
    setCategorias(c.data);
    setContas(d.data);
    setEmpresas(e.data);
    setDemo(a.demo || b.demo || c.demo || d.demo || e.demo);
    setSelected(s => s ?? a.data[0] ?? null);
    }
    // Executa este efeito quando o componente é carregado ou quando suas dependências mudam.
    useEffect(() => { void load(); }, []);
    // Prepara o valor `people` usado pela tela.
    const people = tab === 'Fornecedores' ? fornecedores : clientes;
        async function createPerson(e: FormEvent<HTMLFormElement>) { e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = { empresaId: empresas[0]?.id ?? null, nome: String(f.get('nome')), cpfCnpj: String(f.get('cpfCnpj') || ''), email: String(f.get('email') || ''), telefone: String(f.get('telefone') || ''), endereco: String(f.get('endereco') || ''), observacoes: String(f.get('observacoes') || ''), ativo: true };
    try {
        // Aguarda a resposta assíncrona antes de continuar.
        await api.post(tab === 'Fornecedores' ? '/api/fornecedores' : '/api/clientes', body);
        // Atualiza o estado React com o valor recém-processado.
        setOpen(false);
        // Aguarda a resposta assíncrona antes de continuar.
        await load();
    }
    // Trata uma eventual falha sem interromper a experiência do usuário.
    catch (err) {
        // Valida a condição antes de continuar com a ação.
        if (demo) {
            // Prepara o valor `n` usado pela tela.
            const n = { id: Date.now(), ...body };
            tab === 'Fornecedores' ? setFornecedores(v => [...v, n]) : setClientes(v => [...v, n]);
            // Atualiza o estado React com o valor recém-processado.
            setOpen(false);
        }
        else
            alert(err instanceof Error ? err.message : 'Erro');
    } }
    // Retorna a interface que será renderizada pelo React.
    return <>
        {/* Cabeçalho e identificação principal da página. */}
        <div className="page-title">
            <div>
                <div className="title-line">
                    <h1>Cadastros</h1>{demo && <DemoPill />}
                </div>
                <p>Mantenha os dados principais do seu negócio organizados e atualizados.</p>
            </div>
        </div>
        {/* Indicadores financeiros apresentados no topo da tela. */}
        <div className="kpi-grid four">
            <Kpi icon="user" label="Total de Clientes" value={String(clientes.length)} trend="+12,7%"/>
            <Kpi icon="truck" label="Fornecedores Ativos" value={String(fornecedores.filter(x => x.ativo).length)} trend="+8,3%"/>
            <Kpi icon="tag" label="Categorias Cadastradas" value={String(categorias.length)} trend="+5,9%" tone="yellow"/>
            <Kpi icon="bank" label="Contas Financeiras" value={String(contas.length)} trend="+0,0%"/>
        </div>
        <div className="registry-tabs">{(['Empresas', 'Clientes', 'Fornecedores', 'Categorias', 'Plano de Contas', 'Contas Financeiras'] as Tab[]).map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => { setTab(t); if (t === 'Clientes')
            setSelected(clientes[0] ?? null); if (t === 'Fornecedores')
            setSelected(fornecedores[0] ?? null); }}>{t}
        </button>)}
    </div>
    {(tab === 'Clientes' || tab === 'Fornecedores') ? <div className="master-detail">
    {/* Painel visual que agrupa informações relacionadas. */}
    <Card title={tab} subtitle={`Gerencie seus ${tab.toLowerCase()} e mantenha as informações atualizadas.`} action={<Button icon="plus" onClick={() => setOpen(true)}>Novo {tab === 'Clientes' ? 'Cliente' : 'Fornecedor'}
    </Button>}>
    <div className="search-row">
        <input placeholder="Buscar por nome, documento, cidade ou contato..."/>
        <select>
            <option>Todos os status</option>
        </select>
    </div>
    <div className="table-scroll">
        {/* Tabela usada para exibir os registros de forma estruturada. */}
        <table>
            <thead>
                <tr>
                    <th>Nome / Razão Social</th>
                    <th>Documento</th>
                    <th>Localização</th>
                    <th>Contato</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>{people.map(x => <tr key={x.id} className={selected?.id === x.id ? 'selected' : ''} onClick={() => setSelected(x)}>
                <td>{x.nome}
                </td>
                <td>{x.cpfCnpj || '—'}
                </td>
                <td>{x.endereco || '—'}
                </td>
                <td>{x.telefone || '—'}
                </td>
                <td>
                    <Badge tone={x.ativo ? 'success' : 'warning'}>{x.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                </td>
            </tr>)}
        </tbody>
    </table>{!people.length && <EmptyState />}
    </div>
    </Card>
    {/* Painel visual que agrupa informações relacionadas. */}
    <Card title={`Dados do ${tab === 'Clientes' ? 'Cliente' : 'Fornecedor'}`}>{selected ? <div className="detail-form-preview">
        <Field label="Nome / Razão Social">
            <input value={selected.nome} readOnly/>
        </Field>
        <Field label="CPF / CNPJ">
            <input value={selected.cpfCnpj ?? ''} readOnly/>
        </Field>
        <Field label="E-mail">
            <input value={selected.email ?? ''} readOnly/>
        </Field>
        <Field label="Telefone">
            <input value={selected.telefone ?? ''} readOnly/>
        </Field>
        <Field label="Endereço">
            <input value={selected.endereco ?? ''} readOnly/>
        </Field>
        <Field label="Observações">
            <textarea value={selected.observacoes ?? ''} readOnly rows={4}/>
        </Field>
        <div className="detail-actions">
            <Button>Salvar</Button>
        </div>
    </div> : <EmptyState />}
    </Card>
    </div> : <RegistryOther tab={tab} categorias={categorias} contas={contas} empresas={empresas}/>}
    <Modal open={open} title={`Novo ${tab === 'Fornecedores' ? 'Fornecedor' : 'Cliente'}`} onClose={() => setOpen(false)}>
        <form className="form-grid" onSubmit={createPerson}>
            <Field label="Nome / Razão Social">
                <input name="nome" required/>
            </Field>
            <Field label="CPF / CNPJ">
                <input name="cpfCnpj"/>
            </Field>
            <Field label="E-mail">
                <input name="email" type="email"/>
            </Field>
            <Field label="Telefone">
                <input name="telefone"/>
            </Field>
            <Field label="Endereço">
                <input name="endereco"/>
            </Field>
            <Field label="Observações">
                <textarea name="observacoes" rows={3}/>
            </Field>
            <div className="form-actions">
                <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
            </div>
        </form>
    </Modal>
    </>;
}
// Declara o componente/função `RegistryOther`.
function RegistryOther({ tab, categorias, contas, empresas }: {
    tab: Tab;
    categorias: Categoria[];
    contas: ContaFinanceira[];
    empresas: Empresa[];
}) {
    // Prepara o valor `data` usado pela tela.
    const data = tab === 'Contas Financeiras' ? contas : tab === 'Empresas' ? empresas : categorias;
    // Retorna a interface que será renderizada pelo React.
    return <Card title={tab}>
<div className="table-scroll">
{/* Tabela usada para exibir os registros de forma estruturada. */}
<table>
<thead>
<tr>
<th>Nome</th>
<th>Tipo / Documento</th>
<th>Status</th>
</tr>
</thead>
<tbody>{data.map((x: any) => <tr key={x.id}>
<td>{x.nome}
</td>
<td>{x.tipo ?? x.cpfCnpj ?? x.codigo ?? '—'}
</td>
<td>
<Badge tone={(x.ativa ?? x.ativo) !== false ? 'success' : 'warning'}>{(x.ativa ?? x.ativo) !== false ? 'Ativo' : 'Inativo'}
</Badge>
</td>
</tr>)}
</tbody>
</table>
</div>
</Card>;
}
