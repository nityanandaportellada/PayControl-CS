// Importa os recursos do namespace `Microsoft.Data.Sqlite` usados neste arquivo.
using Microsoft.Data.Sqlite;
// Importa os recursos do namespace `System.Globalization` usados neste arquivo.
using System.Globalization;
// Define o namespace `PayControl.Api.Services`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Services;
// Declara `DatabaseService`, que representa uma parte do domínio do PayControl.
public sealed class DatabaseService(IConfiguration configuration)
{
    // Declara este membro e deixa explícita sua responsabilidade dentro da classe.
    public string ConnectionString
    {
        get;
    }
    = configuration.GetConnectionString("PayControl") ?? "Data Source=contas.db";
    // Define o método `CreateConnection` e sua responsabilidade no fluxo da aplicação.
    public SqliteConnection CreateConnection()=>new(ConnectionString);
    // Define o método `InitializeAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task InitializeAsync()
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `cmd` que será usado nas próximas etapas do processamento.
        var cmd=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        cmd.CommandText="PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;";
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await cmd.ExecuteNonQueryAsync();
        // Define o comando SQL que será executado no banco SQLite.
        cmd.CommandText=Schema;
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await cmd.ExecuteNonQueryAsync();
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await MigrateLegacyAsync(c);
    }
    // Define o método `MigrateLegacyAsync` e sua responsabilidade no fluxo da aplicação.
    private async Task MigrateLegacyAsync(SqliteConnection c)
    {
        // Define o método `Table` e sua responsabilidade no fluxo da aplicação.
        async Task<bool> Table(string n)
        {
            // Prepara o valor de `x` que será usado nas próximas etapas do processamento.
            var x=c.CreateCommand();
            // Define o comando SQL que será executado no banco SQLite.
            x.CommandText="SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=$n";
            x.Parameters.AddWithValue("$n",n);
            // Retorna o resultado calculado para quem chamou este método.
            return Convert.ToInt32(await x.ExecuteScalarAsync())>0;
        }
        // Define o método `Count` e sua responsabilidade no fluxo da aplicação.
        async Task<long> Count(string n)
        {
            // Prepara o valor de `x` que será usado nas próximas etapas do processamento.
            var x=c.CreateCommand();
            // Define o comando SQL que será executado no banco SQLite.
            x.CommandText=$"SELECT COUNT(*) FROM {n}";
            // Retorna o resultado calculado para quem chamou este método.
            return Convert.ToInt64(await x.ExecuteScalarAsync());
        }
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(await Table("contas") && await Count("contas_pagar")==0)
        {
            // Prepara o valor de `x` que será usado nas próximas etapas do processamento.
            var x=c.CreateCommand();
            // Define o comando SQL que será executado no banco SQLite.
            x.CommandText="""
            INSERT INTO contas_pagar(descricao,valor,data_emissao,data_vencimento,status,parcela_numero,parcela_total)
            SELECT nome_conta,valor,date('now'),printf('%04d-%02d-%02d',ano_vencimento,mes_vencimento,dia_vencimento),CASE WHEN lower(status)='paga' THEN 'Pago' ELSE 'Pendente' END,1,1 FROM contas;
            """;
            try
            {
                // Executa o comando de alteração no banco e aguarda sua conclusão.
                await x.ExecuteNonQueryAsync();
            }
            catch
            {
            }
        }
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(await Table("receitas") && await Count("contas_receber")==0)
        {
            // Prepara o valor de `x` que será usado nas próximas etapas do processamento.
            var x=c.CreateCommand();
            // Define o comando SQL que será executado no banco SQLite.
            x.CommandText="""
            INSERT INTO contas_receber(descricao,tipo,valor,data_emissao,data_vencimento,status,parcela_numero,parcela_total)
            SELECT descricao,tipo,valor,date('now'),printf('%04d-%02d-%02d',ano,mes,dia),CASE WHEN lower(status)='recebida' THEN 'Recebido' ELSE 'Previsto' END,1,1 FROM receitas;
            """;
            try
            {
                // Executa o comando de alteração no banco e aguarda sua conclusão.
                await x.ExecuteNonQueryAsync();
            }
            catch
            {
            }
        }

        /*
         * ============================================================
         * MIGRAÇÃO PARA O MODELO MULTIEMPRESA
         * ============================================================
         *
         * Versões anteriores permitiam registros com empresa_id NULL.
         * Após a implantação da Empresa Ativa Global esses registros
         * deixam de aparecer nos filtros.
         *
         * A estratégia é:
         *
         * 1. utilizar a empresa de um cadastro relacionado, quando existir;
         * 2. caso não seja possível inferir, utilizar a primeira empresa
         *    cadastrada, que representa a empresa original do banco legado.
         *
         * Os UPDATEs são idempotentes: somente registros ainda sem empresa
         * são modificados.
         */
        var empresaPadraoCommand=c.CreateCommand();
        empresaPadraoCommand.CommandText="SELECT id FROM empresas ORDER BY id LIMIT 1";
        var empresaPadraoValue=await empresaPadraoCommand.ExecuteScalarAsync();

        if(empresaPadraoValue is not null && empresaPadraoValue is not DBNull)
        {
            var empresaPadrao=Convert.ToInt64(empresaPadraoValue);

            async Task MigrarEmpresaAsync(string sql)
            {
                var migration=c.CreateCommand();
                migration.CommandText=sql;
                migration.Parameters.AddWithValue("$empresa",empresaPadrao);
                await migration.ExecuteNonQueryAsync();
            }

            // Cadastros-base antigos.
            await MigrarEmpresaAsync("UPDATE clientes SET empresa_id=$empresa WHERE empresa_id IS NULL");
            await MigrarEmpresaAsync("UPDATE fornecedores SET empresa_id=$empresa WHERE empresa_id IS NULL");
            await MigrarEmpresaAsync("UPDATE categorias SET empresa_id=$empresa WHERE empresa_id IS NULL");
            await MigrarEmpresaAsync("UPDATE contas_financeiras SET empresa_id=$empresa WHERE empresa_id IS NULL");

            // Contas a pagar: tenta inferir pelos cadastros relacionados.
            await MigrarEmpresaAsync("""
                UPDATE contas_pagar
                SET empresa_id=COALESCE(
                    (SELECT empresa_id FROM fornecedores WHERE id=contas_pagar.fornecedor_id),
                    (SELECT empresa_id FROM categorias WHERE id=contas_pagar.categoria_id),
                    (SELECT empresa_id FROM contas_financeiras WHERE id=contas_pagar.conta_financeira_id),
                    $empresa
                )
                WHERE empresa_id IS NULL;
                """);

            // Contas a receber: tenta inferir pelos cadastros relacionados.
            await MigrarEmpresaAsync("""
                UPDATE contas_receber
                SET empresa_id=COALESCE(
                    (SELECT empresa_id FROM clientes WHERE id=contas_receber.cliente_id),
                    (SELECT empresa_id FROM categorias WHERE id=contas_receber.categoria_id),
                    (SELECT empresa_id FROM contas_financeiras WHERE id=contas_receber.conta_financeira_id),
                    $empresa
                )
                WHERE empresa_id IS NULL;
                """);

            // Transferências antigas.
            await MigrarEmpresaAsync("""
                UPDATE transferencias
                SET empresa_id=COALESCE(
                    (SELECT empresa_id FROM contas_financeiras WHERE id=transferencias.conta_origem_id),
                    (SELECT empresa_id FROM contas_financeiras WHERE id=transferencias.conta_destino_id),
                    $empresa
                )
                WHERE empresa_id IS NULL;
                """);

            // Recorrências antigas.
            await MigrarEmpresaAsync("""
                UPDATE recorrencias
                SET empresa_id=COALESCE(
                    (SELECT empresa_id FROM clientes WHERE id=recorrencias.cliente_id),
                    (SELECT empresa_id FROM fornecedores WHERE id=recorrencias.fornecedor_id),
                    (SELECT empresa_id FROM categorias WHERE id=recorrencias.categoria_id),
                    (SELECT empresa_id FROM contas_financeiras WHERE id=recorrencias.conta_financeira_id),
                    $empresa
                )
                WHERE empresa_id IS NULL;
                """);

            // Itens de conciliação antigos.
            await MigrarEmpresaAsync("""
                UPDATE conciliacao_itens
                SET empresa_id=COALESCE(
                    (SELECT empresa_id FROM contas_financeiras WHERE id=conciliacao_itens.conta_financeira_id),
                    $empresa
                )
                WHERE empresa_id IS NULL;
                """);
        }
    }
    // Define o método `Date` e sua responsabilidade no fluxo da aplicação.
    public static string Date(DateTime d)=>d.ToString("yyyy-MM-dd",CultureInfo.InvariantCulture);
    // Define o método `ParseDate` e sua responsabilidade no fluxo da aplicação.
    public static DateTime ParseDate(string s)=>DateTime.ParseExact(s,"yyyy-MM-dd",CultureInfo.InvariantCulture);
    // Declara este membro e deixa explícita sua responsabilidade dentro da classe.
    private const string Schema="""
    CREATE TABLE IF NOT EXISTS empresas(id INTEGER PRIMARY KEY AUTOINCREMENT,nome TEXT NOT NULL,nome_fantasia TEXT,cpf_cnpj TEXT,email TEXT,telefone TEXT,endereco TEXT,ativa INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS clientes(id INTEGER PRIMARY KEY AUTOINCREMENT,empresa_id INTEGER,nome TEXT NOT NULL,cpf_cnpj TEXT,email TEXT,telefone TEXT,endereco TEXT,observacoes TEXT,ativo INTEGER NOT NULL DEFAULT 1,FOREIGN KEY(empresa_id) REFERENCES empresas(id));
    CREATE TABLE IF NOT EXISTS fornecedores(id INTEGER PRIMARY KEY AUTOINCREMENT,empresa_id INTEGER,nome TEXT NOT NULL,cpf_cnpj TEXT,email TEXT,telefone TEXT,endereco TEXT,observacoes TEXT,ativo INTEGER NOT NULL DEFAULT 1,FOREIGN KEY(empresa_id) REFERENCES empresas(id));
    CREATE TABLE IF NOT EXISTS categorias(id INTEGER PRIMARY KEY AUTOINCREMENT,empresa_id INTEGER,nome TEXT NOT NULL,tipo TEXT NOT NULL,categoria_pai_id INTEGER,codigo TEXT,ativa INTEGER NOT NULL DEFAULT 1,FOREIGN KEY(empresa_id) REFERENCES empresas(id),FOREIGN KEY(categoria_pai_id) REFERENCES categorias(id));
    CREATE TABLE IF NOT EXISTS contas_financeiras(id INTEGER PRIMARY KEY AUTOINCREMENT,empresa_id INTEGER,nome TEXT NOT NULL,tipo TEXT NOT NULL,instituicao TEXT,agencia TEXT,numero_conta TEXT,saldo_inicial REAL NOT NULL DEFAULT 0,ativa INTEGER NOT NULL DEFAULT 1,FOREIGN KEY(empresa_id) REFERENCES empresas(id));
    CREATE TABLE IF NOT EXISTS recorrencias(id INTEGER PRIMARY KEY AUTOINCREMENT,empresa_id INTEGER,natureza TEXT NOT NULL,descricao TEXT NOT NULL,valor REAL NOT NULL,frequencia TEXT NOT NULL,proxima_data TEXT NOT NULL,data_fim TEXT,cliente_id INTEGER,fornecedor_id INTEGER,categoria_id INTEGER,conta_financeira_id INTEGER,tipo_receita TEXT,forma_pagamento TEXT,ativa INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS contas_pagar(id INTEGER PRIMARY KEY AUTOINCREMENT,empresa_id INTEGER,fornecedor_id INTEGER,categoria_id INTEGER,conta_financeira_id INTEGER,descricao TEXT NOT NULL,valor REAL NOT NULL,data_emissao TEXT NOT NULL,data_vencimento TEXT NOT NULL,data_pagamento TEXT,status TEXT NOT NULL DEFAULT 'Pendente',forma_pagamento TEXT,numero_documento TEXT,serie_documento TEXT,chave_fiscal TEXT,observacoes TEXT,parcela_numero INTEGER NOT NULL DEFAULT 1,parcela_total INTEGER NOT NULL DEFAULT 1,grupo_parcelamento_id TEXT,recorrencia_id INTEGER,motivo_cancelamento TEXT);
    CREATE TABLE IF NOT EXISTS contas_receber(id INTEGER PRIMARY KEY AUTOINCREMENT,empresa_id INTEGER,cliente_id INTEGER,categoria_id INTEGER,conta_financeira_id INTEGER,descricao TEXT NOT NULL,tipo TEXT NOT NULL DEFAULT 'Venda',valor REAL NOT NULL,data_emissao TEXT NOT NULL,data_vencimento TEXT NOT NULL,data_recebimento TEXT,status TEXT NOT NULL DEFAULT 'Previsto',forma_recebimento TEXT,numero_documento TEXT,serie_documento TEXT,chave_fiscal TEXT,observacoes TEXT,parcela_numero INTEGER NOT NULL DEFAULT 1,parcela_total INTEGER NOT NULL DEFAULT 1,grupo_parcelamento_id TEXT,recorrencia_id INTEGER,motivo_cancelamento TEXT);
    CREATE TABLE IF NOT EXISTS transferencias(id INTEGER PRIMARY KEY AUTOINCREMENT,empresa_id INTEGER,conta_origem_id INTEGER NOT NULL,conta_destino_id INTEGER NOT NULL,valor REAL NOT NULL,data TEXT NOT NULL,descricao TEXT,status TEXT NOT NULL DEFAULT 'Efetivada',motivo_cancelamento TEXT);
    CREATE TABLE IF NOT EXISTS anexos(id INTEGER PRIMARY KEY AUTOINCREMENT,entidade TEXT NOT NULL,entidade_id INTEGER NOT NULL,nome_original TEXT NOT NULL,nome_armazenado TEXT NOT NULL,caminho TEXT NOT NULL,tipo_conteudo TEXT,tamanho INTEGER NOT NULL,criado_em TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS eventos_financeiros(id INTEGER PRIMARY KEY AUTOINCREMENT,entidade TEXT NOT NULL,entidade_id INTEGER NOT NULL,evento TEXT NOT NULL,observacao TEXT,criado_em TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS conciliacao_itens(id INTEGER PRIMARY KEY AUTOINCREMENT,empresa_id INTEGER,conta_financeira_id INTEGER,data TEXT NOT NULL,descricao TEXT NOT NULL,valor REAL NOT NULL,tipo TEXT NOT NULL,documento TEXT,status TEXT NOT NULL DEFAULT 'Pendente',conta_pagar_id INTEGER,conta_receber_id INTEGER,importado_em TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS configuracoes(chave TEXT PRIMARY KEY,valor TEXT NOT NULL);
    INSERT OR IGNORE INTO configuracoes(chave,valor) VALUES('orcamento','0');
    CREATE INDEX IF NOT EXISTS idx_cp_vencimento ON contas_pagar(data_vencimento,status);
    CREATE INDEX IF NOT EXISTS idx_cr_vencimento ON contas_receber(data_vencimento,status);
    CREATE INDEX IF NOT EXISTS idx_cp_empresa ON contas_pagar(empresa_id);
    CREATE INDEX IF NOT EXISTS idx_cr_empresa ON contas_receber(empresa_id);
    """;
}
