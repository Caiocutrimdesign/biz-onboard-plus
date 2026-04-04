#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";
import { z } from "zod";

// Configurações e Instância da API
const RASTREMIX_API_URL = "https://aplicativo.rastremix.com.br";
let sessionCookie: string | null = null;
let lastLoginTime: number = 0;

/**
 * Camada de Inteligência MCP - Rastremix
 */
class RastremixMcpServer {
  private server: Server;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: "ras-mcp-intelligence",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

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
  private sanitizeNumbers(value: string): string {
    return value.replace(/\D/g, "");
  }

  /**
   * Gerenciador de Autenticação (Auth Manager)
   */
  private async ensureAuthenticated() {
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
    } catch (err: any) {
      throw new Error(`Falha no Auth Manager: ${err.message}`);
    }
  }

  /**
   * Mapeamento de Ferramentas (Tools)
   */
  private setupTools() {
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
      ],
    }));

    // 2. Executar Ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "clean_payload": {
            const { data, fields } = args as { data: any, fields: string[] };
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
            const { user_data } = args as { user_data: any };
            const cookie = await this.ensureAuthenticated();
            
            try {
              const response = await this.axiosInstance.post("/users/save", user_data, {
                headers: { "Cookie": cookie }
              });
              return {
                content: [{ type: "text", text: `Sucesso: Usuário sincronizado. ID: ${response.data.id}` }],
              };
            } catch (err: any) {
              // Tratamento inteligente de Erro 500/BAD REQUEST
              const errorBody = err.response?.data;
              const status = err.response?.status;
              
              if (status === 500 || status === 400) {
                 const message = errorBody?.message || JSON.stringify(errorBody);
                 let analysis = "Erro na API Rastremix: ";
                 
                 if (message.includes("cpf_duplicate")) analysis += "O CPF informado já está em uso.";
                 else if (message.includes("email_invalid")) analysis += "O E-mail informado é inválido.";
                 else analysis += message;

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

          default:
            throw new Error(`Ferramenta não encontrada: ${name}`);
        }
      } catch (error: any) {
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
