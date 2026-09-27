# PayControl

## Sobre o Projeto

O **PayControl** é um sistema de gestão financeira desenvolvido para apoiar empresários individuais, MEIs, pequenas empresas e médias empresas no controle de suas entradas e saídas financeiras.

O sistema centraliza informações de **contas a pagar**, **contas a receber**, **clientes**, **fornecedores**, **categorias financeiras**, **contas financeiras**, **transferências**, **recorrências**, **conciliação bancária**, **relatórios** e **backups**.

A aplicação possui uma arquitetura separada em duas partes principais:

- **Backend:** C# com ASP.NET Core 10;
- **Frontend:** React com TypeScript e Vite.

Os dados são armazenados localmente em um banco de dados **SQLite**, permitindo que a aplicação funcione em ambiente local sem exigir um servidor de banco de dados externo.

A versão **0.2** mantém as funcionalidades validadas na versão 0.1 e concentra as alterações na **organização do código-fonte**, com indentação padronizada, separação visual das instruções e comentários em português para facilitar leitura, estudo, manutenção e evolução do projeto.

---

## Objetivo

O objetivo do PayControl é permitir que uma empresa acompanhe de forma simples e organizada:

- Valores a pagar;
- Valores a receber;
- Pagamentos realizados;
- Recebimentos realizados;
- Receitas previstas;
- Despesas previstas;
- Saldo realizado;
- Saldo projetado;
- Fluxo de caixa;
- Movimentações por conta financeira;
- Clientes;
- Fornecedores;
- Categorias financeiras;
- Plano de contas;
- Transferências internas;
- Lançamentos recorrentes;
- Parcelamentos;
- Conciliação bancária;
- Relatórios gerenciais;
- Backups do banco de dados.

O sistema busca oferecer uma visão financeira consolidada sem transformar o projeto, nesta fase, em um ERP completo.

---

## Tecnologias Utilizadas

### Backend

- C#;
- .NET 10;
- ASP.NET Core 10;
- ASP.NET Core Web API;
- Microsoft.Data.Sqlite;
- SQLite;
- OpenAPI.

### Frontend

- React 19;
- TypeScript;
- Vite;
- CSS;
- Fetch API para comunicação HTTP.

### Desenvolvimento

- Visual Studio Code ou Visual Studio;
- .NET SDK 10;
- Node.js;
- npm;
- Git opcional para controle de versão.

---

## Arquitetura do Sistema

O PayControl utiliza uma arquitetura cliente-servidor local.

```text
Navegador
   |
   v
React + TypeScript
PayControl.Web
   |
   | HTTP / JSON
   v
ASP.NET Core 10
PayControl.Api
   |
   v
SQLite
paycontrol.db
```

O frontend não acessa diretamente o banco de dados.

Todas as operações passam pela API ASP.NET Core, responsável por:

- Receber requisições HTTP;
- Validar regras de negócio;
- Executar operações no banco SQLite;
- Gerar relatórios;
- Processar recorrências;
- Gerenciar conciliação;
- Criar e restaurar backups;
- Retornar dados em JSON para o frontend.

---

## Estrutura do Projeto

```text
PayControl_v0.2/
|
|-- src/
|   |
|   |-- PayControl.Api/
|   |   |
|   |   |-- Controllers/
|   |   |-- Dtos/
|   |   |-- Models/
|   |   |-- Services/
|   |   |-- Properties/
|   |   |-- Program.cs
|   |   |-- appsettings.json
|   |   `-- PayControl.Api.csproj
|   |
|   `-- PayControl.Web/
|       |
|       |-- src/
|       |   |-- components/
|       |   |-- pages/
|       |   |-- App.tsx
|       |   |-- api.ts
|       |   |-- main.tsx
|       |   |-- mock.ts
|       |   |-- styles.css
|       |   `-- types.ts
|       |
|       |-- index.html
|       |-- package.json
|       |-- tsconfig.json
|       `-- vite.config.ts
|
|-- docs/
|   `-- prototipos/
|
|-- start-dev.bat
|-- start-dev.ps1
|-- PayControl.sln
|-- VERSION
`-- README.md
```

---

# Backend — PayControl.Api

## Program.cs

Arquivo principal de inicialização da API.

Responsável por:

