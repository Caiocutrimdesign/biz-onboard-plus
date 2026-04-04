import React, { useState, useEffect } from "react"
import { Plus, Users, Search, Filter, MoreVertical, Shield, Mail, Phone, Calendar, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserRegistrationForm } from "@/components/admin/users/UserRegistrationForm"
import { supabase } from "@/lib/supabaseClient"
import { motion, AnimatePresence } from "framer-motion"

export default function UsersPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('usuarios' as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUsers(data)
    }
    setIsLoading(false)
  }

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.login_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.document?.includes(searchTerm)
  )

  if (showAddForm) {
    return (
      <div className="p-6">
        <UserRegistrationForm onCancel={() => {
          setShowAddForm(false)
          fetchUsers()
        }} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Gestão de Usuários
          </h1>
          <p className="text-gray-500 text-sm">Gerencie os acessos e permissões dos seus clientes.</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 px-6 py-6 rounded-2xl flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Adicionar Novo Usuário
        </Button>
      </div>

      <Card className="bg-white border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-50 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou documento..."
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Usuário</TableHead>
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Documento</TableHead>
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Grupo</TableHead>
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Status</TableHead>
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Criado em</TableHead>
                  <TableHead className="text-right text-gray-500 font-bold uppercase text-[10px] tracking-wider px-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                        Carregando usuários...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                        {searchTerm ? "Nenhum usuário encontrado para essa busca." : "Nenhum usuário cadastrado ainda."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-gray-50 hover:bg-gray-50/50 group transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                              {user.full_name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-bold">{user.full_name}</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.login_email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 font-mono text-xs">{user.document || "---"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold">
                            <Shield className="h-3 w-3 mr-1" />
                            {user.group_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.status === 'Ativo' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs text-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.created_at).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <div className="flex items-center justify-end gap-1">
                             <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                <Edit className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
