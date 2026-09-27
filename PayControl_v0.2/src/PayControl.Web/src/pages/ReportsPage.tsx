// Importa as funções, componentes ou dados utilizados por este módulo.
import { useEffect, useState } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { API_BASE, api, loadWithFallback } from '../api';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Bars, Card, DemoPill, Donut, Field, Kpi, money } from '../components/UI';
type Resumo = {
    receitaTotal?: number;
    despesaTotal?: number;
    lucroPrejuizo?: number;
    receitas?: number | {
        total?: number;
        recebidas?: number;
        previstas?: number;
    };
    despesas?: number | {
        total?: number;
        pagas?: number;
        pendentes?: number;
    };
    resultado?: number;
    resultadoRealizado?: number;
    resultadoProjetado?: number;
};
// Declara o componente/função `ReportsPage`.
export default function ReportsPage() {
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [resumo, setResumo] = useState<Resumo>({ receitaTotal: 46200, despesaTotal: 33750, lucroPrejuizo: 12450 }), [demo, setDemo] = useState(false), [tab, setTab] = useState('Resumo Financeiro');
    // Executa este efeito quando o componente é carregado ou quando suas dependências mudam.
        useEffect(() => { void (async () => { const r = await loadWithFallback(() => api.get<Resumo>('/api/relatorios/resumo'), { receitaTotal: 46200, despesaTotal: 33750, lucroPrejuizo: 12450 });
    setResumo(r.data);
    setDemo(r.demo);
    })();
    }, []);
    // Prepara o valor `receitas` usado pela tela.
    const receitas = resumo.receitaTotal ?? (typeof resumo.receitas === 'number' ? resumo.receitas : resumo.receitas?.total) ?? 46200, despesas = resumo.despesaTotal ?? (typeof resumo.despesas === 'number' ? resumo.despesas : resumo.despesas?.total) ?? 33750, resultado = resumo.lucroPrejuizo ?? resumo.resultado ?? resumo.resultadoProjetado ?? receitas - despesas;
    // Prepara o valor `reports` usado pela tela.
    const reports = ['Resumo Financeiro', 'Fluxo de Caixa', 'Receitas', 'Despesas', 'Receita Bruta Mensal', 'DRE Gerencial', 'Inadimplência', 'Projeções', 'Receitas por Cliente', 'Despesas por Fornecedor'];
    // Retorna a interface que será renderizada pelo React.
    return <>
        {/* Cabeçalho e identificação principal da página. */}
        <div className="page-title">
            <div>
                <div className="title-line">
                    <h1>Relatórios</h1>{demo && <DemoPill />}
                </div>
                <p>Análises e exportações para uma gestão mais estratégica do seu negócio.</p>
            </div>
        </div>
        <div className="report-tabs">{reports.map(r => <button key={r} onClick={() => setTab(r)} className={tab === r ? 'active' : ''}>{r}<small>{r === 'Resumo Financeiro' ? 'Visão geral do período' : r.includes('Receitas') ? 'Análise de receitas' : r.includes('Despesas') ? 'Análise de despesas' : 'Relatório gerencial'}
        </small>
    </button>)}
    </div>
    <div className="filter-bar report-filter">
        <Field label="Período">
            <input value="01/09/2026 - 30/09/2026" readOnly/>
        </Field>
        <Field label="Empresa">
            <select>
                <option>Empresa Exemplo Ltda.</option>
            </select>
        </Field>
        <Field label="Categoria">
            <select>
                <option>Todas as categorias</option>
            </select>
        </Field>
        <Field label="Cliente">
            <select>
                <option>Todos os clientes</option>
            </select>
        </Field>
        <a className="btn btn-secondary" href={`${API_BASE}/api/relatorios/pdf/resumo`} target="_blank" rel="noreferrer">Exportar PDF</a>
        <a className="btn btn-secondary" href={`${API_BASE}/api/relatorios/exportar/resumo`} target="_blank" rel="noreferrer">Exportar CSV</a>
    </div>
    {/* Indicadores financeiros apresentados no topo da tela. */}
    <div className="kpi-grid four">
        <Kpi icon="up" label="Receita Total" value={money(receitas)} tone="green" trend="+15,2%"/>
        <Kpi icon="down" label="Despesa Total" value={money(despesas)} tone="red" trend="+6,1%"/>
        <Kpi icon="cash" label="Lucro / Prejuízo" value={money(resultado)} trend="+37,0%"/>
        <Kpi icon="warning" label="Inadimplência" value="4,8%" tone="yellow" trend="-2,1 p.p."/>
    </div>
    <div className="reports-grid">
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card className="span-2" title="Receitas x Despesas" subtitle="Comparativo mensal no período selecionado.">
            <Bars items={[{ label: 'Abr', a: 32400, b: 24800 }, { label: 'Mai', a: 36200, b: 27900 }, { label: 'Jun', a: 34800, b: 29400 }, { label: 'Jul', a: 42600, b: 31200 }, { label: 'Ago', a: 39500, b: 32100 }, { label: 'Set', a: receitas, b: despesas }]}/>
        </Card>
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="DRE Gerencial Simplificada">
            <div className="dre">
                <div>
                    <span>Receita Bruta</span>
                    <b>{money(receitas * 1.14)}
                    </b>
                </div>
                <div>
                    <span>Deduções e Impostos</span>
                    <b className="negative-text">-{money(receitas * .14)}
                    </b>
                </div>
                <div className="highlight">
                    <span>Receita Líquida</span>
                    <b>{money(receitas)}
                    </b>
                </div>
                <div>
                    <span>Custos dos Produtos/Serviços</span>
                    <b className="negative-text">-{money(despesas * .55)}
                    </b>
                </div>
                <div>
                    <span>Despesas Operacionais</span>
                    <b className="negative-text">-{money(despesas * .45)}
                    </b>
                </div>
                <div className="highlight">
                    <span>Resultado do Período</span>
                    <b className="positive-text">{money(resultado)}
                    </b>
                </div>
            </div>
        </Card>
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Composição">
            <Donut center={money(receitas)} segments={[{ label: 'Vendas', value: 23000, color: '#2f73f6' }, { label: 'Serviços', value: 15000, color: '#16a985' }, { label: 'Consultoria', value: 6200, color: '#7453e8' }, { label: 'Outros', value: 2000, color: '#f4b83f' }]}/>
        </Card>
    </div>
    {/* Painel visual que agrupa informações relacionadas. */}
    <Card title="Detalhamento das Receitas e Despesas">
        <div className="table-scroll">
            {/* Tabela usada para exibir os registros de forma estruturada. */}
            <table>
                <thead>
                    <tr>
                        <th>Mês</th>
                        <th>Receitas</th>
                        <th>Despesas</th>
                        <th>Lucro / Prejuízo</th>
                        <th>Margem</th>
                    </tr>
                </thead>
                <tbody>{[['Abril/2026', 32400, 24800], ['Maio/2026', 36200, 27900], ['Junho/2026', 34800, 29400], ['Julho/2026', 42600, 31200], ['Agosto/2026', 39500, 32100], ['Setembro/2026', receitas, despesas]].map(([m, r, d]) => { const rr = Number(r), dd = Number(d), l = rr - dd; return <tr key={String(m)}>
                    <td>{String(m)}
                    </td>
                    <td className="positive-text">{money(rr)}
                    </td>
                    <td className="negative-text">{money(dd)}
                    </td>
                    <td>{money(l)}
                    </td>
                    <td>{((l / rr) * 100).toFixed(1)}%</td>
                </tr>; })}
            </tbody>
        </table>
    </div>
    </Card>
    </>;
}
