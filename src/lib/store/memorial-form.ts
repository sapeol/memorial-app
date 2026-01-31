import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface MemorialFormState {
  step: number
  name: string
  birthDate: string | undefined
  passingDate: string | undefined
  bio: string
  coverImage: string
  themeColor: string
  
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setData: (data: Partial<Omit<MemorialFormState, 'step' | 'nextStep' | 'prevStep' | 'setStep' | 'setData' | 'reset'>>) => void
  reset: () => void
}

export const useMemorialFormStore = create<MemorialFormState>()(
  persist(
    (set) => ({
      step: 1,
      name: '',
      birthDate: undefined,
      passingDate: undefined,
      bio: '',
      coverImage: '',
      themeColor: '#1e293b',

      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      setData: (data) => set((state) => ({ ...state, ...data })),
      reset: () => set({
        step: 1,
        name: '',
        birthDate: undefined,
        passingDate: undefined,
        bio: '',
        coverImage: '',
        themeColor: '#1e293b',
      }),
    }),
    {
      name: 'memorial-form-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)