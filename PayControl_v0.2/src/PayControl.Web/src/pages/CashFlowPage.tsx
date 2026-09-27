// Importa as funções, componentes ou dados utilizados por este módulo.
import { useEffect, useMemo, useState } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { api, loadWithFallback } from '../api';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { mockAlerts, mockContasFinanceiras, mockFluxo } from '../mock';
// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { ContaFinanceira, Fluxo } from '../types';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Badge, Card, DemoPill, Field, Kpi, LineChart, dateBR, money, statusTone } from '../components/UI';
// Declara o componente/função `CashFlowPage`.
export default function CashFlowPage() {
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [fluxo, setFluxo] = useState<Fluxo>(mockFluxo), [contas, setContas] = useState<ContaFinanceira[]>(mockContasFinanceiras), [demo, setDemo] = useState(false), [account, setAccount] = useState('');
        async function load(id = '') { const suffix = id ? `?contaFinanceiraId=${id}` : '';
    const [f, c] = await Promise.all([loadWithFallback(() => api.get<Fluxo>(`/api/fluxo-financeiro${suffix}`), mockFluxo), loadWithFallback(() => api.get<ContaFinanceira[]>('/api/contas-financeiras'), mockContasFinanceiras)]);
    setFluxo(f.data);
    setContas(c.data);
    setDemo(f.demo || c.demo);
    }
    // Executa este efeito quando o componente é carregado ou quando suas dependências mudam.
    useEffect(() => { void load(); }, []);
    // Memoriza este cálculo para evitar processamento desnecessário em novas renderizações.
    const points = useMemo(() => fluxo.lancamentos.length ? fluxo.lancamentos.map(x => x.saldo) : [8200, 10200, 9400, 15800, 14600, 20650, 28300], [fluxo]);
    // Retorna a interface que será renderizada pelo React.
    return <>
        <div className="page-title actions">
            <div>
                <div className="title-line">
                    <h1>Fluxo de Caixa</h1>{demo && <DemoPill />}
                </div>
                <p>Acompanhe o extrato da conta, entradas, saídas e o saldo projetado em um só lugar.</p>
            </div>
            <button className="btn btn-secondary">Exportar</button>
        </div>
        <div className="filter-bar">
            <Field label="Período">
                <input value="01/09/2026 - 30/09/2026" readOnly/>
            </Field>
            <Field label="Conta Financeira">
                <select value={account} onChange={(e: any) => { setAccount(e.target.value); void load(e.target.value); }}>
                    <option value="">Todas as contas</option>{contas.map(x => <option value={x.id} key={x.id}>{x.nome}
                </option>)}
            </select>
        </Field>
        <Field label="Empresa">
            <select>
                <option>Empresa Exemplo Ltda.</option>
            </select>
        </Field>
        <Field label="Status">
            <select>
                <option>Todos os status</option>
            </select>
        </Field>
    </div>
    {/* Indicadores financeiros apresentados no topo da tela. */}
    <div className="kpi-grid five">
        <Kpi icon="wallet" label="Saldo Inicial" value={money(fluxo.saldoInicial)}/>
        <Kpi icon="up" label="Entradas" value={money(fluxo.entradasRealizadas)} tone="green" trend="+12,5%"/>
        <Kpi icon="down" label="Saídas" value={money(fluxo.saidasRealizadas)} tone="red" trend="+6,1%"/>
        <Kpi icon="wallet" label="Saldo Atual" value={money(fluxo.saldoRealizado)} trend="+37,0%"/>
        <Kpi icon="cash" label="Saldo Projetado (30 dias)" value={money(fluxo.saldoProjetado)} tone="purple" trend="+8,3%"/>
    </div>
    <div className="cash-layout">
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Fluxo de Caixa no Período" subtitle="Evolução do saldo com entradas, saídas e projeções.">
            <LineChart points={points}/>
            <div className="mini-axis">
                <span>01/Set</span>
                <span>07/Set</span>
                <span>15/Set</span>
                <span>22/Set</span>
                <span>30/Set</span>
            </div>
        </Card>
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Projeção de Saldo">
            <div className="projection-list">{[7, 15, 30, 60, 90].map((d, i) => <div key={d}>
                <span>Em {d} dias</span>
                <b>{money(fluxo.saldoProjetado + (i * 2800))}
                </b>
                <small>+{10 + i * 9},0%</small>
            </div>)}
        </div>
    </Card>
    </div>
    <div className="cash-layout lower">
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Extrato de Lançamentos" subtitle="Movimentações da conta selecionada no período.">
            <div className="table-scroll">
                {/* Tabela usada para exibir os registros de forma estruturada. */}
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Histórico</th>
                            <th>Origem</th>
                            <th>Entrada</th>
                            <th>Saída</th>
                            <th>Saldo</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>{fluxo.lancamentos.map((x, i) => <tr key={`${x.id}-${i}`}>
                        <td>{dateBR(x.data)}
                        </td>
                        <td>{x.descricao}
                        </td>
                        <td>
                            <Badge tone={x.origem === 'Receita' ? 'success' : x.origem === 'Transferência' ? 'info' : 'danger'}>{x.origem}
                            </Badge>
                        </td>
                        <td className="num positive-text">{x.entrada ? money(x.entrada) : '—'}
                        </td>
                        <td className="num negative-text">{x.saida ? money(x.saida) : '—'}
                        </td>
                        <td className="num">{money(x.saldo)}
                        </td>
                        <td>
                            <Badge tone={statusTone(x.status)}>{x.status}
                            </Badge>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    </Card>
    {/* Painel visual que agrupa informações relacionadas. */}
    <Card title="Alertas Financeiros">
        <div className="alert-list">{mockAlerts.map((a, i) => <div className={`alert alert-${a.level}`} key={i}>
            <strong>{a.title}
            </strong>
            <span>{a.detail}
            </span>
        </div>)}
    </div>
    <div className="info-note">Transferências entre contas da mesma empresa não afetam o resultado consolidado, mas aparecem no extrato da conta selecionada.</div>
    </Card>
    </div>
    </>;
}
