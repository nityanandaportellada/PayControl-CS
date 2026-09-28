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
    public async Task<IActionResult>O(long id,long empresaId)=>(await s.ObterClienteAsync(id,empresaId)) is
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
    public async Task<IActionResult>D(long id,long empresaId)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await s.ExcluirCadastroAsync("clientes","Cliente",id,empresaId);
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
    public async Task<IActionResult>O(long id,long empresaId)=>(await s.ObterFornecedorAsync(id,empresaId)) is
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
    public async Task<IActionResult>D(long id,long empresaId)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await s.ExcluirCadastroAsync("fornecedores","Fornecedor",id,empresaId);
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