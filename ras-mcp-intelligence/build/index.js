#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
// Configurações e Instância da API
const RASTREMIX_API_URL = "https://aplicativo.rastremix.com.br";
let sessionCookie = null;
let lastLoginTime = 0;
/**
 * Camada de Inteligência MCP - Rastremix
 */
class RastremixMcpServer {
    server;
    axiosInstance;
    constructor() {
        this.server = new Server({
            name: "ras-mcp-intelligence",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.axiosInstance = axios.create({
            baseURL: RASTREMIX_API_URL,
            timeout: 15000,
            headers: {
                "Content-Type": "application/json",
            },
        });
        this.setupTools();
    }
    /**
     * Utilitário: Limpeza de Dados (Sanitization)
     */
    sanitizeNumbers(value) {
        return value.replace(/\D/g, "");
    }
    /**
     * Gerenciador de Autenticação (Auth Manager)
     */
    async ensureAuthenticated() {
        const now = Date.now();
        // Cache de cookie por 1 hora
        if (sessionCookie && now - lastLoginTime < 3600000) {
            return sessionCookie;
        }
        const email = process.env.RASTREMIX_EMAIL || "milenia@facilit.com";
        const password = process.env.RASTREMIX_PASSWORD || "123456";
        console.error("MCP: Realizando novo login na Rastremix...");
        try {
            const response = await this.axiosInstance.post("/auth/login", {
                email,
                password,
            });
            // Extrair cookie (depende da implementação da API legada)
            const setCookie = response.headers["set-cookie"];
            if (setCookie && setCookie.length > 0) {
                sessionCookie = setCookie[0].split(";")[0];
                lastLoginTime = now;
                return sessionCookie;
            }
            // Fallback para token se a API usar Bearer
            if (response.data.token) {
                sessionCookie = `Bearer ${response.data.token}`;
                lastLoginTime = now;
                return sessionCookie;
            }
            throw new Error("Não foi possível obter sessão da Rastremix.");
        }
        catch (err) {
            throw new Error(`Falha no Auth Manager: ${err.message}`);
        }
    }
    /**
     * Mapeamento de Ferramentas (Tools)
     */
    setupTools() {
        // 1. Listar Ferramentas
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "clean_payload",
                    description: "Limpa dados sensíveis (remover pontos/traços de CPF, CNPJ e Celular).",
                    inputSchema: {
                        type: "object",
                        properties: {
                            data: { type: "object", description: "Payload original do formulário" },
                            fields: { type: "array", items: { type: "string" }, description: "Lista de campos para limpar" }
                        },
                        required: ["data", "fields"],
                    },
                },
                {
                    name: "sync_to_legacy",
                    description: "Sincroniza um novo usuário com a API legacy da Rastremix.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            user_data: { type: "object" },
                        },
                        required: ["user_data"],
                    },
                },
                {
                    name: "get_fleet_status",
                    description: "Busca a posição em tempo real de todos os veículos da frota.",
                    inputSchema: {
                        type: "object",
                        properties: {},
                    },
                },
                {
                    name: "sync_definitive_mirror",
                    description: "Executa a sincronização definitiva usando o payload e headers espelhados do navegador.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            user_data: {
                                type: "object",
                                properties: {
                                    full_name: { type: "string" },
                                    login_email: { type: "string" },
                                    cpf: { type: "string" },
                                    password: { type: "string" },
                                    due_day: { type: "number" }
                                },
                                required: ["full_name", "login_email", "cpf", "password"]
                            }
                        },
                        required: ["user_data"],
                    },
                },
            ],
        }));
        // 2. Executar Ferramentas
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "clean_payload": {
                        const { data, fields } = args;
                        const cleaned = { ...data };
                        fields.forEach(field => {
                            if (cleaned[field]) {
                                cleaned[field] = this.sanitizeNumbers(cleaned[field]);
                            }
                        });
                        return {
                            content: [{ type: "text", text: JSON.stringify(cleaned, null, 2) }],
                        };
                    }
                    case "sync_to_legacy": {
                        const { user_data } = args;
                        const cookie = await this.ensureAuthenticated();
                        try {
                            const response = await this.axiosInstance.post("/users/save", user_data, {
                                headers: { "Cookie": cookie }
                            });
                            return {
                                content: [{ type: "text", text: `Sucesso: Usuário sincronizado. ID: ${response.data.id}` }],
                            };
                        }
                        catch (err) {
                            // Tratamento inteligente de Erro 500/BAD REQUEST
                            const errorBody = err.response?.data;
                            const status = err.response?.status;
                            if (status === 500 || status === 400) {
                                const message = errorBody?.message || JSON.stringify(errorBody);
                                let analysis = "Erro na API Rastremix: ";
                                if (message.includes("cpf_duplicate"))
                                    analysis += "O CPF informado já está em uso.";
                                else if (message.includes("email_invalid"))
                                    analysis += "O E-mail informado é inválido.";
                                else
                                    analysis += message;
                                return {
                                    isError: true,
                                    content: [{ type: "text", text: analysis }],
                                };
                            }
                            throw err;
                        }
                    }
                    case "get_fleet_status": {
                        const cookie = await this.ensureAuthenticated();
                        const response = await this.axiosInstance.post("/objects/items", {
                            size: 1500,
                            filter_by: "device"
                        }, {
                            headers: { "Cookie": cookie }
                        });
                        return {
                            content: [{ type: "text", text: JSON.stringify(response.data.items || [], null, 2) }],
                        };
                    }
                    case "sync_definitive_mirror": {
                        const { user_data } = args;
                        const mirrorPayload = new URLSearchParams();
                        const FIXED_TOKEN = "8UefPinuAXg6QJgUygn4gUN618ULTBDBnrdBAR9b";
                        mirrorPayload.append('_token', FIXED_TOKEN);
                        mirrorPayload.append('fakeusernameremembered', '');
                        mirrorPayload.append('fakepasswordremembered', '');
                        mirrorPayload.append('sync_button_status', '0');
                        mirrorPayload.append('data_cpf_cnpj', '');
                        mirrorPayload.append('id', '');
                        mirrorPayload.append('active', '1');
                        mirrorPayload.append('group_id', '2');
                        mirrorPayload.append('manager_id', '96833');
                        mirrorPayload.append('bin_admin_flags', '0');
                        mirrorPayload.append('bin_admin_flags', '1');
                        mirrorPayload.append('bin_permissions', '-1');
                        mirrorPayload.append('template_bin_permissions', '-1');
                        mirrorPayload.append('name', '');
                        mirrorPayload.append('client_name', user_data.full_name || "");
                        mirrorPayload.append('email', user_data.login_email || "");
                        mirrorPayload.append('client_login', user_data.login_email || "");
                        mirrorPayload.append('client_tab_client_email', user_data.login_email || "");
                        mirrorPayload.append('client_tab_client_cpf', user_data.cpf || "");
                        mirrorPayload.append('password', user_data.password || "");
                        mirrorPayload.append('password_confirmation', user_data.password || "");
                        mirrorPayload.append('client_pass', user_data.password || "");
                        mirrorPayload.append('data_de_vencimento', (user_data.due_day || 14).toString());
                        // Endereço (Vazios como no curl padrão se não fornecidos)
                        mirrorPayload.append('client_tab_client_postal_code', user_data.zip_code || "");
                        mirrorPayload.append('client_tab_client_address', user_data.address || "");
                        mirrorPayload.append('client_tab_client_address_number', user_data.address_number || "");
                        mirrorPayload.append('client_tab_complemento', user_data.complement || "");
                        mirrorPayload.append('client_tab_client_address_bairro', user_data.neighborhood || "");
                        mirrorPayload.append('client_tab_client_address_city', user_data.city || "");
                        mirrorPayload.append('client_tab_client_address_state', user_data.state || "");
                        mirrorPayload.append('tel_cel', user_data.celular || user_data.cellphone || "");
                        mirrorPayload.append('taxa_mensal', (user_data.monthly_value || "").toString());
                        const permsMap = {
                            'devices': ['view', 'edit'],
                            'alerts': ['view', 'edit', 'remove'],
                            'geofences': ['view', 'edit', 'remove'],
                            'reports': ['view', 'edit', 'remove'],
                            'send_command': ['view'],
                            'history': ['view', 'remove'],
                            'sharing': ['view', 'edit', 'remove']
                        };
                        Object.entries(permsMap).forEach(([mod, actions]) => {
                            actions.forEach(act => {
                                mirrorPayload.append(`perms[${mod}][${act}]`, '1');
                            });
                        });
                        const headers = {
                            "accept": "application/json, text/javascript, */*; q=0.01",
                            "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "origin": "https://aplicativo.rastremix.com.br",
                            "referer": "https://aplicativo.rastremix.com.br/admin/users/clients",
                            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
                            "x-requested-with": "XMLHttpRequest",
                            "Cookie": "_ga=GA1.1.750912743.1775263527; remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d=eyJpdiI6IjREdnZrMFRDRGhGWE1zR0xkNkRKeUE9PSIsInZhbHVlIjoiUzRMNTBOREZCZG03UVZ1QWRIU1VTT0hrSzcyMFhYaFV4U1VpQXpWR1NBSUNzbTk0aUpBbVA0SGIwQUIvRjZrYk5rUHkzUXBRSUgzOHA0cGZBUmtiZkpTQm9Nd21sR2k5NTdZQnppS0hUZmZVanZ5K0dIRUN3d255YjNIZTZqeEZZU0I3OFhoTGRoU25zQUdhQkkzUldsRFplU0Y3cWQ5MnRwZXJaM0cyZmNxeFNlY3h1WEZmaVFKUVMrbHNQajEzTjNoK056T01sa3VNdHdhZGZLS2V6R1NkS3NuSkV0UTRXTW9BK1VIeE0wZz0iLCJtYWMiOiIwYjc0NThkNWQwNGNiZTViZjAyMTg3MWMwNjVkMjdhNWI1NGQzZTY5OTAzODk2NWNjZDA0ODQ5ZDgwNzRiZTI4IiwidGFnIjoiIn0%3D; _ga_7KP7V1FZW3=GS2.1.s1775322699$o7$g1$t1775323243$j60$l0$h0; laravel_session=eyJpdiI6IkNQc2xUVDI3aFhEWkdEelVlTzEyQ3c9PSIsInZhbHVlIjoicFUzb2o4K1ZOY2Z4S2Ivbit5a0xleVdsa2MwSStybEIzRmY2alZSTjB5L1Q4Qm5uYkhFeVVzbHJoZEl0ZlZqejAxTTNjbkxNYmJIc1FIQnZtSThxbGt3K2pXb3dCT21uTm9NcGlvQW1xd0hjUmVsM1BnRnp1RXlqaEE3RXp6K1EiLCJtYWMiOiJlMDc5ZjZlYmI2M2FjZDdkM2I3MmM1YmEyYTNkYTY4OTE3YTdiYjQ5MDY1ZTc5ZTJmZTdjOThlYzViMWVjNTdhIiwidGFnIjoiIn0%3D"
                        };
                        const response = await axios.post("https://aplicativo.rastremix.com.br/admin/clients", mirrorPayload.toString(), {
                            headers: headers
                        });
                        return {
                            content: [{ type: "text", text: `Mirror Success! HTTP ${response.status}: ${JSON.stringify(response.data)}` }]
                        };
                    }
                    default:
                        throw new Error(`Ferramenta não encontrada: ${name}`);
                }
            }
            catch (error) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Erro no MCP Intelligence: ${error.message}` }],
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("MCP Inteligência Rastremix iniciado!");
    }
}
const server = new RastremixMcpServer();
server.run().catch(console.error);