- Criar a aplicação ASP.NET Core;
- Registrar Controllers;
- Registrar OpenAPI;
- Configurar CORS;
- Registrar os serviços da aplicação;
- Inicializar o banco SQLite;
- Configurar tratamento de exceções;
- Mapear os endpoints HTTP;
- Iniciar a API.

---

## Controllers

Os Controllers recebem requisições HTTP e direcionam cada operação para os serviços responsáveis pelas regras de negócio e persistência.

### CadastrosControllers.cs

Responsável pelos cadastros principais do sistema.

Inclui operações para:

- Empresas;
- Clientes;
- Fornecedores;
- Categorias;
- Contas financeiras.

Esses dados são utilizados pelos módulos financeiros para organizar os lançamentos.

### FinanceiroControllers.cs

Responsável pelas principais operações financeiras.

Inclui endpoints para:

- Contas a pagar;
- Contas a receber;
- Pagamentos;
- Recebimentos;
- Cancelamentos;
- Estornos;
- Transferências;
- Recorrências;
- Fluxo financeiro;
- Dashboard;
- Alertas.

### OrcamentoController.cs

Mantém compatibilidade com o módulo de orçamento existente nas versões anteriores do projeto.

### SupportControllers.cs

Agrupa recursos de apoio do sistema, incluindo:

- Relatórios;
- Exportações;
- Anexos;
- Conciliação bancária;
- Backups.

---

## DTOs

### Requests.cs

Contém os objetos utilizados para receber informações enviadas pelo frontend.

Exemplos:

- Cadastro de empresas;
- Cadastro de clientes;
- Cadastro de fornecedores;
- Criação de contas a pagar;
- Criação de contas a receber;
- Liquidação de lançamentos;
- Transferências;
- Recorrências;
- Cancelamentos;
- Conciliação.

A utilização de DTOs evita que o frontend manipule diretamente os modelos internos do banco.

---

## Models

### DomainModels.cs

Contém os modelos utilizados pelo domínio financeiro do sistema.

Entre as principais entidades estão:

- Empresa;
- Cliente;
- Fornecedor;
- Categoria;
- Conta financeira;
- Conta a pagar;
- Conta a receber;
- Transferência;
- Recorrência;
- Evento financeiro;
- Itens utilizados no fluxo de caixa.

---

## Services

A camada de Services concentra as regras de negócio e o acesso aos dados.

### DatabaseService.cs

Responsável pela infraestrutura do SQLite.

Entre suas responsabilidades estão:

- Definir o caminho do banco;
- Criar conexões SQLite;
- Inicializar as tabelas;
- Criar estruturas necessárias ao sistema;
- Executar migrações internas previstas pelo projeto;
- Manter compatibilidade com dados das versões anteriores.

### CadastrosService.cs

Responsável pelas operações dos cadastros mestres.

Permite:

- Criar empresas;
- Listar empresas;
- Atualizar empresas;
- Excluir registros permitidos;
- Cadastrar clientes;
- Cadastrar fornecedores;
- Cadastrar categorias;
- Cadastrar contas financeiras.

### FinanceiroService.cs

É um dos principais serviços do PayControl.

Responsável por:

- Contas a pagar;
- Contas a receber;
- Parcelamento;
- Pagamentos;
- Recebimentos;
- Cancelamentos;
- Estornos;
- Transferências internas;
- Recorrências;
- Eventos financeiros.

### ConsultaFinanceiraService.cs

Responsável por consultas consolidadas.

Permite obter:

- Fluxo de caixa;
- Saldo realizado;
- Saldo projetado;
- Saldos por conta financeira;
- Informações utilizadas no dashboard;
- Alertas financeiros.

### RelatoriosService.cs

Responsável pela geração dos relatórios gerenciais.

Inclui:

- Resumo financeiro;
- DRE gerencial simplificada;
- Receita bruta mensal;
- Inadimplência;
- Rankings;
- Série histórica do fluxo financeiro;
- Projeções;
- Exportação CSV;
- Relatório PDF.

### SupportServices.cs

Responsável por recursos complementares.

Inclui operações relacionadas a:

- Anexos;
- Conciliação bancária;
- Importação de arquivos;
- Backups;
- Restauração do banco.

### HostedServices.cs

Contém serviços executados automaticamente em segundo plano pela aplicação.

