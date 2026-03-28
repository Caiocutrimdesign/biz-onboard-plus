import { create } from 'zustand';
import type { CustomerRegistration } from '@/types/customer';

interface RegistrationState {
  currentStep: number;
  data: Partial<CustomerRegistration>;
  setStep: (step: number) => void;
  updateData: (partial: Partial<CustomerRegistration>) => void;
  reset: () => void;
}

const initialData: Partial<CustomerRegistration> = {
  vehicle_type: 'carro',
  plan: 'basico',
  payment_method: 'pix',
  status: 'novo_cadastro',
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  currentStep: 0,
  data: { ...initialData },
  setStep: (step) => set({ currentStep: step }),
  updateData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
  reset: () => set({ currentStep: 0, data: { ...initialData } }),
}));
