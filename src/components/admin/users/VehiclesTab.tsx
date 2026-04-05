import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useVeiculos, Veiculo } from "@/hooks/useVeiculos"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Trash2, Car, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export const VehiclesTab = () => {
  const { watch, setValue } = useFormContext()
  const { veiculos, isLoading } = useVeiculos()
  const [searchTerm, setSearchTerm] = useState("")

  const selectedVehicles = watch("vehicles") || []

  const availableVehicles = veiculos.filter(v => 
    !selectedVehicles.includes(v.id_rastremix) &&
    (v.placa.toLowerCase().includes(searchTerm.toLowerCase()) || 
     v.id_rastremix.includes(searchTerm))
  )

  const handleAdd = (id: string) => {
    setValue("vehicles", [...selectedVehicles, id])
  }

  const handleRemove = (id: string) => {
    setValue("vehicles", selectedVehicles.filter((vId: string) => vId !== id))
  }

  const handleAddAll = () => {
    const allAvailableIds = availableVehicles.map(v => v.id_rastremix)
    setValue("vehicles", [...selectedVehicles, ...allAvailableIds])
  }

  const handleRemoveAll = () => {
    setValue("vehicles", [])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 h-[600px]">
      {/* Disponíveis */}
      <Card className="bg-white border-gray-100 shadow-sm flex flex-col h-full overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="text-gray-900 text-lg flex items-center gap-2 font-bold">
            Dispositivos Disponíveis 
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
              {availableVehicles.length}
            </span>
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por placa ou ID..."
              className="pl-10 bg-white border-gray-200 text-gray-900 focus:ring-red-500/20 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 px-4 py-2">
            {isLoading ? (
              <div className="flex justify-center p-8 text-gray-400">Carregando...</div>
            ) : (
              <div className="space-y-2 mt-2">
                {availableVehicles.map((v) => (
                  <div key={v.id_rastremix} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-red-100 text-red-600">
                        <Car className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 uppercase">{v.placa}</p>
                        <p className="text-[10px] text-gray-500 font-mono">ID: {v.id_rastremix}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                      onClick={() => handleAdd(v.id_rastremix)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 border-t border-gray-50 flex justify-center gap-2 bg-gray-50/50">
            <Button variant="outline" size="sm" className="hidden md:flex bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl px-4" onClick={handleAddAll}>
              <ChevronsRight className="h-4 w-4 mr-1" /> Vincular Todos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vinculados */}
      <Card className="bg-white border-gray-100 shadow-sm flex flex-col h-full overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="text-gray-900 text-lg flex items-center gap-2 font-bold">
            Dispositivos Vinculados
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
              {selectedVehicles.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 px-4 py-2">
            {selectedVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400 text-sm text-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <Car className="h-12 w-12 opacity-20" />
                </div>
                Nenhum dispositivo vinculado
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {selectedVehicles.map((id: string) => {
                  const v = veiculos.find(v => v.id_rastremix === id)
                  return (
                    <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-green-50/50 border border-green-100 hover:border-green-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-green-100 text-green-600">
                          <Car className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 uppercase">{v?.placa || id}</p>
                          <p className="text-[10px] text-gray-500 font-mono">ID: {id}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        onClick={() => handleRemove(id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 border-t border-gray-50 flex justify-center gap-2 bg-gray-50/50">
            <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl px-4" onClick={handleRemoveAll}>
              <ChevronsLeft className="h-4 w-4 mr-1" /> Remover Todos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