Entre suas responsabilidades estão rotinas que não dependem diretamente de uma ação de tela, como processamento programado previsto pela arquitetura.

### OrcamentoService.cs

Mantém as regras do módulo de orçamento herdado das primeiras versões do PayControl.

---

# Frontend — PayControl.Web

## App.tsx

Componente principal do frontend.

Responsável por:

- Controlar a página atual;
- Montar a navegação principal;
- Direcionar o usuário para as telas do sistema;
- Integrar as páginas com o layout geral.

---

## main.tsx

Ponto inicial da aplicação React.

Responsável por:

- Inicializar o React;
- Localizar o elemento raiz do HTML;
- Renderizar o componente principal;
- Carregar os estilos globais.

---

## api.ts

Centraliza a comunicação entre React e ASP.NET Core.

Responsável por:

- Definir a URL base da API;
- Executar requisições HTTP;
- Converter respostas JSON;
- Tratar respostas inválidas;
- Permitir uso de dados demonstrativos quando necessário.

A URL da API pode ser configurada através de:

```text
VITE_API_URL
```

Durante o desenvolvimento, o endereço esperado é:

```text
http://localhost:5080
```

---

## types.ts

Define os tipos TypeScript compartilhados pelas páginas.

Esses tipos ajudam a manter consistência entre:

- Dados retornados pela API;
- Estados React;
- Componentes;
- Tabelas;
- Indicadores financeiros.

---

## mock.ts

Contém dados demonstrativos utilizados pelo frontend.

O modo demonstrativo permite visualizar as telas mesmo quando:

- A API não estiver disponível;
- O banco estiver vazio;
- Ainda não existirem lançamentos suficientes para preencher todos os componentes visuais.

Esses dados não substituem o SQLite e não representam persistência real.

---

## components/

### Layout.tsx

Responsável pela estrutura geral da interface.

Inclui:

- Menu lateral;
- Cabeçalho superior;
- Área de conteúdo;
- Navegação entre módulos.

### UI.tsx

Agrupa componentes visuais reutilizáveis.

Entre eles:

- Cards;
- Indicadores KPI;
- Badges;
- Gráficos simplificados;
- Componentes de apoio para apresentação dos dados.

### Icon.tsx

Centraliza os ícones utilizados na interface.

---

## pages/

### DashboardPage.tsx

Apresenta a visão geral financeira.

Exibe informações como:

- Saldo realizado;
- Saldo projetado;
- Receitas;
- Despesas;
- Contas a vencer;
- Receitas a receber;
- Alertas;
- Últimos lançamentos;
- Indicadores visuais.

### AccountsPayablePage.tsx

Tela de contas a pagar.

Permite visualizar e operar despesas da empresa.

### AccountsReceivablePage.tsx

Tela de contas a receber.

Permite visualizar receitas originadas de vendas, serviços e outras entradas.

### CashFlowPage.tsx

Tela de fluxo de caixa.

Apresenta:

- Entradas;
- Saídas;
- Saldo;
- Movimentações;
- Valores realizados;
- Valores projetados.

### ReportsPage.tsx

Tela de relatórios gerenciais.

Centraliza os principais relatórios financeiros disponíveis na API.

### RegistryPage.tsx

Tela de cadastros.

Agrupa:

- Empresas;
- Clientes;
- Fornecedores;
- Categorias;
- Plano de contas;
- Contas financeiras.

### ReconciliationPage.tsx

Tela de conciliação bancária.

Permite trabalhar com movimentações bancárias importadas para comparação com os lançamentos registrados no sistema.

### BackupsPage.tsx

Tela destinada à criação, consulta e restauração de backups.

---

# Principais Funcionalidades

O PayControl v0.2 possui atualmente:

