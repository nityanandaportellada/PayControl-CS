// Importa os recursos do namespace `System.Text` usados neste arquivo.
using System.Text;
// Importa os recursos do namespace `PayControl.Api.Models` usados neste arquivo.
using PayControl.Api.Models;
// Define o namespace `PayControl.Api.Services`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Services;
// Declara `RelatoriosService`, que representa uma parte do domínio do PayControl.
public sealed class RelatoriosService(FinanceiroService fin,ConsultaFinanceiraService consulta,CadastrosService cad)
{
    // Define o método `ResumoAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<object> ResumoAsync(long? empresa,DateTime? inicio,DateTime? fim)
    {
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,inicio,fim,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,inicio,fim,null);
        // Retorna o resultado calculado para quem chamou este método.
        return new
        {
            // Prepara o valor de `receitas` que será usado nas próximas etapas do processamento.
            receitas=new
            {
                // Prepara o valor de `total` que será usado nas próximas etapas do processamento.
                total=cr.Where(x=>x.Status!="Cancelado").Sum(x=>x.Valor),recebidas=cr.Where(x=>x.Status=="Recebido").Sum(x=>x.Valor),previstas=cr.Where(x=>x.Status is "Previsto" or "Vencido").Sum(x=>x.Valor),porTipo=cr.Where(x=>x.Status!="Cancelado").GroupBy(x=>x.Tipo).Select(g=>new
                {
                    // Prepara o valor de `tipo` que será usado nas próximas etapas do processamento.
                    tipo=g.Key,valor=g.Sum(x=>x.Valor)
                }
                )
            }
            ,despesas=new
            {
                // Prepara o valor de `total` que será usado nas próximas etapas do processamento.
                total=cp.Where(x=>x.Status!="Cancelado").Sum(x=>x.Valor),pagas=cp.Where(x=>x.Status=="Pago").Sum(x=>x.Valor),pendentes=cp.Where(x=>x.Status is "Pendente" or "Vencido").Sum(x=>x.Valor)
            }
            ,resultadoRealizado=cr.Where(x=>x.Status=="Recebido").Sum(x=>x.Valor)-cp.Where(x=>x.Status=="Pago").Sum(x=>x.Valor),resultadoProjetado=cr.Where(x=>x.Status!="Cancelado").Sum(x=>x.Valor)-cp.Where(x=>x.Status!="Cancelado").Sum(x=>x.Valor)
        }
        ;
    }
    // Define o método `DreAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<object> DreAsync(long? empresa,DateTime inicio,DateTime fim)
    {
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,inicio,fim,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,inicio,fim,null);
        // Prepara o valor de `cats` que será usado nas próximas etapas do processamento.
        var cats=await cad.ListarCategoriasAsync(empresa,null);
        string C(long? id)=>cats.FirstOrDefault(x=>x.Id==id)?.Nome??"Sem categoria";
        // Prepara o valor de `rec` que será usado nas próximas etapas do processamento.
        var rec=cr.Where(x=>x.Status!="Cancelado").GroupBy(x=>C(x.CategoriaId)).Select(g=>new
        {
            // Prepara o valor de `categoria` que será usado nas próximas etapas do processamento.
            categoria=g.Key,valor=g.Sum(x=>x.Valor)
        }
        ).ToList();
        // Prepara o valor de `desp` que será usado nas próximas etapas do processamento.
        var desp=cp.Where(x=>x.Status!="Cancelado").GroupBy(x=>C(x.CategoriaId)).Select(g=>new
        {
            // Prepara o valor de `categoria` que será usado nas próximas etapas do processamento.
            categoria=g.Key,valor=g.Sum(x=>x.Valor)
        }
        ).ToList();
        // Retorna o resultado calculado para quem chamou este método.
        return new
        {
            inicio,fim,receitaBruta=rec.Sum(x=>x.valor),receitas=rec,despesas=desp,totalDespesas=desp.Sum(x=>x.valor),resultado=rec.Sum(x=>x.valor)-desp.Sum(x=>x.valor)
        }
        ;
    }
    // Define o método `ReceitaBrutaMensalAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<object> ReceitaBrutaMensalAsync(long? empresa,int ano)
    {
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,new DateTime(ano,1,1),new DateTime(ano,12,31),null);
        // Retorna o resultado calculado para quem chamou este método.
        return new
        {
            ano,meses=Enumerable.Range(1,12).Select(m=>new
            {
                // Prepara o valor de `mes` que será usado nas próximas etapas do processamento.
                mes=m,valor=cr.Where(x=>x.Status!="Cancelado"&&x.DataEmissao.Month==m).Sum(x=>x.Valor)
            }
            )
        }
        ;
    }
    // Define o método `InadimplenciaAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<object> InadimplenciaAsync(long? empresa)
    {
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,"Vencido",null,null,null,null,null,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,"Vencido",null,null,null,null,null,null,null);
        // Retorna o resultado calculado para quem chamou este método.
        return new
        {
            // Prepara o valor de `contasVencidas` que será usado nas próximas etapas do processamento.
            contasVencidas=cp,totalContasVencidas=cp.Sum(x=>x.Valor),receitasVencidas=cr,totalReceitasVencidas=cr.Sum(x=>x.Valor)
        }
        ;
    }
    // Define o método `RankingsAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<object> RankingsAsync(long? empresa,DateTime? inicio,DateTime? fim)
    {
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,inicio,fim,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,inicio,fim,null);
        // Prepara o valor de `clientes` que será usado nas próximas etapas do processamento.
        var clientes=await cad.ListarClientesAsync(empresa);
        // Prepara o valor de `fornecedores` que será usado nas próximas etapas do processamento.
        var fornecedores=await cad.ListarFornecedoresAsync(empresa);
        // Prepara o valor de `cats` que será usado nas próximas etapas do processamento.
        var cats=await cad.ListarCategoriasAsync(empresa,null);
        string Cl(long? id)=>clientes.FirstOrDefault(x=>x.Id==id)?.Nome??"Sem cliente";
        string Fo(long? id)=>fornecedores.FirstOrDefault(x=>x.Id==id)?.Nome??"Sem fornecedor";
        string Ca(long? id)=>cats.FirstOrDefault(x=>x.Id==id)?.Nome??"Sem categoria";
        // Retorna o resultado calculado para quem chamou este método.
        return new
        {
            // Prepara o valor de `receitasPorCliente` que será usado nas próximas etapas do processamento.
            receitasPorCliente=cr.Where(x=>x.Status!="Cancelado").GroupBy(x=>Cl(x.ClienteId)).Select(g=>new
            {
                // Prepara o valor de `nome` que será usado nas próximas etapas do processamento.
                nome=g.Key,valor=g.Sum(x=>x.Valor)
            }
            ).OrderByDescending(x=>x.valor),despesasPorFornecedor=cp.Where(x=>x.Status!="Cancelado").GroupBy(x=>Fo(x.FornecedorId)).Select(g=>new
            {
                // Prepara o valor de `nome` que será usado nas próximas etapas do processamento.
                nome=g.Key,valor=g.Sum(x=>x.Valor)
            }
            ).OrderByDescending(x=>x.valor),receitasPorCategoria=cr.Where(x=>x.Status!="Cancelado").GroupBy(x=>Ca(x.CategoriaId)).Select(g=>new
            {
                // Prepara o valor de `nome` que será usado nas próximas etapas do processamento.
                nome=g.Key,valor=g.Sum(x=>x.Valor)
            }
            ).OrderByDescending(x=>x.valor),despesasPorCategoria=cp.Where(x=>x.Status!="Cancelado").GroupBy(x=>Ca(x.CategoriaId)).Select(g=>new
            {
                // Prepara o valor de `nome` que será usado nas próximas etapas do processamento.
                nome=g.Key,valor=g.Sum(x=>x.Valor)
            }
            ).OrderByDescending(x=>x.valor)
        }
        ;
    }
    // Define o método `SerieFluxoAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<object> SerieFluxoAsync(long? empresa,DateTime inicio,DateTime fim,string agrupamento)
    {
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,inicio,fim,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,inicio,fim,null);
        string Key(DateTime d)=>agrupamento.ToLowerInvariant() switch
        {
            "dia"=>d.ToString("yyyy-MM-dd"),"ano"=>d.ToString("yyyy"),_=>d.ToString("yyyy-MM")
        }
        ;
        // Prepara o valor de `keys` que será usado nas próximas etapas do processamento.
        var keys=cr.Where(x=>x.Status!="Cancelado").Select(x=>Key(x.DataVencimento)).Concat(cp.Where(x=>x.Status!="Cancelado").Select(x=>Key(x.DataVencimento))).Distinct().OrderBy(x=>x);
        // Retorna o resultado calculado para quem chamou este método.
        return new
        {
            agrupamento,pontos=keys.Select(k=>new
            {
                // Prepara o valor de `periodo` que será usado nas próximas etapas do processamento.
                periodo=k,entradas=cr.Where(x=>x.Status!="Cancelado"&&Key(x.DataVencimento)==k).Sum(x=>x.Valor),saidas=cp.Where(x=>x.Status!="Cancelado"&&Key(x.DataVencimento)==k).Sum(x=>x.Valor),resultado=cr.Where(x=>x.Status!="Cancelado"&&Key(x.DataVencimento)==k).Sum(x=>x.Valor)-cp.Where(x=>x.Status!="Cancelado"&&Key(x.DataVencimento)==k).Sum(x=>x.Valor)
            }
            )
        }
        ;
    }
    // Define o método `ProjecaoAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<object> ProjecaoAsync(long? empresa)
    {
        // Prepara o valor de `h` que será usado nas próximas etapas do processamento.
        var h=DateTime.Today;
        // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
        var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,null,null,null);
        // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
        var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,null,null,null);
        // Prepara o valor de `realizados` que será usado nas próximas etapas do processamento.
        var realizados=cr.Where(x=>x.Status=="Recebido").Sum(x=>x.Valor)-cp.Where(x=>x.Status=="Pago").Sum(x=>x.Valor);
        // Retorna o resultado calculado para quem chamou este método.
        return new
        {
            // Prepara o valor de `saldoRealizado` que será usado nas próximas etapas do processamento.
            saldoRealizado=realizados,horizontes=new[]
            {
                7,15,30,60,90
            }
            .Select(d=>new
            {
                // Prepara o valor de `dias` que será usado nas próximas etapas do processamento.
                dias=d,data=h.AddDays(d),entradas=cr.Where(x=>(x.Status is "Previsto" or "Vencido")&&x.DataVencimento<=h.AddDays(d)).Sum(x=>x.Valor),saidas=cp.Where(x=>(x.Status is "Pendente" or "Vencido")&&x.DataVencimento<=h.AddDays(d)).Sum(x=>x.Valor)
            }
            ).Select(x=>new
            {
                x.dias,x.data,x.entradas,x.saidas,saldoProjetado=realizados+x.entradas-x.saidas
            }
            )
        }
        ;
    }
    // Define o método `CsvAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<string> CsvAsync(string tipo,long? empresa,DateTime? inicio,DateTime? fim)
    {
        // Prepara o valor de `sb` que será usado nas próximas etapas do processamento.
        var sb=new StringBuilder();
        // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
        if(tipo.Equals("resumo",StringComparison.OrdinalIgnoreCase))
        {
            // Prepara o valor de `cp` que será usado nas próximas etapas do processamento.
            var cp=await fin.ListarContasPagarAsync(empresa,null,null,null,null,inicio,fim,null);
            // Prepara o valor de `cr` que será usado nas próximas etapas do processamento.
            var cr=await fin.ListarReceitasAsync(empresa,null,null,null,null,null,inicio,fim,null);
            // Prepara o valor de `receitas` que será usado nas próximas etapas do processamento.
            var receitas=cr.Where(x=>x.Status!="Cancelado").Sum(x=>x.Valor);
            // Prepara o valor de `despesas` que será usado nas próximas etapas do processamento.
            var despesas=cp.Where(x=>x.Status!="Cancelado").Sum(x=>x.Valor);
            sb.AppendLine("Indicador;Valor");
            sb.AppendLine($"Receitas;{receitas:0.00}");
            sb.AppendLine($"Despesas;{despesas:0.00}");
            sb.AppendLine($"Resultado;{receitas-despesas:0.00}");
        }
        // Executa o fluxo alternativo quando a condição anterior não é atendida.
        else if(tipo.Equals("receitas",StringComparison.OrdinalIgnoreCase))
        {
            sb.AppendLine("Id;Descrição;Tipo;Emissão;Vencimento;Recebimento;Valor;Status;Documento");
            // Percorre a sequência necessária para processar todos os itens deste fluxo.
            foreach(var x in await fin.ListarReceitasAsync(empresa,null,null,null,null,null,inicio,fim,null))sb.AppendLine($"{x.Id};{Esc(x.Descricao)};{x.Tipo};{x.DataEmissao:dd/MM/yyyy};{x.DataVencimento:dd/MM/yyyy};{x.DataRecebimento:dd/MM/yyyy};{x.Valor:0.00};{x.Status};{Esc(x.NumeroDocumento)}");
        }
        // Executa o fluxo alternativo quando a condição anterior não é atendida.
        else
        {
            sb.AppendLine("Id;Descrição;Emissão;Vencimento;Pagamento;Valor;Status;Documento");
            // Percorre a sequência necessária para processar todos os itens deste fluxo.
            foreach(var x in await fin.ListarContasPagarAsync(empresa,null,null,null,null,inicio,fim,null))sb.AppendLine($"{x.Id};{Esc(x.Descricao)};{x.DataEmissao:dd/MM/yyyy};{x.DataVencimento:dd/MM/yyyy};{x.DataPagamento:dd/MM/yyyy};{x.Valor:0.00};{x.Status};{Esc(x.NumeroDocumento)}");
        }
        // Retorna o resultado calculado para quem chamou este método.
        return sb.ToString();
    }
    // Define o método `PdfResumoAsync` e sua responsabilidade no fluxo da aplicação.
    public async Task<byte[]> PdfResumoAsync(long? empresa,DateTime? inicio,DateTime? fim)
    {
        // Prepara o valor de `r` que será usado nas próximas etapas do processamento.
        var r=await ResumoAsync(empresa,inicio,fim);
        // Prepara o valor de `text` que será usado nas próximas etapas do processamento.
        var text=$"PayControl - Relatório Financeiro\nPeríodo: {inicio:dd/MM/yyyy} a {fim:dd/MM/yyyy}\n\n{System.Text.Json.JsonSerializer.Serialize(r,new System.Text.Json.JsonSerializerOptions{WriteIndented=true})}";
        // Retorna o resultado calculado para quem chamou este método.
        return SimplePdf.Create(text);
    }
    // Define o método `Esc` e sua responsabilidade no fluxo da aplicação.
    static string Esc(string? s)=>'"'+(s??"").Replace("\"","\"\"")+'"';
}
// Declara `SimplePdf`, que representa uma parte do domínio do PayControl.
internal static class SimplePdf
{
    // Define o método `Create` e sua responsabilidade no fluxo da aplicação.
    public static byte[] Create(string text)
    {
        // Prepara o valor de `lines` que será usado nas próximas etapas do processamento.
        var lines=text.Replace("\r","").Split('\n').Take(55).Select(x=>x.Replace("\\","\\\\").Replace("(","\\(").Replace(")","\\)")).ToArray();
        // Prepara o valor de `content` que será usado nas próximas etapas do processamento.
        var content=new StringBuilder("BT /F1 10 Tf 50 790 Td 12 TL ");
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        foreach(var l in lines)content.Append('(').Append(l).Append(") Tj T* ");
        content.Append("ET");
        // Prepara o valor de `body` que será usado nas próximas etapas do processamento.
        var body=content.ToString();
        // Prepara o valor de `objs` que será usado nas próximas etapas do processamento.
        var objs=new[]
        {
            "<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",$"<< /Length {Encoding.ASCII.GetByteCount(body)} >>\nstream\n{body}\nendstream","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
        }
        ;
        // Prepara o valor de `ms` que será usado nas próximas etapas do processamento.
        var ms=new MemoryStream();
        void W(string s)
        {
            // Prepara o valor de `b` que será usado nas próximas etapas do processamento.
            var b=Encoding.ASCII.GetBytes(s);
            ms.Write(b);
        }
        W("%PDF-1.4\n");
        // Prepara o valor de `off` que será usado nas próximas etapas do processamento.
        var off=new List<long>
        {
            0
        }
        ;
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        for(int i=0;i<objs.Length;i++)
        {
            off.Add(ms.Position);
            W($"{i+1} 0 obj\n{objs[i]}\nendobj\n");
        }
        // Prepara o valor de `xref` que será usado nas próximas etapas do processamento.
        var xref=ms.Position;
        W($"xref\n0 {objs.Length+1}\n0000000000 65535 f \n");
        // Percorre a sequência necessária para processar todos os itens deste fluxo.
        for(int i=1;i<off.Count;i++)W($"{off[i]:0000000000} 00000 n \n");
        W($"trailer << /Size {objs.Length+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF");
        // Retorna o resultado calculado para quem chamou este método.
        return ms.ToArray();
    }
}
