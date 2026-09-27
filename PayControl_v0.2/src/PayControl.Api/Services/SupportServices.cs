// Importa os recursos do namespace `System.Globalization` usados neste arquivo.
using System.Globalization;
// Importa os recursos do namespace `System.IO.Compression` usados neste arquivo.
using System.IO.Compression;
// Importa os recursos do namespace `System.Text` usados neste arquivo.
using System.Text;
// Importa os recursos do namespace `Microsoft.Data.Sqlite` usados neste arquivo.
using Microsoft.Data.Sqlite;
// Importa os recursos do namespace `PayControl.Api.Models` usados neste arquivo.
using PayControl.Api.Models;
// Define o namespace `PayControl.Api.Services`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Services;
// Declara `AnexosService`, que representa uma parte do domínio do PayControl.
public sealed class AnexosService(DatabaseService db,IWebHostEnvironment env)
{
    // Prepara o valor de `Root` que será usado nas próximas etapas do processamento.
    string Root=>Path.Combine(env.ContentRootPath,"data","anexos");
    // Define o método `SalvarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Anexo> SalvarAsync(string entidade,long id,IFormFile file)
    {
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(file.Length==0)throw new ArgumentException("Arquivo vazio.");
        Directory.CreateDirectory(Root);
        // Prepara o valor de `nome` que será usado nas próximas etapas do processamento.
        var nome=Guid.NewGuid().ToString("N")+Path.GetExtension(file.FileName);
        // Prepara o valor de `path` que será usado nas próximas etapas do processamento.
        var path=Path.Combine(Root,nome);
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await using(var fs=File.Create(path))await file.CopyToAsync(fs);
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="INSERT INTO anexos(entidade,entidade_id,nome_original,nome_armazenado,caminho,tipo_conteudo,tamanho,criado_em) VALUES($e,$id,$o,$n,$p,$t,$s,$d);SELECT last_insert_rowid();";
        CadastrosService.P(q,"$e",entidade);
        CadastrosService.P(q,"$id",id);
        CadastrosService.P(q,"$o",file.FileName);
        CadastrosService.P(q,"$n",nome);
        CadastrosService.P(q,"$p",path);
        CadastrosService.P(q,"$t",file.ContentType);
        CadastrosService.P(q,"$s",file.Length);
        CadastrosService.P(q,"$d",DateTime.UtcNow.ToString("O"));
        // Executa o comando e recupera o valor único retornado pela consulta.
        var aid=Convert.ToInt64(await q.ExecuteScalarAsync());
        // Retorna o resultado calculado para quem chamou este método.
        return new(aid,entidade,id,file.FileName,nome,path,file.ContentType,file.Length,DateTime.UtcNow);
    }
    // Define o método `ListarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<Anexo>> ListarAsync(string entidade,long id)
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<Anexo>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT id,entidade,entidade_id,nome_original,nome_armazenado,caminho,tipo_conteudo,tamanho,criado_em FROM anexos WHERE entidade=$e AND entidade_id=$id";
        CadastrosService.P(q,"$e",entidade);
        CadastrosService.P(q,"$id",id);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())l.Add(new(r.GetInt64(0),r.GetString(1),r.GetInt64(2),r.GetString(3),r.GetString(4),r.GetString(5),r.IsDBNull(6)?null:r.GetString(6),r.GetInt64(7),DateTime.Parse(r.GetString(8))));
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `BaixarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<(byte[] Data,string Name,string ContentType)> BaixarAsync(long id)
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT nome_original,caminho,tipo_conteudo FROM anexos WHERE id=$id";
        CadastrosService.P(q,"$id",id);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(!await r.ReadAsync())throw new KeyNotFoundException();
        return(await File.ReadAllBytesAsync(r.GetString(1)),r.GetString(0),r.IsDBNull(2)?"application/octet-stream":r.GetString(2));
    }
}
// Declara `ConciliacaoService`, que representa uma parte do domínio do PayControl.
public sealed class ConciliacaoService(DatabaseService db)
{
    // Define o método `ImportarCsvAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<int> ImportarCsvAsync(long? empresa,long conta,IFormFile file)
    {
        // Importa os recursos do namespace `var sr=new StreamReader(file.OpenReadStream(),Encoding.UTF8,true)` usados neste arquivo.
        using var sr=new StreamReader(file.OpenReadStream(),Encoding.UTF8,true);
        // Prepara o valor de `header` que será usado nas próximas etapas do processamento.
        var header=await sr.ReadLineAsync()??throw new ArgumentException("CSV vazio.");
        // Prepara o valor de `n` que será usado nas próximas etapas do processamento.
        int n=0;
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await sr.ReadLineAsync() is
        {
        }
        line)
        {
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(string.IsNullOrWhiteSpace(line))continue;
            // Prepara o valor de `p` que será usado nas próximas etapas do processamento.
            var p=line.Split(';');
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(p.Length<3)continue;
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(!DateTime.TryParse(p[0],new CultureInfo("pt-BR"),DateTimeStyles.None,out var data))continue;
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(!decimal.TryParse(p[2],NumberStyles.Any,new CultureInfo("pt-BR"),out var valor)&&!decimal.TryParse(p[2],NumberStyles.Any,CultureInfo.InvariantCulture,out valor))continue;
            // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
            var q=c.CreateCommand();
            // Define o comando SQL que será executado no banco SQLite.
            q.CommandText="INSERT INTO conciliacao_itens(empresa_id,conta_financeira_id,data,descricao,valor,tipo,documento,status,importado_em) VALUES($e,$c,$d,$ds,$v,$t,$doc,'Pendente',$i)";
            CadastrosService.P(q,"$e",empresa);
            CadastrosService.P(q,"$c",conta);
            CadastrosService.P(q,"$d",DatabaseService.Date(data));
            CadastrosService.P(q,"$ds",p[1]);
            CadastrosService.P(q,"$v",Math.Abs(valor));
            CadastrosService.P(q,"$t",valor>=0?"Entrada":"Saída");
            CadastrosService.P(q,"$doc",p.Length>3?p[3]:null);
            CadastrosService.P(q,"$i",DateTime.UtcNow.ToString("O"));
            // Executa o comando de alteração no banco e aguarda sua conclusão.
            await q.ExecuteNonQueryAsync();
            n++;
        }
        // Retorna o resultado calculado para quem chamou este método.
        return n;
    }
    // Define o método `ImportarOfxAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<int> ImportarOfxAsync(long? empresa,long conta,IFormFile file)
    {
        // Importa os recursos do namespace `var sr=new StreamReader(file.OpenReadStream(),Encoding.UTF8,true)` usados neste arquivo.
        using var sr=new StreamReader(file.OpenReadStream(),Encoding.UTF8,true);
        // Prepara o valor de `txt` que será usado nas próximas etapas do processamento.
        var txt=await sr.ReadToEndAsync();
        // Prepara o valor de `blocos` que será usado nas próximas etapas do processamento.
        var blocos=System.Text.RegularExpressions.Regex.Matches(txt,"<STMTTRN>(.*?)(?=<STMTTRN>|</BANKTRANLIST>|$)",System.Text.RegularExpressions.RegexOptions.Singleline|System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        // Prepara o valor de `n` que será usado nas próximas etapas do processamento.
        int n=0;
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        string Tag(string b,string t)
        {
            // Prepara o valor de `m` que será usado nas próximas etapas do processamento.
            var m=System.Text.RegularExpressions.Regex.Match(b,$"<{t}>([^\r\n<]+)",System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            // Retorna o resultado calculado para quem chamou este método.
            return m.Success?m.Groups[1].Value.Trim():string.Empty;
        }
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        foreach(System.Text.RegularExpressions.Match m in blocos)
        {
            // Prepara o valor de `b` que será usado nas próximas etapas do processamento.
            var b=m.Groups[1].Value;
            // Prepara o valor de `ds` que será usado nas próximas etapas do processamento.
            var ds=Tag(b,"DTPOSTED");
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(ds.Length<8||!DateTime.TryParseExact(ds[..8],"yyyyMMdd",CultureInfo.InvariantCulture,DateTimeStyles.None,out var data))continue;
            // Prepara o valor de `vs` que será usado nas próximas etapas do processamento.
            var vs=Tag(b,"TRNAMT").Replace(",",".");
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(!decimal.TryParse(vs,NumberStyles.Any,CultureInfo.InvariantCulture,out var valor))continue;
            // Prepara o valor de `desc` que será usado nas próximas etapas do processamento.
            var desc=Tag(b,"MEMO");
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(string.IsNullOrWhiteSpace(desc))desc=Tag(b,"NAME");
            // Prepara o valor de `doc` que será usado nas próximas etapas do processamento.
            var doc=Tag(b,"FITID");
            // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
            var q=c.CreateCommand();
            // Define o comando SQL que será executado no banco SQLite.
            q.CommandText="INSERT INTO conciliacao_itens(empresa_id,conta_financeira_id,data,descricao,valor,tipo,documento,status,importado_em) VALUES($e,$c,$d,$ds,$v,$t,$doc,'Pendente',$i)";
            CadastrosService.P(q,"$e",empresa);
            CadastrosService.P(q,"$c",conta);
            CadastrosService.P(q,"$d",DatabaseService.Date(data));
            CadastrosService.P(q,"$ds",desc);
            CadastrosService.P(q,"$v",Math.Abs(valor));
            CadastrosService.P(q,"$t",valor>=0?"Entrada":"Saída");
            CadastrosService.P(q,"$doc",doc);
            CadastrosService.P(q,"$i",DateTime.UtcNow.ToString("O"));
            // Executa o comando de alteração no banco e aguarda sua conclusão.
            await q.ExecuteNonQueryAsync();
            n++;
        }
        // Retorna o resultado calculado para quem chamou este método.
        return n;
    }
    // Define o método `ListarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<ConciliacaoItem>> ListarAsync(long? empresa,long? conta,string? status)
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<ConciliacaoItem>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT id,empresa_id,conta_financeira_id,data,descricao,valor,tipo,documento,status,conta_pagar_id,conta_receber_id,importado_em FROM conciliacao_itens WHERE ($e IS NULL OR empresa_id=$e) AND ($c IS NULL OR conta_financeira_id=$c) AND ($s IS NULL OR status=$s) ORDER BY data";
        CadastrosService.P(q,"$e",empresa);
        CadastrosService.P(q,"$c",conta);
        CadastrosService.P(q,"$s",status);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())l.Add(new(r.GetInt64(0),r.IsDBNull(1)?null:r.GetInt64(1),r.IsDBNull(2)?null:r.GetInt64(2),DatabaseService.ParseDate(r.GetString(3)),r.GetString(4),Convert.ToDecimal(r.GetDouble(5)),r.GetString(6),r.IsDBNull(7)?null:r.GetString(7),r.GetString(8),r.IsDBNull(9)?null:r.GetInt64(9),r.IsDBNull(10)?null:r.GetInt64(10),DateTime.Parse(r.GetString(11))));
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `VincularAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task VincularAsync(long item,string entidade,long lancamento)
    {
        // Prepara o valor de `col` que será usado nas próximas etapas do processamento.
        var col=entidade.Equals("Pagar",StringComparison.OrdinalIgnoreCase)?"conta_pagar_id":entidade.Equals("Receber",StringComparison.OrdinalIgnoreCase)?"conta_receber_id":throw new ArgumentException("Entidade deve ser Pagar ou Receber.");
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText=$"UPDATE conciliacao_itens SET status='Conciliado',{col}=$l WHERE id=$id";
        CadastrosService.P(q,"$l",lancamento);
        CadastrosService.P(q,"$id",item);
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(await q.ExecuteNonQueryAsync()==0)throw new KeyNotFoundException();
    }
}
// Declara `BackupService`, que representa uma parte do domínio do PayControl.
public sealed class BackupService(DatabaseService db,IWebHostEnvironment env)
{
    // Prepara o valor de `BackupDir` que será usado nas próximas etapas do processamento.
    string BackupDir=>Path.Combine(env.ContentRootPath,"data","backups");
    string DbPath()
    {
        // Prepara o valor de `b` que será usado nas próximas etapas do processamento.
        var b=new SqliteConnectionStringBuilder(db.ConnectionString);
        // Retorna o resultado calculado para quem chamou este método.
        return Path.GetFullPath(b.DataSource);
    }
    // Define o método `CriarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<string> CriarAsync()
    {
        Directory.CreateDirectory(BackupDir);
        // Prepara o valor de `path` que será usado nas próximas etapas do processamento.
        var path=Path.Combine(BackupDir,$"paycontrol_{DateTime.Now:yyyyMMdd_HHmmss}.db");
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var src=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await src.OpenAsync();
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await using var dst=new SqliteConnection($"Data Source={path}");
        // Abre a conexão com o banco antes de executar comandos SQL.
        await dst.OpenAsync();
        src.BackupDatabase(dst);
        // Retorna o resultado calculado para quem chamou este método.
        return path;
    }
    // Define o método `Listar` e sua responsabilidade no fluxo da aplicação.
    public IReadOnlyList<object> Listar()
    {
        Directory.CreateDirectory(BackupDir);
        // Retorna o resultado calculado para quem chamou este método.
        return Directory.GetFiles(BackupDir,"*.db").OrderByDescending(x=>x).Select(x=>(object)new
        {
            // Prepara o valor de `arquivo` que será usado nas próximas etapas do processamento.
            arquivo=Path.GetFileName(x),tamanho=new FileInfo(x).Length,data=File.GetLastWriteTime(x)
        }
        ).ToList();
    }
    // Define o método `ExisteBackupDeHoje` e sua responsabilidade no fluxo da aplicação.
    public bool ExisteBackupDeHoje()
    {
        Directory.CreateDirectory(BackupDir);
        // Retorna o resultado calculado para quem chamou este método.
        return Directory.GetFiles(BackupDir,"*.db").Any(x=>File.GetLastWriteTime(x).Date==DateTime.Today);
    }
    // Define o método `RestaurarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task RestaurarAsync(IFormFile file)
    {
        // Prepara o valor de `tmp` que será usado nas próximas etapas do processamento.
        var tmp=Path.GetTempFileName();
        try
        {
            // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
            await using(var fs=File.Create(tmp))await file.CopyToAsync(fs);
            // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
            await using var src=new SqliteConnection($"Data Source={tmp};Mode=ReadOnly");
            // Abre a conexão com o banco antes de executar comandos SQL.
            await src.OpenAsync();
            // Cria uma conexão com o banco de dados usando a configuração central do sistema.
            await using var dst=db.CreateConnection();
            // Abre a conexão com o banco antes de executar comandos SQL.
            await dst.OpenAsync();
            src.BackupDatabase(dst);
        }
        finally
        {
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(File.Exists(tmp))File.Delete(tmp);
        }
    }
}