- Cadastro de empresas;
- Cadastro de clientes;
- Cadastro de fornecedores;
- Cadastro de categorias;
- Organização por plano de contas;
- Cadastro de contas financeiras;
- Controle de saldo inicial por conta;
- Contas a pagar;
- Contas a receber;
- Receitas de vendas;
- Receitas de serviços;
- Outras receitas;
- Pagamentos;
- Recebimentos;
- Data de emissão;
- Data de vencimento;
- Data de liquidação;
- Formas de pagamento;
- Formas de recebimento;
- Parcelamento;
- Lançamentos recorrentes;
- Transferências entre contas;
- Cancelamento de lançamentos;
- Estorno de pagamentos;
- Estorno de recebimentos;
- Preservação de lançamentos liquidados;
- Eventos financeiros associados aos lançamentos;
- Campos de documentos fiscais;
- Anexos;
- Fluxo de caixa realizado;
- Fluxo de caixa projetado;
- Extrato consolidado;
- Saldo por conta financeira;
- Projeções financeiras;
- Alertas;
- Dashboard financeiro;
- Relatórios de receitas;
- Relatórios de despesas;
- DRE gerencial simplificada;
- Receita bruta mensal;
- Relatório de inadimplência;
- Rankings;
- Exportação CSV;
- Exportação PDF;
- Importação de conciliação em CSV;
- Importação de conciliação em OFX;
- Backup manual;
- Rotina de backup prevista pelo backend;
- Restauração de backup;
- Modo demonstrativo do frontend.

---

# Regras Financeiras Importantes

## Contas a Pagar

As contas a pagar representam saídas financeiras.

Status utilizados pelo sistema incluem:

```text
Pendente
Pago
Vencido
Cancelado
```

Uma conta pendente cuja data de vencimento já passou pode ser apresentada como vencida.

Uma conta paga deve ser estornada antes de determinadas operações de cancelamento.

Lançamentos liquidados são preservados para evitar perda simples do histórico financeiro.

---

## Contas a Receber

As contas a receber representam entradas financeiras.

Status utilizados incluem:

```text
Previsto
Recebido
Vencido
Cancelado
```

O sistema diferencia a previsão de receita do recebimento efetivamente realizado.

---

## Saldo Realizado

O saldo realizado considera movimentações efetivamente liquidadas.

De forma conceitual:

```text
Saldo Realizado
=
Saldo Inicial
+
Recebimentos realizados
-
Pagamentos realizados
```

---

## Saldo Projetado

O saldo projetado considera também lançamentos futuros ainda não liquidados.

```text
Saldo Projetado
=
Saldo realizado
+
Receitas previstas
-
Despesas previstas
```

Essa informação permite antecipar períodos em que a empresa poderá enfrentar falta de caixa.

---

## Transferências Internas

Transferências entre contas financeiras da mesma empresa não devem ser tratadas como receita ou despesa da empresa.

Exemplo:

```text
Banco A
   |
   | R$ 5.000
   v
Banco B
```

Na conta de origem existe uma saída.

Na conta de destino existe uma entrada.

No consolidado da empresa, o patrimônio total não muda apenas por causa da transferência.

---

## Parcelamentos

O sistema permite dividir um lançamento em várias parcelas.

Exemplo:

```text
Compra: R$ 12.000
Parcelas: 12
```

O PayControl pode gerar lançamentos vinculados ao mesmo grupo de parcelamento.

Cada parcela mantém:

- Número da parcela;
- Total de parcelas;
- Valor;
- Vencimento;
- Identificação do grupo.

---

## Recorrências

O sistema possui estrutura para lançamentos recorrentes.

Frequências previstas:

```text
Semanal
Mensal
Bimestral
Trimestral
Semestral
Anual
```

A recorrência pode ser utilizada para despesas ou receitas repetitivas, como:

- Aluguel;
- Mensalidades;
- Contratos;
- Serviços recorrentes;
- Assinaturas.

---

# Relatórios

O módulo de relatórios disponibiliza diferentes análises financeiras.

## Resumo Financeiro

Apresenta uma visão consolidada do período.

## DRE Gerencial Simplificada

Apresenta uma visão gerencial do resultado financeiro.

Não substitui demonstrações contábeis formais emitidas por profissional habilitado.

## Receita Bruta Mensal

Permite acompanhar a evolução das receitas mensais.

## Inadimplência

Permite identificar contas a receber vencidas.

## Rankings

Permite gerar análises agregadas utilizadas para comparação de clientes, fornecedores ou categorias conforme a implementação da API.

## Série de Fluxo

Permite agrupar informações financeiras por período.

## Projeção

Apresenta valores futuros com base nos lançamentos previstos existentes no sistema.

## Exportações

A API disponibiliza exportação em:

```text
CSV
PDF
```

---

# Conciliação Bancária

O sistema possui estrutura para importar movimentações bancárias através de:

```text
CSV
OFX
```

