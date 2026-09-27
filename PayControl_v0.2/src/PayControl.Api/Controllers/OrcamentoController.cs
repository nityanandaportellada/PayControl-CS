// Importa os recursos do namespace `Microsoft.AspNetCore.Mvc` usados neste arquivo.
using Microsoft.AspNetCore.Mvc;
// Importa os recursos do namespace `PayControl.Api.Dtos` usados neste arquivo.
using PayControl.Api.Dtos;
// Importa os recursos do namespace `PayControl.Api.Services` usados neste arquivo.
using PayControl.Api.Services;
// Define o namespace `PayControl.Api.Controllers`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Controllers;
// Declara `OrcamentoController`, que representa uma parte do domínio do PayControl.
[ApiController]
[Route("api/orcamento")]
public sealed class OrcamentoController(OrcamentoService s) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult>G()=>Ok(new
    {
        // Prepara o valor de `valor` que será usado nas próximas etapas do processamento.
        valor=await s.ObterAsync()
    }
    );
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPut]
    public async Task<IActionResult>P(OrcamentoRequest r)=>Ok(new
    {
        // Prepara o valor de `valor` que será usado nas próximas etapas do processamento.
        valor=await s.DefinirAsync(r.Valor)
    }
    );
}
