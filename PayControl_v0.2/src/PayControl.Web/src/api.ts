// Prepara o valor `rawBase` usado pela tela.
const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? '';
export const API_BASE = rawBase.replace(/\/$/, '');
export const DEMO_FALLBACK = String(import.meta.env.VITE_DEMO_FALLBACK ?? 'true').toLowerCase() !== 'false';
export class ApiError extends Error {
    constructor(public status: number, message: string) { super(message); }
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    // Prepara o valor `url` usado pela tela.
    const url = `${API_BASE}${path}`;
    // Prepara o valor `headers` usado pela tela.
    const headers = new Headers(options.headers);
    // Valida a condição antes de continuar com a ação.
    if (!(options.body instanceof FormData) && options.body != null)
        headers.set('Content-Type', 'application/json');
    // Prepara o valor `response` usado pela tela.
    const response = await fetch(url, { ...options, headers });
    // Valida a condição antes de continuar com a ação.
    if (!response.ok) {
        let message = `Erro ${response.status}`;
        // Inicia o bloco protegido para tratar possíveis falhas da operação.
        try {
            // Prepara o valor `body` usado pela tela.
            const body = await response.json();
            message = body.mensagem ?? body.message ?? message;
        }
        // Trata uma eventual falha sem interromper a experiência do usuário.
        catch { }
        throw new ApiError(response.status, message);
    }
    // Valida a condição antes de continuar com a ação.
    if (response.status === 204)
        // Retorna a interface que será renderizada pelo React.
        return undefined as T;
    // Retorna a interface que será renderizada pelo React.
    return response.json() as Promise<T>;
}
export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    upload: <T>(path: string, file: File, fields: Record<string, string | number> = {}) => {
        // Prepara o valor `form` usado pela tela.
        const form = new FormData();
        form.append('arquivo', file);
        Object.entries(fields).forEach(([k, v]) => form.append(k, String(v)));
        // Retorna a interface que será renderizada pelo React.
        return request<T>(path, { method: 'POST', body: form });
    }
};
export async function loadWithFallback<T>(loader: () => Promise<T>, fallback: T): Promise<{
    data: T;
    demo: boolean;
    error?: string;
}> {
    // Inicia o bloco protegido para tratar possíveis falhas da operação.
    try {
        // Retorna a interface que será renderizada pelo React.
        return { data: await loader(), demo: false };
    }
    // Trata uma eventual falha sem interromper a experiência do usuário.
    catch (e) {
        // Valida a condição antes de continuar com a ação.
        if (!DEMO_FALLBACK)
            throw e;
        // Retorna a interface que será renderizada pelo React.
        return { data: fallback, demo: true, error: e instanceof Error ? e.message : 'API indisponível' };
    }
}
