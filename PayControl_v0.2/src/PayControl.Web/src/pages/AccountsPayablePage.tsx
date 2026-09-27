// Importa as funções, componentes ou dados utilizados por este módulo.
import { FormEvent, useEffect, useMemo, useState } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { api, loadWithFallback } from '../api';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { mockCategorias, mockContasFinanceiras, mockContasPagar, mockFornecedores } from '../mock';
// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { Categoria, ContaFinanceira, ContaPagar, Pessoa } from '../types';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Badge, Button, Card, DemoPill, Donut, EmptyState, Field, Kpi, Modal, dateBR, money, statusTone } from '../components/UI';
// Declara o componente/função `AccountsPayablePage`.
export default function AccountsPayablePage() {
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [items, setItems] = useState<ContaPagar[]>([]), [fornecedores, setFornecedores] = useState<Pessoa[]>([]), [categorias, setCategorias] = useState<Categoria[]>([]), [contas, setContas] = useState<ContaFinanceira[]>([]);
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [demo, setDemo] = useState(false), [open, setOpen] = useState(false), [selected, setSelected] = useState<ContaPagar | null>(null), [busy, setBusy] = useState(false);
    // Declara uma função assíncrona responsável por esta ação da interface.
        const reload = async () => { const [a, b, c, d] = await Promise.all([loadWithFallback(() => api.get<ContaPagar[]>('/api/contas-pagar'), mockContasPagar), loadWithFallback(() => api.get<Pessoa[]>('/api/fornecedores'), mockFornecedores), loadWithFallback(() => api.get<Categoria[]>('/api/categorias?tipo=Despesa'), mockCategorias.filter(x => x.tipo === 'Despesa')), loadWithFallback(() => api.get<ContaFinanceira[]>('/api/contas-financeiras'), mockContasFinanceiras)]);
    setItems(a.data);
    setFornecedores(b.data);
    setCategorias(c.data);
    setContas(d.data);
    setDemo(a.demo || b.demo || c.demo || d.demo);
    setSelected(s => s ?? a.data[0] ?? null);
    };
    // Executa este efeito quando o componente é carregado ou quando suas dependências mudam.
    useEffect(() => { void reload(); }, []);
    // Prepara o valor `total` usado pela tela.
    const total = items.filter(x => x.status !== 'Pago' && x.status !== 'Cancelado').reduce((a, b) => a + b.valor, 0), paid = items.filter(x => x.status === 'Pago').reduce((a, b) => a + b.valor, 0), overdue = items.filter(x => x.status === 'Vencido').reduce((a, b) => a + b.valor, 0);
    // Prepara o valor `lookup` usado pela tela.
    const lookup = (list: {
        id: number;
        nome: string;
    }[], id?: number | null) => list.find(x => x.id === id)?.nome ?? '—';
        async function create(e: FormEvent<HTMLFormElement>) { e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const body = { empresaId: null, fornecedorId: Number(f.get('fornecedorId')) || null, categoriaId: Number(f.get('categoriaId')) || null, contaFinanceiraId: Number(f.get('contaFinanceiraId')) || null, descricao: String(f.get('descricao')), valor: Number(f.get('valor')), dataEmissao: String(f.get('dataEmissao')), dataVencimento: String(f.get('dataVencimento')), formaPagamento: String(f.get('formaPagamento') || ''), numeroDocumento: null, serieDocumento: null, chaveFiscal: null, observacoes: String(f.get('observacoes') || ''), parcelas: Number(f.get('parcelas')) || 1, frequenciaRecorrencia: null, recorrenciaAte: null };
    try {
        // Aguarda a resposta assíncrona antes de continuar.
        await api.post('/api/contas-pagar', body);
        // Atualiza o estado React com o valor recém-processado.
        setOpen(false);
        // Aguarda a resposta assíncrona antes de continuar.
        await reload();
    }
    // Trata uma eventual falha sem interromper a experiência do usuário.
    catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
    finally {
        // Atualiza o estado React com o valor recém-processado.
        setBusy(false);
    } }
    async function pay(x: ContaPagar) { if (demo) {
        // Atualiza o estado React com o valor recém-processado.
        setItems(v => v.map(i => i.id === x.id ? { ...i, status: 'Pago', dataPagamento: new Date().toISOString() } : i));
        // Atualiza o estado React com o valor recém-processado.
        setSelected({ ...x, status: 'Pago', dataPagamento: new Date().toISOString() });
        return;
    } try {
        // Aguarda a resposta assíncrona antes de continuar.
        await api.post(`/api/contas-pagar/${x.id}/pagar`, { data: new Date().toISOString(), contaFinanceiraId: x.contaFinanceiraId, formaPagamento: x.formaPagamento });
        // Aguarda a resposta assíncrona antes de continuar.
        await reload();
    }
    // Trata uma eventual falha sem interromper a experiência do usuário.
    catch (e) {
        alert(e instanceof Error ? e.message : 'Erro');
    } }
    // Retorna a interface que será renderizada pelo React.
    return <>
        <div className="page-title actions">
            <div>
                <div className="title-line">
                    <h1>Contas a Pagar</h1>{demo && <DemoPill />}
                </div>
                <p>Gerencie despesas, fornecedores, vencimentos e pagamentos em um só lugar.</p>
            </div>
            <div className="action-row">
                <Button icon="plus" onClick={() => setOpen(true)}>Nova Conta</Button>
                <Button variant="secondary" icon="download">Exportar</Button>
            </div>
        </div>
        <div className="filter-bar">
            <Field label="Período">
                <input value="01/09/2026 - 30/09/2026" readOnly/>
            </Field>
            <Field label="Status">
                <select>
                    <option>Todos os status</option>
                    <option>Pendente</option>
                    <option>Pago</option>
                    <option>Vencido</option>
                </select>
            </Field>
            <Field label="Categoria">
                <select>
                    <option>Todas as categorias</option>{categorias.map(x => <option key={x.id}>{x.nome}
                </option>)}
            </select>
        </Field>
        <Field label="Fornecedor">
            <select>
                <option>Todos os fornecedores</option>{fornecedores.map(x => <option key={x.id}>{x.nome}
            </option>)}
        </select>
    </Field>
    </div>
    {/* Indicadores financeiros apresentados no topo da tela. */}
    <div className="kpi-grid four">
        <Kpi icon="pay" label="Total em Aberto" value={money(total)} hint={`${items.filter(x => x.status === 'Pendente').length} contas pendentes`}/>
        <Kpi icon="check" label="Pago no Mês" value={money(paid)} trend="+12,5%" tone="green"/>
        <Kpi icon="warning" label="Vencido" value={money(overdue)} tone="red" hint={`${items.filter(x => x.status === 'Vencido').length} contas em atraso`}/>
        <Kpi icon="calendar" label="Próximos 7 Dias" value={money(items.filter(x => x.status === 'Pendente').reduce((a, b) => a + b.valor, 0))} tone="yellow"/>
    </div>
    <div className="master-detail">
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Contas a Pagar" subtitle={`Lista de ${items.length} contas e despesas da sua empresa.`}>
            <div className="table-scroll">
                {/* Tabela usada para exibir os registros de forma estruturada. */}
                <table>
                    <thead>
                        <tr>
                            <th>Vencimento</th>
                            <th>Descrição</th>
                            <th>Fornecedor</th>
                            <th>Categoria</th>
                            <th>Parcela</th>
                            <th>Status</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>{items.map(x => <tr key={x.id} className={selected?.id === x.id ? 'selected' : ''} onClick={() => setSelected(x)}>
                        <td>{dateBR(x.dataVencimento)}
                        </td>
                        <td>{x.descricao}
                        </td>
                        <td>{lookup(fornecedores, x.fornecedorId)}
                        </td>
                        <td>{lookup(categorias, x.categoriaId)}
                        </td>
                        <td>{x.parcelaNumero}/{x.parcelaTotal}
                        </td>
                        <td>
                            <Badge tone={statusTone(x.status)}>{x.status}
                            </Badge>
                        </td>
                        <td className="num">{money(x.valor)}
                        </td>
                    </tr>)}
                </tbody>
            </table>{!items.length && <EmptyState />}
        </div>
    </Card>
    {/* Painel visual que agrupa informações relacionadas. */}
    <Card title="Detalhes da Conta">{selected ? <div className="detail-panel">
        <div className="detail-title">
            <div>
                <strong>{selected.descricao}
                </strong>
                <span>{lookup(fornecedores, selected.fornecedorId)}
                </span>
            </div>
            <Badge tone={statusTone(selected.status)}>{selected.status}
            </Badge>
        </div>
        <dl>
            <dt>Categoria</dt>
            <dd>{lookup(categorias, selected.categoriaId)}
            </dd>
            <dt>Emissão</dt>
            <dd>{dateBR(selected.dataEmissao)}
            </dd>
            <dt>Vencimento</dt>
            <dd>{dateBR(selected.dataVencimento)}
            </dd>
            <dt>Pagamento</dt>
            <dd>{dateBR(selected.dataPagamento)}
            </dd>
            <dt>Forma</dt>
            <dd>{selected.formaPagamento || '—'}
            </dd>
            <dt>Conta Financeira</dt>
            <dd>{lookup(contas, selected.contaFinanceiraId)}
            </dd>
            <dt>Valor</dt>
            <dd>{money(selected.valor)}
            </dd>
            <dt>Parcelas</dt>
            <dd>{selected.parcelaNumero} de {selected.parcelaTotal}
            </dd>
        </dl>
        <div className="detail-actions">
            <Button variant="success" icon="check" onClick={() => void pay(selected)}>Marcar como Pago</Button>
        </div>
    </div> : <EmptyState />}
    </Card>
    </div>
    <div className="two-col">
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Despesas por Categoria">
            <Donut center={money(total)} segments={useMemo(() => categorias.slice(0, 5).map((c, i) => ({ label: c.nome, value: items.filter(x => x.categoriaId === c.id).reduce((a, b) => a + b.valor, 0) || [5200, 4480, 1890, 2310, 1600][i] || 500, color: ['#2f73f6', '#7453e8', '#f4b83f', '#16a985', '#f9803d'][i] })), [categorias, items, total])}/>
        </Card>
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Despesas por Status">
            <div className="status-bars">{['Pendente', 'Pago', 'Vencido', 'Cancelado'].map(s => <div key={s}>
                <span>{s}
                </span>
                <i>
                    <b style={{ width: `${Math.max(6, items.filter(x => x.status === s).length / Math.max(items.length, 1) * 100)}%` }}/>
                </i>
                <strong>{items.filter(x => x.status === s).length}
                </strong>
            </div>)}
        </div>
    </Card>
    </div>
    <Modal open={open} title="Nova Conta a Pagar" onClose={() => setOpen(false)}>
        <form className="form-grid" onSubmit={create}>
            <Field label="Descrição">
                <input name="descricao" required/>
            </Field>
            <Field label="Valor">
                <input name="valor" type="number" step="0.01" min="0.01" required/>
            </Field>
            <Field label="Fornecedor">
                <select name="fornecedorId">
                    <option value="">Selecione</option>{fornecedores.map(x => <option value={x.id} key={x.id}>{x.nome}
                </option>)}
            </select>
        </Field>
        <Field label="Categoria">
            <select name="categoriaId">
                <option value="">Selecione</option>{categorias.map(x => <option value={x.id} key={x.id}>{x.nome}
            </option>)}
        </select>
    </Field>
    <Field label="Conta financeira">
        <select name="contaFinanceiraId">
            <option value="">Selecione</option>{contas.map(x => <option value={x.id} key={x.id}>{x.nome}
        </option>)}
    </select>
    </Field>
    <Field label="Forma de pagamento">
        <select name="formaPagamento">
            <option>Transferência Bancária</option>
            <option>PIX</option>
            <option>Boleto</option>
            <option>Cartão</option>
            <option>Dinheiro</option>
        </select>
    </Field>
    <Field label="Data de emissão">
        <input name="dataEmissao" type="date" required/>
    </Field>
    <Field label="Vencimento">
        <input name="dataVencimento" type="date" required/>
    </Field>
    <Field label="Parcelas">
        <input name="parcelas" type="number" min="1" defaultValue="1"/>
    </Field>
    <Field label="Observações">
        <textarea name="observacoes" rows={3}/>
    </Field>
    <div className="form-actions">
        <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button type="submit" disabled={busy}>Salvar</Button>
    </div>
    </form>
    </Modal>
    </>;
}
