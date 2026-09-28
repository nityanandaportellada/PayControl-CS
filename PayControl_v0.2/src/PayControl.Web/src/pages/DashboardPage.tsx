// Importa as funções, componentes ou dados utilizados por este módulo.
import { useEffect, useMemo, useState } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { api, loadWithFallback } from '../api';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { mockContasPagar, mockFluxo, mockReceitas } from '../mock';
// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { AlertItem, ContaPagar, Fluxo, Receita } from '../types';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Bars, Card, DemoPill, Donut, Kpi, LineChart, Badge, money, statusTone } from '../components/UI';
// Declara o componente/função `DashboardPage`.
export default function DashboardPage({ navigate }: {
    navigate: (p: string) => void;
}) {
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [fluxo, setFluxo] = useState<Fluxo>(mockFluxo);
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [pagar, setPagar] = useState<ContaPagar[]>(mockContasPagar);
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [receber, setReceber] = useState<Receita[]>(mockReceitas);
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [alertas, setAlertas] = useState<AlertItem[]>([]);
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [demo, setDemo] = useState(false);
    // Executa este efeito quando o componente é carregado ou quando suas dependências mudam.
        useEffect(() => { void (async () => { const [f, p, r, a] = await Promise.all([loadWithFallback(() => api.get<Fluxo>('/api/fluxo-financeiro'), mockFluxo), loadWithFallback(() => api.get<ContaPagar[]>('/api/contas-pagar'), mockContasPagar), loadWithFallback(() => api.get<Receita[]>('/api/contas-receber'), mockReceitas), loadWithFallback(() => api.get<AlertItem[]>('/api/dashboard/alertas'), [] as AlertItem[])]);
    setFluxo(f.data);
    setPagar(p.data);
    setReceber(r.data);
    setAlertas(a.data);
    setDemo(f.demo || p.demo || r.demo || a.demo);
    })();
    }, []);
    // Prepara o valor `received` usado pela tela.
    const received = receber.filter(x => x.status === 'Recebido').reduce((a, b) => a + b.valor, 0);
    // Prepara o valor `paid` usado pela tela.
    const paid = pagar.filter(x => x.status === 'Pago').reduce((a, b) => a + b.valor, 0);
    // Prepara o valor `due` usado pela tela.
    const due = pagar.filter(x => ['Pendente', 'Vencido'].includes(x.status)).reduce((a, b) => a + b.valor, 0);
    // Prepara o valor `toReceive` usado pela tela.
    const toReceive = receber.filter(x => ['Previsto', 'Vencido'].includes(x.status)).reduce((a, b) => a + b.valor, 0);
    // Memoriza este cálculo para evitar processamento desnecessário em novas renderizações.
    const recent = useMemo(() => [...receber.map(x => ({ date: x.dataRecebimento ?? x.dataVencimento, description: x.descricao, type: 'Receita', status: x.status, value: x.valor })), ...pagar.map(x => ({ date: x.dataPagamento ?? x.dataVencimento, description: x.descricao, type: 'Despesa', status: x.status, value: x.valor }))].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), [pagar, receber]);
    // Retorna a interface que será renderizada pelo React.
    return <>
        {/* Cabeçalho e identificação principal da página. */}
        <div className="page-title">
            <div>
                <div className="title-line">
                    <h1>Visão Geral Financeira</h1>{demo && <DemoPill />}
                </div>
                <p>Acompanhe o desempenho do seu negócio em tempo real e mantenha suas finanças sob controle.</p>
            </div>
        </div>
        {/* Indicadores financeiros apresentados no topo da tela. */}
        <div className="kpi-grid six">
            <Kpi icon="wallet" label="Saldo Realizado" value={money(fluxo.saldoRealizado)} trend="+12,5%"/>
            <Kpi icon="cash" label="Saldo Projetado" value={money(fluxo.saldoProjetado)} trend="+8,3%" tone="green"/>
            <Kpi icon="up" label="Receitas do Mês" value={money(received)} trend="+15,2%" tone="green"/>
            <Kpi icon="down" label="Despesas do Mês" value={money(paid)} trend="+6,1%" tone="red"/>
            <Kpi icon="calendar" label="Contas a Vencer" value={money(due)} hint={`${pagar.filter(x => x.status !== 'Pago').length} contas abertas`}/>
            <Kpi icon="receive" label="Receitas a Receber" value={money(toReceive)} hint={`${receber.filter(x => x.status !== 'Recebido').length} recebimentos`}/>
        </div>
        {/* Grade principal com os painéis e informações de apoio. */}
        <div className="dashboard-grid">
            {/* Painel visual que agrupa informações relacionadas. */}
            <Card className="span-2" title="Entradas x Saídas" subtitle="Comparativo financeiro recente." action={<span className="chart-legend">
                <i className="green"/>Entradas <i className="red"/>Saídas</span>}>
                    <Bars items={[{ label: 'Abr', a: 26000, b: 21000 }, { label: 'Mai', a: 32000, b: 24000 }, { label: 'Jun', a: 29000, b: 25000 }, { label: 'Jul', a: 38000, b: 31000 }, { label: 'Ago', a: 41000, b: 30000 }, { label: 'Set', a: received || 46200, b: paid || 33750 }]}/>
                </Card>
                {/* Painel visual que agrupa informações relacionadas. */}
                <Card title="Fluxo de Caixa" subtitle="Resumo do período selecionado.">
                    <div className="summary-list">
                        <div>
                            <span>Saldo inicial</span>
                            <b>{money(fluxo.saldoInicial)}
                            </b>
                        </div>
                        <div>
                            <span>(+) Entradas</span>
                            <b className="positive-text">{money(fluxo.entradasRealizadas)}
                            </b>
                        </div>
                        <div>
                            <span>(-) Saídas</span>
                            <b className="negative-text">{money(fluxo.saidasRealizadas)}
                            </b>
                        </div>
                        <div className="highlight">
                            <span>Saldo final</span>
                            <b>{money(fluxo.saldoRealizado)}
                            </b>
                        </div>
                        <div>
                            <span>Saldo projetado</span>
                            <b>{money(fluxo.saldoProjetado)}
                            </b>
                        </div>
                    </div>
                </Card>
                {/* Painel visual que agrupa informações relacionadas. */}
                <Card title="Alertas" action={<button className="link-button">Ver todos</button>}>
                    <div className="alert-list">{alertas.map((a, i) => <button className={`alert alert-${a.level}`} key={i}>
                        <strong>{a.title}
                        </strong>
                        <span>{a.detail}
                        </span>
                    </button>)}
                    {!alertas.length && <div className="empty-state">Nenhum alerta financeiro para a empresa ativa.</div>}
                </div>
            </Card>
            {/* Painel visual que agrupa informações relacionadas. */}
            <Card className="span-2" title="Últimos Lançamentos" action={<button className="link-button" onClick={() => navigate('/fluxo-caixa')}>Ver todos</button>}>
                <div className="table-scroll">
                    {/* Tabela usada para exibir os registros de forma estruturada. */}
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th className="num">Valor</th>
                            </tr>
                        </thead>
                        <tbody>{recent.map((x, i) => <tr key={i}>
                            <td>{new Date(x.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td>{x.description}
                            </td>
                            <td>
                                <Badge tone={x.type === 'Receita' ? 'success' : 'danger'}>{x.type}
                                </Badge>
                            </td>
                            <td>
                                <Badge tone={statusTone(x.status)}>{x.status}
                                </Badge>
                            </td>
                            <td className={`num ${x.type === 'Receita' ? 'positive-text' : 'negative-text'}`}>{money(x.value)}
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </Card>
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Despesas por Categoria">
            <Donut center={money(paid || 33750)} segments={[{ label: 'Aluguel', value: 9480, color: '#2f73f6' }, { label: 'Pessoal', value: 7500, color: '#7453e8' }, { label: 'Marketing', value: 5000, color: '#16a985' }, { label: 'Utilidades', value: 4000, color: '#f4b83f' }, { label: 'Outros', value: 7770, color: '#94a3b8' }]}/>
        </Card>
    </div>
    {/* Painel visual que agrupa informações relacionadas. */}
    <Card className="projection-card" title="Tendência do saldo">
        <LineChart points={fluxo.lancamentos.length ? fluxo.lancamentos.map(x => x.saldo) : [8, 12, 10, 15, 20, 19, 25, 29]}/>
    </Card>
    </>;
}
