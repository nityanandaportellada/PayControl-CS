// Importa os recursos do namespace `PayControl.Api.Models` usados neste arquivo.
using PayControl.Api.Models;
// Define o namespace `PayControl.Api.Services`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Services;
// Declara `ConsultaFinanceiraService`, que representa uma parte do domínio do PayControl.
public sealed class ConsultaFinanceiraService(DatabaseService db,FinanceiroService fin,CadastrosService cad)
{
    // Define o método `ObterFluxoAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<object> ObterFluxoAsync(long? empresa,long? conta,DateTime? inicio,DateTime? fim,bool incluirPendentes)
    {
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,conta,inicio,fim,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,conta,inicio,fim,null);
        // Prepara o valor de `contas` que será usado nas próximas etapas do processamento.
        var contas=await cad.ListarContasFinanceirasAsync(empresa);
        // Prepara o valor de `transferencias` que será usado nas próximas etapas do processamento.
        var transferencias=await fin.ListarTransferenciasAsync(empresa,conta);
        // Prepara o valor de `saldoInicial` que será usado nas próximas etapas do processamento.
        var saldoInicial=conta.HasValue?contas.Where(x=>x.Id==conta.Value).Sum(x=>x.SaldoInicial):contas.Sum(x=>x.SaldoInicial);
        // Prepara o valor de `baseMov` que será usado nas próximas etapas do processamento.
        var baseMov=new List<(DateTime Data,string Natureza,string Origem,long Id,string Descricao,decimal Entrada,decimal Saida,string Status,long? Conta,bool Projetado)>();
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        foreach(var x in cr.Where(x=>x.Status!="Cancelado"&&(incluirPendentes||x.Status=="Recebido"))) baseMov.Add((x.DataRecebimento??x.DataVencimento,"Entrada","Receita",x.Id,x.Descricao,x.Valor,0,x.Status,x.ContaFinanceiraId,x.Status!="Recebido"));
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        foreach(var x in cp.Where(x=>x.Status!="Cancelado"&&(incluirPendentes||x.Status=="Pago"))) baseMov.Add((x.DataPagamento??x.DataVencimento,"Saída","Conta a pagar",x.Id,x.Descricao,0,x.Valor,x.Status,x.ContaFinanceiraId,x.Status!="Pago"));
        // Transferências aparecem somente no extrato de uma conta específica. No consolidado da empresa são neutras.
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(conta.HasValue)
        {
            // Percorre a sequência necessária para processar todos os itens deste fluxo.
            foreach(var x in transferencias.Where(x=>x.Status=="Efetivada"))
            {
                // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
                if(x.ContaDestinoId==conta.Value) baseMov.Add((x.Data,"Entrada","Transferência",x.Id,x.Descricao??"Transferência recebida",x.Valor,0,x.Status,conta,false));
                // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
                if(x.ContaOrigemId==conta.Value) baseMov.Add((x.Data,"Saída","Transferência",x.Id,x.Descricao??"Transferência enviada",0,x.Valor,x.Status,conta,false));
            }
        }
        // Prepara o valor de `saldo` que será usado nas próximas etapas do processamento.
        decimal saldo=saldoInicial;
        // Prepara o valor de `mov` que será usado nas próximas etapas do processamento.
        var mov=new List<MovimentoFluxo>();
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        foreach(var x in baseMov.OrderBy(x=>x.Data).ThenBy(x=>x.Id))
        {
            saldo+=x.Entrada-x.Saida;
            mov.Add(new(x.Data,x.Natureza,x.Origem,x.Id,x.Descricao,x.Entrada,x.Saida,saldo,x.Status,x.Conta,x.Projetado));
        }
        // Prepara o valor de `entradasReal` que será usado nas próximas etapas do processamento.
        var entradasReal=cr.Where(x=>x.Status=="Recebido").Sum(x=>x.Valor);
        // Prepara o valor de `saidasReal` que será usado nas próximas etapas do processamento.
        var saidasReal=cp.Where(x=>x.Status=="Pago").Sum(x=>x.Valor);
        // Prepara o valor de `entradasProj` que será usado nas próximas etapas do processamento.
        var entradasProj=cr.Where(x=>x.Status!="Cancelado").Sum(x=>x.Valor);
        // Prepara o valor de `saidasProj` que será usado nas próximas etapas do processamento.
        var saidasProj=cp.Where(x=>x.Status!="Cancelado").Sum(x=>x.Valor);
        // Prepara o valor de `transf` que será usado nas próximas etapas do processamento.
        decimal transf=0;
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(conta.HasValue) transf=transferencias.Where(x=>x.Status=="Efetivada"&&x.ContaDestinoId==conta.Value).Sum(x=>x.Valor)-transferencias.Where(x=>x.Status=="Efetivada"&&x.ContaOrigemId==conta.Value).Sum(x=>x.Valor);
        // Retorna o resultado calculado para quem chamou este método.
        return new
        {
            saldoInicial,entradasRealizadas=entradasReal,saidasRealizadas=saidasReal,saldoRealizado=saldoInicial+entradasReal-saidasReal+transf,entradasProjetadas=entradasProj,saidasProjetadas=saidasProj,saldoProjetado=saldoInicial+entradasProj-saidasProj+transf,lancamentos=mov
        }
        ;
    }
    // Define o método `ObterDashboardAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<object> ObterDashboardAsync(long? empresa)
    {
        // Prepara o valor de `hoje` que será usado nas próximas etapas do processamento.
        var hoje=DateTime.Today;
        // Prepara o valor de `mes` que será usado nas próximas etapas do processamento.
        var mes=new DateTime(hoje.Year,hoje.Month,1);
        // Prepara o valor de `fim` que será usado nas próximas etapas do processamento.
        var fim=mes.AddMonths(1).AddDays(-1);
        // Prepara o valor de `fluxo` que será usado nas próximas etapas do processamento.
        var fluxo=await ObterFluxoAsync(empresa,null,mes,fim,true);
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,null,null,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,null,null,null);
        // Prepara o valor de `saldos` que será usado nas próximas etapas do processamento.
        var saldos=await ObterSaldosContasAsync(empresa);
        // Prepara o valor de `proj` que será usado nas próximas etapas do processamento.
        var proj=new Dictionary<int,decimal>();
        // Prepara o valor de `saldoAtual` que será usado nas próximas etapas do processamento.
        var saldoAtual=saldos.Sum(x=>x.Saldo);
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        foreach(var dias in new[]
        {
            7,15,30,60,90
        }
        )
        {
            // Prepara o valor de `ate` que será usado nas próximas etapas do processamento.
            var ate=hoje.AddDays(dias);
            // Prepara o valor de `entradas` que será usado nas próximas etapas do processamento.
            var entradas=cr.Where(x=>(x.Status is "Previsto" or "Vencido")&&x.DataVencimento<=ate).Sum(x=>x.Valor);
            // Prepara o valor de `saidas` que será usado nas próximas etapas do processamento.
            var saidas=cp.Where(x=>(x.Status is "Pendente" or "Vencido")&&x.DataVencimento<=ate).Sum(x=>x.Valor);
            proj[dias]=saldoAtual+entradas-saidas;
        }
        // Retorna o resultado calculado para quem chamou este método.
        return new
        {
            // Prepara o valor de `periodo` que será usado nas próximas etapas do processamento.
            periodo=new
            {
                // Prepara o valor de `inicio` que será usado nas próximas etapas do processamento.
                inicio=mes,fim
            }
            ,fluxo,saldoAtual,saldosPorConta=saldos,contasVencidas=cp.Count(x=>x.Status=="Vencido"),receitasVencidas=cr.Count(x=>x.Status=="Vencido"),aPagarHoje=cp.Where(x=>x.Status=="Pendente"&&x.DataVencimento.Date==hoje).Sum(x=>x.Valor),aReceberHoje=cr.Where(x=>x.Status=="Previsto"&&x.DataVencimento.Date==hoje).Sum(x=>x.Valor),projecoes=proj
        }
        ;
    }
    // Define o método `ObterAlertasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<object>> ObterAlertasAsync(long? empresa)
    {
        // Prepara o valor de `h` que será usado nas próximas etapas do processamento.
        var h=DateTime.Today;
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,null,null,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,null,null,null);
        // Prepara o valor de `l` que será usado nas próximas etapas do processamento.
        var l=new List<(DateTime Data,object Item)>();
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        foreach(var x in cp.Where(x=>x.Status=="Vencido"||x.Status=="Pendente"&&x.DataVencimento<=h.AddDays(7)))l.Add((x.DataVencimento,new
        {
            // Prepara o valor de `tipo` que será usado nas próximas etapas do processamento.
            tipo="ContaPagar",x.Id,x.Descricao,x.Valor,x.DataVencimento,severidade=x.Status=="Vencido"?"Alta":"Média"
        }
        ));
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        foreach(var x in cr.Where(x=>x.Status=="Vencido"||x.Status=="Previsto"&&x.DataVencimento<=h.AddDays(7)))l.Add((x.DataVencimento,new
        {
            // Prepara o valor de `tipo` que será usado nas próximas etapas do processamento.
            tipo="ContaReceber",x.Id,x.Descricao,x.Valor,x.DataVencimento,severidade=x.Status=="Vencido"?"Alta":"Média"
        }
        ));
        // Retorna o resultado calculado para quem chamou este método.
        return l.OrderBy(x=>x.Data).Select(x=>x.Item).ToList();
    }
    // Define o método `ObterSaldosContasAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<IReadOnlyList<SaldoConta>> ObterSaldosContasAsync(long? empresa)
    {
        // Prepara o valor de `contas` que será usado nas próximas etapas do processamento.
        var contas=await cad.ListarContasFinanceirasAsync(empresa);
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,null,null,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,null,null,null);
        // Prepara o valor de `tr` que será usado nas próximas etapas do processamento.
        var tr=await fin.ListarTransferenciasAsync(empresa,null);
        // Retorna o resultado calculado para quem chamou este método.
        return contas.Select(c=>
        {
            // Prepara o valor de `saldo` que será usado nas próximas etapas do processamento.
            var saldo=c.SaldoInicial+cr.Where(x=>x.Status=="Recebido"&&x.ContaFinanceiraId==c.Id).Sum(x=>x.Valor)-cp.Where(x=>x.Status=="Pago"&&x.ContaFinanceiraId==c.Id).Sum(x=>x.Valor)+tr.Where(x=>x.Status=="Efetivada"&&x.ContaDestinoId==c.Id).Sum(x=>x.Valor)-tr.Where(x=>x.Status=="Efetivada"&&x.ContaOrigemId==c.Id).Sum(x=>x.Valor);return new SaldoConta(c.Id,c.Nome,c.Tipo,saldo);
        }
        ).ToList();
    }
}
