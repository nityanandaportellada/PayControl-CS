// Importa os recursos do namespace `PayControl.Api.Services` usados neste arquivo.
using PayControl.Api.Services;
// Prepara o valor de `builder` que será usado nas próximas etapas do processamento.
var builder = WebApplication.CreateBuilder(args);
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddControllers();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddOpenApi();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddSingleton<DatabaseService>();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddSingleton<CadastrosService>();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddSingleton<FinanceiroService>();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddSingleton<ConsultaFinanceiraService>();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddSingleton<RelatoriosService>();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddSingleton<AnexosService>();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddSingleton<ConciliacaoService>();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddSingleton<BackupService>();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddSingleton<OrcamentoService>();
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddHostedService<MaintenanceHostedService>();
// Prepara o valor de `origins` que será usado nas próximas etapas do processamento.
var origins = builder.Configuration .GetSection("Cors:AllowedOrigins") .Get<string[]>() ?? ["http://localhost:5173", "http://localhost:3000"];
// Registra este serviço no contêiner de injeção de dependências do ASP.NET Core.
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy.WithOrigins(origins) .AllowAnyHeader() .AllowAnyMethod());
}
);
// Prepara o valor de `app` que será usado nas próximas etapas do processamento.
var app = builder.Build();
// Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
await app.Services.GetRequiredService<DatabaseService>().InitializeAsync();
// Verifica a condição antes de continuar, evitando que o sistema processe um estado inválido.
if (app.Environment.IsDevelopment())
{
    // Configura este componente no pipeline HTTP da aplicação.
    app.MapOpenApi();
}
// Configura este componente no pipeline HTTP da aplicação.
app.UseCors("Frontend");
// Configura este componente no pipeline HTTP da aplicação.
app.Use(async (context, next) =>
{
    try
    {
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await next();
    }
    catch (KeyNotFoundException e)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await context.Response.WriteAsJsonAsync(new
        {
            // Prepara o valor de `mensagem` que será usado nas próximas etapas do processamento.
            mensagem = e.Message
        }
        );
    }
    catch (ArgumentException e)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await context.Response.WriteAsJsonAsync(new
        {
            // Prepara o valor de `mensagem` que será usado nas próximas etapas do processamento.
            mensagem = e.Message
        }
        );
    }
    catch (InvalidOperationException e)
    {
        context.Response.StatusCode = StatusCodes.Status409Conflict;
        // Aguarda a conclusão da operação assíncrona antes de seguir para o próximo passo.
        await context.Response.WriteAsJsonAsync(new
        {
            // Prepara o valor de `mensagem` que será usado nas próximas etapas do processamento.
            mensagem = e.Message
        }
        );
    }
}
);
// Configura este componente no pipeline HTTP da aplicação.
app.MapControllers();
// Configura este componente no pipeline HTTP da aplicação.
app.MapGet("/", () => Results.Ok(new
{
    // Prepara o valor de `sistema` que será usado nas próximas etapas do processamento.
    sistema = "PayControl", backend = "ASP.NET Core 10", api = "/api", openApi = "/openapi/v1.json", frontend = "React + TypeScript incluído em src/PayControl.Web", versao = "0.2"
}
));
// Inicia a aplicação ASP.NET Core e mantém a API disponível para requisições.
app.Run();
