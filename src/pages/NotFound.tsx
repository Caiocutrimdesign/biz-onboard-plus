import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 select-none">
      <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-gray-100 max-w-lg w-full mx-4 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
           <h1 className="text-5xl font-black">404</h1>
        </div>
        <h2 className="mb-4 text-3xl font-black text-gray-900 tracking-tight">Rota não encontrada</h2>
        <p className="mb-10 text-gray-400 font-medium leading-relaxed">
          Ocorreu um erro ao tentar acessar o recurso em <code className="px-2 py-1 bg-gray-100 rounded text-red-600 text-xs font-bold">{location.pathname}</code>. 
          Certifique-se de que o endereço está correto ou retorne ao portal.
        </p>
        <a 
          href="/" 
          className="inline-flex h-14 items-center px-10 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-50 hover:bg-red-700 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
        >
          Voltar ao Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
