// Importa as funções, componentes ou dados utilizados por este módulo.
import { ChangeEvent, useEffect, useState } from 'react';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { api, loadWithFallback } from '../api';
// Importa as funções, componentes ou dados utilizados por este módulo.
import { Badge, Button, Card, DemoPill, EmptyState, Kpi } from '../components/UI';
type Backup = {
    nome?: string;
    arquivo?: string;
    name?: string;
    tamanho?: number;
    data?: string;
    criadoEm?: string;
};
// Prepara o valor `fallback` usado pela tela.
const fallback: Backup[] = [{ nome: 'paycontrol-2026-09-27.db', tamanho: 135168, data: '2026-09-27T08:00:00' }, { nome: 'paycontrol-2026-09-26.db', tamanho: 132096, data: '2026-09-26T08:00:00' }];
// Declara o componente/função `BackupsPage`.
export default function BackupsPage() {
    // Cria um estado React para manter esta informação enquanto a tela estiver aberta.
    const [items, setItems] = useState<Backup[]>(fallback), [demo, setDemo] = useState(false), [busy, setBusy] = useState(false);
    async function load() { const r = await loadWithFallback(() => api.get<Backup[]>('/api/backups'), fallback); setItems(r.data); setDemo(r.demo); }
    // Executa este efeito quando o componente é carregado ou quando suas dependências mudam.
    useEffect(() => { void load(); }, []);
    async function create() { setBusy(true); try {
        // Prepara o valor `r` usado pela tela.
        const r = await api.post<{
            arquivo: string;
        }>('/api/backups');
        alert(`Backup criado: ${r.arquivo}`);
        // Aguarda a resposta assíncrona antes de continuar.
        await load();
    }
    // Trata uma eventual falha sem interromper a experiência do usuário.
    catch (err) {
        // Valida a condição antes de continuar com a ação.
        if (demo)
            alert('Modo demonstrativo: a criação real do backup requer a API ativa.');
        else
            alert(err instanceof Error ? err.message : 'Erro');
    }
    finally {
        // Atualiza o estado React com o valor recém-processado.
        setBusy(false);
    } }
    async function restore(e: ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (!file)
        return; if (!confirm('A restauração substituirá o banco atual. Deseja continuar?'))
        return; setBusy(true); try {
        // Aguarda a resposta assíncrona antes de continuar.
        await api.upload('/api/backups/restaurar', file);
        alert('Backup restaurado. Reinicie a API antes de continuar.');
    }
    // Trata uma eventual falha sem interromper a experiência do usuário.
    catch (err) {
        // Valida a condição antes de continuar com a ação.
        if (demo)
            alert('Modo demonstrativo: restauração simulada.');
        else
            alert(err instanceof Error ? err.message : 'Erro');
    }
    finally {
        // Atualiza o estado React com o valor recém-processado.
        setBusy(false);
        e.target.value = '';
    } }
    // Retorna a interface que será renderizada pelo React.
    return <>
        {/* Cabeçalho e identificação principal da página. */}
        <div className="page-title">
            <div>
                <div className="title-line">
                    <h1>Backups</h1>{demo && <DemoPill />}
                </div>
                <p>Proteja o banco local com cópias de segurança e restauração controlada.</p>
            </div>
        </div>
        {/* Indicadores financeiros apresentados no topo da tela. */}
        <div className="kpi-grid four">
            <Kpi icon="backup" label="Backups Disponíveis" value={String(items.length)}/>
            <Kpi icon="calendar" label="Rotina Automática" value="Diária" tone="green"/>
            <Kpi icon="wallet" label="Banco de Dados" value="SQLite"/>
            <Kpi icon="check" label="Status" value="Protegido" tone="green"/>
        </div>
        <div className="two-col">
            {/* Painel visual que agrupa informações relacionadas. */}
            <Card title="Ações de Backup" subtitle="Crie uma cópia antes de mudanças importantes.">
                <div className="backup-actions">
                    <Button icon="backup" onClick={() => void create()} disabled={busy}>Criar Backup Agora</Button>
                    <label className="btn btn-secondary file-btn">
                        <span>Restaurar Backup</span>
                        <input type="file" accept=".db,.sqlite,.sqlite3" onChange={(e: any) => void restore(e)} disabled={busy}/>
                    </label>
                    <div className="info-note">A restauração troca o banco em uso. Faça um backup atual antes de restaurar uma versão anterior.</div>
                </div>
            </Card>
            {/* Painel visual que agrupa informações relacionadas. */}
            <Card title="Boas práticas">
                <ul className="check-list">
                    <li>Mantenha pelo menos uma cópia fora do computador principal.</li>
                    <li>Faça backup antes de atualizações.</li>
                    <li>Teste periodicamente a restauração.</li>
                    <li>Proteja arquivos de backup contra acesso não autorizado.</li>
                </ul>
            </Card>
        </div>
        {/* Painel visual que agrupa informações relacionadas. */}
        <Card title="Histórico de Backups">
            <div className="table-scroll">
                {/* Tabela usada para exibir os registros de forma estruturada. */}
                <table>
                    <thead>
                        <tr>
                            <th>Arquivo</th>
                            <th>Data</th>
                            <th>Tamanho</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>{items.map((x, i) => <tr key={i}>
                        <td>{x.nome ?? x.arquivo ?? x.name ?? `backup-${i + 1}`}
                        </td>
                        <td>{x.data || x.criadoEm ? new Date((x.data ?? x.criadoEm)!).toLocaleString('pt-BR') : '—'}
                        </td>
                        <td>{x.tamanho ? `${Math.round(x.tamanho / 1024)} KB` : '—'}
                        </td>
                        <td>
                            <Badge tone="success">Disponível</Badge>
                        </td>
                    </tr>)}
                </tbody>
            </table>{!items.length && <EmptyState />}
        </div>
    </Card>
    </>;
}