Fluxo conceitual:

```text
Arquivo bancário
      |
      v
Importação
      |
      v
Item de conciliação
      |
      v
Comparação com lançamento financeiro
      |
      v
Vinculação / conciliação
```

A conciliação ajuda a comparar registros internos com movimentações efetivamente presentes no banco.

---

# Anexos

O backend permite vincular arquivos aos registros suportados pelo módulo de anexos.

Exemplos de arquivos que podem ser associados:

- Boleto;
- Comprovante;
- Nota fiscal;
- Recibo;
- Contrato;
- Documento de apoio.

---

# Backup

O banco SQLite contém informações financeiras importantes.

Por esse motivo, o sistema possui módulo de backup.

O backend permite:

- Listar backups;
- Criar backup;
- Restaurar backup.

Após a restauração, a própria API informa que a aplicação deve ser reiniciada antes de continuar.

---

# Banco de Dados

O PayControl utiliza **SQLite**.

O banco é criado automaticamente pelo backend quando necessário.

A inicialização é realizada pelo `DatabaseService`.

As estruturas do banco contemplam os módulos necessários ao funcionamento financeiro, incluindo cadastros, contas a pagar, contas a receber, transferências, recorrências, eventos e recursos de apoio.

A aplicação utiliza consultas parametrizadas para reduzir problemas de montagem manual de SQL com dados informados pelo usuário.

---

# API REST

Abaixo estão alguns dos principais grupos de endpoints.

## Empresas

```text
GET    /api/empresas
GET    /api/empresas/{id}
POST   /api/empresas
PUT    /api/empresas/{id}
DELETE /api/empresas/{id}
```

## Clientes

```text
/api/clientes
```

## Fornecedores

```text
/api/fornecedores
```

## Categorias

```text
/api/categorias
```

## Contas Financeiras

```text
/api/contas-financeiras
/api/contas-financeiras/saldos
```

## Contas a Pagar

```text
GET    /api/contas-pagar
GET    /api/contas-pagar/{id}
POST   /api/contas-pagar
PATCH  /api/contas-pagar/{id}
POST   /api/contas-pagar/{id}/pagar
POST   /api/contas-pagar/{id}/estornar
POST   /api/contas-pagar/{id}/cancelar
DELETE /api/contas-pagar/{id}
GET    /api/contas-pagar/{id}/eventos
```

O alias abaixo é mantido para compatibilidade:

```text
/api/contas
```

## Contas a Receber

```text
GET    /api/contas-receber
GET    /api/contas-receber/{id}
POST   /api/contas-receber
PATCH  /api/contas-receber/{id}
POST   /api/contas-receber/{id}/receber
POST   /api/contas-receber/{id}/estornar
POST   /api/contas-receber/{id}/cancelar
DELETE /api/contas-receber/{id}
GET    /api/contas-receber/{id}/eventos
```

O alias abaixo também existe:

```text
/api/receitas
```

## Transferências

```text
GET  /api/transferencias
POST /api/transferencias
POST /api/transferencias/{id}/cancelar
```

## Recorrências

```text
GET  /api/recorrencias
POST /api/recorrencias
POST /api/recorrencias/processar
```

## Fluxo Financeiro

```text
GET /api/fluxo-financeiro
```

Alias:

```text
GET /api/extrato
```

## Dashboard

```text
GET /api/dashboard
GET /api/dashboard/alertas
```

## Relatórios

```text
GET /api/relatorios/resumo
GET /api/relatorios/dre
GET /api/relatorios/receita-bruta-mensal
GET /api/relatorios/inadimplencia
GET /api/relatorios/rankings
GET /api/relatorios/serie-fluxo
GET /api/relatorios/projecao
GET /api/relatorios/exportar/{tipo}
GET /api/relatorios/pdf/resumo
```

## Conciliação

```text
POST /api/conciliacao/importar-csv
POST /api/conciliacao/importar-ofx
GET  /api/conciliacao
POST /api/conciliacao/vincular
```

## Backups

```text
GET  /api/backups
POST /api/backups
POST /api/backups/restaurar
```

## OpenAPI

Durante o desenvolvimento, a descrição OpenAPI pode ser consultada em:

```text
http://localhost:5080/openapi/v1.json
```

---

# Validações e Regras de Negócio

O sistema realiza validações antes de persistir e alterar dados.

