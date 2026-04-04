import React from "react"
import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const ClientTab = () => {
  const { control } = useFormContext()

  return (
    <div className="space-y-6 p-4">
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CPF/CNPJ */}
          <FormField
            control={control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">CPF/CNPJ:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nome/Razão Social */}
          <FormField
            control={control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-gray-700 font-bold">Nome/Razão Social:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* RG */}
          <FormField
            control={control}
            name="rg"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">RG:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Nascimento */}
          <FormField
            control={control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Data de nascimento:</FormLabel>
                <FormControl>
                  <Input {...field} type="date" className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-100 shadow-sm">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* CEP */}
          <FormField
            control={control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">CEP:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Endereço */}
          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-gray-700 font-bold">Endereço:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nº */}
          <FormField
            control={control}
            name="address_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Nº:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Complemento */}
          <FormField
            control={control}
            name="complement"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-gray-700 font-bold">Complemento:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bairro */}
          <FormField
            control={control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Bairro:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cidade */}
          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Cidade:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estado */}
          <FormField
            control={control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Estado:</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={2} placeholder="UF" className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-100 shadow-sm">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Celular */}
          <FormField
            control={control}
            name="cellphone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Celular:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Valor Mensalidade */}
          <FormField
            control={control}
            name="monthly_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Valor mensalidade:</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                    <Input {...field} type="number" step="0.01" className="pl-10 bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dia de Vencimento */}
          <FormField
            control={control}
            name="due_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Dia de vencimento (Fatura):</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    {[1, 5, 10, 15, 20, 25].map(day => (
                      <SelectItem key={day} value={String(day)}>Dia {day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email de Cobrança */}
          <FormField
            control={control}
            name="billing_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Email de Cobrança:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Renda/Faturamento */}
          <FormField
            control={control}
            name="income"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Renda/Faturamento:</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                    <Input {...field} type="number" step="0.01" className="pl-10 bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-100 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          {/* Número para retorno de suporte */}
          <FormField
            control={control}
            name="support_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Número para retorno de suporte:</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notas Administrativas */}
          <FormField
            control={control}
            name="admin_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Notas Administrativas:</FormLabel>
                <FormControl>
                  <Textarea {...field} className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
