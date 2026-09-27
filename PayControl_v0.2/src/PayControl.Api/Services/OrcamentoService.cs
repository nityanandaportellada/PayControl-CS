// Importa os recursos do namespace `Microsoft.Data.Sqlite` usados neste arquivo.
using Microsoft.Data.Sqlite;
// Define o namespace `PayControl.Api.Services`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Services;
// Declara `OrcamentoService`, que representa uma parte do domínio do PayControl.
public sealed class OrcamentoService(DatabaseService db)
{
    // Define o método `ObterAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<decimal> ObterAsync()
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT valor FROM configuracoes WHERE chave='orcamento'";
        // Retorna o resultado calculado para quem chamou este método.
        return decimal.TryParse(Convert.ToString(await q.ExecuteScalarAsync()),out var v)?v:0;
    }
    // Define o método `DefinirAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<decimal> DefinirAsync(decimal v)
    {
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(v<0)throw new ArgumentException();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="INSERT INTO configuracoes(chave,valor) VALUES('orcamento',$v) ON CONFLICT(chave) DO UPDATE SET valor=$v";
        // Executa esta etapa técnica do acesso aos dados.
        q.Parameters.AddWithValue("$v",v.ToString(System.Globalization.CultureInfo.InvariantCulture));
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await q.ExecuteNonQueryAsync();
        // Retorna o resultado calculado para quem chamou este método.
        return v;
    }
}