Entre os exemplos existentes estão:

- Descrição obrigatória para lançamentos;
- Valor maior que zero;
- Vencimento não anterior à emissão;
- Quantidade válida de parcelas;
- Bloqueio de edição de lançamento já liquidado ou cancelado em determinados fluxos;
- Bloqueio de pagamento duplicado;
- Bloqueio de recebimento duplicado;
- Necessidade de estorno antes de cancelar determinados lançamentos liquidados;
- Preservação de registros financeiros relevantes;
- Validação de recorrência;
- Regras específicas para transferências;
- Tratamento centralizado de exceções na API.

---

# Interface do Sistema

O menu principal do frontend apresenta:

```text
Dashboard
Contas a Pagar
Contas a Receber
Fluxo de Caixa
Relatórios
Cadastros
Conciliação
Backups
```

As telas seguem o protótipo visual validado durante o desenvolvimento.

Os protótipos estão armazenados em:

```text
docs/prototipos/
```

---

# Requisitos para Desenvolvimento

Para executar o projeto em Windows é necessário possuir:

- Windows 10 ou Windows 11;
- .NET SDK 10;
- Node.js;
- npm;
- Navegador moderno.

Visual Studio Code ou Visual Studio são opcionais, mas recomendados para edição do código.

---

# Verificação do Ambiente

Abra o Prompt de Comando e execute:

```bash
dotnet --version
```

O resultado deve iniciar com:

```text
10.
```

Depois execute:

```bash
node -v
npm -v
```

Os comandos devem retornar as versões instaladas.

---

# Compilação do Backend

Acesse a pasta:

```text
src\PayControl.Api
```

Execute:

```bash
dotnet restore
```

Depois:

```bash
dotnet build
```

A compilação deve terminar sem erros.

Avisos do compilador devem ser avaliados, mas não necessariamente impedem a execução.

---

# Execução do Backend

Ainda na pasta da API:

```bash
dotnet run
```

O endereço configurado para desenvolvimento é:

```text
http://localhost:5080
```

A API deve permanecer em execução enquanto o frontend estiver sendo testado.

---

# Instalação do Frontend

Abra outro terminal.

Acesse:

```text
src\PayControl.Web
```

Instale as dependências:

```bash
npm install
```

---

# Execução do Frontend

Execute:

```bash
npm run dev
```

O Vite deverá informar o endereço local.

O endereço padrão utilizado durante o desenvolvimento é:

```text
http://localhost:5173
```

Abra esse endereço no navegador.

---

# Build do Frontend

Para validar o TypeScript e gerar os arquivos de produção:

```bash
npm run build
```

O script configurado executa a verificação TypeScript antes da geração do build do Vite.

---

# Execução Simplificada no Windows

Na raiz do projeto existem scripts para facilitar a inicialização:

```text
start-dev.bat
start-dev.ps1
```

Eles podem ser utilizados depois que o ambiente estiver corretamente instalado.

Para a primeira execução, recomenda-se testar backend e frontend separadamente para facilitar a identificação de erros.

---

# Fluxo Básico de Utilização

Uma sequência recomendada para um ambiente vazio é:

```text
1. Iniciar o backend
       |
       v
2. Iniciar o frontend
       |
       v
3. Cadastrar a empresa
       |
       v
4. Cadastrar contas financeiras
       |
       v
5. Cadastrar categorias
       |
       v
6. Cadastrar clientes e fornecedores
       |
       v
7. Registrar contas a pagar
       |
       v
8. Registrar contas a receber
       |
       v
9. Efetuar pagamentos e recebimentos
       |
       v
10. Consultar o fluxo de caixa
       |
       v
11. Consultar dashboard e relatórios
       |
       v
12. Criar backup
```

Os módulos podem ser utilizados em outra ordem quando os dados necessários já estiverem cadastrados.

---

# Teste Funcional Sugerido

## 1. Empresa

Cadastre uma empresa de teste.

## 2. Conta Financeira

Cadastre uma conta com saldo inicial.

Exemplo:

```text
Banco Principal
Saldo inicial: R$ 10.000,00
```

## 3. Receita

Cadastre uma receita:

```text
Descrição: Serviço Cliente A
Valor: R$ 5.000,00
Status inicial: Previsto
```

## 4. Despesa

