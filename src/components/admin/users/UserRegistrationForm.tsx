import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PrincipalTab } from "./PrincipalTab"
import { ClientTab } from "./ClientTab"
import { PermissionsTab } from "./PermissionsTab"
import { VehiclesTab } from "./VehiclesTab"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Loader2, Save, X } from "lucide-react"

const userFormSchema = z.object({
  // Principal
  status: z.string().default("Ativo"),
  login_email: z.string().email("Email inválido"),
  group_name: z.string().min(1, "Selecione um grupo"),
  has_device_limit: z.boolean().default(false),
  device_limit: z.coerce.number().optional(),
  has_expiration: z.boolean().default(false),
  expiration_date: z.string().optional(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  password_confirmation: z.string(),
  
  // Cliente
  document: z.string().optional(),
  full_name: z.string().min(3, "Nome muito curto"),
  rg: z.string().optional(),
  birth_date: z.string().optional(),
  zip_code: z.string().optional(),
  address: z.string().optional(),
  address_number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  cellphone: z.string().optional(),
  monthly_value: z.coerce.number().optional(),
  fixed_phone: z.string().optional(),
  due_day: z.coerce.number().optional(),
  billing_email: z.string().email("Email inválido").optional().or(z.literal("")),
  income: z.coerce.number().optional(),
  support_phone: z.string().optional(),
  admin_notes: z.string().optional(),

  // Permissões
  permissions: z.record(z.object({
    view: z.boolean(),
    edit: z.boolean(),
    delete: z.boolean(),
  })).default({}),

  // Veículos
  vehicles: z.array(z.string()).default([]),
}).refine((data) => data.password === data.password_confirmation, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"],
})

type UserFormValues = z.infer<typeof userFormSchema>

export const UserRegistrationForm = ({ onCancel }: { onCancel?: () => void }) => {
  const [activeTab, setActiveTab] = useState("principal")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      status: "Ativo",
      group_name: "Usuário",
      has_device_limit: false,
      has_expiration: false,
      permissions: {
        dispositivos: { view: true, edit: true, delete: false },
        alertas: { view: true, edit: true, delete: true },
        cercas: { view: true, edit: true, delete: true },
        relatorios: { view: true, edit: true, delete: true },
        comandos: { view: true, edit: false, delete: false },
        historico_api: { view: true, edit: false, delete: true },
        compartilhar_localizacao: { view: true, edit: true, delete: true },
        servicos: { view: false, edit: false, delete: false },
        imei: { view: false, edit: false, delete: false },
      },
      vehicles: [],
    },
  })

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true)
    try {
      console.log("🚀 Caminho Definitivo: Iniciando salvamento e sincronia bilateral...", values)

      const { data, error: invokeError } = await supabase.functions.invoke('sync-rastremix', {
        body: { 
          type: 'register',
          user_data: {
            ...values,
            password_confirmation: values.password,
            due_day: values.due_day || 14
          }
        }
      })

      if (invokeError) throw invokeError

      if (data?.success) {
        if (data.sync_status === 'error') {
          toast.warning("Usuário salvo, mas a sincronia com o sistema antigo falhou. Verifique os dados (Login/Senha).")
        } else {
          toast.success("Usuário cadastrado e espelhado com sucesso!", {
            description: "Os dados já estão disponíveis no sistema novo e no antigo.",
            duration: 5000,
          })
        }
        
        // Finalizar fluxo
        if (onCancel) onCancel()
      } else {
        throw new Error(data?.error || "Erro na resposta da sincronia")
      }

    } catch (error: any) {
      console.error("❌ Falha crítica no cadastro:", error)
      toast.error("Erro ao criar usuário", {
        description: error.message || "Falha na comunicação com o servidor de sincronia.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-red-50/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 rounded-[1.25rem] shadow-xl shadow-red-200">
             <Save className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Matrícula de Operador</h2>
            <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] mt-1.5">Cadastro Central de Inteligência</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all h-12 w-12">
          <X className="h-7 w-7" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-8 py-5 bg-gray-50/30 border-b border-gray-100/50">
              <TabsList className="bg-white/80 border border-gray-100 p-1.5 rounded-[1.5rem] w-fit shadow-sm">
                <TabsTrigger value="principal" className="px-6 h-10 rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white font-black text-[10px] tracking-widest transition-all">PRINCIPAL</TabsTrigger>
                <TabsTrigger value="cliente" className="px-6 h-10 rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white font-black text-[10px] tracking-widest transition-all">CLIENTE</TabsTrigger>
                <TabsTrigger value="permissoes" className="px-6 h-10 rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white font-black text-[10px] tracking-widest transition-all">PERMISSÕES</TabsTrigger>
                <TabsTrigger value="veiculos" className="px-6 h-10 rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white font-black text-[10px] tracking-widest transition-all">VEÍCULOS</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
              <div className="max-w-5xl mx-auto">
                <TabsContent value="principal" className="m-0 border-none outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <PrincipalTab />
                </TabsContent>
                <TabsContent value="cliente" className="m-0 border-none outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <ClientTab />
                </TabsContent>
                <TabsContent value="permissoes" className="m-0 border-none outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <PermissionsTab />
                </TabsContent>
                <TabsContent value="veiculos" className="m-0 border-none outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <VehiclesTab />
                </TabsContent>
              </div>
            </div>
          </Tabs>

          <div className="p-8 border-t border-gray-100 flex justify-end items-center gap-5 bg-gray-50/30 backdrop-blur-md">
            <div className="mr-8 hidden lg:block">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Sincronização em Tempo Real</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Pronto para Integrar</p>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-gray-200 text-gray-500 hover:bg-gray-50 transition-all shadow-sm"
              disabled={isSubmitting}
            >
              Cancelar Cadastro
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-200/50 px-14 h-14 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Transmitindo Dados...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Finalizar e Sincronizar
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
