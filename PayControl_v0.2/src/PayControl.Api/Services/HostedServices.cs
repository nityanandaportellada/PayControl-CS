// Define o namespace `PayControl.Api.Services`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Services;
// Declara `MaintenanceHostedService`, que representa uma parte do domínio do PayControl.
public sealed class MaintenanceHostedService(IServiceProvider services,ILogger<MaintenanceHostedService> logger) : BackgroundService
{
    // Define o método `ExecuteAsync` e sua responsabilidade no fluxo da aplicação.
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Pequeno atraso para não competir com a inicialização da API.
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        // Continua a leitura/processamento enquanto ainda existirem registros disponíveis.
        while(!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Importa os recursos do namespace `var scope=services.CreateScope()` usados neste arquivo.
                using var scope=services.CreateScope();
                // Prepara o valor de `financeiro` que será usado nas próximas etapas do processamento.
                var financeiro=scope.ServiceProvider.GetRequiredService<FinanceiroService>();
                // Prepara o valor de `backup` que será usado nas próximas etapas do processamento.
                var backup=scope.ServiceProvider.GetRequiredService<BackupService>();
                // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
                await financeiro.ProcessarRecorrenciasAsync(DateTime.Today);
                // Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
                if(!backup.ExisteBackupDeHoje()) await backup.CriarAsync();
            }
            catch(Exception ex)
            {
                logger.LogError(ex,"Falha na manutenção automática do PayControl.");
            }
            // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
            await Task.Delay(TimeSpan.FromHours(6),stoppingToken);
        }
    }
}
