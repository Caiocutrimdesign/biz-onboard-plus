import React from "react"
import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

const PERMISSIONS_LIST = [
  { id: "dispositivos", label: "Dispositivos" },
  { id: "alertas", label: "Alertas" },
  { id: "cercas", label: "Cercas Virtuais" },
  { id: "relatorios", label: "Relatórios e Histórico" },
  { id: "comandos", label: "Enviar comando" },
  { id: "historico_api", label: "Histórico API" },
  { id: "compartilhar_localizacao", label: "Compartilhar localização" },
  { id: "servicos", label: "Serviços" },
  { id: "imei", label: "IMEI" },
]

export const PermissionsTab = () => {
  const { control } = useFormContext()

  return (
    <div className="p-4">
      <Card className="bg-white border-gray-100 shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="text-gray-600 font-bold py-4">Permissão</TableHead>
                <TableHead className="text-center text-gray-600 font-bold">Visão</TableHead>
                <TableHead className="text-center text-gray-600 font-bold">Editar</TableHead>
                <TableHead className="text-center text-gray-600 font-bold">Excluir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS_LIST.map((permission) => (
                <TableRow key={permission.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="text-gray-900 font-bold py-4">{permission.label}</TableCell>
                  
                  {/* Visão */}
                  <TableCell className="text-center">
                    <FormField
                      control={control}
                      name={`permissions.${permission.id}.view`}
                      render={({ field }) => (
                        <FormItem className="flex justify-center">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-red-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {/* Editar */}
                  <TableCell className="text-center">
                    <FormField
                      control={control}
                      name={`permissions.${permission.id}.edit`}
                      render={({ field }) => (
                        <FormItem className="flex justify-center">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-red-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {/* Excluir */}
                  <TableCell className="text-center">
                    <FormField
                      control={control}
                      name={`permissions.${permission.id}.delete`}
                      render={({ field }) => (
                        <FormItem className="flex justify-center">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-red-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
