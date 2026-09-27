// Importa os recursos do namespace `Microsoft.AspNetCore.Mvc` usados neste arquivo.
using Microsoft.AspNetCore.Mvc;
// Importa os recursos do namespace `PayControl.Api.Dtos` usados neste arquivo.
using PayControl.Api.Dtos;
// Importa os recursos do namespace `PayControl.Api.Services` usados neste arquivo.
using PayControl.Api.Services;
// Define o namespace `PayControl.Api.Controllers`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Controllers;
// Declara `EmpresasController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/empresas")]
public sealed class EmpresasController(CadastrosService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult> L()=>Ok(await s.ListarEmpresasAsync());
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{id:long}")]
    public async Task<IActionResult> O(long id)=>(await s.ObterEmpresaAsync(id)) is
    {
    }
    x?Ok(x):NotFound();
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult>C(EmpresaRequest r)=>StatusCode(201,await s.CriarEmpresaAsync(r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPut("{id:long}")]
    public async Task<IActionResult>U(long id,EmpresaRequest r)=>Ok(await s.AtualizarEmpresaAsync(id,r));
}
// Declara `ClientesController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/clientes")]
public sealed class ClientesController(CadastrosService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>L(long? empresaId)=>Ok(await s.ListarClientesAsync(empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{id:long}")]
    public async Task<IActionResult>O(long id)=>(await s.ObterClienteAsync(id)) is
    {
    }
    x?Ok(x):NotFound();
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult>C(PessoaRequest r)=>StatusCode(201,await s.CriarClienteAsync(r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPut("{id:long}")]
    public async Task<IActionResult>U(long id,PessoaRequest r)=>Ok(await s.AtualizarClienteAsync(id,r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpDelete("{id:long}")]
    public async Task<IActionResult>D(long id)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await s.ExcluirCadastroAsync("clientes","Cliente",id);
        // Retorna o resultado calculado para quem chamou este método.
        return NoContent();
    }
}
// Declara `FornecedoresController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/fornecedores")]
public sealed class FornecedoresController(CadastrosService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>L(long? empresaId)=>Ok(await s.ListarFornecedoresAsync(empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{id:long}")]
    public async Task<IActionResult>O(long id)=>(await s.ObterFornecedorAsync(id)) is
    {
    }
    x?Ok(x):NotFound();
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult>C(PessoaRequest r)=>StatusCode(201,await s.CriarFornecedorAsync(r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPut("{id:long}")]
    public async Task<IActionResult>U(long id,PessoaRequest r)=>Ok(await s.AtualizarFornecedorAsync(id,r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpDelete("{id:long}")]
    public async Task<IActionResult>D(long id)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await s.ExcluirCadastroAsync("fornecedores","Fornecedor",id);
        // Retorna o resultado calculado para quem chamou este método.
        return NoContent();
    }
}
// Declara `CategoriasController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/categorias")]
[Route("api/plano-contas")]
public sealed class CategoriasController(CadastrosService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>L(long? empresaId,string? tipo)=>Ok(await s.ListarCategoriasAsync(empresaId,tipo));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{id:long}")]
    public async Task<IActionResult>O(long id)=>(await s.ObterCategoriaAsync(id)) is
    {
    }
    x?Ok(x):NotFound();
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult>C(CategoriaRequest r)=>StatusCode(201,await s.CriarCategoriaAsync(r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPut("{id:long}")]
    public async Task<IActionResult>U(long id,CategoriaRequest r)=>Ok(await s.AtualizarCategoriaAsync(id,r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpDelete("{id:long}")]
    public async Task<IActionResult>D(long id)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await s.ExcluirCadastroAsync("categorias","Categoria",id);
        // Retorna o resultado calculado para quem chamou este método.
        return NoContent();
    }
}
// Declara `ContasFinanceirasController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/contas-financeiras")]
public sealed class ContasFinanceirasController(CadastrosService s,ConsultaFinanceiraService q) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>L(long? empresaId)=>Ok(await s.ListarContasFinanceirasAsync(empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("saldos")]
    public async Task<IActionResult>S(long? empresaId)=>Ok(await q.ObterSaldosContasAsync(empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{id:long}")]
    public async Task<IActionResult>O(long id)=>(await s.ObterContaFinanceiraAsync(id)) is
    {
    }
    x?Ok(x):NotFound();
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult>C(ContaFinanceiraRequest r)=>StatusCode(201,await s.CriarContaFinanceiraAsync(r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPut("{id:long}")]
    public async Task<IActionResult>U(long id,ContaFinanceiraRequest r)=>Ok(await s.AtualizarContaFinanceiraAsync(id,r));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpDelete("{id:long}")]
    public async Task<IActionResult>D(long id)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await s.ExcluirCadastroAsync("contas_financeiras","Conta financeira",id);
        // Retorna o resultado calculado para quem chamou este método.
        return NoContent();
    }
}
