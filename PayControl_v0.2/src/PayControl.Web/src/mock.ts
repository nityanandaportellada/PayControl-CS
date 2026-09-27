// Importa apenas os tipos TypeScript usados para validar os dados em tempo de desenvolvimento.
import type { AlertItem, Categoria, ContaFinanceira, ContaPagar, Empresa, Fluxo, Pessoa, Receita } from './types';
// Prepara o valor `d` usado pela tela.
const d = (day: number) => `2026-09-${String(day).padStart(2, '0')}T00:00:00`;
export const mockEmpresas: Empresa[] = [{ id: 1, nome: 'Empresa Exemplo Ltda.', nomeFantasia: 'Empresa Exemplo', cpfCnpj: '12.345.678/0001-90', email: 'financeiro@exemplo.com.br', telefone: '(41) 3333-0000', endereco: 'Curitiba - PR', ativa: true }];
export const mockClientes: Pessoa[] = [
    { id: 1, empresaId: 1, nome: 'Cliente ABC Ltda.', cpfCnpj: '12.345.678/0001-90', email: 'contato@clienteabc.com.br', telefone: '(11) 98765-4321', endereco: 'São Paulo - SP', observacoes: 'Cliente estratégico.', ativo: true },
    { id: 2, empresaId: 1, nome: 'Comércio XYZ', cpfCnpj: '98.765.432/0001-10', email: 'financeiro@xyz.com.br', telefone: '(21) 99876-5432', endereco: 'Rio de Janeiro - RJ', ativo: true },
    { id: 3, empresaId: 1, nome: 'Indústria Alfa S.A.', cpfCnpj: '11.222.333/0001-44', telefone: '(31) 91234-5678', endereco: 'Belo Horizonte - MG', ativo: true },
    { id: 4, empresaId: 1, nome: 'Maria Oliveira', cpfCnpj: '123.456.789-00', telefone: '(41) 99876-3344', endereco: 'Curitiba - PR', ativo: true },
];
export const mockFornecedores: Pessoa[] = [
    { id: 1, empresaId: 1, nome: 'Imobiliária ABC', cpfCnpj: '33.444.555/0001-10', telefone: '(41) 3200-1000', endereco: 'Curitiba - PR', ativo: true },
    { id: 2, empresaId: 1, nome: 'Papelaria Silva', cpfCnpj: '44.555.666/0001-20', telefone: '(41) 3200-2000', endereco: 'Curitiba - PR', ativo: true },
    { id: 3, empresaId: 1, nome: 'TechManut', cpfCnpj: '55.666.777/0001-30', telefone: '(41) 3200-3000', endereco: 'Curitiba - PR', ativo: true },
];
export const mockCategorias: Categoria[] = [
    { id: 1, empresaId: 1, nome: 'Vendas', tipo: 'Receita', codigo: '1.01', ativa: true }, { id: 2, empresaId: 1, nome: 'Serviços', tipo: 'Receita', codigo: '1.02', ativa: true }, { id: 3, empresaId: 1, nome: 'Aluguel', tipo: 'Despesa', codigo: '2.01', ativa: true }, { id: 4, empresaId: 1, nome: 'Materiais', tipo: 'Despesa', codigo: '2.02', ativa: true }, { id: 5, empresaId: 1, nome: 'Impostos', tipo: 'Despesa', codigo: '2.03', ativa: true }, { id: 6, empresaId: 1, nome: 'Software', tipo: 'Despesa', codigo: '2.04', ativa: true },
];
export const mockContasFinanceiras: ContaFinanceira[] = [
    { id: 1, empresaId: 1, nome: 'Banco do Brasil - Conta Corrente', tipo: 'Conta Corrente', instituicao: 'Banco do Brasil', saldoInicial: 8200, ativa: true }, { id: 2, empresaId: 1, nome: 'Itaú - Conta Corrente', tipo: 'Conta Corrente', instituicao: 'Itaú', saldoInicial: 5600, ativa: true }, { id: 3, empresaId: 1, nome: 'Caixa - Poupança', tipo: 'Poupança', instituicao: 'Caixa', saldoInicial: 3200, ativa: true },
];
export const mockContasPagar: ContaPagar[] = [
    { id: 1, empresaId: 1, fornecedorId: 1, categoriaId: 3, contaFinanceiraId: 1, descricao: 'Aluguel do Escritório', valor: 5200, dataEmissao: d(5), dataVencimento: d(28), status: 'Pendente', formaPagamento: 'Transferência Bancária', observacoes: 'Aluguel referente ao mês.', parcelaNumero: 1, parcelaTotal: 12 },
    { id: 2, empresaId: 1, fornecedorId: 2, categoriaId: 4, contaFinanceiraId: 1, descricao: 'Compra de Materiais', valor: 1450, dataEmissao: d(8), dataVencimento: d(20), dataPagamento: d(20), status: 'Pago', formaPagamento: 'PIX', parcelaNumero: 1, parcelaTotal: 1 },
    { id: 3, empresaId: 1, fornecedorId: 3, categoriaId: 6, contaFinanceiraId: 2, descricao: 'Software de Gestão', valor: 890, dataEmissao: d(10), dataVencimento: d(25), status: 'Vencido', formaPagamento: 'Boleto', parcelaNumero: 2, parcelaTotal: 12 },
    { id: 4, empresaId: 1, categoriaId: 5, contaFinanceiraId: 1, descricao: 'Impostos - DAS', valor: 1890, dataEmissao: d(12), dataVencimento: d(30), status: 'Pendente', formaPagamento: 'Boleto', parcelaNumero: 1, parcelaTotal: 1 },
];
export const mockReceitas: Receita[] = [
    { id: 1, empresaId: 1, clienteId: 1, categoriaId: 1, contaFinanceiraId: 1, descricao: 'Venda NF 1254', tipo: 'Venda', valor: 5290, dataEmissao: d(10), dataVencimento: d(15), dataRecebimento: d(15), status: 'Recebido', formaRecebimento: 'Transferência Bancária', numeroDocumento: 'NF-e 1254', parcelaNumero: 1, parcelaTotal: 1 },
    { id: 2, empresaId: 1, clienteId: 2, categoriaId: 2, contaFinanceiraId: 2, descricao: 'Consultoria - Projeto XYZ', tipo: 'Serviço', valor: 12000, dataEmissao: d(12), dataVencimento: d(29), status: 'Previsto', formaRecebimento: 'Boleto', parcelaNumero: 1, parcelaTotal: 1 },
    { id: 3, empresaId: 1, clienteId: 1, categoriaId: 2, contaFinanceiraId: 1, descricao: 'Manutenção Mensal', tipo: 'Serviço', valor: 1200, dataEmissao: d(1), dataVencimento: d(18), status: 'Vencido', formaRecebimento: 'PIX', parcelaNumero: 1, parcelaTotal: 1 },
    { id: 4, empresaId: 1, clienteId: 3, categoriaId: 1, contaFinanceiraId: 2, descricao: 'Venda de Equipamentos', tipo: 'Venda', valor: 8750, dataEmissao: d(20), dataVencimento: d(30), status: 'Previsto', formaRecebimento: 'Transferência Bancária', parcelaNumero: 1, parcelaTotal: 3 },
];
export const mockFluxo: Fluxo = { saldoInicial: 17000, entradasRealizadas: 46200, saidasRealizadas: 33750, saldoRealizado: 29450, entradasProjetadas: 68550, saidasProjetadas: 48200, saldoProjetado: 37350, lancamentos: [
        { data: d(8), natureza: 'Saída', origem: 'Conta a pagar', id: 2, descricao: 'Pagamento de Energia Elétrica', entrada: 0, saida: 320, saldo: 16680, status: 'Pago', contaFinanceiraId: 1, projetado: false },
        { data: d(10), natureza: 'Entrada', origem: 'Receita', id: 1, descricao: 'Recebimento NF 874 - Cliente GHI', entrada: 6500, saida: 0, saldo: 23180, status: 'Recebido', contaFinanceiraId: 1, projetado: false },
        { data: d(12), natureza: 'Saída', origem: 'Conta a pagar', id: 1, descricao: 'Pagamento de Aluguel - Setembro', entrada: 0, saida: 1200, saldo: 21980, status: 'Pago', contaFinanceiraId: 1, projetado: false },
        { data: d(16), natureza: 'Entrada', origem: 'Receita', id: 4, descricao: 'Recebimento NF 982 - Cliente DEF', entrada: 8750, saida: 0, saldo: 30730, status: 'Recebido', contaFinanceiraId: 2, projetado: false },
        { data: d(20), natureza: 'Saída', origem: 'Transferência', id: 1, descricao: 'Transferência para Conta Poupança', entrada: 0, saida: 3000, saldo: 27730, status: 'Efetivada', contaFinanceiraId: 1, projetado: false },
        { data: d(29), natureza: 'Entrada', origem: 'Receita', id: 2, descricao: 'Consultoria - Projeto XYZ', entrada: 12000, saida: 0, saldo: 39730, status: 'Previsto', contaFinanceiraId: 2, projetado: true },
    ] };
export const mockAlerts: AlertItem[] = [
    { level: 'danger', title: '2 contas vencidas', detail: 'Total em atraso de R$ 3.240,00' }, { level: 'warning', title: '3 contas vencem esta semana', detail: 'Total de R$ 7.890,00' }, { level: 'info', title: 'Entrada prevista de R$ 12.000,00', detail: 'Cliente Comércio XYZ - 29/09/2026' }
];
