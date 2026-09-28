// Importa os recursos do namespace `Microsoft.Data.Sqlite` usados neste arquivo.
using Microsoft.Data.Sqlite;
// Importa os recursos do namespace `PayControl.Api.Dtos` usados neste arquivo.
using PayControl.Api.Dtos;
// Importa os recursos do namespace `PayControl.Api.Models` usados neste arquivo.
using PayControl.Api.Models;
// Define o namespace `PayControl.Api.Services`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Services;
// Declara `FinanceiroService`, que representa uma parte do domínio do PayControl.
public sealed class FinanceiroService(DatabaseService db)
{
    // Define o método `P` e sua responsabilidade no fluxo da aplicação.
    static void P(SqliteCommand q,string n,object? v)=>CadastrosService.P(q,n,v);
    // Define o método `S` e sua responsabilidade no fluxo da aplicação.
    static string? S(SqliteDataReader r,int i)=>r.IsDBNull(i)?null:r.GetString(i);
    // Define o método `L` e sua responsabilidade no fluxo da aplicação.
    static long? L(SqliteDataReader r,int i)=>r.IsDBNull(i)?null:r.GetInt64(i);
    // Define o método `D` e sua responsabilidade no fluxo da aplicação.
    static decimal D(SqliteDataReader r,int i)=>Convert.ToDecimal(r.GetDouble(i));
    // Define o método `StatusPagar` e sua responsabilidade no fluxo da aplicação.
    static string StatusPagar(ContaPagar x)=>x.Status=="Pendente"&&x.DataVencimento.Date<DateTime.Today?"Vencido":x.Status;
    // Define o método `StatusReceber` e sua responsabilidade no fluxo da aplicação.
    static string StatusReceber(ContaReceber x)=>x.Status=="Previsto"&&x.DataVencimento.Date<DateTime.Today?"Vencido":x.Status;
    // Define o método `ListarContasPagarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<ContaPagar>> ListarContasPagarAsync(long? empresa,string? status,long? fornecedor,long? categoria,long? conta,DateTime? inicio,DateTime? fim,string? busca)
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<ContaPagar>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="""SELECT id,empresa_id,fornecedor_id,categoria_id,conta_financeira_id,descricao,valor,data_emissao,data_vencimento,data_pagamento,status,forma_pagamento,numero_documento,serie_documento,chave_fiscal,observacoes,parcela_numero,parcela_total,grupo_parcelamento_id,recorrencia_id FROM contas_pagar WHERE ($e IS NULL OR empresa_id=$e) AND ($f IS NULL OR fornecedor_id=$f) AND ($cat IS NULL OR categoria_id=$cat) AND ($cf IS NULL OR conta_financeira_id=$cf) AND ($ini IS NULL OR data_vencimento >= $ini) AND ($fim IS NULL OR data_vencimento <= $fim) AND ($b IS NULL OR lower(descricao) LIKE '%'||lower($b)||'%') ORDER BY data_vencimento,id""";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",empresa);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$f",fornecedor);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cat",categoria);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cf",conta);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ini",inicio.HasValue?DatabaseService.Date(inicio.Value):null);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$fim",fim.HasValue?DatabaseService.Date(fim.Value):null);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$b",busca);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())
        {
            // Prepara o valor de `x` que será usado nas próximas etapas do processamento.
            var x=MapPagar(r);
            // Prepara o valor de `x` que será usado nas próximas etapas do processamento.
            x=x with
            {
                // Prepara o valor de `Status` que será usado nas próximas etapas do processamento.
                Status=StatusPagar(x)
            }
            ;
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(status is null||x.Status.Equals(status,StringComparison.OrdinalIgnoreCase))l.Add(x);
        }
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `ObterContaPagarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaPagar?> ObterContaPagarAsync(long id,long? empresaId=null)=>(await ListarContasPagarAsync(empresaId,null,null,null,null,null,null,null)).FirstOrDefault(x=>x.Id==id);
    // Define o método `CriarContasPagarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<ContaPagar>> CriarContasPagarAsync(CriarContaPagarRequest x)
    {
        Validar(x.Descricao,x.Valor,x.DataEmissao,x.DataVencimento,x.Parcelas);
        await ValidarVinculosPagarAsync(x.EmpresaId,x.FornecedorId,x.CategoriaId,x.ContaFinanceiraId,true);
        // Prepara o valor de `grupo` que será usado nas próximas etapas do processamento.
        var grupo=x.Parcelas>1?Guid.NewGuid().ToString("N"):null;
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<ContaPagar>();
        // Prepara o valor de `total` que será usado nas próximas etapas do processamento.
        var total=x.Valor;
        // Prepara o valor de `basev` que será usado nas próximas etapas do processamento.
        var basev=Math.Round(total/x.Parcelas,2);
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        for(int i=1;i<=x.Parcelas;i++)
        {
            // Prepara o valor de `v` que será usado nas próximas etapas do processamento.
            var v=i==x.Parcelas?total-basev*(x.Parcelas-1):basev;
            // Prepara o valor de `venc` que será usado nas próximas etapas do processamento.
            var venc=x.DataVencimento.AddMonths(i-1);
            l.Add(await InsertPagar(x,v,venc,i,x.Parcelas,grupo,null));
        }
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(!string.IsNullOrWhiteSpace(x.FrequenciaRecorrencia))await CriarRecorrenciaInterna(x.EmpresaId,"Pagar",x.Descricao,x.Valor,x.FrequenciaRecorrencia!,x.DataVencimento.AddMonths(1),x.RecorrenciaAte,null,x.FornecedorId,x.CategoriaId,x.ContaFinanceiraId,null,x.FormaPagamento);
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `InsertPagar` e sua responsabilidade no fluxo da aplicação.
    async Task<ContaPagar> InsertPagar(CriarContaPagarRequest x,decimal valor,DateTime venc,int pn,int pt,string? grupo,long? recorrencia)
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="""INSERT INTO contas_pagar(empresa_id,fornecedor_id,categoria_id,conta_financeira_id,descricao,valor,data_emissao,data_vencimento,status,forma_pagamento,numero_documento,serie_documento,chave_fiscal,observacoes,parcela_numero,parcela_total,grupo_parcelamento_id,recorrencia_id) VALUES($e,$f,$cat,$cf,$d,$v,$em,$ve,'Pendente',$fp,$nd,$sd,$ch,$o,$pn,$pt,$g,$r);SELECT last_insert_rowid();""";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.EmpresaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$f",x.FornecedorId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cat",x.CategoriaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cf",x.ContaFinanceiraId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",x.Descricao.Trim());
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$v",valor);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$em",DatabaseService.Date(x.DataEmissao));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ve",DatabaseService.Date(venc));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$fp",x.FormaPagamento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$nd",x.NumeroDocumento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$sd",x.SerieDocumento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ch",x.ChaveFiscal);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$o",x.Observacoes);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$pn",pn);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$pt",pt);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$g",grupo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$r",recorrencia);
        // Executa o comando e recupera o valor único retornado pela consulta.
        var id=Convert.ToInt64(await q.ExecuteScalarAsync());
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Evento(c,"ContaPagar",id,"Criado",null);
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterContaPagarAsync(id))!;
    }
    // Define o método `AtualizarContaPagarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaPagar> AtualizarContaPagarAsync(long id,AtualizarContaPagarRequest x,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterContaPagarAsync(id,empresaId)??throw new KeyNotFoundException("Conta a pagar não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status is "Pago" or "Cancelado")throw new InvalidOperationException("Lançamento liquidado/cancelado não pode ser editado; use estorno/cancelamento quando aplicável.");
        // Prepara o valor de `n` que será usado nas próximas etapas do processamento.
        var n=a with
        {
            // Prepara o valor de `FornecedorId` que será usado nas próximas etapas do processamento.
            FornecedorId=x.FornecedorId??a.FornecedorId,CategoriaId=x.CategoriaId??a.CategoriaId,ContaFinanceiraId=x.ContaFinanceiraId??a.ContaFinanceiraId,Descricao=x.Descricao??a.Descricao,Valor=x.Valor??a.Valor,DataEmissao=x.DataEmissao??a.DataEmissao,DataVencimento=x.DataVencimento??a.DataVencimento,FormaPagamento=x.FormaPagamento??a.FormaPagamento,NumeroDocumento=x.NumeroDocumento??a.NumeroDocumento,SerieDocumento=x.SerieDocumento??a.SerieDocumento,ChaveFiscal=x.ChaveFiscal??a.ChaveFiscal,Observacoes=x.Observacoes??a.Observacoes
        }
        ;
        Validar(n.Descricao,n.Valor,n.DataEmissao,n.DataVencimento,1);
        await ValidarVinculosPagarAsync(a.EmpresaId,n.FornecedorId,n.CategoriaId,n.ContaFinanceiraId,false);
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="UPDATE contas_pagar SET fornecedor_id=$f,categoria_id=$cat,conta_financeira_id=$cf,descricao=$d,valor=$v,data_emissao=$em,data_vencimento=$ve,forma_pagamento=$fp,numero_documento=$nd,serie_documento=$sd,chave_fiscal=$ch,observacoes=$o WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$f",n.FornecedorId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cat",n.CategoriaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cf",n.ContaFinanceiraId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",n.Descricao);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$v",n.Valor);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$em",DatabaseService.Date(n.DataEmissao));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ve",DatabaseService.Date(n.DataVencimento));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$fp",n.FormaPagamento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$nd",n.NumeroDocumento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$sd",n.SerieDocumento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ch",n.ChaveFiscal);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$o",n.Observacoes);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await q.ExecuteNonQueryAsync();
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Evento(c,"ContaPagar",id,"Alterado",null);
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterContaPagarAsync(id))!;
    }
    // Define o método `PagarAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaPagar> PagarAsync(long id,LiquidarRequest x,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterContaPagarAsync(id,empresaId)??throw new KeyNotFoundException("Conta a pagar não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status=="Pago")throw new InvalidOperationException("Conta já paga.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status=="Cancelado")throw new InvalidOperationException("Conta cancelada.");
        // Prepara o valor de `data` que será usado nas próximas etapas do processamento.
        var data=x.Data??DateTime.Today;
        var contaPagamento=x.ContaFinanceiraId??a.ContaFinanceiraId;
        if(!contaPagamento.HasValue)throw new ArgumentException("Conta financeira é obrigatória para registrar o pagamento.");
        await ValidarContaFinanceiraDaEmpresaAsync(a.EmpresaId,contaPagamento.Value,true);
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await UpdateStatus("contas_pagar",id,"Pago","data_pagamento",data,contaPagamento,x.FormaPagamento,"forma_pagamento");
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterContaPagarAsync(id))!;
    }
    // Define o método `CancelarContaAsync` e sua responsabilidade no fluxo da aplicação.
    public Task<ContaPagar> CancelarContaAsync(long id,string? m,long? empresaId=null)=>CancelPagar(id,m,empresaId);
    // Define o método `CancelPagar` e sua responsabilidade no fluxo da aplicação.
    async Task<ContaPagar> CancelPagar(long id,string? m,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterContaPagarAsync(id,empresaId)??throw new KeyNotFoundException("Conta a pagar não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status=="Pago")throw new InvalidOperationException("Conta paga deve ser estornada antes do cancelamento.");
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await SetCancel("contas_pagar",id,m);
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterContaPagarAsync(id))!;
    }
    // Define o método `EstornarPagamentoAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaPagar> EstornarPagamentoAsync(long id,string? motivo,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterContaPagarAsync(id,empresaId)??throw new KeyNotFoundException("Conta a pagar não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status!="Pago")throw new InvalidOperationException("Apenas conta paga pode ser estornada.");
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="UPDATE contas_pagar SET status='Pendente',data_pagamento=NULL WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await q.ExecuteNonQueryAsync();
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Evento(c,"ContaPagar",id,"Pagamento estornado",motivo);
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterContaPagarAsync(id))!;
    }
    // Define o método `ExcluirContaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task ExcluirContaAsync(long id,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterContaPagarAsync(id,empresaId)??throw new KeyNotFoundException("Conta a pagar não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status is "Pago" or "Cancelado")throw new InvalidOperationException("Lançamentos liquidados/cancelados são preservados. Use estorno/cancelamento.");
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Delete("contas_pagar",id);
    }
    // Define o método `ListarReceitasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<ContaReceber>> ListarReceitasAsync(long? empresa,string? status,string? tipo,long? cliente,long? categoria,long? conta,DateTime? inicio,DateTime? fim,string? busca)
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<ContaReceber>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="""SELECT id,empresa_id,cliente_id,categoria_id,conta_financeira_id,descricao,tipo,valor,data_emissao,data_vencimento,data_recebimento,status,forma_recebimento,numero_documento,serie_documento,chave_fiscal,observacoes,parcela_numero,parcela_total,grupo_parcelamento_id,recorrencia_id FROM contas_receber WHERE ($e IS NULL OR empresa_id=$e) AND ($cl IS NULL OR cliente_id=$cl) AND ($cat IS NULL OR categoria_id=$cat) AND ($cf IS NULL OR conta_financeira_id=$cf) AND ($t IS NULL OR lower(tipo)=lower($t)) AND ($ini IS NULL OR data_vencimento >= $ini) AND ($fim IS NULL OR data_vencimento <= $fim) AND ($b IS NULL OR lower(descricao) LIKE '%'||lower($b)||'%') ORDER BY data_vencimento,id""";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",empresa);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cl",cliente);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cat",categoria);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cf",conta);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",tipo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ini",inicio.HasValue?DatabaseService.Date(inicio.Value):null);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$fim",fim.HasValue?DatabaseService.Date(fim.Value):null);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$b",busca);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())
        {
            // Prepara o valor de `x` que será usado nas próximas etapas do processamento.
            var x=MapReceber(r);
            // Prepara o valor de `x` que será usado nas próximas etapas do processamento.
            x=x with
            {
                // Prepara o valor de `Status` que será usado nas próximas etapas do processamento.
                Status=StatusReceber(x)
            }
            ;
            // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
            if(status is null||x.Status.Equals(status,StringComparison.OrdinalIgnoreCase))l.Add(x);
        }
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `ObterReceitaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaReceber?> ObterReceitaAsync(long id,long? empresaId=null)=>(await ListarReceitasAsync(empresaId,null,null,null,null,null,null,null,null)).FirstOrDefault(x=>x.Id==id);
    // Define o método `CriarReceitasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<ContaReceber>> CriarReceitasAsync(CriarReceitaRequest x)
    {
        Validar(x.Descricao,x.Valor,x.DataEmissao,x.DataVencimento,x.Parcelas);
        await ValidarVinculosReceberAsync(x.EmpresaId,x.ClienteId,x.CategoriaId,x.ContaFinanceiraId,true);
        // Prepara o valor de `tipo` que será usado nas próximas etapas do processamento.
        var tipo=x.Tipo.Trim().ToLowerInvariant() switch
        {
            "venda"=>"Venda","serviço" or "servico"=>"Serviço",_=>"Outras"
        }
        ;
        // Prepara o valor de `grupo` que será usado nas próximas etapas do processamento.
        var grupo=x.Parcelas>1?Guid.NewGuid().ToString("N"):null;
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<ContaReceber>();
        // Prepara o valor de `basev` que será usado nas próximas etapas do processamento.
        var basev=Math.Round(x.Valor/x.Parcelas,2);
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        for(int i=1;i<=x.Parcelas;i++)
        {
            // Prepara o valor de `v` que será usado nas próximas etapas do processamento.
            var v=i==x.Parcelas?x.Valor-basev*(x.Parcelas-1):basev;
            l.Add(await InsertReceber(x with
            {
                // Prepara o valor de `Tipo` que será usado nas próximas etapas do processamento.
                Tipo=tipo
            }
            ,v,x.DataVencimento.AddMonths(i-1),i,x.Parcelas,grupo,null));
        }
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(!string.IsNullOrWhiteSpace(x.FrequenciaRecorrencia))await CriarRecorrenciaInterna(x.EmpresaId,"Receber",x.Descricao,x.Valor,x.FrequenciaRecorrencia!,x.DataVencimento.AddMonths(1),x.RecorrenciaAte,x.ClienteId,null,x.CategoriaId,x.ContaFinanceiraId,tipo,x.FormaRecebimento);
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `InsertReceber` e sua responsabilidade no fluxo da aplicação.
    async Task<ContaReceber> InsertReceber(CriarReceitaRequest x,decimal valor,DateTime venc,int pn,int pt,string? grupo,long? recorrencia)
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="""INSERT INTO contas_receber(empresa_id,cliente_id,categoria_id,conta_financeira_id,descricao,tipo,valor,data_emissao,data_vencimento,status,forma_recebimento,numero_documento,serie_documento,chave_fiscal,observacoes,parcela_numero,parcela_total,grupo_parcelamento_id,recorrencia_id) VALUES($e,$cl,$cat,$cf,$d,$t,$v,$em,$ve,'Previsto',$fp,$nd,$sd,$ch,$o,$pn,$pt,$g,$r);SELECT last_insert_rowid();""";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",x.EmpresaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cl",x.ClienteId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cat",x.CategoriaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cf",x.ContaFinanceiraId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",x.Descricao);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",x.Tipo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$v",valor);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$em",DatabaseService.Date(x.DataEmissao));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ve",DatabaseService.Date(venc));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$fp",x.FormaRecebimento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$nd",x.NumeroDocumento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$sd",x.SerieDocumento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ch",x.ChaveFiscal);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$o",x.Observacoes);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$pn",pn);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$pt",pt);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$g",grupo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$r",recorrencia);
        // Executa o comando e recupera o valor único retornado pela consulta.
        var id=Convert.ToInt64(await q.ExecuteScalarAsync());
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Evento(c,"ContaReceber",id,"Criado",null);
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterReceitaAsync(id))!;
    }
    // Define o método `AtualizarReceitaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaReceber> AtualizarReceitaAsync(long id,AtualizarReceitaRequest x,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterReceitaAsync(id,empresaId)??throw new KeyNotFoundException("Conta a receber não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status is "Recebido" or "Cancelado")throw new InvalidOperationException("Lançamento liquidado/cancelado não pode ser editado.");
        // Prepara o valor de `n` que será usado nas próximas etapas do processamento.
        var n=a with
        {
            // Prepara o valor de `ClienteId` que será usado nas próximas etapas do processamento.
            ClienteId=x.ClienteId??a.ClienteId,CategoriaId=x.CategoriaId??a.CategoriaId,ContaFinanceiraId=x.ContaFinanceiraId??a.ContaFinanceiraId,Descricao=x.Descricao??a.Descricao,Tipo=x.Tipo??a.Tipo,Valor=x.Valor??a.Valor,DataEmissao=x.DataEmissao??a.DataEmissao,DataVencimento=x.DataVencimento??a.DataVencimento,FormaRecebimento=x.FormaRecebimento??a.FormaRecebimento,NumeroDocumento=x.NumeroDocumento??a.NumeroDocumento,SerieDocumento=x.SerieDocumento??a.SerieDocumento,ChaveFiscal=x.ChaveFiscal??a.ChaveFiscal,Observacoes=x.Observacoes??a.Observacoes
        }
        ;
        Validar(n.Descricao,n.Valor,n.DataEmissao,n.DataVencimento,1);
        await ValidarVinculosReceberAsync(a.EmpresaId,n.ClienteId,n.CategoriaId,n.ContaFinanceiraId,false);
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="UPDATE contas_receber SET cliente_id=$cl,categoria_id=$cat,conta_financeira_id=$cf,descricao=$d,tipo=$t,valor=$v,data_emissao=$em,data_vencimento=$ve,forma_recebimento=$fp,numero_documento=$nd,serie_documento=$sd,chave_fiscal=$ch,observacoes=$o WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cl",n.ClienteId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cat",n.CategoriaId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cf",n.ContaFinanceiraId);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",n.Descricao);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",n.Tipo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$v",n.Valor);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$em",DatabaseService.Date(n.DataEmissao));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ve",DatabaseService.Date(n.DataVencimento));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$fp",n.FormaRecebimento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$nd",n.NumeroDocumento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$sd",n.SerieDocumento);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$ch",n.ChaveFiscal);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$o",n.Observacoes);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await q.ExecuteNonQueryAsync();
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Evento(c,"ContaReceber",id,"Alterado",null);
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterReceitaAsync(id))!;
    }
    // Define o método `ReceberAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaReceber> ReceberAsync(long id,LiquidarRequest x,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterReceitaAsync(id,empresaId)??throw new KeyNotFoundException("Conta a receber não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status=="Recebido")throw new InvalidOperationException("Receita já recebida.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status=="Cancelado")throw new InvalidOperationException("Receita cancelada.");
        var contaRecebimento=x.ContaFinanceiraId??a.ContaFinanceiraId;
        if(!contaRecebimento.HasValue)throw new ArgumentException("Conta financeira é obrigatória para registrar o recebimento.");
        await ValidarContaFinanceiraDaEmpresaAsync(a.EmpresaId,contaRecebimento.Value,true);
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await UpdateStatus("contas_receber",id,"Recebido","data_recebimento",x.Data??DateTime.Today,contaRecebimento,x.FormaPagamento,"forma_recebimento");
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterReceitaAsync(id))!;
    }
    // Define o método `EstornarRecebimentoAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaReceber> EstornarRecebimentoAsync(long id,string? motivo,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterReceitaAsync(id,empresaId)??throw new KeyNotFoundException("Conta a receber não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status!="Recebido")throw new InvalidOperationException("Apenas receita recebida pode ser estornada.");
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="UPDATE contas_receber SET status='Previsto',data_recebimento=NULL WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await q.ExecuteNonQueryAsync();
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Evento(c,"ContaReceber",id,"Recebimento estornado",motivo);
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterReceitaAsync(id))!;
    }
    // Define o método `CancelarReceitaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<ContaReceber> CancelarReceitaAsync(long id,string? m,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterReceitaAsync(id,empresaId)??throw new KeyNotFoundException("Conta a receber não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status=="Recebido")throw new InvalidOperationException("Receita recebida deve ser estornada antes do cancelamento.");
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await SetCancel("contas_receber",id,m);
        // Retorna o resultado calculado para quem chamou este método.
        return (await ObterReceitaAsync(id))!;
    }
    // Define o método `ExcluirReceitaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task ExcluirReceitaAsync(long id,long? empresaId=null)
    {
        // Prepara o valor de `a` que será usado nas próximas etapas do processamento.
        var a=await ObterReceitaAsync(id,empresaId)??throw new KeyNotFoundException("Conta a receber não encontrada para a empresa ativa.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(a.Status is "Recebido" or "Cancelado")throw new InvalidOperationException("Lançamentos liquidados/cancelados são preservados.");
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Delete("contas_receber",id);
    }
    // Define o método `ListarTransferenciasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<Transferencia>> ListarTransferenciasAsync(long? empresa,long? conta)
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<Transferencia>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT id,empresa_id,conta_origem_id,conta_destino_id,valor,data,descricao,status,motivo_cancelamento FROM transferencias WHERE ($e IS NULL OR empresa_id=$e) AND ($c IS NULL OR conta_origem_id=$c OR conta_destino_id=$c) ORDER BY data,id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",empresa);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$c",conta);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())l.Add(new(r.GetInt64(0),L(r,1),r.GetInt64(2),r.GetInt64(3),D(r,4),DatabaseService.ParseDate(r.GetString(5)),S(r,6),r.GetString(7),S(r,8)));
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `CriarTransferenciaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Transferencia> CriarTransferenciaAsync(TransferenciaRequest x)
    {
        if(x.ContaOrigemId==x.ContaDestinoId)throw new ArgumentException("A conta de origem deve ser diferente da conta de destino.");
        if(x.Valor<=0)throw new ArgumentException("O valor da transferência deve ser maior que zero.");

        var empresa=await ExigirEmpresaAtivaAsync(x.EmpresaId);
        await ValidarContaFinanceiraDaEmpresaAsync(empresa,x.ContaOrigemId,true);
        await ValidarContaFinanceiraDaEmpresaAsync(empresa,x.ContaDestinoId,true);

        // Impede que a transferência deixe a conta de origem com saldo negativo.
        var saldoOrigem=await ObterSaldoContaAsync(empresa,x.ContaOrigemId);
        if(x.Valor>saldoOrigem)
        {
            throw new InvalidOperationException(
                $"Saldo insuficiente na conta de origem. Saldo disponível: R$ {saldoOrigem:N2}."
            );
        }

        await using var c=db.CreateConnection();
        await c.OpenAsync();
        var q=c.CreateCommand();
        q.CommandText="INSERT INTO transferencias(empresa_id,conta_origem_id,conta_destino_id,valor,data,descricao) VALUES($e,$o,$d,$v,$dt,$ds);SELECT last_insert_rowid();";
        P(q,"$e",empresa);
        P(q,"$o",x.ContaOrigemId);
        P(q,"$d",x.ContaDestinoId);
        P(q,"$v",x.Valor);
        P(q,"$dt",DatabaseService.Date(x.Data));
        P(q,"$ds",x.Descricao);
        var id=Convert.ToInt64(await q.ExecuteScalarAsync());
        return (await ListarTransferenciasAsync(empresa,null)).First(z=>z.Id==id);
    }
    // Define o método `CancelarTransferenciaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Transferencia> CancelarTransferenciaAsync(long id,string? motivo,long? empresaId=null)
    {
        var transferencia=(await ListarTransferenciasAsync(empresaId,null)).FirstOrDefault(x=>x.Id==id)
            ?? throw new KeyNotFoundException("Transferência não encontrada.");

        if(transferencia.Status=="Cancelada")
        {
            throw new InvalidOperationException("Transferência já cancelada.");
        }

        var empresa=await ExigirEmpresaAtivaAsync(transferencia.EmpresaId);

        // O cancelamento retira o valor da conta de destino. Para manter a
        // regra de saldo não negativo, o destino precisa possuir esse valor.
        var saldoDestino=await ObterSaldoContaAsync(empresa,transferencia.ContaDestinoId);
        if(transferencia.Valor>saldoDestino)
        {
            throw new InvalidOperationException(
                $"Não é possível cancelar a transferência porque a conta de destino possui apenas R$ {saldoDestino:N2} disponíveis."
            );
        }

        await using var c=db.CreateConnection();
        await c.OpenAsync();
        var q=c.CreateCommand();
        q.CommandText="UPDATE transferencias SET status='Cancelada',motivo_cancelamento=$m WHERE id=$id AND status<>'Cancelada'";
        P(q,"$m",motivo);
        P(q,"$id",id);
        if(await q.ExecuteNonQueryAsync()==0)throw new InvalidOperationException("Transferência não encontrada ou já cancelada.");
        return (await ListarTransferenciasAsync(empresa,null)).First(x=>x.Id==id);
    }
    // Define o método `ListarRecorrenciasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<Recorrencia>> ListarRecorrenciasAsync(long? empresa)
    {
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<Recorrencia>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT id,empresa_id,natureza,descricao,valor,frequencia,proxima_data,data_fim,cliente_id,fornecedor_id,categoria_id,conta_financeira_id,tipo_receita,forma_pagamento,ativa FROM recorrencias WHERE ($e IS NULL OR empresa_id=$e) ORDER BY proxima_data";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",empresa);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())l.Add(new(r.GetInt64(0),L(r,1),r.GetString(2),r.GetString(3),D(r,4),r.GetString(5),DatabaseService.ParseDate(r.GetString(6)),S(r,7) is
        {
        }
        ds?DatabaseService.ParseDate(ds):null,L(r,8),L(r,9),L(r,10),L(r,11),S(r,12),S(r,13),r.GetInt64(14)==1));
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `CriarRecorrenciaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<Recorrencia> CriarRecorrenciaAsync(RecorrenciaRequest x)
    {
        await ValidarRecorrenciaAsync(x.EmpresaId,x.Natureza,x.ClienteId,x.FornecedorId,x.CategoriaId,x.ContaFinanceiraId);
        // Prepara o valor de `id` que será usado nas próximas etapas do processamento.
        var id=await CriarRecorrenciaInterna(x.EmpresaId,x.Natureza,x.Descricao,x.Valor,x.Frequencia,x.ProximaData,x.DataFim,x.ClienteId,x.FornecedorId,x.CategoriaId,x.ContaFinanceiraId,x.TipoReceita,x.FormaPagamento);
        // Retorna o resultado calculado para quem chamou este método.
        return (await ListarRecorrenciasAsync(null)).First(r=>r.Id==id);
    }
    // Define o método `CriarRecorrenciaInterna` e sua responsabilidade no fluxo da aplicação.
    async Task<long> CriarRecorrenciaInterna(long? empresa,string natureza,string desc,decimal valor,string freq,DateTime prox,DateTime? fim,long? cliente,long? fornecedor,long? cat,long? conta,string? tipo,string? forma)
    {
        NormalizarFreq(freq);
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="INSERT INTO recorrencias(empresa_id,natureza,descricao,valor,frequencia,proxima_data,data_fim,cliente_id,fornecedor_id,categoria_id,conta_financeira_id,tipo_receita,forma_pagamento,ativa) VALUES($e,$n,$d,$v,$f,$p,$fim,$cl,$for,$cat,$cf,$t,$fp,1);SELECT last_insert_rowid();";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",empresa);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$n",natureza);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",desc);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$v",valor);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$f",NormalizarFreq(freq));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$p",DatabaseService.Date(prox));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$fim",fim.HasValue?DatabaseService.Date(fim.Value):null);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cl",cliente);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$for",fornecedor);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cat",cat);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$cf",conta);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$t",tipo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$fp",forma);
        // Retorna o resultado calculado para quem chamou este método.
        return Convert.ToInt64(await q.ExecuteScalarAsync());
    }
    // Define o método `ProcessarRecorrenciasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<int> ProcessarRecorrenciasAsync(DateTime? ate,long? empresaId=null)
    {
        // Prepara o valor de `limite` que será usado nas próximas etapas do processamento.
        var limite=(ate??DateTime.Today).Date;
        // Prepara o valor de `rec` que será usado nas próximas etapas do processamento.
        var rec=(await ListarRecorrenciasAsync(empresaId)).Where(x=>x.Ativa).ToList();
        // Prepara o valor de `n` que será usado nas próximas etapas do processamento.
        int n=0;
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        foreach(var r in rec)
        {
            // Prepara o valor de `data` que será usado nas próximas etapas do processamento.
            var data=r.ProximaData;
            // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
            while(data<=limite && (!r.DataFim.HasValue||data<=r.DataFim.Value))
            {
                // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
                if(r.Natureza.Equals("Pagar",StringComparison.OrdinalIgnoreCase))
                {
                    // Prepara o valor de `req` que será usado nas próximas etapas do processamento.
                    var req=new CriarContaPagarRequest(r.EmpresaId,r.FornecedorId,r.CategoriaId,r.ContaFinanceiraId,r.Descricao,r.Valor,data,data,r.FormaPagamento,null,null,null,"Gerado por recorrência",1);
                    // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
                    await InsertPagar(req,r.Valor,data,1,1,null,r.Id);
                }
                // Executa o fluxo alternativo quando a condição anterior não é atendida.
                else
                {
                    // Prepara o valor de `req` que será usado nas próximas etapas do processamento.
                    var req=new CriarReceitaRequest(r.EmpresaId,r.ClienteId,r.CategoriaId,r.ContaFinanceiraId,r.Descricao,r.TipoReceita??"Outras",r.Valor,data,data,r.FormaPagamento,null,null,null,"Gerado por recorrência",1);
                    // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
                    await InsertReceber(req,r.Valor,data,1,1,null,r.Id);
                }
                n++;
                // Prepara o valor de `data` que será usado nas próximas etapas do processamento.
                data=Proxima(data,r.Frequencia);
            }
            // Cria uma conexão com o banco de dados usando a configuração central do sistema.
            await using var c=db.CreateConnection();
            // Abre a conexão com o banco antes de executar comandos SQL.
            await c.OpenAsync();
            // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
            var q=c.CreateCommand();
            // Define o comando SQL que será executado no banco SQLite.
            q.CommandText="UPDATE recorrencias SET proxima_data=$p,ativa=CASE WHEN data_fim IS NOT NULL AND $p>data_fim THEN 0 ELSE ativa END WHERE id=$id";
            // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
            P(q,"$p",DatabaseService.Date(data));
            // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
            P(q,"$id",r.Id);
            // Executa o comando de alteração no banco e aguarda sua conclusão.
            await q.ExecuteNonQueryAsync();
        }
        // Retorna o resultado calculado para quem chamou este método.
        return n;
    }
    // Define o método `EventosAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<EventoFinanceiro>> EventosAsync(string entidade,long id,long? empresaId=null)
    {
        if(empresaId.HasValue)
        {
            var existe=entidade.Equals("ContaPagar",StringComparison.OrdinalIgnoreCase)
                ? await ObterContaPagarAsync(id,empresaId) is not null
                : entidade.Equals("ContaReceber",StringComparison.OrdinalIgnoreCase)
                    ? await ObterReceitaAsync(id,empresaId) is not null
                    : false;

            if(!existe)
                throw new KeyNotFoundException("Lançamento não encontrado para a empresa ativa.");
        }

        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<EventoFinanceiro>();
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="SELECT id,entidade,entidade_id,evento,observacao,criado_em FROM eventos_financeiros WHERE entidade=$e AND entidade_id=$id ORDER BY id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",entidade);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Executa a consulta e obtém um leitor para percorrer os registros retornados.
        await using var r=await q.ExecuteReaderAsync();
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(await r.ReadAsync())l.Add(new(r.GetInt64(0),r.GetString(1),r.GetInt64(2),r.GetString(3),S(r,4),DateTime.Parse(r.GetString(5))));
        // Retorna o resultado calculado para quem chamou este método.
        return l;
    }
    // Define o método `UpdateStatus` e sua responsabilidade no fluxo da aplicação.
    async Task UpdateStatus(string table,long id,string status,string datecol,DateTime date,long? conta,string? forma,string formacol)
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText=$"UPDATE {table} SET status=$s,{datecol}=$d,conta_financeira_id=COALESCE($c,conta_financeira_id),{formacol}=COALESCE($f,{formacol}) WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$s",status);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$d",DatabaseService.Date(date));
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$c",conta);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$f",forma);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(await q.ExecuteNonQueryAsync()==0)throw new KeyNotFoundException();
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Evento(c,table=="contas_pagar"?"ContaPagar":"ContaReceber",id,status,null);
    }
    // Define o método `SetCancel` e sua responsabilidade no fluxo da aplicação.
    async Task SetCancel(string table,long id,string? motivo)
    {
        // Cria uma conexão com o banco de dados usando a configuração central do sistema.
        await using var c=db.CreateConnection();
        // Abre a conexão com o banco antes de executar comandos SQL.
        await c.OpenAsync();
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText=$"UPDATE {table} SET status='Cancelado',motivo_cancelamento=$m WHERE id=$id";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$m",motivo);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await q.ExecuteNonQueryAsync();
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Evento(c,table=="contas_pagar"?"ContaPagar":"ContaReceber",id,"Cancelado",motivo);
    }
    // Define o método `Delete` e sua responsabilidade no fluxo da aplicação.
    async Task Delete(string table,long id)
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
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await q.ExecuteNonQueryAsync();
    }
    // Define o método `Evento` e sua responsabilidade no fluxo da aplicação.
    static async Task Evento(SqliteConnection c,string e,long id,string ev,string? o)
    {
        // Prepara o valor de `q` que será usado nas próximas etapas do processamento.
        var q=c.CreateCommand();
        // Define o comando SQL que será executado no banco SQLite.
        q.CommandText="INSERT INTO eventos_financeiros(entidade,entidade_id,evento,observacao,criado_em) VALUES($e,$id,$v,$o,$dt)";
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$e",e);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$id",id);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$v",ev);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$o",o);
        // Associa o valor ao parâmetro SQL, mantendo a consulta parametrizada.
        P(q,"$dt",DateTime.UtcNow.ToString("O"));
        // Executa o comando de alteração no banco e aguarda sua conclusão.
        await q.ExecuteNonQueryAsync();
    }
    /*
     * ============================================================
     * INTEGRIDADE MULTIEMPRESA
     * ============================================================
     */
    async Task<long> ExigirEmpresaAtivaAsync(long? empresaId)
    {
        if(!empresaId.HasValue)throw new ArgumentException("Empresa é obrigatória.");

        await using var c=db.CreateConnection();
        await c.OpenAsync();
        var q=c.CreateCommand();
        q.CommandText="SELECT COUNT(*) FROM empresas WHERE id=$id AND ativa=1";
        P(q,"$id",empresaId.Value);

        if(Convert.ToInt32(await q.ExecuteScalarAsync())==0)
            throw new ArgumentException("A empresa informada não existe ou está inativa.");

        return empresaId.Value;
    }

    async Task ValidarVinculoEmpresaAsync(long empresaId,string table,long? id,string entidade,bool exigirAtivo,string? ativoCol="ativo")
    {
        if(!id.HasValue)return;

        await using var c=db.CreateConnection();
        await c.OpenAsync();
        var q=c.CreateCommand();

        var filtroAtivo=exigirAtivo && !string.IsNullOrWhiteSpace(ativoCol)
            ? $" AND {ativoCol}=1"
            : string.Empty;

        q.CommandText=$"SELECT COUNT(*) FROM {table} WHERE id=$id AND empresa_id=$empresa{filtroAtivo}";
        P(q,"$id",id.Value);
        P(q,"$empresa",empresaId);

        if(Convert.ToInt32(await q.ExecuteScalarAsync())==0)
            throw new ArgumentException($"{entidade} não pertence à empresa ativa, não existe ou está inativo.");
    }

    async Task ValidarCategoriaFinanceiraAsync(long empresaId,long? categoriaId,string tipoEsperado,bool exigirAtiva)
    {
        if(!categoriaId.HasValue)return;

        await using var c=db.CreateConnection();
        await c.OpenAsync();
        var q=c.CreateCommand();
        q.CommandText="SELECT COUNT(*) FROM categorias WHERE id=$id AND empresa_id=$empresa AND lower(tipo)=lower($tipo) AND ($exigirAtiva=0 OR ativa=1)";
        P(q,"$id",categoriaId.Value);
        P(q,"$empresa",empresaId);
        P(q,"$tipo",tipoEsperado);
        P(q,"$exigirAtiva",exigirAtiva?1:0);

        if(Convert.ToInt32(await q.ExecuteScalarAsync())==0)
            throw new ArgumentException($"A conta do Plano de Contas deve pertencer à empresa ativa e ser do tipo {tipoEsperado}.");
    }

    async Task ValidarContaFinanceiraDaEmpresaAsync(long? empresaId,long contaId,bool exigirAtiva)
    {
        var empresa=await ExigirEmpresaAtivaAsync(empresaId);
        await ValidarVinculoEmpresaAsync(empresa,"contas_financeiras",contaId,"Conta financeira",exigirAtiva,"ativa");
    }

    async Task ValidarVinculosPagarAsync(long? empresaId,long? fornecedorId,long? categoriaId,long? contaId,bool exigirAtivos)
    {
        var empresa=await ExigirEmpresaAtivaAsync(empresaId);
        await ValidarVinculoEmpresaAsync(empresa,"fornecedores",fornecedorId,"Fornecedor",exigirAtivos,"ativo");
        await ValidarCategoriaFinanceiraAsync(empresa,categoriaId,"Despesa",exigirAtivos);
        if(contaId.HasValue)await ValidarContaFinanceiraDaEmpresaAsync(empresa,contaId.Value,exigirAtivos);
    }

    async Task ValidarVinculosReceberAsync(long? empresaId,long? clienteId,long? categoriaId,long? contaId,bool exigirAtivos)
    {
        var empresa=await ExigirEmpresaAtivaAsync(empresaId);
        await ValidarVinculoEmpresaAsync(empresa,"clientes",clienteId,"Cliente",exigirAtivos,"ativo");
        await ValidarCategoriaFinanceiraAsync(empresa,categoriaId,"Receita",exigirAtivos);
        if(contaId.HasValue)await ValidarContaFinanceiraDaEmpresaAsync(empresa,contaId.Value,exigirAtivos);
    }

    async Task ValidarRecorrenciaAsync(long? empresaId,string natureza,long? clienteId,long? fornecedorId,long? categoriaId,long? contaId)
    {
        var empresa=await ExigirEmpresaAtivaAsync(empresaId);
        var normalizada=natureza.Trim().ToLowerInvariant();

        if(normalizada=="pagar")
        {
            if(clienteId.HasValue)throw new ArgumentException("Recorrência a pagar não pode possuir cliente.");
            await ValidarVinculoEmpresaAsync(empresa,"fornecedores",fornecedorId,"Fornecedor",true,"ativo");
            await ValidarCategoriaFinanceiraAsync(empresa,categoriaId,"Despesa",true);
        }
        else if(normalizada=="receber")
        {
            if(fornecedorId.HasValue)throw new ArgumentException("Recorrência a receber não pode possuir fornecedor.");
            await ValidarVinculoEmpresaAsync(empresa,"clientes",clienteId,"Cliente",true,"ativo");
            await ValidarCategoriaFinanceiraAsync(empresa,categoriaId,"Receita",true);
        }
        else
        {
            throw new ArgumentException("Natureza da recorrência deve ser Pagar ou Receber.");
        }

        if(contaId.HasValue)await ValidarContaFinanceiraDaEmpresaAsync(empresa,contaId.Value,true);
    }

    async Task<decimal> ObterSaldoContaAsync(long empresaId,long contaId)
    {
        await using var c=db.CreateConnection();
        await c.OpenAsync();
        var q=c.CreateCommand();
        q.CommandText="""
            SELECT
                cf.saldo_inicial
                + COALESCE((SELECT SUM(valor) FROM contas_receber WHERE empresa_id=$empresa AND conta_financeira_id=cf.id AND status='Recebido'),0)
                - COALESCE((SELECT SUM(valor) FROM contas_pagar WHERE empresa_id=$empresa AND conta_financeira_id=cf.id AND status='Pago'),0)
                + COALESCE((SELECT SUM(valor) FROM transferencias WHERE empresa_id=$empresa AND conta_destino_id=cf.id AND status='Efetivada'),0)
                - COALESCE((SELECT SUM(valor) FROM transferencias WHERE empresa_id=$empresa AND conta_origem_id=cf.id AND status='Efetivada'),0)
            FROM contas_financeiras cf
            WHERE cf.id=$conta AND cf.empresa_id=$empresa;
            """;
        P(q,"$empresa",empresaId);
        P(q,"$conta",contaId);

        var valor=await q.ExecuteScalarAsync();
        if(valor is null or DBNull)throw new ArgumentException("Conta financeira não pertence à empresa ativa.");
        return Convert.ToDecimal(valor);
    }

    // Define o método `Validar` e sua responsabilidade no fluxo da aplicação.
    static void Validar(string d,decimal v,DateTime e,DateTime venc,int parcelas)
    {
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(string.IsNullOrWhiteSpace(d))throw new ArgumentException("Descrição obrigatória.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(v<=0)throw new ArgumentException("Valor deve ser maior que zero.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(venc.Date<e.Date)throw new ArgumentException("Vencimento não pode ser anterior à emissão.");
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(parcelas<1||parcelas>360)throw new ArgumentException("Parcelas inválidas.");
    }
    // Define o método `NormalizarFreq` e sua responsabilidade no fluxo da aplicação.
    static string NormalizarFreq(string f)=>f.Trim().ToLowerInvariant() switch
    {
        "semanal"=>"Semanal","mensal"=>"Mensal","bimestral"=>"Bimestral","trimestral"=>"Trimestral","semestral"=>"Semestral","anual"=>"Anual",_=>throw new ArgumentException("Frequência inválida.")
    }
    ;
    // Define o método `Proxima` e sua responsabilidade no fluxo da aplicação.
    static DateTime Proxima(DateTime d,string f)=>f switch
    {
        "Semanal"=>d.AddDays(7),"Mensal"=>d.AddMonths(1),"Bimestral"=>d.AddMonths(2),"Trimestral"=>d.AddMonths(3),"Semestral"=>d.AddMonths(6),"Anual"=>d.AddYears(1),_=>d.AddMonths(1)
    }
    ;
    // Define o método `MapPagar` e sua responsabilidade no fluxo da aplicação.
    static ContaPagar MapPagar(SqliteDataReader r)=>new(r.GetInt64(0),L(r,1),L(r,2),L(r,3),L(r,4),r.GetString(5),D(r,6),DatabaseService.ParseDate(r.GetString(7)),DatabaseService.ParseDate(r.GetString(8)),S(r,9) is
    {
    }
    p?DatabaseService.ParseDate(p):null,r.GetString(10),S(r,11),S(r,12),S(r,13),S(r,14),S(r,15),r.GetInt32(16),r.GetInt32(17),S(r,18),L(r,19));
    // Define o método `MapReceber` e sua responsabilidade no fluxo da aplicação.
    static ContaReceber MapReceber(SqliteDataReader r)=>new(r.GetInt64(0),L(r,1),L(r,2),L(r,3),L(r,4),r.GetString(5),r.GetString(6),D(r,7),DatabaseService.ParseDate(r.GetString(8)),DatabaseService.ParseDate(r.GetString(9)),S(r,10) is
    {
    }
    p?DatabaseService.ParseDate(p):null,r.GetString(11),S(r,12),S(r,13),S(r,14),S(r,15),S(r,16),r.GetInt32(17),r.GetInt32(18),S(r,19),L(r,20));
}
