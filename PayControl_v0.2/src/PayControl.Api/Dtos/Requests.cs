// Define o namespace `PayControl.Api.Dtos`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Dtos;
// Declara `EmpresaRequest`, que representa uma parte do domínio do PayControl.
public sealed record EmpresaRequest(string Nome,string? NomeFantasia,string? CpfCnpj,string? Email,string? Telefone,string? Endereco,bool Ativa=true);
// Declara `PessoaRequest`, que representa uma parte do domínio do PayControl.
public sealed record PessoaRequest(long? EmpresaId,string Nome,string? CpfCnpj,string? Email,string? Telefone,string? Endereco,string? Observacoes,bool Ativo=true);
// Declara `CategoriaRequest`, que representa uma parte do domínio do PayControl.
public sealed record CategoriaRequest(long? EmpresaId,string Nome,string Tipo,long? CategoriaPaiId,string? Codigo,bool Ativa=true);
// Declara `ContaFinanceiraRequest`, que representa uma parte do domínio do PayControl.
public sealed record ContaFinanceiraRequest(long? EmpresaId,string Nome,string Tipo,string? Instituicao,string? Agencia,string? NumeroConta,decimal SaldoInicial=0,bool Ativa=true);
// Declara `CriarContaPagarRequest`, que representa uma parte do domínio do PayControl.
public sealed record CriarContaPagarRequest(long? EmpresaId,long? FornecedorId,long? CategoriaId,long? ContaFinanceiraId,string Descricao,decimal Valor,DateTime DataEmissao,DateTime DataVencimento,string? FormaPagamento,string? NumeroDocumento,string? SerieDocumento,string? ChaveFiscal,string? Observacoes,int Parcelas=1,string? FrequenciaRecorrencia=null,DateTime? RecorrenciaAte=null);
// Declara `AtualizarContaPagarRequest`, que representa uma parte do domínio do PayControl.
public sealed record AtualizarContaPagarRequest(long? FornecedorId,long? CategoriaId,long? ContaFinanceiraId,string? Descricao,decimal? Valor,DateTime? DataEmissao,DateTime? DataVencimento,string? FormaPagamento,string? NumeroDocumento,string? SerieDocumento,string? ChaveFiscal,string? Observacoes);
// Declara `CriarReceitaRequest`, que representa uma parte do domínio do PayControl.
public sealed record CriarReceitaRequest(long? EmpresaId,long? ClienteId,long? CategoriaId,long? ContaFinanceiraId,string Descricao,string Tipo,decimal Valor,DateTime DataEmissao,DateTime DataVencimento,string? FormaRecebimento,string? NumeroDocumento,string? SerieDocumento,string? ChaveFiscal,string? Observacoes,int Parcelas=1,string? FrequenciaRecorrencia=null,DateTime? RecorrenciaAte=null);
// Declara `AtualizarReceitaRequest`, que representa uma parte do domínio do PayControl.
public sealed record AtualizarReceitaRequest(long? ClienteId,long? CategoriaId,long? ContaFinanceiraId,string? Descricao,string? Tipo,decimal? Valor,DateTime? DataEmissao,DateTime? DataVencimento,string? FormaRecebimento,string? NumeroDocumento,string? SerieDocumento,string? ChaveFiscal,string? Observacoes);
// Declara `LiquidarRequest`, que representa uma parte do domínio do PayControl.
public sealed record LiquidarRequest(DateTime? Data,long? ContaFinanceiraId,string? FormaPagamento);
// Declara `CancelarRequest`, que representa uma parte do domínio do PayControl.
public sealed record CancelarRequest(string? Motivo);
// Declara `TransferenciaRequest`, que representa uma parte do domínio do PayControl.
public sealed record TransferenciaRequest(long? EmpresaId,long ContaOrigemId,long ContaDestinoId,decimal Valor,DateTime Data,string? Descricao);
// Declara `RecorrenciaRequest`, que representa uma parte do domínio do PayControl.
public sealed record RecorrenciaRequest(long? EmpresaId,string Natureza,string Descricao,decimal Valor,string Frequencia,DateTime ProximaData,DateTime? DataFim,long? ClienteId,long? FornecedorId,long? CategoriaId,long? ContaFinanceiraId,string? TipoReceita,string? FormaPagamento,bool Ativa=true);
// Declara `OrcamentoRequest`, que representa uma parte do domínio do PayControl.
public sealed record OrcamentoRequest(decimal Valor);
// Declara `ConciliacaoVincularRequest`, que representa uma parte do domínio do PayControl.
public sealed record ConciliacaoVincularRequest(long ItemId,string Entidade,long LancamentoId);