Cadastre uma conta a pagar:

```text
Descrição: Aluguel
Valor: R$ 2.000,00
Status inicial: Pendente
```

## 5. Liquidação

Marque a receita como recebida e a conta como paga.

O impacto conceitual esperado é:

```text
Saldo inicial      R$ 10.000
Recebimento       +R$  5.000
Pagamento         -R$  2.000
-----------------------------
Saldo realizado    R$ 13.000
```

---

# Organização e Legibilidade do Código — Versão 0.2

A versão 0.2 foi criada para melhorar a legibilidade do projeto sem alterar intencionalmente suas funcionalidades.

As principais mudanças de código foram:

- Expansão de trechos anteriormente muito compactados;
- Indentação consistente;
- Separação visual de instruções;
- Comentários em português;
- Comentários em métodos e etapas lógicas;
- Comentários em consultas SQL e parâmetros;
- Comentários nos principais estados e efeitos React;
- Comentários nos blocos visuais JSX;
- Organização das regras CSS em blocos mais fáceis de localizar.

Os comentários foram escritos com objetivo didático e de manutenção.

Eles explicam principalmente **por que** e **para que** determinada etapa existe, evitando depender apenas do nome da instrução.

---

# Arquivos que Não Foram Funcionalmente Alterados na Versão 0.2

A versão 0.2 não foi planejada como uma versão de novas funcionalidades.

Os arquivos de configuração, scripts e protótipos foram preservados, exceto pelos identificadores estritamente necessários para representar a nova versão.

O foco desta versão é:

```text
Legibilidade
+
Documentação
+
Manutenção
```

---

# Recursos Fora do Escopo Atual

Alguns recursos discutidos durante o planejamento não fazem parte desta versão.

Entre eles:

- Integração direta com Pix;
- Centros de custo;
- Usuários e permissões;
- Auditoria por usuário.

Esses itens podem ser tratados em versões futuras.

---

# Segurança e Cuidados de Uso

O PayControl manipula informações financeiras.

Em um ambiente real, recomenda-se:

- Realizar backups periódicos;
- Proteger o computador onde o banco está armazenado;
- Não compartilhar arquivos do banco sem necessidade;
- Restringir acesso ao diretório da aplicação;
- Testar restauração de backup;
- Evitar exclusão manual de arquivos internos;
- Utilizar HTTPS quando a aplicação for disponibilizada em rede;
- Implementar autenticação antes de uso multiusuário ou exposição externa.

A versão atual é direcionada principalmente a desenvolvimento e validação funcional local.

---

# Conceitos Aplicados no Projeto

Durante o desenvolvimento são utilizados conceitos de engenharia de software e desenvolvimento web, incluindo:

- Programação orientada a objetos;
- C#;
- ASP.NET Core;
- APIs REST;
- Programação assíncrona;
- Injeção de dependências;
- Controllers;
- Services;
- DTOs;
- Models;
- SQLite;
- SQL;
- Consultas parametrizadas;
- Chaves primárias;
- Chaves estrangeiras;
- Persistência local;
- React;
- TypeScript;
- Componentização;
- Hooks;
- Estado;
- Efeitos;
- Requisições HTTP;
- JSON;
- CSS responsivo;
- Separação entre frontend e backend;
- Tratamento de erros;
- Modularização;
- Versionamento de software.

---

# Versão Atual

```text
PayControl 0.2
```

A versão 0.2 mantém a base funcional validada da 0.1 e melhora principalmente a qualidade de leitura e documentação do código.

---

# Considerações Finais

O **PayControl** reúne em uma única aplicação recursos essenciais de gestão financeira para pequenos negócios, permitindo controlar contas a pagar, contas a receber, receitas, despesas, saldos, projeções, cadastros, transferências, recorrências, conciliação e relatórios.

A separação entre **ASP.NET Core** e **React + TypeScript** permite evoluir backend e frontend de maneira independente, mantendo uma API central como camada de integração.

O uso de **SQLite** simplifica a execução local e elimina a necessidade inicial de instalar um servidor de banco de dados separado.

A versão **0.2** melhora a documentação interna do código para facilitar estudo, manutenção e desenvolvimento das próximas etapas do projeto.

O próximo ciclo pode se concentrar novamente em evolução funcional, agora sobre uma base de código mais legível e documentada.
