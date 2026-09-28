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
        if(inicio.HasValue&&fim.HasValue&&inicio.Value.Date>fim.Value.Date)
            throw new ArgumentException("A data inicial não pode ser posterior à data final.");

        /*
         * Buscamos todo o histórico porque o saldo de abertura de um período
         * precisa considerar as movimentações realizadas antes de `inicio`.
         * O filtro por período é aplicado abaixo usando a data real do evento:
         * pagamento/recebimento para realizados e vencimento para projeções.
         */
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,conta,null,null,null);
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,conta,null,null,null);
        var contas=await cad.ListarContasFinanceirasAsync(empresa);
        var transferencias=await fin.ListarTransferenciasAsync(empresa,conta);

        if(conta.HasValue&&!contas.Any(x=>x.Id==conta.Value))
            throw new ArgumentException("A conta financeira informada não pertence à empresa ativa.");

        bool DentroPeriodo(DateTime data)
        {
            var d=data.Date;
            if(inicio.HasValue&&d<inicio.Value.Date)return false;
            if(fim.HasValue&&d>fim.Value.Date)return false;
            return true;
        }

        bool AntesDoPeriodo(DateTime data)=>inicio.HasValue&&data.Date<inicio.Value.Date;

        /*
         * Saldo-base cadastrado nas contas.
         */
        var saldoInicial=conta.HasValue
            ? contas.Where(x=>x.Id==conta.Value).Sum(x=>x.SaldoInicial)
            : contas.Sum(x=>x.SaldoInicial);

        /*
         * Quando existe data inicial, transforma o saldo inicial cadastrado
         * em saldo de abertura do período adicionando todo o realizado anterior.
         */
        if(inicio.HasValue)
        {
            saldoInicial+=cr
                .Where(x=>x.Status=="Recebido"&&x.DataRecebimento.HasValue&&AntesDoPeriodo(x.DataRecebimento.Value))
                .Sum(x=>x.Valor);

            saldoInicial-=cp
                .Where(x=>x.Status=="Pago"&&x.DataPagamento.HasValue&&AntesDoPeriodo(x.DataPagamento.Value))
                .Sum(x=>x.Valor);

            // No consolidado da empresa transferências são neutras.
            if(conta.HasValue)
            {
                saldoInicial+=transferencias
                    .Where(x=>x.Status=="Efetivada"&&x.ContaDestinoId==conta.Value&&AntesDoPeriodo(x.Data))
                    .Sum(x=>x.Valor);

                saldoInicial-=transferencias
                    .Where(x=>x.Status=="Efetivada"&&x.ContaOrigemId==conta.Value&&AntesDoPeriodo(x.Data))
                    .Sum(x=>x.Valor);
            }
        }

        var baseMov=new List<(DateTime Data,string Natureza,string Origem,long Id,string Descricao,decimal Entrada,decimal Saida,string Status,long? Conta,bool Projetado)>();

        /*
         * Receitas realizadas usam data de recebimento.
         * Receitas previstas usam data de vencimento.
         */
        foreach(var x in cr.Where(x=>x.Status!="Cancelado"))
        {
            if(x.Status=="Recebido")
            {
                var data=x.DataRecebimento??x.DataVencimento;
                if(DentroPeriodo(data))
                    baseMov.Add((data,"Entrada","Receita",x.Id,x.Descricao,x.Valor,0,x.Status,x.ContaFinanceiraId,false));
            }
            else if(incluirPendentes&&DentroPeriodo(x.DataVencimento))
            {
                baseMov.Add((x.DataVencimento,"Entrada","Receita",x.Id,x.Descricao,x.Valor,0,x.Status,x.ContaFinanceiraId,true));
            }
        }

        /*
         * Despesas realizadas usam data de pagamento.
         * Despesas pendentes usam data de vencimento.
         */
        foreach(var x in cp.Where(x=>x.Status!="Cancelado"))
        {
            if(x.Status=="Pago")
            {
                var data=x.DataPagamento??x.DataVencimento;
                if(DentroPeriodo(data))
                    baseMov.Add((data,"Saída","Conta a pagar",x.Id,x.Descricao,0,x.Valor,x.Status,x.ContaFinanceiraId,false));
            }
            else if(incluirPendentes&&DentroPeriodo(x.DataVencimento))
            {
                baseMov.Add((x.DataVencimento,"Saída","Conta a pagar",x.Id,x.Descricao,0,x.Valor,x.Status,x.ContaFinanceiraId,true));
            }
        }

        /*
         * Transferências aparecem somente no extrato de uma conta específica.
         * No consolidado da empresa elas não alteram o saldo total.
         */
        if(conta.HasValue)
        {
            foreach(var x in transferencias.Where(x=>x.Status=="Efetivada"&&DentroPeriodo(x.Data)))
            {
                if(x.ContaDestinoId==conta.Value)
                    baseMov.Add((x.Data,"Entrada","Transferência",x.Id,x.Descricao??"Transferência recebida",x.Valor,0,x.Status,conta,false));

                if(x.ContaOrigemId==conta.Value)
                    baseMov.Add((x.Data,"Saída","Transferência",x.Id,x.Descricao??"Transferência enviada",0,x.Valor,x.Status,conta,false));
            }
        }

        decimal saldo=saldoInicial;
        var mov=new List<MovimentoFluxo>();

        foreach(var x in baseMov.OrderBy(x=>x.Data).ThenBy(x=>x.Id))
        {
            saldo+=x.Entrada-x.Saida;
            mov.Add(new(x.Data,x.Natureza,x.Origem,x.Id,x.Descricao,x.Entrada,x.Saida,saldo,x.Status,x.Conta,x.Projetado));
        }

        var recebidasPeriodo=cr.Where(x=>x.Status=="Recebido"&&x.DataRecebimento.HasValue&&DentroPeriodo(x.DataRecebimento.Value));
        var pagasPeriodo=cp.Where(x=>x.Status=="Pago"&&x.DataPagamento.HasValue&&DentroPeriodo(x.DataPagamento.Value));
        var previstasPeriodo=cr.Where(x=>x.Status!="Cancelado"&&((x.Status=="Recebido"&&x.DataRecebimento.HasValue&&DentroPeriodo(x.DataRecebimento.Value))||(x.Status!="Recebido"&&DentroPeriodo(x.DataVencimento))));
        var despesasPeriodo=cp.Where(x=>x.Status!="Cancelado"&&((x.Status=="Pago"&&x.DataPagamento.HasValue&&DentroPeriodo(x.DataPagamento.Value))||(x.Status!="Pago"&&DentroPeriodo(x.DataVencimento))));

        var entradasReal=recebidasPeriodo.Sum(x=>x.Valor);
        var saidasReal=pagasPeriodo.Sum(x=>x.Valor);
        var entradasProj=previstasPeriodo.Sum(x=>x.Valor);
        var saidasProj=despesasPeriodo.Sum(x=>x.Valor);

        decimal transf=0;
        if(conta.HasValue)
        {
            transf=transferencias
                .Where(x=>x.Status=="Efetivada"&&DentroPeriodo(x.Data)&&x.ContaDestinoId==conta.Value)
                .Sum(x=>x.Valor)
                - transferencias
                    .Where(x=>x.Status=="Efetivada"&&DentroPeriodo(x.Data)&&x.ContaOrigemId==conta.Value)
                    .Sum(x=>x.Valor);
        }

        return new
        {
            saldoInicial,
            entradasRealizadas=entradasReal,
            saidasRealizadas=saidasReal,
            saldoRealizado=saldoInicial+entradasReal-saidasReal+transf,
            entradasProjetadas=entradasProj,
            saidasProjetadas=saidasProj,
            saldoProjetado=saldoInicial+entradasProj-saidasProj+transf,
            lancamentos=mov
        };
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
        var hoje=DateTime.Today;
        var limite=hoje.AddDays(7);
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,null,null,null);
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,null,null,null);
        var alertas=new List<(DateTime Data,object Item)>();

        foreach(var x in cp.Where(x=>x.Status=="Vencido"||(x.Status=="Pendente"&&x.DataVencimento.Date<=limite)))
        {
            var vencida=x.Status=="Vencido";
            alertas.Add((x.DataVencimento,new
            {
                level=vencida?"danger":"warning",
                title=vencida?"Conta a pagar vencida":"Conta a pagar próxima do vencimento",
                detail=$"{x.Descricao} · vencimento {x.DataVencimento:dd/MM/yyyy}",
                tipo="ContaPagar",
                x.Id
            }));
        }

        foreach(var x in cr.Where(x=>x.Status=="Vencido"||(x.Status=="Previsto"&&x.DataVencimento.Date<=limite)))
        {
            var vencida=x.Status=="Vencido";
            alertas.Add((x.DataVencimento,new
            {
                level=vencida?"danger":"warning",
                title=vencida?"Receita em atraso":"Receita próxima do vencimento",
                detail=$"{x.Descricao} · vencimento {x.DataVencimento:dd/MM/yyyy}",
                tipo="ContaReceber",
                x.Id
            }));
        }

        return alertas.OrderBy(x=>x.Data).Select(x=>x.Item).ToList();
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
