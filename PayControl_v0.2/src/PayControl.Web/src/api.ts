const rawBase =
    (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? '';

export const API_BASE = rawBase.replace(/\/$/, '');

export const DEMO_FALLBACK =
    String(import.meta.env.VITE_DEMO_FALLBACK ?? 'true').toLowerCase() !== 'false';

/*
 * ID da empresa atualmente selecionada no PayControl.
 *
 * O CompanyContext atualiza esse valor quando o usuário
 * escolhe outra empresa no cabeçalho.
 */
let activeEmpresaId: number | null = null;

/*
 * Atualiza a empresa utilizada pela camada de API.
 */
export function setApiEmpresaId(
    empresaId: number | null
) {
    activeEmpresaId = empresaId;
}

/*
 * Retorna a empresa atualmente configurada.
 */
export function getApiEmpresaId() {
    return activeEmpresaId;
}

/*
 * Algumas rotas são globais e não devem ser filtradas
 * pela empresa ativa.
 */
function isGlobalPath(path: string) {
    return (
        path.startsWith('/api/empresas') ||
        path.startsWith('/api/backups')
    );
}

/*
 * Acrescenta empresaId à query string das rotas
 * pertencentes ao contexto financeiro da empresa.
 */
export function withActiveCompany(path: string) {
    if (!activeEmpresaId) {
        return path;
    }

    if (isGlobalPath(path)) {
        return path;
    }

    if (/[?&]empresaId=/.test(path)) {
        return path;
    }

    const separator = path.includes('?')
        ? '&'
        : '?';

    return `${path}${separator}empresaId=${activeEmpresaId}`;
}

/*
 * Monta URL completa para downloads e links diretos,
 * como relatórios PDF e CSV.
 */
export function apiUrl(path: string) {
    return `${API_BASE}${withActiveCompany(path)}`;
}

/*
 * Lista das rotas cujo corpo possui associação com Empresa.
 *
 * Isso também corrige temporariamente os formulários antigos
 * que ainda enviam empresaId como null.
 */
function bodyUsesCompany(path: string) {
    const paths = [
        '/api/clientes',
        '/api/fornecedores',
        '/api/categorias',
        '/api/plano-contas',
        '/api/contas-financeiras',
        '/api/contas-pagar',
        '/api/contas',
        '/api/contas-receber',
        '/api/receitas',
        '/api/transferencias',
        '/api/recorrencias'
    ];

    return paths.some(
        prefix => path.startsWith(prefix)
    );
}

/*
 * Inclui a empresa ativa no corpo dos cadastros financeiros.
 */
function withCompanyBody(
    path: string,
    body: unknown
): unknown {
    if (!activeEmpresaId) {
        return body;
    }

    if (!bodyUsesCompany(path)) {
        return body;
    }

    if (
        body === null ||
        typeof body !== 'object' ||
        Array.isArray(body) ||
        body instanceof FormData
    ) {
        return body;
    }

    const objectBody =
        body as Record<string, unknown>;

    if (
        objectBody.empresaId !== undefined &&
        objectBody.empresaId !== null
    ) {
        return body;
    }

    return {
        ...objectBody,
        empresaId: activeEmpresaId
    };
}

/*
 * Classe utilizada para padronizar erros HTTP.
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
    }
}

/*
 * Função central responsável por executar
 * todas as requisições HTTP.
 */
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    /*
     * Acrescenta automaticamente empresaId.
     */
    const pathWithCompany =
        withActiveCompany(path);

    /*
     * Monta a URL completa.
     */
    const url =
        `${API_BASE}${pathWithCompany}`;

    /*
     * Copia os cabeçalhos recebidos.
     */
    const headers =
        new Headers(options.headers);

    /*
     * Requisições JSON precisam informar
     * Content-Type.
     *
     * FormData não deve receber este cabeçalho
     * manualmente porque o navegador adiciona
     * automaticamente o boundary.
     */
    if (
        !(options.body instanceof FormData) &&
        options.body != null
    ) {
        headers.set(
            'Content-Type',
            'application/json'
        );
    }

    /*
     * Executa a requisição.
     */
    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );

    /*
     * Trata respostas de erro.
     */
    if (!response.ok) {
        let message =
            `Erro ${response.status}`;

        try {
            const body =
                await response.json();

            message =
                body.mensagem ??
                body.message ??
                message;
        } catch {
            /*
             * Mantém a mensagem padrão caso
             * a resposta não seja JSON.
             */
        }

        throw new ApiError(
            response.status,
            message
        );
    }

    /*
     * Resposta sem conteúdo.
     */
    if (response.status === 204) {
        return undefined as T;
    }

    /*
     * Converte a resposta JSON.
     */
    return response.json() as Promise<T>;
}

/*
 * Métodos disponibilizados para as telas.
 */
export const api = {
    get: <T>(
        path: string
    ) =>
        request<T>(path),

    post: <T>(
        path: string,
        body?: unknown
    ) => {
        /*
         * Acrescenta empresaId ao corpo
         * quando necessário.
         */
        const preparedBody =
            body === undefined
                ? undefined
                : withCompanyBody(
                    path,
                    body
                );

        return request<T>(
            path,
            {
                method: 'POST',

                body:
                    preparedBody === undefined
                        ? undefined
                        : JSON.stringify(
                            preparedBody
                        )
            }
        );
    },

    put: <T>(
        path: string,
        body: unknown
    ) => {
        const preparedBody =
            withCompanyBody(
                path,
                body
            );

        return request<T>(
            path,
            {
                method: 'PUT',

                body:
                    JSON.stringify(
                        preparedBody
                    )
            }
        );
    },

    patch: <T>(
        path: string,
        body: unknown
    ) => {
        const preparedBody =
            withCompanyBody(
                path,
                body
            );

        return request<T>(
            path,
            {
                method: 'PATCH',

                body:
                    JSON.stringify(
                        preparedBody
                    )
            }
        );
    },

    delete: <T>(
        path: string
    ) =>
        request<T>(
            path,
            {
                method: 'DELETE'
            }
        ),

    upload: <T>(
        path: string,
        file: File,
        fields: Record<
            string,
            string | number
        > = {}
    ) => {
        const form =
            new FormData();

        form.append(
            'arquivo',
            file
        );

        Object.entries(
            fields
        ).forEach(
            ([key, value]) => {
                form.append(
                    key,
                    String(value)
                );
            }
        );

        return request<T>(
            path,
            {
                method: 'POST',
                body: form
            }
        );
    }
};

/*
 * Executa uma consulta real.
 *
 * Se a API estiver indisponível e o modo
 * demonstrativo estiver ativo, utiliza o fallback.
 */
export async function loadWithFallback<T>(
    loader: () => Promise<T>,
    fallback: T
): Promise<{
    data: T;
    demo: boolean;
    error?: string;
}> {
    try {
        return {
            data: await loader(),
            demo: false
        };
    } catch (error) {
        if (!DEMO_FALLBACK) {
            throw error;
        }

        return {
            data: fallback,
            demo: true,

            error:
                error instanceof Error
                    ? error.message
                    : 'API indisponível'
        };
    }
}