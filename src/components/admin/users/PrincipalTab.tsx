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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const PrincipalTab = () => {
  const { control, watch } = useFormContext()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          {/* Status */}
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Status:</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Grupo */}
          <FormField
            control={control}
            name="group_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Grupo*:</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl">
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    <SelectItem value="Usuário">Usuário</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Limite de dispositivos */}
          <FormField
            control={control}
            name="has_device_limit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-gray-100 p-4 bg-gray-50/30">
                <FormLabel className="text-gray-700 font-bold">Limite de dispositivos:</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  {field.value && (
                    <FormField
                      control={control}
                      name="device_limit"
                      render={({ field: inputField }) => (
                        <Input
                          {...inputField}
                          type="number"
                          className="w-20 bg-white border-gray-200 text-gray-900 rounded-xl"
                        />
                      )}
                    />
                  )}
                </div>
              </FormItem>
            )}
          />

          {/* Senha */}
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Senha:</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password" 
                    autoComplete="new-password"
                    className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-100 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          {/* Login ou Email */}
          <FormField
            control={control}
            name="login_email"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="text-gray-700 font-bold">Login ou Email:</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Será usado para login no sistema.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" 
                    placeholder="exemplo@rastremix.com.br"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de validade */}
          <FormField
            control={control}
            name="has_expiration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-gray-100 p-4 bg-gray-50/30">
                <FormLabel className="text-gray-700 font-bold">Data de validade:</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  {field.value && (
                    <FormField
                      control={control}
                      name="expiration_date"
                      render={({ field: dateField }) => (
                        <Input
                          {...dateField}
                          type="date"
                          className="w-40 bg-white border-gray-200 text-gray-900 rounded-xl"
                        />
                      )}
                    />
                  )}
                </div>
              </FormItem>
            )}
          />

          {/* Confirmação de Senha */}
          <FormField
            control={control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-bold">Confirmação de Senha:</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password" 
                    className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20 rounded-xl" 
                  />
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
