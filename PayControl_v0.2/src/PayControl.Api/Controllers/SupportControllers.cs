// Importa os recursos do namespace `System.Text` usados neste arquivo.
using System.Text;
// Importa os recursos do namespace `Microsoft.AspNetCore.Mvc` usados neste arquivo.
using Microsoft.AspNetCore.Mvc;
// Importa os recursos do namespace `PayControl.Api.Dtos` usados neste arquivo.
using PayControl.Api.Dtos;
// Importa os recursos do namespace `PayControl.Api.Services` usados neste arquivo.
using PayControl.Api.Services;
// Define o namespace `PayControl.Api.Controllers`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Controllers;
// Declara `RelatoriosController`, que representa uma parte do domínio do PayControl.
[ApiController] [Route("api/relatorios")]
public sealed class RelatoriosController(RelatoriosService service) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("resumo")]
    public async Task<IActionResult> Resumo(long? empresaId, DateTime? inicio, DateTime? fim) => Ok(await service.ResumoAsync(empresaId, inicio, fim));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("dre")]
    public async Task<IActionResult> Dre(long? empresaId, DateTime inicio, DateTime fim) => Ok(await service.DreAsync(empresaId, inicio, fim));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("receita-bruta-mensal")]
    public async Task<IActionResult> ReceitaBrutaMensal(long? empresaId, int ano) => Ok(await service.ReceitaBrutaMensalAsync(empresaId, ano));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("inadimplencia")]
    public async Task<IActionResult> Inadimplencia(long? empresaId) => Ok(await service.InadimplenciaAsync(empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("rankings")]
    public async Task<IActionResult> Rankings(long? empresaId, DateTime? inicio, DateTime? fim) => Ok(await service.RankingsAsync(empresaId, inicio, fim));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("serie-fluxo")]
    public async Task<IActionResult> SerieFluxo(long? empresaId, DateTime inicio, DateTime fim, string agrupamento = "mes") => Ok(await service.SerieFluxoAsync(empresaId, inicio, fim, agrupamento));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("projecao")]
    public async Task<IActionResult> Projecao(long? empresaId) => Ok(await service.ProjecaoAsync(empresaId));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("exportar/{tipo}")]
    public async Task<IActionResult> ExportarCsv(string tipo, long? empresaId, DateTime? inicio, DateTime? fim)
    {
        // Prepara o valor de `csv` que será usado nas próximas etapas do processamento.
        var csv = await service.CsvAsync(tipo, empresaId, inicio, fim);
        // Retorna o resultado calculado para quem chamou este método.
        return File(Encoding.UTF8.GetBytes(csv), "text/csv", $"{tipo}.csv");
    }
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("pdf/resumo")]
    public async Task<IActionResult> PdfResumo(long? empresaId, DateTime? inicio, DateTime? fim) => File(await service.PdfResumoAsync(empresaId, inicio, fim), "application/pdf", "relatorio-financeiro.pdf");
}
// Declara `AnexosController`, que representa uma parte do domínio do PayControl.
[ApiController] [Route("api/anexos")]
public sealed class AnexosController(AnexosService service) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("{entidade}/{id:long}")]
    public async Task<IActionResult> Listar(string entidade, long id) => Ok(await service.ListarAsync(entidade, id));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("{entidade}/{id:long}")]
    public async Task<IActionResult> Upload(string entidade, long id, IFormFile arquivo) => StatusCode(StatusCodes.Status201Created, await service.SalvarAsync(entidade, id, arquivo));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet("download/{id:long}")]
    public async Task<IActionResult> Download(long id)
    {
        // Prepara o valor de `arquivo` que será usado nas próximas etapas do processamento.
        var arquivo = await service.BaixarAsync(id);
        // Retorna o resultado calculado para quem chamou este método.
        return File(arquivo.Data, arquivo.ContentType, arquivo.Name);
    }
}
// Declara `ConciliacaoController`, que representa uma parte do domínio do PayControl.
[ApiController] [Route("api/conciliacao")]
public sealed class ConciliacaoController(ConciliacaoService service) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("importar-csv")]
    public async Task<IActionResult> ImportarCsv(long? empresaId, long contaFinanceiraId, IFormFile arquivo) => Ok(new
    {
        // Prepara o valor de `importados` que será usado nas próximas etapas do processamento.
        importados = await service.ImportarCsvAsync(empresaId, contaFinanceiraId, arquivo)
    }
    );
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("importar-ofx")]
    public async Task<IActionResult> ImportarOfx(long? empresaId, long contaFinanceiraId, IFormFile arquivo) => Ok(new
    {
        // Prepara o valor de `importados` que será usado nas próximas etapas do processamento.
        importados = await service.ImportarOfxAsync(empresaId, contaFinanceiraId, arquivo)
    }
    );
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public async Task<IActionResult> Listar(long? empresaId, long? contaFinanceiraId, string? status) => Ok(await service.ListarAsync(empresaId, contaFinanceiraId, status));
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("vincular")]
    public async Task<IActionResult> Vincular(ConciliacaoVincularRequest request)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await service.VincularAsync(request.ItemId, request.Entidade, request.LancamentoId);
        // Retorna o resultado calculado para quem chamou este método.
        return NoContent();
    }
}
// Declara `BackupController`, que representa uma parte do domínio do PayControl.
[ApiController] [Route("api/backups")]
public sealed class BackupController(BackupService service) : ControllerBase
{
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpGet]
    public IActionResult Listar() => Ok(service.Listar());
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost]
    public async Task<IActionResult> Criar() => Ok(new
    {
        // Prepara o valor de `arquivo` que será usado nas próximas etapas do processamento.
        arquivo = await service.CriarAsync()
    }
    );
    // Aplica este atributo para configurar o comportamento do elemento abaixo.
    [HttpPost("restaurar")]
    public async Task<IActionResult> Restaurar(IFormFile arquivo)
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await service.RestaurarAsync(arquivo);
        // Retorna o resultado calculado para quem chamou este método.
        return Ok(new
        {
            // Prepara o valor de `mensagem` que será usado nas próximas etapas do processamento.
            mensagem = "Backup restaurado. Reinicie a aplicação antes de continuar."
        }
        );
    }
}
