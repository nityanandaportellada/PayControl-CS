using Microsoft.Data.Sqlite;
using PayControl.Api.Dtos;
using PayControl.Api.Models;

namespace PayControl.Api.Services;

public sealed class CadastrosService(DatabaseService db)
{
    /*
     * ============================================================
     * EMPRESAS
     * ============================================================
     */

    public async Task<IReadOnlyList<Empresa>> ListarEmpresasAsync()
    {
        var lista = new List<Empresa>();

        await using var connection = db.CreateConnection();

        await connection.OpenAsync();

        var command = connection.CreateCommand();

        command.CommandText = """
            SELECT
                id,
                nome,
                nome_fantasia,
                cpf_cnpj,
                email,
                telefone,
                endereco,
                ativa
            FROM empresas
            ORDER BY nome;
            """;

        await using var reader =
            await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            lista.Add(
                new Empresa(
                    reader.GetInt64(0),
                    reader.GetString(1),
                    NStr(reader, 2),
                    NStr(reader, 3),
                    NStr(reader, 4),
                    NStr(reader, 5),
                    NStr(reader, 6),
                    reader.GetInt64(7) == 1
                )
            );
        }

        return lista;
    }


    public async Task<Empresa?> ObterEmpresaAsync(
        long id
    )
    {
        return (await ListarEmpresasAsync())
            .FirstOrDefault(
                empresa =>
                    empresa.Id == id
            );
    }


    public async Task<Empresa> CriarEmpresaAsync(
        EmpresaRequest request
    )
    {
        ValidarNome(
            request.Nome
        );

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            INSERT INTO empresas
            (
                nome,
                nome_fantasia,
                cpf_cnpj,
                email,
                telefone,
                endereco,
                ativa
            )
            VALUES
            (
                $nome,
                $fantasia,
                $documento,
                $email,
                $telefone,
                $endereco,
                $ativa
            );

            SELECT last_insert_rowid();
            """;

        P(
            command,
            "$nome",
            request.Nome.Trim()
        );

        P(
            command,
            "$fantasia",
            Limpar(
                request.NomeFantasia
            )
        );

        P(
            command,
            "$documento",
            Limpar(
                request.CpfCnpj
            )
        );

        P(
            command,
            "$email",
            Limpar(
                request.Email
            )
        );

        P(
            command,
            "$telefone",
            Limpar(
                request.Telefone
            )
        );

        P(
            command,
            "$endereco",
            Limpar(
                request.Endereco
            )
        );

        P(
            command,
            "$ativa",
            request.Ativa
                ? 1
                : 0
        );

        var id =
            Convert.ToInt64(
                await command
                    .ExecuteScalarAsync()
            );

        return (
            await ObterEmpresaAsync(
                id
            )
        )!;
    }


    public async Task<Empresa> AtualizarEmpresaAsync(
        long id,
        EmpresaRequest request
    )
    {
        ValidarNome(
            request.Nome
        );

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            UPDATE empresas

            SET
                nome = $nome,
                nome_fantasia = $fantasia,
                cpf_cnpj = $documento,
                email = $email,
                telefone = $telefone,
                endereco = $endereco,
                ativa = $ativa

            WHERE id = $id;
            """;

        P(
            command,
            "$nome",
            request.Nome.Trim()
        );

        P(
            command,
            "$fantasia",
            Limpar(
                request.NomeFantasia
            )
        );

        P(
            command,
            "$documento",
            Limpar(
                request.CpfCnpj
            )
        );

        P(
            command,
            "$email",
            Limpar(
                request.Email
            )
        );

        P(
            command,
            "$telefone",
            Limpar(
                request.Telefone
            )
        );

        P(
            command,
            "$endereco",
            Limpar(
                request.Endereco
            )
        );

        P(
            command,
            "$ativa",
            request.Ativa
                ? 1
                : 0
        );

        P(
            command,
            "$id",
            id
        );

        if (
            await command
                .ExecuteNonQueryAsync()
            ==
            0
        )
        {
            throw new KeyNotFoundException(
                "Empresa não encontrada."
            );
        }

        return (
            await ObterEmpresaAsync(
                id
            )
        )!;
    }


    /*
     * ============================================================
     * CLIENTES
     * ============================================================
     */

    public Task<IReadOnlyList<Cliente>>
        ListarClientesAsync(
            long? empresaId
        )
    {
        return ListarPessoasAsync(
            "clientes",
            empresaId,

            reader =>
                new Cliente(
                    reader.GetInt64(0),
                    NLong(
                        reader,
                        1
                    ),
                    reader.GetString(2),
                    NStr(
                        reader,
                        3
                    ),
                    NStr(
                        reader,
                        4
                    ),
                    NStr(
                        reader,
                        5
                    ),
                    NStr(
                        reader,
                        6
                    ),
                    NStr(
                        reader,
                        7
                    ),
                    reader.GetInt64(8)
                    ==
                    1
                )
        );
    }


    public async Task<Cliente?>
        ObterClienteAsync(
            long id
        )
    {
        return (
            await ListarClientesAsync(
                null
            )
        )
        .FirstOrDefault(
            cliente =>
                cliente.Id == id
        );
    }


    public Task<Cliente>
        CriarClienteAsync(
            PessoaRequest request
        )
    {
        return CriarPessoaAsync(
            "clientes",
            request,
            ObterClienteAsync
        );
    }


    public Task<Cliente>
        AtualizarClienteAsync(
            long id,
            PessoaRequest request
        )
    {
        return AtualizarPessoaAsync(
            "clientes",
            id,
            request,
            ObterClienteAsync
        );
    }


    /*
     * ============================================================
     * FORNECEDORES
     * ============================================================
     */

    public Task<IReadOnlyList<Fornecedor>>
        ListarFornecedoresAsync(
            long? empresaId
        )
    {
        return ListarPessoasAsync(
            "fornecedores",
            empresaId,

            reader =>
                new Fornecedor(
                    reader.GetInt64(0),

                    NLong(
                        reader,
                        1
                    ),

                    reader.GetString(2),

                    NStr(
                        reader,
                        3
                    ),

                    NStr(
                        reader,
                        4
                    ),

                    NStr(
                        reader,
                        5
                    ),

                    NStr(
                        reader,
                        6
                    ),

                    NStr(
                        reader,
                        7
                    ),

                    reader.GetInt64(8)
                    ==
                    1
                )
        );
    }


    public async Task<Fornecedor?>
        ObterFornecedorAsync(
            long id
        )
    {
        return (
            await ListarFornecedoresAsync(
                null
            )
        )
        .FirstOrDefault(
            fornecedor =>
                fornecedor.Id == id
        );
    }


    public Task<Fornecedor>
        CriarFornecedorAsync(
            PessoaRequest request
        )
    {
        return CriarPessoaAsync(
            "fornecedores",
            request,
            ObterFornecedorAsync
        );
    }


    public Task<Fornecedor>
        AtualizarFornecedorAsync(
            long id,
            PessoaRequest request
        )
    {
        return AtualizarPessoaAsync(
            "fornecedores",
            id,
            request,
            ObterFornecedorAsync
        );
    }


    /*
     * ============================================================
     * MÉTODOS COMPARTILHADOS ENTRE CLIENTES E FORNECEDORES
     * ============================================================
     */

    private async Task<IReadOnlyList<T>>
        ListarPessoasAsync<T>(
            string table,
            long? empresaId,
            Func<SqliteDataReader, T> map
        )
    {
        var lista =
            new List<T>();

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = $"""
            SELECT
                id,
                empresa_id,
                nome,
                cpf_cnpj,
                email,
                telefone,
                endereco,
                observacoes,
                ativo

            FROM {table}

            WHERE
                (
                    $empresa IS NULL
                    OR
                    empresa_id = $empresa
                )

            ORDER BY nome;
            """;

        P(
            command,
            "$empresa",
            empresaId
        );

        await using var reader =
            await command.ExecuteReaderAsync();

        while (
            await reader.ReadAsync()
        )
        {
            lista.Add(
                map(
                    reader
                )
            );
        }

        return lista;
    }


    private async Task<T>
        CriarPessoaAsync<T>(
            string table,
            PessoaRequest request,
            Func<long, Task<T?>> getter
        )
        where T : class
    {
        ValidarNome(
            request.Nome
        );

        await ValidarEmpresaAsync(
            request.EmpresaId
        );

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = $"""
            INSERT INTO {table}
            (
                empresa_id,
                nome,
                cpf_cnpj,
                email,
                telefone,
                endereco,
                observacoes,
                ativo
            )
            VALUES
            (
                $empresa,
                $nome,
                $documento,
                $email,
                $telefone,
                $endereco,
                $observacoes,
                $ativo
            );

            SELECT last_insert_rowid();
            """;

        P(
            command,
            "$empresa",
            request.EmpresaId
        );

        P(
            command,
            "$nome",
            request.Nome.Trim()
        );

        P(
            command,
            "$documento",
            Limpar(
                request.CpfCnpj
            )
        );

        P(
            command,
            "$email",
            Limpar(
                request.Email
            )
        );

        P(
            command,
            "$telefone",
            Limpar(
                request.Telefone
            )
        );

        P(
            command,
            "$endereco",
            Limpar(
                request.Endereco
            )
        );

        P(
            command,
            "$observacoes",
            Limpar(
                request.Observacoes
            )
        );

        P(
            command,
            "$ativo",
            request.Ativo
                ? 1
                : 0
        );

        var id =
            Convert.ToInt64(
                await command
                    .ExecuteScalarAsync()
            );

        return (
            await getter(
                id
            )
        )!;
    }


    private async Task<T>
        AtualizarPessoaAsync<T>(
            string table,
            long id,
            PessoaRequest request,
            Func<long, Task<T?>> getter
        )
        where T : class
    {
        ValidarNome(
            request.Nome
        );

        await ValidarEmpresaAsync(
            request.EmpresaId
        );

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = $"""
            UPDATE {table}

            SET
                empresa_id = $empresa,
                nome = $nome,
                cpf_cnpj = $documento,
                email = $email,
                telefone = $telefone,
                endereco = $endereco,
                observacoes = $observacoes,
                ativo = $ativo

            WHERE id = $id;
            """;

        P(
            command,
            "$empresa",
            request.EmpresaId
        );

        P(
            command,
            "$nome",
            request.Nome.Trim()
        );

        P(
            command,
            "$documento",
            Limpar(
                request.CpfCnpj
            )
        );

        P(
            command,
            "$email",
            Limpar(
                request.Email
            )
        );

        P(
            command,
            "$telefone",
            Limpar(
                request.Telefone
            )
        );

        P(
            command,
            "$endereco",
            Limpar(
                request.Endereco
            )
        );

        P(
            command,
            "$observacoes",
            Limpar(
                request.Observacoes
            )
        );

        P(
            command,
            "$ativo",
            request.Ativo
                ? 1
                : 0
        );

        P(
            command,
            "$id",
            id
        );

        if (
            await command
                .ExecuteNonQueryAsync()
            ==
            0
        )
        {
            throw new KeyNotFoundException(
                "Cadastro não encontrado."
            );
        }

        return (
            await getter(
                id
            )
        )!;
    }


    /*
     * ============================================================
     * PLANO DE CONTAS
     * ============================================================
     */

    public async Task<IReadOnlyList<Categoria>>
        ListarCategoriasAsync(
            long? empresaId,
            string? tipo
        )
    {
        var lista =
            new List<Categoria>();

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            SELECT
                id,
                empresa_id,
                nome,
                tipo,
                categoria_pai_id,
                codigo,
                ativa

            FROM categorias

            WHERE
                (
                    $empresa IS NULL
                    OR
                    empresa_id = $empresa
                )

                AND

                (
                    $tipo IS NULL
                    OR
                    lower(tipo) = lower($tipo)
                )

            ORDER BY
                COALESCE(codigo, ''),
                nome;
            """;

        P(
            command,
            "$empresa",
            empresaId
        );

        P(
            command,
            "$tipo",
            tipo
        );

        await using var reader =
            await command.ExecuteReaderAsync();

        while (
            await reader.ReadAsync()
        )
        {
            lista.Add(
                new Categoria(
                    reader.GetInt64(0),

                    NLong(
                        reader,
                        1
                    ),

                    reader.GetString(2),

                    reader.GetString(3),

                    NLong(
                        reader,
                        4
                    ),

                    NStr(
                        reader,
                        5
                    ),

                    reader.GetInt64(6)
                    ==
                    1
                )
            );
        }

        return lista;
    }


    public async Task<Categoria?>
        ObterCategoriaAsync(
            long id
        )
    {
        return (
            await ListarCategoriasAsync(
                null,
                null
            )
        )
        .FirstOrDefault(
            categoria =>
                categoria.Id == id
        );
    }


    public async Task<Categoria>
        CriarCategoriaAsync(
            CategoriaRequest request
        )
    {
        await ValidarCategoriaAsync(
            request,
            null
        );

        var tipo =
            TipoCategoria(
                request.Tipo
            );

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            INSERT INTO categorias
            (
                empresa_id,
                nome,
                tipo,
                categoria_pai_id,
                codigo,
                ativa
            )
            VALUES
            (
                $empresa,
                $nome,
                $tipo,
                $pai,
                $codigo,
                $ativa
            );

            SELECT last_insert_rowid();
            """;

        P(
            command,
            "$empresa",
            request.EmpresaId
        );

        P(
            command,
            "$nome",
            request.Nome.Trim()
        );

        P(
            command,
            "$tipo",
            tipo
        );

        P(
            command,
            "$pai",
            request.CategoriaPaiId
        );

        P(
            command,
            "$codigo",
            Limpar(
                request.Codigo
            )
        );

        P(
            command,
            "$ativa",
            request.Ativa
                ? 1
                : 0
        );

        var id =
            Convert.ToInt64(
                await command
                    .ExecuteScalarAsync()
            );

        return (
            await ObterCategoriaAsync(
                id
            )
        )!;
    }


    public async Task<Categoria>
        AtualizarCategoriaAsync(
            long id,
            CategoriaRequest request
        )
    {
        if (
            await ObterCategoriaAsync(
                id
            )
            is null
        )
        {
            throw new KeyNotFoundException(
                "Conta do Plano de Contas não encontrada."
            );
        }

        await ValidarCategoriaAsync(
            request,
            id
        );

        var tipo =
            TipoCategoria(
                request.Tipo
            );

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            UPDATE categorias

            SET
                empresa_id = $empresa,
                nome = $nome,
                tipo = $tipo,
                categoria_pai_id = $pai,
                codigo = $codigo,
                ativa = $ativa

            WHERE id = $id;
            """;

        P(
            command,
            "$empresa",
            request.EmpresaId
        );

        P(
            command,
            "$nome",
            request.Nome.Trim()
        );

        P(
            command,
            "$tipo",
            tipo
        );

        P(
            command,
            "$pai",
            request.CategoriaPaiId
        );

        P(
            command,
            "$codigo",
            Limpar(
                request.Codigo
            )
        );

        P(
            command,
            "$ativa",
            request.Ativa
                ? 1
                : 0
        );

        P(
            command,
            "$id",
            id
        );

        if (
            await command
                .ExecuteNonQueryAsync()
            ==
            0
        )
        {
            throw new KeyNotFoundException(
                "Conta do Plano de Contas não encontrada."
            );
        }

        return (
            await ObterCategoriaAsync(
                id
            )
        )!;
    }


    /*
     * ============================================================
     * CONTAS FINANCEIRAS
     * ============================================================
     */

    public async Task<IReadOnlyList<ContaFinanceira>>
        ListarContasFinanceirasAsync(
            long? empresaId
        )
    {
        var lista =
            new List<ContaFinanceira>();

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            SELECT
                id,
                empresa_id,
                nome,
                tipo,
                instituicao,
                agencia,
                numero_conta,
                saldo_inicial,
                ativa

            FROM contas_financeiras

            WHERE
                (
                    $empresa IS NULL
                    OR
                    empresa_id = $empresa
                )

            ORDER BY nome;
            """;

        P(
            command,
            "$empresa",
            empresaId
        );

        await using var reader =
            await command.ExecuteReaderAsync();

        while (
            await reader.ReadAsync()
        )
        {
            lista.Add(
                new ContaFinanceira(
                    reader.GetInt64(0),

                    NLong(
                        reader,
                        1
                    ),

                    reader.GetString(2),

                    reader.GetString(3),

                    NStr(
                        reader,
                        4
                    ),

                    NStr(
                        reader,
                        5
                    ),

                    NStr(
                        reader,
                        6
                    ),

                    Convert.ToDecimal(
                        reader.GetDouble(7)
                    ),

                    reader.GetInt64(8)
                    ==
                    1
                )
            );
        }

        return lista;
    }


    public async Task<ContaFinanceira?>
        ObterContaFinanceiraAsync(
            long id
        )
    {
        return (
            await ListarContasFinanceirasAsync(
                null
            )
        )
        .FirstOrDefault(
            conta =>
                conta.Id == id
        );
    }


    public async Task<ContaFinanceira>
        CriarContaFinanceiraAsync(
            ContaFinanceiraRequest request
        )
    {
        await ValidarContaFinanceiraAsync(
            request
        );

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            INSERT INTO contas_financeiras
            (
                empresa_id,
                nome,
                tipo,
                instituicao,
                agencia,
                numero_conta,
                saldo_inicial,
                ativa
            )
            VALUES
            (
                $empresa,
                $nome,
                $tipo,
                $instituicao,
                $agencia,
                $numero,
                $saldo,
                $ativa
            );

            SELECT last_insert_rowid();
            """;

        P(
            command,
            "$empresa",
            request.EmpresaId
        );

        P(
            command,
            "$nome",
            request.Nome.Trim()
        );

        P(
            command,
            "$tipo",
            request.Tipo.Trim()
        );

        P(
            command,
            "$instituicao",
            Limpar(
                request.Instituicao
            )
        );

        P(
            command,
            "$agencia",
            Limpar(
                request.Agencia
            )
        );

        P(
            command,
            "$numero",
            Limpar(
                request.NumeroConta
            )
        );

        P(
            command,
            "$saldo",
            request.SaldoInicial
        );

        P(
            command,
            "$ativa",
            request.Ativa
                ? 1
                : 0
        );

        var id =
            Convert.ToInt64(
                await command
                    .ExecuteScalarAsync()
            );

        return (
            await ObterContaFinanceiraAsync(
                id
            )
        )!;
    }


    public async Task<ContaFinanceira>
        AtualizarContaFinanceiraAsync(
            long id,
            ContaFinanceiraRequest request
        )
    {
        var atual =
            await ObterContaFinanceiraAsync(
                id
            )
            ??
            throw new KeyNotFoundException(
                "Conta financeira não encontrada."
            );

        await ValidarEmpresaAsync(
            atual.EmpresaId
        );

        ValidarNome(
            request.Nome
        );

        if (
            string.IsNullOrWhiteSpace(
                request.Tipo
            )
        )
        {
            throw new ArgumentException(
                "Tipo da conta financeira é obrigatório."
            );
        }

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            UPDATE contas_financeiras

            SET
                nome = $nome,
                tipo = $tipo,
                instituicao = $instituicao,
                agencia = $agencia,
                numero_conta = $numero,
                ativa = $ativa

            WHERE id = $id;
            """;

        /*
         * O saldo inicial não é alterado.
         *
         * Ele representa o ponto inicial do histórico
         * financeiro da conta.
         *
         * Depois do cadastro, alterações de saldo devem
         * ocorrer através de pagamentos, recebimentos
         * e transferências.
         */

        P(
            command,
            "$nome",
            request.Nome.Trim()
        );

        P(
            command,
            "$tipo",
            request.Tipo.Trim()
        );

        P(
            command,
            "$instituicao",
            Limpar(
                request.Instituicao
            )
        );

        P(
            command,
            "$agencia",
            Limpar(
                request.Agencia
            )
        );

        P(
            command,
            "$numero",
            Limpar(
                request.NumeroConta
            )
        );

        P(
            command,
            "$ativa",
            request.Ativa
                ? 1
                : 0
        );

        P(
            command,
            "$id",
            id
        );

        if (
            await command
                .ExecuteNonQueryAsync()
            ==
            0
        )
        {
            throw new KeyNotFoundException(
                "Conta financeira não encontrada."
            );
        }

        return (
            await ObterContaFinanceiraAsync(
                id
            )
        )!;
    }


    /*
     * ============================================================
     * EXCLUSÕES SEGURAS
     * ============================================================
     */

    public async Task ExcluirCadastroAsync(
        string table,
        string entidade,
        long id
    )
    {
        switch (table)
        {
            case "clientes":

                await ValidarExclusaoClienteAsync(
                    id
                );

                break;


            case "fornecedores":

                await ValidarExclusaoFornecedorAsync(
                    id
                );

                break;


            case "categorias":

                await ValidarExclusaoCategoriaAsync(
                    id
                );

                break;


            case "contas_financeiras":

                await ValidarExclusaoContaFinanceiraAsync(
                    id
                );

                break;


            default:

                throw new ArgumentException(
                    "Cadastro não suportado para exclusão."
                );
        }

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText =
            $"DELETE FROM {table} WHERE id = $id;";

        P(
            command,
            "$id",
            id
        );

        if (
            await command
                .ExecuteNonQueryAsync()
            ==
            0
        )
        {
            throw new KeyNotFoundException(
                $"{entidade} não encontrado."
            );
        }
    }


    /*
     * ============================================================
     * VALIDAÇÕES DO PLANO DE CONTAS
     * ============================================================
     */

    private async Task ValidarCategoriaAsync(
        CategoriaRequest request,
        long? idAtual
    )
    {
        ValidarNome(
            request.Nome
        );

        await ValidarEmpresaAsync(
            request.EmpresaId
        );

        var tipo =
            TipoCategoria(
                request.Tipo
            );

        var codigo =
            Limpar(
                request.Codigo
            );

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();


        /*
         * --------------------------------------------------------
         * DUPLICIDADE DO CÓDIGO
         * --------------------------------------------------------
         */

        if (
            !string.IsNullOrWhiteSpace(
                codigo
            )
        )
        {
            var duplicado =
                connection.CreateCommand();

            duplicado.CommandText = """
                SELECT COUNT(*)

                FROM categorias

                WHERE
                    (
                        (
                            $empresa IS NULL
                            AND
                            empresa_id IS NULL
                        )
                        OR
                        empresa_id = $empresa
                    )

                    AND

                    lower(
                        trim(
                            COALESCE(
                                codigo,
                                ''
                            )
                        )
                    )
                    =
                    lower(
                        trim(
                            $codigo
                        )
                    )

                    AND

                    (
                        $idAtual IS NULL
                        OR
                        id <> $idAtual
                    );
                """;

            P(
                duplicado,
                "$empresa",
                request.EmpresaId
            );

            P(
                duplicado,
                "$codigo",
                codigo
            );

            P(
                duplicado,
                "$idAtual",
                idAtual
            );

            if (
                Convert.ToInt32(
                    await duplicado
                        .ExecuteScalarAsync()
                )
                >
                0
            )
            {
                throw new InvalidOperationException(
                    $"Já existe uma conta com o código '{codigo}' nesta empresa."
                );
            }
        }


        /*
         * Conta raiz não possui pai.
         */

        if (
            !request
                .CategoriaPaiId
                .HasValue
        )
        {
            return;
        }


        /*
         * Não permite que uma conta
         * seja pai dela mesma.
         */

        if (
            idAtual.HasValue
            &&
            request
                .CategoriaPaiId
                .Value
            ==
            idAtual.Value
        )
        {
            throw new ArgumentException(
                "Uma conta não pode ser pai dela mesma."
            );
        }


        /*
         * Recupera a conta pai.
         */

        var paiCommand =
            connection.CreateCommand();

        paiCommand.CommandText = """
            SELECT
                empresa_id,
                tipo,
                categoria_pai_id

            FROM categorias

            WHERE id = $id;
            """;

        P(
            paiCommand,
            "$id",
            request
                .CategoriaPaiId
                .Value
        );

        await using var paiReader =
            await paiCommand
                .ExecuteReaderAsync();

        if (
            !await paiReader
                .ReadAsync()
        )
        {
            throw new ArgumentException(
                "A conta pai informada não existe."
            );
        }

        var empresaPai =
            NLong(
                paiReader,
                0
            );

        var tipoPai =
            paiReader
                .GetString(1);


        /*
         * O pai precisa pertencer
         * à mesma empresa.
         */

        if (
            empresaPai
            !=
            request.EmpresaId
        )
        {
            throw new ArgumentException(
                "A conta pai deve pertencer à mesma empresa."
            );
        }


        /*
         * Não mistura Receita com Despesa.
         */

        if (
            !tipoPai.Equals(
                tipo,
                StringComparison
                    .OrdinalIgnoreCase
            )
        )
        {
            throw new ArgumentException(
                "A conta pai deve possuir o mesmo tipo: Receita ou Despesa."
            );
        }

        await paiReader.DisposeAsync();


        /*
         * --------------------------------------------------------
         * EVITA CICLOS
         * --------------------------------------------------------
         *
         * Exemplo inválido:
         *
         * Conta A
         *    ↓
         * Conta B
         *    ↓
         * Conta A
         */

        if (
            idAtual.HasValue
        )
        {
            var visitados =
                new HashSet<long>();

            var atual =
                request.CategoriaPaiId;

            while (
                atual.HasValue
            )
            {
                if (
                    !visitados.Add(
                        atual.Value
                    )
                )
                {
                    throw new ArgumentException(
                        "Foi detectado um ciclo inválido no Plano de Contas."
                    );
                }

                if (
                    atual.Value
                    ==
                    idAtual.Value
                )
                {
                    throw new ArgumentException(
                        "A conta pai escolhida criaria um ciclo no Plano de Contas."
                    );
                }

                var ancestralCommand =
                    connection.CreateCommand();

                ancestralCommand.CommandText = """
                    SELECT categoria_pai_id

                    FROM categorias

                    WHERE id = $id;
                    """;

                P(
                    ancestralCommand,
                    "$id",
                    atual.Value
                );

                var valor =
                    await ancestralCommand
                        .ExecuteScalarAsync();

                atual =
                    valor is null
                    or DBNull

                    ? null

                    : Convert.ToInt64(
                        valor
                    );
            }
        }
    }


    /*
     * ============================================================
     * VALIDAÇÕES DE CONTA FINANCEIRA
     * ============================================================
     */

    private async Task
        ValidarContaFinanceiraAsync(
            ContaFinanceiraRequest request
        )
    {
        ValidarNome(
            request.Nome
        );

        await ValidarEmpresaAsync(
            request.EmpresaId
        );

        if (
            string.IsNullOrWhiteSpace(
                request.Tipo
            )
        )
        {
            throw new ArgumentException(
                "Tipo da conta financeira é obrigatório."
            );
        }
    }


    /*
     * ============================================================
     * VALIDAÇÃO DE EMPRESA
     * ============================================================
     */

    private async Task
        ValidarEmpresaAsync(
            long? empresaId
        )
    {
        if (
            !empresaId.HasValue
        )
        {
            throw new ArgumentException(
                "Empresa é obrigatória."
            );
        }

        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            SELECT COUNT(*)

            FROM empresas

            WHERE id = $id;
            """;

        P(
            command,
            "$id",
            empresaId.Value
        );

        if (
            Convert.ToInt32(
                await command
                    .ExecuteScalarAsync()
            )
            ==
            0
        )
        {
            throw new ArgumentException(
                "Empresa informada não existe."
            );
        }
    }


    /*
     * ============================================================
     * VALIDAÇÕES DE EXCLUSÃO
     * ============================================================
     */

    private async Task
        ValidarExclusaoClienteAsync(
            long id
        )
    {
        if (
            await ContarAsync(
                "contas_receber",
                "cliente_id",
                id
            )
            >
            0

            ||

            await ContarAsync(
                "recorrencias",
                "cliente_id",
                id
            )
            >
            0
        )
        {
            throw new InvalidOperationException(
                "Cliente possui lançamentos ou recorrências vinculadas. Inative o cliente em vez de excluí-lo."
            );
        }
    }


    private async Task
        ValidarExclusaoFornecedorAsync(
            long id
        )
    {
        if (
            await ContarAsync(
                "contas_pagar",
                "fornecedor_id",
                id
            )
            >
            0

            ||

            await ContarAsync(
                "recorrencias",
                "fornecedor_id",
                id
            )
            >
            0
        )
        {
            throw new InvalidOperationException(
                "Fornecedor possui lançamentos ou recorrências vinculadas. Inative o fornecedor em vez de excluí-lo."
            );
        }
    }


    private async Task
        ValidarExclusaoCategoriaAsync(
            long id
        )
    {
        /*
         * Não exclui uma conta que possui
         * contas filhas.
         */

        if (
            await ContarAsync(
                "categorias",
                "categoria_pai_id",
                id
            )
            >
            0
        )
        {
            throw new InvalidOperationException(
                "Esta conta possui contas filhas no Plano de Contas e não pode ser excluída."
            );
        }


        /*
         * Não exclui conta que já possui
         * histórico financeiro.
         */

        if (
            await ContarAsync(
                "contas_pagar",
                "categoria_id",
                id
            )
            >
            0

            ||

            await ContarAsync(
                "contas_receber",
                "categoria_id",
                id
            )
            >
            0

            ||

            await ContarAsync(
                "recorrencias",
                "categoria_id",
                id
            )
            >
            0
        )
        {
            throw new InvalidOperationException(
                "Esta conta do Plano de Contas possui lançamentos vinculados. Inative-a em vez de excluí-la."
            );
        }
    }


    private async Task
        ValidarExclusaoContaFinanceiraAsync(
            long id
        )
    {
        var possuiVinculo =

            await ContarAsync(
                "contas_pagar",
                "conta_financeira_id",
                id
            )
            >
            0

            ||

            await ContarAsync(
                "contas_receber",
                "conta_financeira_id",
                id
            )
            >
            0

            ||

            await ContarAsync(
                "recorrencias",
                "conta_financeira_id",
                id
            )
            >
            0

            ||

            await ContarAsync(
                "conciliacao_itens",
                "conta_financeira_id",
                id
            )
            >
            0

            ||

            await ContarTransferenciasAsync(
                id
            )
            >
            0;

        if (
            possuiVinculo
        )
        {
            throw new InvalidOperationException(
                "Conta financeira possui movimentações ou vínculos históricos. Inative-a em vez de excluí-la."
            );
        }
    }


    /*
     * ============================================================
     * MÉTODOS AUXILIARES DE CONTAGEM
     * ============================================================
     */

    private async Task<long>
        ContarAsync(
            string table,
            string column,
            long id
        )
    {
        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText =
            $"SELECT COUNT(*) FROM {table} WHERE {column} = $id;";

        P(
            command,
            "$id",
            id
        );

        return Convert.ToInt64(
            await command
                .ExecuteScalarAsync()
        );
    }


    private async Task<long>
        ContarTransferenciasAsync(
            long contaId
        )
    {
        await using var connection =
            db.CreateConnection();

        await connection.OpenAsync();

        var command =
            connection.CreateCommand();

        command.CommandText = """
            SELECT COUNT(*)

            FROM transferencias

            WHERE
                conta_origem_id = $id
                OR
                conta_destino_id = $id;
            """;

        P(
            command,
            "$id",
            contaId
        );

        return Convert.ToInt64(
            await command
                .ExecuteScalarAsync()
        );
    }


    /*
     * ============================================================
     * MÉTODOS AUXILIARES
     * ============================================================
     */

    private static void ValidarNome(
        string nome
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                nome
            )
        )
        {
            throw new ArgumentException(
                "Nome é obrigatório."
            );
        }
    }


    private static string TipoCategoria(
        string tipo
    )
    {
        return tipo
            .Trim()
            .ToLowerInvariant()
            switch
            {
                "receita" =>
                    "Receita",

                "despesa" =>
                    "Despesa",

                _ =>
                    throw new ArgumentException(
                        "Tipo deve ser Receita ou Despesa."
                    )
            };
    }


    private static string? Limpar(
        string? valor
    )
    {
        return string.IsNullOrWhiteSpace(
            valor
        )

            ? null

            : valor.Trim();
    }


    internal static void P(
        SqliteCommand command,
        string name,
        object? value
    )
    {
        command.Parameters.AddWithValue(
            name,
            value ?? DBNull.Value
        );
    }


    private static string? NStr(
        SqliteDataReader reader,
        int index
    )
    {
        return reader.IsDBNull(
            index
        )

            ? null

            : reader.GetString(
                index
            );
    }


    private static long? NLong(
        SqliteDataReader reader,
        int index
    )
    {
        return reader.IsDBNull(
            index
        )

            ? null

            : reader.GetInt64(
                index
            );
    }
}