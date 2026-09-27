// Importa as funções, componentes ou dados utilizados por este módulo.
import { FormEvent, useEffect, useMemo, useState } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { api, loadWithFallback } from '../api';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { mockCategorias, mockClientes, mockContasFinanceiras, mockReceitas } from '../mock';
// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { Categoria, ContaFinanceira, Pessoa, Receita } from '../types';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Badge, Bars, Button, Card, DemoPill, Donut, EmptyState, Field, Kpi, Modal, dateBR, money, statusTone } from '../components/UI';
// Declara o componente/função `AccountsReceivablePage`.
export default function AccountsReceivablePage() {
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [items, setItems] = useState<Receita[]>([]), [clientes, setClientes] = useState<Pessoa[]>([]), [categorias, setCategorias] = useState<Categoria[]>([]), [contas, setContas] = useState<ContaFinanceira[]>([]);
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [demo, setDemo] = useState(false), [open, setOpen] = useState(false), [selected, setSelected] = useState<Receita | null>(null), [busy, setBusy] = useState(false);
    // Declara uma função assíncrona responsável por esta ação da interface.
        const reload = async () => { const [a, b, c, d] = await Promise.all([loadWithFallback(() => api.get<Receita[]>('/api/contas-receber'), mockReceitas), loadWithFallback(() => api.get<Pessoa[]>('/api/clientes'), mockClientes), loadWithFallback(() => api.get<Categoria[]>('/api/categorias?tipo=Receita'), mockCategorias.filter(x => x.tipo === 'Receita')), loadWithFallback(() => api.get<ContaFinanceira[]>('/api/contas-financeiras'), mockContasFinanceiras)]);
    setItems(a.data);
    setClientes(b.data);
    setCategorias(c.data);
    setContas(d.data);
    setDemo(a.demo || b.demo || c.demo || d.demo);
    setSelected(s => s ?? a.data[0] ?? null);
    };
    // Executa este efeito quando o componente é carregado ou quando suas dependências mudam.
    useEffect(() => { void reload(); }, []);
    // Prepara o valor `total` usado pela tela.
    const total = items.filter(x => x.status !== 'Cancelado').reduce((a, b) => a + b.valor, 0), received = items.filter(x => x.status === 'Recebido').reduce((a, b) => a + b.valor, 0), overdue = items.filter(x => x.status === 'Vencido').reduce((a, b) => a + b.valor, 0), forecast = items.filter(x => x.status === 'Previsto').reduce((a, b) => a + b.valor, 0);
    // Prepara o valor `lookup` usado pela tela.
    const lookup = (list: {
        id: number;
        nome: string;
    }[], id?: number | null) => list.find(x => x.id === id)?.nome ?? '—';
        async function create(e: FormEvent<HTMLFormElement>) { e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const body = { empresaId: null, clienteId: Number(f.get('clienteId')) || null, categoriaId: Number(f.get('categoriaId')) || null, contaFinanceiraId: Number(f.get('contaFinanceiraId')) || null, descricao: String(f.get('descricao')), tipo: String(f.get('tipo')), valor: Number(f.get('valor')), dataEmissao: String(f.get('dataEmissao')), dataVencimento: String(f.get('dataVencimento')), formaRecebimento: String(f.get('formaRecebimento') || ''), numeroDocumento: String(f.get('numeroDocumento') || ''), serieDocumento: null, chaveFiscal: null, observacoes: String(f.get('observacoes') || ''), parcelas: Number(f.get('parcelas')) || 1, frequenciaRecorrencia: null, recorrenciaAte: null };
    try {
        // Aguarda a resposta assíncrona antes de continuar.
        await api.post('/api/contas-receber', body);
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
    async function receive(x: Receita) { if (demo) {
        // Prepara o valor `updated` usado pela tela.
        const updated = { ...x, status: 'Recebido', dataRecebimento: new Date().toISOString() };
        // Atualiza o estado React com o valor recém-processado.
        setItems(v => v.map(i => i.id === x.id ? updated : i));
        // Atualiza o estado React com o valor recém-processado.
        setSelected(updated);
        return;
    } try {
        // Aguarda a resposta assíncrona antes de continuar.
        await api.post(`/api/contas-receber/${x.id}/receber`, { data: new Date().toISOString(), contaFinanceiraId: x.contaFinanceiraId, formaPagamento: x.formaRecebimento });
        // Aguarda a resposta assíncrona antes de continuar.
        await reload();
    }
    // Trata uma eventual falha sem interromper a experiência do usuário.
    catch (e) {
        alert(e instanceof Error ? e.message : 'Erro');
    } }
    // Memoriza este cálculo para evitar processamento desnecessário em novas renderizações.
    const typeBars = useMemo(() => ['Venda', 'Serviço', 'Consultoria', 'Manutenção'].map(t => ({ label: t, a: items.filter(x => x.tipo === t && x.status === 'Recebido').reduce((a, b) => a + b.valor, 0), b: items.filter(x => x.tipo === t && x.status !== 'Recebido').reduce((a, b) => a + b.valor, 0) })), [items]);
    // Retorna a interface que será renderizada pelo React.
    return <>
        <div className="page-title actions">
            <div>
                <div className="title-line">
                    <h1>Contas a Receber</h1>{demo && <DemoPill />}
                </div>
                <p>Gerencie vendas, serviços, clientes e acompanhe os recebimentos em tempo real.</p>
            </div>
            <div className="action-row">
                <Button icon="plus" onClick={() => setOpen(true)}>Nova Receita</Button>
                <Button variant="secondary" icon="download">Exportar</Button>
            </div>
        </div>
        <div className="filter-bar">
            <Field label="Período">
                <input value="01/09/2026 - 30/09/2026" readOnly/>
            </Field>
            <Field label="Status">
                <select>
                    <option>Todos</option>
                    <option>Previsto</option>
                    <option>Recebido</option>
                    <option>Vencido</option>
                </select>
            </Field>
            <Field label="Tipo">
                <select>
                    <option>Todos</option>
                    <option>Venda</option>
                    <option>Serviço</option>
                </select>
            </Field>
            <Field label="Cliente">
                <select>
                    <option>Todos</option>{clientes.map(x => <option key={x.id}>{x.nome}
                </option>)}
            </select>
        </Field>
    </div>
    {/* Indicadores financeiros apresentados no topo da tela. */}
    <div className="kpi-grid four">
        <Kpi icon="receive" label="Total a Receber" value={money(total)} trend="+12,5%"/>
        <Kpi icon="check" label="Recebido no Mês" value={money(received)} trend="+18,3%" tone="green"/>
        <Kpi icon="warning" label="Vencido" value={money(overdue)} tone="red" trend="+6,1%"/>
        <Kpi icon="cash" label="Previsão Próximos 30 Dias" value={money(forecast)} trend="+15,2%"/>
    </div>
    <div className="receivable-charts">
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Receitas por Tipo" subtitle="Recebidas x previstas">
            <Bars items={typeBars}/>
        </Card>
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Receitas por Categoria">
            <Donut center={money(total)} segments={(categorias.length ? categorias : [{ id: 1, nome: 'Vendas' } as Categoria]).slice(0, 5).map((c, i) => ({ label: c.nome, value: items.filter(x => x.categoriaId === c.id).reduce((a, b) => a + b.valor, 0) || [29000, 19600, 9800, 6100, 3100][i] || 500, color: ['#2f73f6', '#16a985', '#7453e8', '#f4b83f', '#94a3b8'][i] }))}/>
        </Card>
    </div>
    <div className="master-detail">
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Contas a Receber" subtitle={`${items.length} registros encontrados`}>
            <div className="table-scroll">
                {/* Tabela usada para exibir os registros de forma estruturada. */}
                <table>
                    <thead>
                        <tr>
                            <th>Vencimento</th>
                            <th>Descrição</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Status</th>
                            <th>Conta</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>{items.map(x => <tr key={x.id} className={selected?.id === x.id ? 'selected' : ''} onClick={() => setSelected(x)}>
                        <td>{dateBR(x.dataVencimento)}
                        </td>
                        <td>{x.descricao}
                        </td>
                        <td>{lookup(clientes, x.clienteId)}
                        </td>
                        <td>{x.tipo}
                        </td>
                        <td>
                            <Badge tone={statusTone(x.status)}>{x.status}
                            </Badge>
                        </td>
                        <td>{lookup(contas, x.contaFinanceiraId)}
                        </td>
                        <td className="num positive-text">{money(x.valor)}
                        </td>
                    </tr>)}
                </tbody>
            </table>{!items.length && <EmptyState />}
        </div>
    </Card>
    {/* Painel visual que agrupa informações relacionadas. */}
    <Card title="Detalhes da Receita">{selected ? <div className="detail-panel">
        <div className="detail-title">
            <div>
                <strong>{selected.descricao}
                </strong>
                <span>{lookup(clientes, selected.clienteId)} · {selected.tipo}
                </span>
            </div>
            <Badge tone={statusTone(selected.status)}>{selected.status}
            </Badge>
        </div>
        <dl>
            <dt>Emissão</dt>
            <dd>{dateBR(selected.dataEmissao)}
            </dd>
            <dt>Vencimento</dt>
            <dd>{dateBR(selected.dataVencimento)}
            </dd>
            <dt>Recebimento</dt>
            <dd>{dateBR(selected.dataRecebimento)}
            </dd>
            <dt>Forma</dt>
            <dd>{selected.formaRecebimento || '—'}
            </dd>
            <dt>Documento fiscal</dt>
            <dd>{selected.numeroDocumento || '—'}
            </dd>
            <dt>Conta Financeira</dt>
            <dd>{lookup(contas, selected.contaFinanceiraId)}
            </dd>
            <dt>Valor</dt>
            <dd className="positive-text">{money(selected.valor)}
            </dd>
        </dl>
        <div className="detail-actions">
            <Button icon="check" onClick={() => void receive(selected)}>Marcar como Recebido</Button>
        </div>
    </div> : <EmptyState />}
    </Card>
    </div>
    <Modal open={open} title="Nova Conta a Receber" onClose={() => setOpen(false)}>
        <form className="form-grid" onSubmit={create}>
            <Field label="Descrição">
                <input name="descricao" required/>
            </Field>
            <Field label="Valor">
                <input name="valor" type="number" step="0.01" min="0.01" required/>
            </Field>
            <Field label="Tipo">
                <select name="tipo">
                    <option>Venda</option>
                    <option>Serviço</option>
                    <option>Outros</option>
                </select>
            </Field>
            <Field label="Cliente">
                <select name="clienteId">
                    <option value="">Selecione</option>{clientes.map(x => <option value={x.id} key={x.id}>{x.nome}
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
    <Field label="Emissão">
        <input name="dataEmissao" type="date" required/>
    </Field>
    <Field label="Vencimento">
        <input name="dataVencimento" type="date" required/>
    </Field>
    <Field label="Forma de recebimento">
        <select name="formaRecebimento">
            <option>Transferência Bancária</option>
            <option>PIX</option>
            <option>Boleto</option>
            <option>Cartão</option>
            <option>Dinheiro</option>
        </select>
    </Field>
    <Field label="Documento fiscal">
        <input name="numeroDocumento"/>
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
