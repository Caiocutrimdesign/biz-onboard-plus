import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronLeft, ShoppingCart, Check, 
  MapPinned, Shield, Star, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, COMPANIES, PRODUCTS } from './TecTypes';

interface SalesViewProps {
  onBack: () => void;
  onConfirm: (products: Product[]) => void;
}

export function SalesView({ onBack, onConfirm }: SalesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'gps_plus' | 'central' | 'cobertura' | null>(null);
  const [cart, setCart] = useState<Product[]>([]);

  const toggleProduct = (product: Product) => {
    if (cart.find(p => p.id === product.id)) {
      setCart(cart.filter(p => p.id !== product.id));
    } else {
      setCart([...cart, product]);
    }
  };

  const currentProducts = PRODUCTS.filter(p => p.category === selectedCategory);
  const total = cart.reduce((acc, p) => acc + p.price, 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Vendas / Produtos</h1>
          <p className="text-sm text-muted-foreground">Selecione os produtos para o cliente</p>
        </div>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 gap-4">
          {COMPANIES.map((cat) => (
            <Card 
              key={cat.id} 
              className="cursor-pointer hover:border-orange-500 transition-colors"
              onClick={() => setSelectedCategory(cat.id)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-${cat.color}-100`}>
                  {cat.icon === 'MapPinned' && <MapPinned className={`w-8 h-8 text-${cat.color}-600`} />}
                  {cat.icon === 'Shield' && <Shield className={`w-8 h-8 text-${cat.color}-600`} />}
                  {cat.icon === 'Star' && <Star className={`w-8 h-8 text-${cat.color}-600`} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Lista de Adicionais</h2>
            <Button variant="ghost" className="text-orange-600" onClick={() => setSelectedCategory(null)}>Mudar Categoria</Button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {currentProducts.map((product) => {
              const isInCart = !!cart.find(p => p.id === product.id);
              return (
                <Card 
                  key={product.id} 
                  className={`cursor-pointer transition-all ${isInCart ? 'border-orange-500 bg-orange-50' : ''}`}
                  onClick={() => toggleProduct(product)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{product.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                      <p className="text-sm font-bold text-orange-600 mt-1">
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        {product.isMonthly && <span className="text-[10px] font-normal text-muted-foreground uppercase ml-1">/ mes</span>}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isInCart ? 'bg-orange-500 border-orange-500' : 'border-gray-200'}`}>
                      {isInCart && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-50">
          <Button 
            className="w-full h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 shadow-2xl flex items-center justify-between px-6"
            onClick={() => onConfirm(cart)}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <span>{cart.length} {cart.length === 1 ? 'item' : 'itens'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase opacity-80">Total Venda</span>
              <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
