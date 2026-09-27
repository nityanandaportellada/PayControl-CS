// Importa as funções, componentes ou dados utilizados por este módulo.
import { ChangeEvent, useEffect, useState } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { api, loadWithFallback } from '../api';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { mockContasFinanceiras } from '../mock';
// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { ContaFinanceira } from '../types';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Badge, Button, Card, DemoPill, EmptyState, Field, Kpi, money, statusTone } from '../components/UI';
type Item = {
    id: number;
    data: string;
    descricao: string;
    valor: number;
    tipo: string;
    status: string;
    contaFinanceiraId?: number | null;
    documento?: string | null;
};
// Prepara o valor `fallback` usado pela tela.
const fallback: Item[] = [{ id: 1, data: '2026-09-20', descricao: 'PIX RECEBIDO CLIENTE ABC', valor: 5290, tipo: 'Entrada', status: 'Pendente', contaFinanceiraId: 1 }, { id: 2, data: '2026-09-18', descricao: 'PAGAMENTO FORNECEDOR XYZ', valor: -1450, tipo: 'Saída', status: 'Conciliado', contaFinanceiraId: 1 }, { id: 3, data: '2026-09-16', descricao: 'TED RECEBIDA COMERCIO XYZ', valor: 12000, tipo: 'Entrada', status: 'Pendente', contaFinanceiraId: 2 }];
// Declara o componente/função `ReconciliationPage`.
export default function ReconciliationPage() {
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [items, setItems] = useState<Item[]>(fallback), [contas, setContas] = useState<ContaFinanceira[]>(mockContasFinanceiras), [demo, setDemo] = useState(false), [account, setAccount] = useState('1'), [busy, setBusy] = useState(false);
    // Executa este efeito quando o componente é carregado ou quando suas dependências mudam.
        useEffect(() => { void (async () => { const [a, c] = await Promise.all([loadWithFallback(() => api.get<Item[]>('/api/conciliacao'), fallback), loadWithFallback(() => api.get<ContaFinanceira[]>('/api/contas-financeiras'), mockContasFinanceiras)]);
    setItems(a.data);
    setContas(c.data);
    setDemo(a.demo || c.demo);
    if (c.data[0])
        // Atualiza o estado React com o valor recém-processado.
        setAccount(String(c.data[0].id)); })(); }, []);
    async function upload(e: ChangeEvent<HTMLInputElement>, type: 'csv' | 'ofx') { const file = e.target.files?.[0]; if (!file)
        return; setBusy(true); try {
        // Aguarda a resposta assíncrona antes de continuar.
        await api.upload(`/api/conciliacao/importar-${type}?contaFinanceiraId=${account}`, file);
        // Prepara o valor `fresh` usado pela tela.
        const fresh = await api.get<Item[]>('/api/conciliacao');
        // Atualiza o estado React com o valor recém-processado.
        setItems(fresh);
    }
    // Trata uma eventual falha sem interromper a experiência do usuário.
    catch (err) {
        // Valida a condição antes de continuar com a ação.
        if (demo)
            alert('Modo demonstrativo: arquivo selecionado com sucesso. A importação real ocorrerá com a API ativa.');
        else
            alert(err instanceof Error ? err.message : 'Erro na importação');
    }
    finally {
        // Atualiza o estado React com o valor recém-processado.
        setBusy(false);
        e.target.value = '';
    } }
    // Prepara o valor `pend` usado pela tela.
    const pend = items.filter(x => x.status !== 'Conciliado'), conc = items.filter(x => x.status === 'Conciliado');
    // Retorna a interface que será renderizada pelo React.
    return <>
        {/* Cabeçalho e identificação principal da página. */}
        <div className="page-title">
            <div>
                <div className="title-line">
                    <h1>Conciliação Bancária</h1>{demo && <DemoPill />}
                </div>
                <p>Importe extratos CSV/OFX e relacione movimentações bancárias aos lançamentos do PayControl.</p>
            </div>
        </div>
        {/* Indicadores financeiros apresentados no topo da tela. */}
        <div className="kpi-grid four">
            <Kpi icon="reconcile" label="Itens Importados" value={String(items.length)}/>
            <Kpi icon="warning" label="Pendentes" value={String(pend.length)} tone="yellow"/>
            <Kpi icon="check" label="Conciliados" value={String(conc.length)} tone="green"/>
            <Kpi icon="wallet" label="Valor Pendente" value={money(pend.reduce((a, b) => a + Math.abs(b.valor), 0))}/>
        </div>
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Importar Extrato" subtitle="Selecione a conta financeira e importe um arquivo bancário.">
            <div className="import-row">
                <Field label="Conta Financeira">
                    <select value={account} onChange={(e: any) => setAccount(e.target.value)}>{contas.map(x => <option key={x.id} value={x.id}>{x.nome}
                    </option>)}
                </select>
            </Field>
            <label className="btn btn-secondary file-btn">
                <span>Importar CSV</span>
                <input type="file" accept=".csv,text/csv" onChange={(e: any) => void upload(e, 'csv')} disabled={busy}/>
            </label>
            <label className="btn btn-secondary file-btn">
                <span>Importar OFX</span>
                <input type="file" accept=".ofx,.qfx" onChange={(e: any) => void upload(e, 'ofx')} disabled={busy}/>
            </label>
        </div>
    </Card>
    {/* Painel visual que agrupa informações relacionadas. */}
    <Card title="Movimentações para Conciliação">
        <div className="table-scroll">
            {/* Tabela usada para exibir os registros de forma estruturada. */}
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Documento</th>
                        <th>Status</th>
                        <th>Valor</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>{items.map(x => <tr key={x.id}>
                    <td>{new Date(x.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td>{x.descricao}
                    </td>
                    <td>{x.tipo}
                    </td>
                    <td>{x.documento ?? '—'}
                    </td>
                    <td>
                        <Badge tone={statusTone(x.status)}>{x.status}
                        </Badge>
                    </td>
                    <td className={`num ${x.valor >= 0 ? 'positive-text' : 'negative-text'}`}>{money(Math.abs(x.valor))}
                    </td>
                    <td>{x.status !== 'Conciliado' ? <Button variant="ghost">Vincular</Button> : '—'}
                    </td>
                </tr>)}
            </tbody>
        </table>{!items.length && <EmptyState />}
    </div>
    </Card>
    </>;
}
