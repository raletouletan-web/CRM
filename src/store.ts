import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prospect, NewProspect } from './types';

// Fonction pour extraire la valeur numérique d'une offre
export const getOfferValue = (offre: string | undefined): number => {
  if (!offre) return 0;
  if (offre === '3x350€') return 1050;
  if (offre === '157€/mois') return 157;
  return parseInt(offre) || 0;
};

interface CRMState {
  prospects: Prospect[];
  addProspect: (prospect: NewProspect) => void;
  updateProspect: (id: string, updates: Partial<Prospect>) => void;
  deleteProspect: (id: string) => void;
  clearAllProspects: () => void;
  incrementAppels: (
    id: string,
    details?: {
      resumeAppel?: string;
      objections?: string;
      contactDate?: string | null;
      calledAt?: string;
    }
  ) => void;
  getProspectsToRemind: () => Prospect[];
  getStats: () => {
    totalLeads: number;
    totalAppels: number;
    totalClosings: number;
    caTotal: number;
    tauxClosing: number;
    caParLead: number;
    appelsParClosing: number;
  };
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const getTodayDate = () => new Date().toISOString().split('T')[0];

const buildCallTimestamp = (contactDate?: string | null, calledAt?: string) => {
  if (calledAt) return calledAt;

  const now = new Date();
  if (!contactDate) return now.toISOString();

  const [year, month, day] = contactDate.split('-').map(Number);
  if (!year || !month || !day) return now.toISOString();

  const mergedDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return mergedDate.toISOString();
};

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      prospects: [],

      addProspect: (prospect) => {
        const now = new Date().toISOString();
        const newProspect: Prospect = {
          ...prospect,
          id: generateId(),
          nbAppels: 0,
          callHistory: [],
          caGenere: prospect.statutPaiement === 'Payé' ? getOfferValue(prospect.offreProposee) : 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          prospects: [...state.prospects, newProspect],
        }));
      },

       updateProspect: (id, updates) => {
        set((state) => ({
          prospects: state.prospects.map((p) => {
            if (p.id !== id) return p;

            const nextOffre = updates.offreProposee ?? p.offreProposee;
            const nextStatutPaiement = updates.statutPaiement ?? p.statutPaiement;

            return {
              ...p,
              ...updates,
              callHistory: updates.callHistory ?? p.callHistory ?? [],
              updatedAt: new Date().toISOString(),
              caGenere: nextStatutPaiement === 'Payé' ? getOfferValue(nextOffre) : 0,
            };
          }),
        }));
      },

      deleteProspect: (id) => {
        set((state) => ({
          prospects: state.prospects.filter((p) => p.id !== id),
        }));
      },

      clearAllProspects: () => {
        set({ prospects: [] });
      },

      incrementAppels: (id, details) => {
        const now = new Date().toISOString();
        const contactDate = details?.contactDate || getTodayDate();
        const callTimestamp = buildCallTimestamp(details?.contactDate, details?.calledAt);

        set((state) => ({
          prospects: state.prospects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  nbAppels: p.nbAppels + 1,
                  dernierContact: contactDate,
                  callHistory: [
                    ...(p.callHistory || []),
                    {
                      id: generateId(),
                      calledAt: callTimestamp,
                      resumeAppel: details?.resumeAppel?.trim() || '',
                      objections: details?.objections?.trim() || '',
                    },
                  ],
                  updatedAt: now,
                }
              : p
          ),
        }));
      },

      getProspectsToRemind: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().prospects.filter(
          (p) => p.prochainRappel === today && p.statut !== 'Closé' && p.statut !== 'Perdu'
        );
      },

      getStats: () => {
        const prospects = get().prospects;
        const totalLeads = prospects.length;
        const totalAppels = prospects.reduce((sum, p) => sum + p.nbAppels, 0);
        const totalClosings = prospects.filter((p) => p.statut === 'Closé').length;
         const caTotal = prospects
          .filter((p) => p.statutPaiement === 'Payé')
          .reduce((sum, p) => sum + getOfferValue(p.offreProposee), 0);
        
        const tauxClosing = totalLeads > 0 ? (totalClosings / totalLeads) * 100 : 0;
        const caParLead = totalLeads > 0 ? caTotal / totalLeads : 0;
        const appelsParClosing = totalClosings > 0 ? totalAppels / totalClosings : 0;

        return {
          totalLeads,
          totalAppels,
          totalClosings,
          caTotal,
          tauxClosing,
          caParLead,
          appelsParClosing,
        };
      },
    }),
    {
      name: 'crm-prospecting-storage',
    }
  )
);
