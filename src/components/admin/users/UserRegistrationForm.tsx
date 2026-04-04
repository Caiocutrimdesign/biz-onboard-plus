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
      console.log("Iniciando salvamento...", values)

      const { data, error } = await supabase.functions.invoke('save-user-sync', {
        body: { 
          user: {
            ...values,
            // Remover campos auxiliares do formulário antes de enviar
            has_device_limit: undefined,
            has_expiration: undefined,
            password_confirmation: undefined,
            vehicles: undefined,
          },
          vehicles: values.vehicles // Enviar IDs de veículos separadamente
        }
      })

      if (error) throw error

      if (data.success) {
        if (data.sync.status === 'failed') {
          toast.warning("Usuário salvo no sistema novo, mas houve erro na sincronia com o antigo", {
            description: data.sync.message,
            duration: 6000,
          })
        } else {
          toast.success("Usuário criado e sincronizado com sucesso!")
        }
        if (onCancel) onCancel()
      } else {
        throw new Error(data.error || "Erro desconhecido ao salvar")
      }

    } catch (error: any) {
      console.error("Erro no envio:", error)
      toast.error("Falha ao criar usuário", {
        description: error.message || "Erro na comunicação com o servidor.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
             <Save className="h-5 w-5 text-white" />
          </div>
          Adicionar novo usuário
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4 bg-gray-50/30">
              <TabsList className="bg-gray-100/50 border border-gray-200 p-1 rounded-2xl">
                <TabsTrigger value="principal" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold text-[10px] tracking-widest transition-all">PRINCIPAL</TabsTrigger>
                <TabsTrigger value="cliente" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold text-[10px] tracking-widest transition-all">CLIENTE</TabsTrigger>
                <TabsTrigger value="permissoes" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold text-[10px] tracking-widest transition-all">PERMISSÕES</TabsTrigger>
                <TabsTrigger value="veiculos" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold text-[10px] tracking-widest transition-all">VEÍCULOS</TabsTrigger>
              </TabsList>
            </div>

            <div className="min-h-[550px] p-6 bg-white overflow-y-auto max-h-[70vh] custom-scrollbar">
              <TabsContent value="principal" className="m-0 border-none outline-none focus-visible:ring-0">
                <PrincipalTab />
              </TabsContent>
              <TabsContent value="cliente" className="m-0 border-none outline-none focus-visible:ring-0">
                <ClientTab />
              </TabsContent>
              <TabsContent value="permissoes" className="m-0 border-none outline-none focus-visible:ring-0">
                <PermissionsTab />
              </TabsContent>
              <TabsContent value="veiculos" className="m-0 border-none outline-none focus-visible:ring-0">
                <VehiclesTab />
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all px-8 rounded-2xl h-12 font-bold"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 px-10 rounded-2xl h-12 font-bold flex items-center gap-2 transition-all hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Salvar Usuário
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
