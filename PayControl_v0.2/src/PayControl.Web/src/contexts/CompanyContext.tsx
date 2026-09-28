import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';

import type {
    ReactNode
} from 'react';

import {
    api,
    loadWithFallback,
    setApiEmpresaId
} from '../api';

import {
    mockEmpresas
} from '../mock';

import type {
    Empresa
} from '../types';


/*
 * Nome utilizado para guardar no navegador
 * a última empresa selecionada.
 */
const STORAGE_KEY =
    'paycontrol_empresa_ativa_id';


/*
 * Define os valores que serão disponibilizados
 * globalmente pelo contexto.
 */
type CompanyContextValue = {
    empresas: Empresa[];

    empresaAtiva:
        Empresa | null;

    empresaAtivaId:
        number | null;

    carregandoEmpresas:
        boolean;

    selecionarEmpresa:
        (
            empresaId: number
        ) => void;

    atualizarEmpresas:
        (
            empresaPreferidaId?:
                number | null
        ) => Promise<void>;
};


/*
 * Cria o contexto React.
 */
const CompanyContext =
    createContext<
        CompanyContextValue | null
    >(null);


/*
 * Provider responsável por controlar
 * a empresa ativa de toda a aplicação.
 */
export function CompanyProvider({
    children
}: {
    children: ReactNode;
}) {
    /*
     * Lista de empresas cadastradas.
     */
    const [
        empresas,
        setEmpresas
    ] =
        useState<Empresa[]>([]);


    /*
     * ID da empresa atualmente ativa.
     */
    const [
        empresaAtivaId,
        setEmpresaAtivaId
    ] =
        useState<number | null>(
            () => {
                /*
                 * Recupera a empresa salva já na criação
                 * do estado. Isso evita que o primeiro
                 * useEffect apague a seleção durante o F5.
                 */
                const valorSalvo =
                    localStorage.getItem(
                        STORAGE_KEY
                    );


                if (!valorSalvo) {
                    return null;
                }


                const idSalvo =
                    Number(
                        valorSalvo
                    );


                return (
                    Number.isFinite(
                        idSalvo
                    )
                    &&
                    idSalvo > 0
                )
                    ? idSalvo
                    : null;
            }
        );


    /*
     * Indica se as empresas ainda
     * estão sendo carregadas.
     */
    const [
        carregandoEmpresas,
        setCarregandoEmpresas
    ] =
        useState(true);


    /*
     * Busca as empresas no backend.
     *
     * Também determina qual delas
     * deverá ficar ativa.
     */
    async function atualizarEmpresas(
        empresaPreferidaId?:
            number | null
    ) {
        setCarregandoEmpresas(
            true
        );

        try {
            /*
             * Busca todas as empresas.
             */
            const resultado =
                await loadWithFallback(
                    () =>
                        api.get<
                            Empresa[]
                        >(
                            '/api/empresas'
                        ),

                    mockEmpresas
                );


            const lista =
                resultado.data;


            /*
             * Atualiza a lista global.
             */
            setEmpresas(
                lista
            );


            /*
             * Recupera a empresa salva
             * anteriormente no navegador.
             */
            const idSalvo =
                Number(
                    localStorage.getItem(
                        STORAGE_KEY
                    )
                );


            /*
             * Define a prioridade:
             *
             * 1. empresa solicitada;
             * 2. empresa já ativa;
             * 3. empresa salva no navegador.
             */
            const idAtual =
                empresaPreferidaId ??
                empresaAtivaId ??
                (
                    Number.isFinite(
                        idSalvo
                    ) &&
                    idSalvo > 0

                        ? idSalvo

                        : null
                );


            /*
             * Verifica se a empresa ainda
             * existe e está ativa.
             */
            const empresaValida =
                lista.find(
                    empresa =>
                        empresa.id ===
                            idAtual &&
                        empresa.ativa
                ) ??

                /*
                 * Caso contrário seleciona
                 * a primeira empresa ativa.
                 */
                lista.find(
                    empresa =>
                        empresa.ativa
                ) ??

                /*
                 * Em último caso usa
                 * o primeiro registro.
                 */
                lista[0] ??

                null;


            const novoId =
                empresaValida?.id ??
                null;


            /*
             * Atualiza o estado React.
             */
            setEmpresaAtivaId(
                novoId
            );


            /*
             * Atualiza imediatamente
             * a camada de API.
             */
            setApiEmpresaId(
                novoId
            );


            /*
             * Persiste a escolha.
             */
            if (novoId) {
                localStorage.setItem(
                    STORAGE_KEY,
                    String(novoId)
                );
            } else {
                localStorage.removeItem(
                    STORAGE_KEY
                );
            }

        } finally {
            setCarregandoEmpresas(
                false
            );
        }
    }


    /*
     * Carrega as empresas quando
     * a aplicação inicia.
     */
    useEffect(() => {
        void atualizarEmpresas();
    }, []);


    /*
     * Mantém localStorage e API sincronizados
     * com a empresa ativa.
     */
    useEffect(() => {
        /*
         * Enquanto a lista inicial ainda está sendo
         * carregada, não alteramos o localStorage.
         * Dessa forma um F5 não apaga a empresa salva.
         */
        if (carregandoEmpresas) {
            return;
        }


        setApiEmpresaId(
            empresaAtivaId
        );


        if (empresaAtivaId) {
            localStorage.setItem(
                STORAGE_KEY,
                String(
                    empresaAtivaId
                )
            );
        } else {
            localStorage.removeItem(
                STORAGE_KEY
            );
        }

    }, [empresaAtivaId, carregandoEmpresas]);


    /*
     * Altera a empresa ativa.
     */
    function selecionarEmpresa(
        empresaId: number
    ) {
        /*
         * Confirma que a empresa existe
         * e está ativa.
         */
        const existe =
            empresas.some(
                empresa =>
                    empresa.id ===
                        empresaId &&
                    empresa.ativa
            );


        if (!existe) {
            return;
        }


        /*
         * Atualiza primeiro a API.
         *
         * Isso é importante para impedir
         * que uma página recém-remontada
         * consulte dados da empresa anterior.
         */
        setApiEmpresaId(
            empresaId
        );


        /*
         * Salva imediatamente no navegador.
         */
        localStorage.setItem(
            STORAGE_KEY,
            String(
                empresaId
            )
        );


        /*
         * Atualiza o estado global.
         */
        setEmpresaAtivaId(
            empresaId
        );
    }


    /*
     * Localiza o objeto Empresa
     * correspondente ao ID ativo.
     */
    const empresaAtiva =
        useMemo(
            () =>
                empresas.find(
                    empresa =>
                        empresa.id ===
                        empresaAtivaId
                ) ??
                null,

            [
                empresas,
                empresaAtivaId
            ]
        );


    /*
     * Monta o valor disponibilizado
     * pelo Context.
     */
    const value =
        useMemo<
            CompanyContextValue
        >(
            () => ({
                empresas,

                empresaAtiva,

                empresaAtivaId,

                carregandoEmpresas,

                selecionarEmpresa,

                atualizarEmpresas
            }),

            [
                empresas,
                empresaAtiva,
                empresaAtivaId,
                carregandoEmpresas
            ]
        );


    /*
     * Disponibiliza o contexto
     * para toda a aplicação.
     */
    return (
        <CompanyContext.Provider
            value={value}
        >
            {children}
        </CompanyContext.Provider>
    );
}


/*
 * Hook simplificado para acessar
 * a empresa ativa.
 */
export function useCompany() {
    const context =
        useContext(
            CompanyContext
        );


    if (!context) {
        throw new Error(
            'useCompany deve ser utilizado dentro de CompanyProvider.'
        );
    }


    return context;
}