// Importa os recursos do namespace `Microsoft.AspNetCore.Mvc` usados neste arquivo.
using Microsoft.AspNetCore.Mvc;
// Importa os recursos do namespace `PayControl.Api.Dtos` usados neste arquivo.
using PayControl.Api.Dtos;
// Importa os recursos do namespace `PayControl.Api.Services` usados neste arquivo.
using PayControl.Api.Services;
// Define o namespace `PayControl.Api.Controllers`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Controllers;
// Declara `ContasPagarController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/contas-pagar")]
[Route("api/contas")]
public sealed class ContasPagarController(FinanceiroService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>L(long? empresaId,string? status,long? fornecedorId,long? categoriaId,long? contaFinanceiraId,DateTime? inicio,DateTime? fim,string? busca)=>Ok(await s.ListarContasPagarAsync(empresaId,status,fornecedorId,categoriaId,contaFinanceiraId,inicio,fim,busca));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{id:long}")]
    public async Task<IActionResult>O(long id,long empresaId)=>(await s.ObterContaPagarAsync(id,empresaId)) is
    {
    }
    x?Ok(x):NotFound();
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult>C(CriarContaPagarRequest r)=>StatusCode(201,await s.CriarContasPagarAsync(r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPatch("{id:long}")]
    public async Task<IActionResult>U(long id,long empresaId,AtualizarContaPagarRequest r)=>Ok(await s.AtualizarContaPagarAsync(id,r,empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("{id:long}/pagar")]
    public async Task<IActionResult>P(long id,long empresaId,LiquidarRequest? r)=>Ok(await s.PagarAsync(id,r??new(null,null,null),empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("{id:long}/estornar")]
    public async Task<IActionResult>E(long id,long empresaId,CancelarRequest? r)=>Ok(await s.EstornarPagamentoAsync(id,r?.Motivo,empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("{id:long}/cancelar")]
    public async Task<IActionResult>X(long id,long empresaId,CancelarRequest? r)=>Ok(await s.CancelarContaAsync(id,r?.Motivo,empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpDelete("{id:long}")]
    public async Task<IActionResult>D(long id,long empresaId)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await s.ExcluirContaAsync(id,empresaId);
        // Retorna o resultado calculado para quem chamou este método.
        return NoContent();
    }
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{id:long}/eventos")]
    public async Task<IActionResult>Ev(long id,long empresaId)=>Ok(await s.EventosAsync("ContaPagar",id,empresaId));
}
// Declara `ReceitasController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/receitas")]
[Route("api/contas-receber")]
public sealed class ReceitasController(FinanceiroService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>L(long? empresaId,string? status,string? tipo,long? clienteId,long? categoriaId,long? contaFinanceiraId,DateTime? inicio,DateTime? fim,string? busca)=>Ok(await s.ListarReceitasAsync(empresaId,status,tipo,clienteId,categoriaId,contaFinanceiraId,inicio,fim,busca));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{id:long}")]
    public async Task<IActionResult>O(long id,long empresaId)=>(await s.ObterReceitaAsync(id,empresaId)) is
    {
    }
    x?Ok(x):NotFound();
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult>C(CriarReceitaRequest r)=>StatusCode(201,await s.CriarReceitasAsync(r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPatch("{id:long}")]
    public async Task<IActionResult>U(long id,long empresaId,AtualizarReceitaRequest r)=>Ok(await s.AtualizarReceitaAsync(id,r,empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("{id:long}/receber")]
    public async Task<IActionResult>P(long id,long empresaId,LiquidarRequest? r)=>Ok(await s.ReceberAsync(id,r??new(null,null,null),empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("{id:long}/estornar")]
    public async Task<IActionResult>E(long id,long empresaId,CancelarRequest? r)=>Ok(await s.EstornarRecebimentoAsync(id,r?.Motivo,empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("{id:long}/cancelar")]
    public async Task<IActionResult>X(long id,long empresaId,CancelarRequest? r)=>Ok(await s.CancelarReceitaAsync(id,r?.Motivo,empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpDelete("{id:long}")]
    public async Task<IActionResult>D(long id,long empresaId)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await s.ExcluirReceitaAsync(id,empresaId);
        // Retorna o resultado calculado para quem chamou este método.
        return NoContent();
    }
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{id:long}/eventos")]
    public async Task<IActionResult>Ev(long id,long empresaId)=>Ok(await s.EventosAsync("ContaReceber",id,empresaId));
}
// Declara `TransferenciasController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/transferencias")]
public sealed class TransferenciasController(FinanceiroService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>L(long? empresaId,long? contaFinanceiraId)=>Ok(await s.ListarTransferenciasAsync(empresaId,contaFinanceiraId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult>C(TransferenciaRequest r)=>StatusCode(201,await s.CriarTransferenciaAsync(r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("{id:long}/cancelar")]
    public async Task<IActionResult>X(long id,long empresaId,CancelarRequest? r)=>Ok(await s.CancelarTransferenciaAsync(id,r?.Motivo,empresaId));
}
// Declara `RecorrenciasController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/recorrencias")]
public sealed class RecorrenciasController(FinanceiroService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>L(long? empresaId)=>Ok(await s.ListarRecorrenciasAsync(empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult>C(RecorrenciaRequest r)=>StatusCode(201,await s.CriarRecorrenciaAsync(r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("processar")]
    public async Task<IActionResult>P(DateTime? ate,long empresaId)=>Ok(new
    {
        // Prepara o valor de `gerados` que será usado nas próximas etapas do processamento.
        gerados=await s.ProcessarRecorrenciasAsync(ate,empresaId)
    }
    );
}
// Declara `FluxoController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/fluxo-financeiro")]
[Route("api/extrato")]
public sealed class FluxoController(ConsultaFinanceiraService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>G(long? empresaId,long? contaFinanceiraId,DateTime? inicio,DateTime? fim,bool incluirPendentes=true)=>Ok(await s.ObterFluxoAsync(empresaId,contaFinanceiraId,inicio,fim,incluirPendentes));
}
// Declara `DashboardController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController(ConsultaFinanceiraService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>G(long? empresaId)=>Ok(await s.ObterDashboardAsync(empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("alertas")]
    public async Task<IActionResult>A(long? empresaId)=>Ok(await s.ObterAlertasAsync(empresaId));
}
