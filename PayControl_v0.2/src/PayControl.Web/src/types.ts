export type Empresa = {
    id: number;
    nome: string;
    nomeFantasia?: string | null;
    cpfCnpj?: string | null;
    email?: string | null;
    telefone?: string | null;
    endereco?: string | null;
    ativa: boolean;
};


export type Pessoa = {
    id: number;
    empresaId?: number | null;
    nome: string;
    cpfCnpj?: string | null;
    email?: string | null;
    telefone?: string | null;
    endereco?: string | null;
    observacoes?: string | null;
    ativo: boolean;
};


export type Categoria = {
    id: number;
    empresaId?: number | null;
    nome: string;
    tipo:
        | 'Receita'
        | 'Despesa'
        | string;
    categoriaPaiId?: number | null;
    codigo?: string | null;
    ativa: boolean;
};


export type ContaFinanceira = {
    id: number;
    empresaId?: number | null;
    nome: string;
    tipo: string;
    instituicao?: string | null;
    agencia?: string | null;
    numeroConta?: string | null;
    saldoInicial: number;
    ativa: boolean;
};


export type ContaPagar = {
    id: number;
    empresaId?: number | null;
    fornecedorId?: number | null;
    categoriaId?: number | null;
    contaFinanceiraId?: number | null;

    descricao: string;
    valor: number;

    dataEmissao: string;
    dataVencimento: string;
    dataPagamento?: string | null;

    status: string;

    formaPagamento?: string | null;

    numeroDocumento?: string | null;
    serieDocumento?: string | null;
    chaveFiscal?: string | null;

    observacoes?: string | null;

    parcelaNumero: number;
    parcelaTotal: number;

    grupoParcelamentoId?: string | null;
    recorrenciaId?: number | null;
};


export type Receita = {
    id: number;
    empresaId?: number | null;

    clienteId?: number | null;
    categoriaId?: number | null;
    contaFinanceiraId?: number | null;

    descricao: string;
    tipo: string;
    valor: number;

    dataEmissao: string;
    dataVencimento: string;
    dataRecebimento?: string | null;

    status: string;

    formaRecebimento?: string | null;

    numeroDocumento?: string | null;
    serieDocumento?: string | null;
    chaveFiscal?: string | null;

    observacoes?: string | null;

    parcelaNumero: number;
    parcelaTotal: number;

    grupoParcelamentoId?: string | null;
    recorrenciaId?: number | null;
};


export type Transferencia = {
    id: number;
    empresaId?: number | null;

    contaOrigemId: number;
    contaDestinoId: number;

    valor: number;

    data: string;

    descricao?: string | null;

    status: string;

    motivoCancelamento?: string | null;
};


export type Movimento = {
    data: string;

    natureza: string;

    origem: string;

    id: number;

    descricao: string;

    entrada: number;

    saida: number;

    saldo: number;

    status: string;

    contaFinanceiraId?: number | null;

    projetado: boolean;
};


export type Fluxo = {
    saldoInicial: number;

    entradasRealizadas: number;

    saidasRealizadas: number;

    saldoRealizado: number;

    entradasProjetadas: number;

    saidasProjetadas: number;

    saldoProjetado: number;

    lancamentos: Movimento[];
};


export type AlertItem = {
    level:
        | 'danger'
        | 'warning'
        | 'info'
        | 'success';

    title: string;

    detail: string;
};