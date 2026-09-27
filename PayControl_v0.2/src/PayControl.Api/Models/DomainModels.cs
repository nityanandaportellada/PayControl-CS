// Define o namespace `PayControl.Api.Models`, mantendo o código organizado por responsabilidade.
namespace PayControl.Api.Models;
// Declara `Empresa`, que representa uma parte do domínio do PayControl.
public sealed record Empresa(long Id,string Nome,string? NomeFantasia,string? CpfCnpj,string? Email,string? Telefone,string? Endereco,bool Ativa);
// Declara `Cliente`, que representa uma parte do domínio do PayControl.
public sealed record Cliente(long Id,long? EmpresaId,string Nome,string? CpfCnpj,string? Email,string? Telefone,string? Endereco,string? Observacoes,bool Ativo);
// Declara `Fornecedor`, que representa uma parte do domínio do PayControl.
public sealed record Fornecedor(long Id,long? EmpresaId,string Nome,string? CpfCnpj,string? Email,string? Telefone,string? Endereco,string? Observacoes,bool Ativo);
// Declara `Categoria`, que representa uma parte do domínio do PayControl.
public sealed record Categoria(long Id,long? EmpresaId,string Nome,string Tipo,long? CategoriaPaiId,string? Codigo,bool Ativa);
// Declara `ContaFinanceira`, que representa uma parte do domínio do PayControl.
public sealed record ContaFinanceira(long Id,long? EmpresaId,string Nome,string Tipo,string? Instituicao,string? Agencia,string? NumeroConta,decimal SaldoInicial,bool Ativa);
// Declara `ContaPagar`, que representa uma parte do domínio do PayControl.
public sealed record ContaPagar(long Id,long? EmpresaId,long? FornecedorId,long? CategoriaId,long? ContaFinanceiraId,string Descricao,decimal Valor,DateTime DataEmissao,DateTime DataVencimento,DateTime? DataPagamento,string Status,string? FormaPagamento,string? NumeroDocumento,string? SerieDocumento,string? ChaveFiscal,string? Observacoes,int ParcelaNumero,int ParcelaTotal,string? GrupoParcelamentoId,long? RecorrenciaId);
// Declara `ContaReceber`, que representa uma parte do domínio do PayControl.
public sealed record ContaReceber(long Id,long? EmpresaId,long? ClienteId,long? CategoriaId,long? ContaFinanceiraId,string Descricao,string Tipo,decimal Valor,DateTime DataEmissao,DateTime DataVencimento,DateTime? DataRecebimento,string Status,string? FormaRecebimento,string? NumeroDocumento,string? SerieDocumento,string? ChaveFiscal,string? Observacoes,int ParcelaNumero,int ParcelaTotal,string? GrupoParcelamentoId,long? RecorrenciaId);
// Declara `Transferencia`, que representa uma parte do domínio do PayControl.
public sealed record Transferencia(long Id,long? EmpresaId,long ContaOrigemId,long ContaDestinoId,decimal Valor,DateTime Data,string? Descricao,string Status,string? MotivoCancelamento);
// Declara `Recorrencia`, que representa uma parte do domínio do PayControl.
public sealed record Recorrencia(long Id,long? EmpresaId,string Natureza,string Descricao,decimal Valor,string Frequencia,DateTime ProximaData,DateTime? DataFim,long? ClienteId,long? FornecedorId,long? CategoriaId,long? ContaFinanceiraId,string? TipoReceita,string? FormaPagamento,bool Ativa);
// Declara `Anexo`, que representa uma parte do domínio do PayControl.
public sealed record Anexo(long Id,string Entidade,long EntidadeId,string NomeOriginal,string NomeArmazenado,string Caminho,string? TipoConteudo,long Tamanho,DateTime CriadoEm);
// Declara `EventoFinanceiro`, que representa uma parte do domínio do PayControl.
public sealed record EventoFinanceiro(long Id,string Entidade,long EntidadeId,string Evento,string? Observacao,DateTime CriadoEm);
// Declara `ConciliacaoItem`, que representa uma parte do domínio do PayControl.
public sealed record ConciliacaoItem(long Id,long? EmpresaId,long? ContaFinanceiraId,DateTime Data,string Descricao,decimal Valor,string Tipo,string? Documento,string Status,long? ContaPagarId,long? ContaReceberId,DateTime ImportadoEm);
// Declara `MovimentoFluxo`, que representa uma parte do domínio do PayControl.
public sealed record MovimentoFluxo(DateTime Data,string Natureza,string Origem,long Id,string Descricao,decimal Entrada,decimal Saida,decimal Saldo,string Status,long? ContaFinanceiraId,bool Projetado);
// Declara `SaldoConta`, que representa uma parte do domínio do PayControl.
public sealed record SaldoConta(long Id,string Nome,string Tipo,decimal Saldo);
