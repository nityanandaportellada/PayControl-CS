// Importa os recursos do namespace `Microsoft.Data.Sqlite` usados neste arquivo.
using Microsoft.Data.Sqlite;
// Importa os recursos do namespace `PayControl.Api.Dtos` usados neste arquivo.
using PayControl.Api.Dtos;
// Importa os recursos do namespace `PayControl.Api.Models` usados neste arquivo.
using PayControl.Api.Models;
// Define o namespace `PayControl.Api.Services`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Services;
// Declara `CadastrosService`, que representa uma parte do domínio do PayControl.
public sealed class CadastrosService(DatabaseService db)
{
    // Define o metodo `V` e sua responsabilidade no fluxo da aplicação.
    static object V(SqliteDataReader r,int i)=>r.IsDBNull(i)?DBNull.Value:r.GetValue(i);
    // Define o método `ListarEmpresasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<Empresa>> ListarEmpresasAsync()
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<Empresa>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT id,nome,nome_fantasia,cpf_cnpj,email,telefone,endereco,ativa FROM empresas ORDER BY nome";
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())l.Add(new(r.GetInt64(0),r.GetString(1),r.IsDBNull(2)?null:r.GetString(2),r.IsDBNull(3)?null:r.GetString(3),r.IsDBNull(4)?null:r.GetString(4),r.IsDBNull(5)?null:r.GetString(5),r.IsDBNull(6)?null:r.GetString(6),r.GetInt64(7)==1));
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `ObterEmpresaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Empresa?> ObterEmpresaAsync(long id)=>(await ListarEmpresasAsync()).FirstOrDefault(x=>x.Id==id);
    // Define o método `CriarEmpresaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Empresa> CriarEmpresaAsync(EmpresaRequest x)
    {
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(string.IsNullOrWhiteSpace(x.Nome))throw new ArgumentException("Nome obrigatório.");
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="INSERT INTO empresas(nome,nome_fantasia,cpf_cnpj,email,telefone,endereco,ativa) VALUES($n,$f,$d,$e,$t,$a,$at);SELECT last_insert_rowid();";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$n",x.Nome.Trim());
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$f",x.NomeFantasia);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",x.CpfCnpj);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.Email);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",x.Telefone);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$a",x.Endereco);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$at",x.Ativa?1:0);
        // Executa o comando e recupera o valor único retornado pela consulta.
        var id=Convert.ToInt64(await q.ExecuteScalarAsync());
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterEmpresaAsync(id))!;
    }
    // Define o método `AtualizarEmpresaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Empresa> AtualizarEmpresaAsync(long id,EmpresaRequest x)
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="UPDATE empresas SET nome=$n,nome_fantasia=$f,cpf_cnpj=$d,email=$e,telefone=$t,endereco=$a,ativa=$at WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$n",x.Nome);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$f",x.NomeFantasia);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",x.CpfCnpj);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.Email);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",x.Telefone);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$a",x.Endereco);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$at",x.Ativa?1:0);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(await q.ExecuteNonQueryAsync()==0)throw new KeyNotFoundException("Empresa não encontrada.");
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterEmpresaAsync(id))!;
    }
    // Define o método `ListarClientesAsync` e sua responsabilidade no fluxo da aplicação.
    public Task<IReadOnlyList<Cliente>> ListarClientesAsync(long? e)=>ListarPessoas<Cliente>("clientes",e,(r)=>new(r.GetInt64(0),NLong(r,1),r.GetString(2),NStr(r,3),NStr(r,4),NStr(r,5),NStr(r,6),NStr(r,7),r.GetInt64(8)==1));
    // Define o método `ObterClienteAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Cliente?> ObterClienteAsync(long id)=>(await ListarClientesAsync(null)).FirstOrDefault(x=>x.Id==id);
    // Define o método `CriarClienteAsync` e sua responsabilidade no fluxo da aplicação.
    public Task<Cliente> CriarClienteAsync(PessoaRequest x)=>CriarPessoa("clientes",x,ObterClienteAsync);
    // Define o método `AtualizarClienteAsync` e sua responsabilidade no fluxo da aplicação.
    public Task<Cliente> AtualizarClienteAsync(long id,PessoaRequest x)=>AtualizarPessoa("clientes",id,x,ObterClienteAsync);
    // Define o método `ListarFornecedoresAsync` e sua responsabilidade no fluxo da aplicação.
    public Task<IReadOnlyList<Fornecedor>> ListarFornecedoresAsync(long? e)=>ListarPessoas<Fornecedor>("fornecedores",e,(r)=>new(r.GetInt64(0),NLong(r,1),r.GetString(2),NStr(r,3),NStr(r,4),NStr(r,5),NStr(r,6),NStr(r,7),r.GetInt64(8)==1));
    // Define o método `ObterFornecedorAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Fornecedor?> ObterFornecedorAsync(long id)=>(await ListarFornecedoresAsync(null)).FirstOrDefault(x=>x.Id==id);
    // Define o método `CriarFornecedorAsync` e sua responsabilidade no fluxo da aplicação.
    public Task<Fornecedor> CriarFornecedorAsync(PessoaRequest x)=>CriarPessoa("fornecedores",x,ObterFornecedorAsync);
    // Define o método `AtualizarFornecedorAsync` e sua responsabilidade no fluxo da aplicação.
    public Task<Fornecedor> AtualizarFornecedorAsync(long id,PessoaRequest x)=>AtualizarPessoa("fornecedores",id,x,ObterFornecedorAsync);
    // Define o método `abaixo` e sua responsabilidade no fluxo da aplicação.
    async Task<IReadOnlyList<T>> ListarPessoas<T>(string table,long? empresa,Func<SqliteDataReader,T> map)
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<T>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText=$"SELECT id,empresa_id,nome,cpf_cnpj,email,telefone,endereco,observacoes,ativo FROM {table}"+(empresa.HasValue?" WHERE empresa_id=$e":"")+" ORDER BY nome";
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(empresa.HasValue)P(q,"$e",empresa.Value);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())l.Add(map(r));
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `abaixo` e sua responsabilidade no fluxo da aplicação.
    async Task<T> CriarPessoa<T>(string table,PessoaRequest x,Func<long,Task<T?>> getter) where T:class
    {
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(string.IsNullOrWhiteSpace(x.Nome))throw new ArgumentException("Nome obrigatório.");
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText=$"INSERT INTO {table}(empresa_id,nome,cpf_cnpj,email,telefone,endereco,observacoes,ativo) VALUES($e,$n,$d,$em,$t,$a,$o,$at);SELECT last_insert_rowid();";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.EmpresaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$n",x.Nome.Trim());
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",x.CpfCnpj);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$em",x.Email);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",x.Telefone);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$a",x.Endereco);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$o",x.Observacoes);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$at",x.Ativo?1:0);
        // Executa o comando e recupera o valor único retornado pela consulta.
        var id=Convert.ToInt64(await q.ExecuteScalarAsync());
        // Retorna o resultado calculado para quem chamou este método.
        return (await getter(id))!;
    }
    // Define o método `abaixo` e sua responsabilidade no fluxo da aplicação.
    async Task<T> AtualizarPessoa<T>(string table,long id,PessoaRequest x,Func<long,Task<T?>> getter) where T:class
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText=$"UPDATE {table} SET empresa_id=$e,nome=$n,cpf_cnpj=$d,email=$em,telefone=$t,endereco=$a,observacoes=$o,ativo=$at WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.EmpresaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$n",x.Nome);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",x.CpfCnpj);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$em",x.Email);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",x.Telefone);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$a",x.Endereco);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$o",x.Observacoes);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$at",x.Ativo?1:0);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(await q.ExecuteNonQueryAsync()==0)throw new KeyNotFoundException("Cadastro não encontrado.");
        // Retorna o resultado calculado para quem chamou este método.
        return (await getter(id))!;
    }
    // Define o método `ListarCategoriasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<Categoria>> ListarCategoriasAsync(long? empresa,string? tipo)
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<Categoria>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT id,empresa_id,nome,tipo,categoria_pai_id,codigo,ativa FROM categorias WHERE ($e IS NULL OR empresa_id=$e) AND ($t IS NULL OR lower(tipo)=lower($t)) ORDER BY COALESCE(codigo,''),nome";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",empresa);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",tipo);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())l.Add(new(r.GetInt64(0),NLong(r,1),r.GetString(2),r.GetString(3),NLong(r,4),NStr(r,5),r.GetInt64(6)==1));
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `ObterCategoriaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Categoria?> ObterCategoriaAsync(long id)=>(await ListarCategoriasAsync(null,null)).FirstOrDefault(x=>x.Id==id);
    // Define o método `CriarCategoriaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Categoria> CriarCategoriaAsync(CategoriaRequest x)
    {
        // Prepara o valor de `tipo` que será usado nas próximas etapas do processamento.
        var tipo=TipoCategoria(x.Tipo);
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="INSERT INTO categorias(empresa_id,nome,tipo,categoria_pai_id,codigo,ativa) VALUES($e,$n,$t,$p,$c,$a);SELECT last_insert_rowid();";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.EmpresaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$n",x.Nome);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",tipo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$p",x.CategoriaPaiId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$c",x.Codigo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$a",x.Ativa?1:0);
        // Executa o comando e recupera o valor único retornado pela consulta.
        var id=Convert.ToInt64(await q.ExecuteScalarAsync());
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterCategoriaAsync(id))!;
    }
    // Define o método `AtualizarCategoriaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Categoria> AtualizarCategoriaAsync(long id,CategoriaRequest x)
    {
        // Prepara o valor de `tipo` que será usado nas próximas etapas do processamento.
        var tipo=TipoCategoria(x.Tipo);
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="UPDATE categorias SET empresa_id=$e,nome=$n,tipo=$t,categoria_pai_id=$p,codigo=$c,ativa=$a WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.EmpresaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$n",x.Nome);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",tipo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$p",x.CategoriaPaiId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$c",x.Codigo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$a",x.Ativa?1:0);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(await q.ExecuteNonQueryAsync()==0)throw new KeyNotFoundException();
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterCategoriaAsync(id))!;
    }
    // Define o método `ListarContasFinanceirasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<ContaFinanceira>> ListarContasFinanceirasAsync(long? empresa)
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<ContaFinanceira>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT id,empresa_id,nome,tipo,instituicao,agencia,numero_conta,saldo_inicial,ativa FROM contas_financeiras WHERE ($e IS NULL OR empresa_id=$e) ORDER BY nome";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",empresa);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())l.Add(new(r.GetInt64(0),NLong(r,1),r.GetString(2),r.GetString(3),NStr(r,4),NStr(r,5),NStr(r,6),Convert.ToDecimal(r.GetDouble(7)),r.GetInt64(8)==1));
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `ObterContaFinanceiraAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaFinanceira?> ObterContaFinanceiraAsync(long id)=>(await ListarContasFinanceirasAsync(null)).FirstOrDefault(x=>x.Id==id);
    // Define o método `CriarContaFinanceiraAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaFinanceira> CriarContaFinanceiraAsync(ContaFinanceiraRequest x)
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="INSERT INTO contas_financeiras(empresa_id,nome,tipo,instituicao,agencia,numero_conta,saldo_inicial,ativa) VALUES($e,$n,$t,$i,$a,$c,$s,$at);SELECT last_insert_rowid();";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.EmpresaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$n",x.Nome);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",x.Tipo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$i",x.Instituicao);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$a",x.Agencia);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$c",x.NumeroConta);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$s",x.SaldoInicial);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$at",x.Ativa?1:0);
        // Executa o comando e recupera o valor único retornado pela consulta.
        var id=Convert.ToInt64(await q.ExecuteScalarAsync());
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterContaFinanceiraAsync(id))!;
    }
    // Define o método `AtualizarContaFinanceiraAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaFinanceira> AtualizarContaFinanceiraAsync(long id,ContaFinanceiraRequest x)
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="UPDATE contas_financeiras SET empresa_id=$e,nome=$n,tipo=$t,instituicao=$i,agencia=$a,numero_conta=$c,saldo_inicial=$s,ativa=$at WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.EmpresaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$n",x.Nome);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",x.Tipo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$i",x.Instituicao);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$a",x.Agencia);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$c",x.NumeroConta);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$s",x.SaldoInicial);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$at",x.Ativa?1:0);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(await q.ExecuteNonQueryAsync()==0)throw new KeyNotFoundException();
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterContaFinanceiraAsync(id))!;
    }
    // Define o método `ExcluirCadastroAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task ExcluirCadastroAsync(string table,string entidade,long id)
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText=$"DELETE FROM {table} WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        try
        {
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(await q.ExecuteNonQueryAsync()==0)throw new KeyNotFoundException($"{entidade} não encontrado.");
        }
        catch(SqliteException e) when(e.SqliteErrorCode==19)
        {
            // Interrompe a operação e informa o erro de regra de negócio encontrado.
            throw new InvalidOperationException($"{entidade} possui vínculos e não pode ser excluído; desative-o.");
        }
    }
    // Define o método `TipoCategoria` e sua responsabilidade no fluxo da aplicação.
    static string TipoCategoria(string x)=>x.Trim().ToLowerInvariant() switch
    {
        "receita"=>"Receita","despesa"=>"Despesa",_=>throw new ArgumentException("Tipo deve ser Receita ou Despesa.")
    }
    ;
    // Define o método `P` e sua responsabilidade no fluxo da aplicação.
    internal static void P(SqliteCommand q,string n,object? v)=>q.Parameters.AddWithValue(n,v??DBNull.Value);
    // Define o método `NStr` e sua responsabilidade no fluxo da aplicação.
    static string? NStr(SqliteDataReader r,int i)=>r.IsDBNull(i)?null:r.GetString(i);
    // Define o método `NLong` e sua responsabilidade no fluxo da aplicação.
    static long? NLong(SqliteDataReader r,int i)=>r.IsDBNull(i)?null:r.GetInt64(i);
}
