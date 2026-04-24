export interface CallHistoryEntry {
  id: string;
  calledAt: string;
  resumeAppel?: string;
  objections?: string;
}

export interface Prospect {
  id: string;
  // Identité
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  // Profil
  situationPro: string;
  metierActuel: string;
  diplomeVise: string;
  financement: 'CPF' | 'Personnel' | 'Entreprise' | 'Non défini';
  urgence: 'chaud' | 'moyen' | 'froid';
  // Suivi
  statut: 'Nouveau lead' | 'À appeler' | 'Appelé' | 'Relance' | 'RDV prévu' | 'Closé' | 'Perdu';
  nbAppels: number;
  dernierContact: string | null;
  prochainRappel: string | null;
  prochainRappelHeure: string | null;
  resumeAppel: string;
  objections: string;
  callHistory: CallHistoryEntry[];
  // Closing
  offreProposee: '790' | '1800' | '157€/mois' | '3x350€' | 'Autre' | '';
  statutPaiement: 'Non proposé' | 'En attente' | 'Payé';
  caGenere: number;
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export type NewProspect = Omit<Prospect, 'id' | 'createdAt' | 'updatedAt' | 'nbAppels' | 'caGenere' | 'callHistory'>;

export const STATUTS_PIPELINE = [
  'Nouveau lead',
  'À appeler',
  'Appelé',
  'Relance',
  'RDV prévu',
  'Closé',
  'Perdu'
] as const;

export const SITUATIONS_PRO = [
  'Salarié',
  'Demandeur d emploi',
  'Indépendant',
  'Entrepreneur',
  'Étudiant',
  'Retraité',
  'Autre'
] as const;

export const FINANCEMENTS = ['CPF', 'Personnel', 'Entreprise', 'Non défini'] as const;

export const OFFRES = ['790', '1800', '157€/mois', '3x350€', 'Autre'] as const;

export const STATUTS_PAIEMENT = ['Non proposé', 'En attente', 'Payé'] as const;
