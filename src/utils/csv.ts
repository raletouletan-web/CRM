import type { NewProspect, Prospect } from '../types';

export type CsvHeaderKey =
  | 'id'
  | 'nom'
  | 'prenom'
  | 'telephone'
  | 'email'
  | 'situationPro'
  | 'metierActuel'
  | 'diplomeVise'
  | 'financement'
  | 'urgence'
  | 'statut'
  | 'nbAppels'
  | 'dernierContact'
  | 'prochainRappel'
  | 'prochainRappelHeure'
  | 'resumeAppel'
  | 'objections'
  | 'offreProposee'
  | 'statutPaiement'
  | 'caGenere'
  | 'createdAt';

export type CsvHeaderMap = Partial<Record<CsvHeaderKey, number>>;

const HEADER_ALIASES: Record<CsvHeaderKey, string[]> = {
  id: ['id', 'identifiant'],
  nom: ['nom', 'lastname', 'surname', 'familyname'],
  prenom: ['prenom', 'firstname', 'givenname', 'first'],
  telephone: ['telephone', 'tel', 'phone', 'mobile', 'portable', 'numero', 'numerotelephone'],
  email: ['email', 'mail', 'courriel', 'adresseemail'],
  situationPro: ['situationpro', 'situationprofessionnelle', 'situation'],
  metierActuel: ['metieractuel', 'metier', 'profession', 'posteactuel', 'emploiactuel'],
  diplomeVise: ['diplomevise', 'diplome', 'formation', 'programme', 'objectifformation'],
  financement: ['financement', 'finance', 'modefinancement'],
  urgence: ['urgence', 'priorite', 'temperature'],
  statut: ['statut', 'pipeline', 'etape', 'status'],
  nbAppels: ['nombreappels', 'nbappels', 'appels', 'nombredappels'],
  dernierContact: ['derniercontact', 'lastcontact'],
  prochainRappel: ['prochainrappel', 'daterappel', 'rappel', 'prochainappel', 'nextcall'],
  prochainRappelHeure: ['heurerappel', 'heureprochainrappel', 'timerappel', 'heureappel', 'heureprochainappel'],
  resumeAppel: ['resumeappel', 'notesappel', 'compterendu', 'resume', 'notes'],
  objections: ['objections', 'freins'],
  offreProposee: ['offreproposee', 'offre', 'offer'],
  statutPaiement: ['statutpaiement', 'paiement', 'paymentstatus'],
  caGenere: ['cagenere', 'ca', 'chiffredaffaires'],
  createdAt: ['datecreation', 'creation', 'createdat'],
};

const normalizeText = (value: string) =>
  value
    .replace(/^\uFEFF/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export const normalizeCsvCell = (value: string | undefined) =>
  (value ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/^"|"$/g, '')
    .replace(/""/g, '"')
    .trim();

const countDelimiter = (line: string, delimiter: string) => {
  let count = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      count++;
    }
  }

  return count;
};

export const detectCsvDelimiter = (text: string) => {
  const sanitizedText = text.replace(/^\uFEFF/, '');
  const firstMeaningfulLine = sanitizedText
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0);

  if (!firstMeaningfulLine) {
    return ';';
  }

  if (/^sep=./i.test(firstMeaningfulLine.trim())) {
    return firstMeaningfulLine.trim().slice(4, 5) || ';';
  }

  const delimiters = [';', ',', '\t'] as const;

  return delimiters.reduce((best, current) =>
    countDelimiter(firstMeaningfulLine, current) > countDelimiter(firstMeaningfulLine, best) ? current : best
  , ';');
};

export const parseCsv = (text: string) => {
  const delimiter = detectCsvDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;
  const sanitizedText = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < sanitizedText.length; i++) {
    const char = sanitizedText[i];
    const next = sanitizedText[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(normalizeCsvCell(current));
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i++;
      }

      row.push(normalizeCsvCell(current));
      current = '';

      if (row.length > 1 || row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(normalizeCsvCell(current));
    if (row.length > 1 || row.some((cell) => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  if (rows[0]?.length === 1 && /^sep=./i.test(rows[0][0])) {
    rows.shift();
  }

  return rows;
};

export const buildCsvHeaderMap = (headers: string[]): CsvHeaderMap => {
  const normalizedHeaders = headers.map((header) => normalizeText(normalizeCsvCell(header)));
  const map: CsvHeaderMap = {};

  (Object.entries(HEADER_ALIASES) as [CsvHeaderKey, string[]][]).forEach(([key, aliases]) => {
    const index = normalizedHeaders.findIndex((header) => aliases.includes(header));
    if (index !== -1) {
      map[key] = index;
    }
  });

  return map;
};

export const hasRecognizedCsvHeaders = (headers: string[]) => {
  const headerMap = buildCsvHeaderMap(headers);
  return Object.keys(headerMap).length >= 2;
};

export const getDefaultCsvHeaderMap = (): CsvHeaderMap => ({
  nom: 0,
  prenom: 1,
  email: 2,
  diplomeVise: 3,
  telephone: 4,
});

const getRowValue = (row: string[], headerMap: CsvHeaderMap, key: CsvHeaderKey) => {
  const index = headerMap[key];
  return typeof index === 'number' ? normalizeCsvCell(row[index]) : '';
};

const normalizeDate = (value: string) => {
  const cleaned = normalizeCsvCell(value);
  if (!cleaned) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const slashMatch = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (slashMatch) {
    const [, day, month, rawYear] = slashMatch;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
};

const normalizeTime = (value: string) => {
  const cleaned = normalizeCsvCell(value);
  if (!cleaned) return null;

  const match = cleaned.match(/^(\d{1,2})[:hH](\d{2})$/);
  if (!match) return null;

  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const normalizeUrgence = (value: string): Prospect['urgence'] => {
  const normalized = normalizeText(value);
  if (normalized.includes('chaud')) return 'chaud';
  if (normalized.includes('froid')) return 'froid';
  return 'moyen';
};

const normalizeFinancement = (value: string): Prospect['financement'] => {
  const normalized = normalizeText(value);
  if (normalized.includes('cpf')) return 'CPF';
  if (normalized.includes('personnel') || normalized.includes('perso')) return 'Personnel';
  if (normalized.includes('entreprise')) return 'Entreprise';
  return 'Non défini';
};

const normalizeStatut = (value: string): Prospect['statut'] => {
  const normalized = normalizeText(value);

  if (normalized === 'nouveaulead' || normalized === 'nouveau') return 'Nouveau lead';
  if (normalized === 'aappeler' || normalized === 'appeler') return 'À appeler';
  if (normalized === 'appele') return 'Appelé';
  if (normalized === 'relance') return 'Relance';
  if (normalized === 'rdvprevu' || normalized === 'rdv') return 'RDV prévu';
  if (normalized === 'close' || normalized === 'cloture') return 'Closé';
  if (normalized === 'perdu') return 'Perdu';

  return 'Nouveau lead';
};

const normalizeStatutPaiement = (value: string): Prospect['statutPaiement'] => {
  const normalized = normalizeText(value);
  if (normalized === 'paye' || normalized === 'payee') return 'Payé';
  if (normalized === 'enattente' || normalized === 'attente') return 'En attente';
  return 'Non proposé';
};

const normalizeOffre = (value: string): Prospect['offreProposee'] => {
  const cleaned = normalizeCsvCell(value);
  const normalized = normalizeText(cleaned);

  if (!cleaned) return '';
  if (normalized === '3x350' || normalized === '3x350e' || normalized === '3x350euros' || normalized === '3fois350') return '3x350€';
  if (normalized === '157mois' || normalized === '157parmois' || normalized === '157eparmois' || normalized === '157eurosparmois' || normalized === '157illimite' || normalized === '157moisillimite') return '157€/mois';
  if (normalized === '790' || normalized === '790e' || normalized === '790euros') return '790';
  if (normalized === '1800' || normalized === '1800e' || normalized === '1800euros') return '1800';
  if (normalized === 'autre') return 'Autre';

  return cleaned as Prospect['offreProposee'];
};

const normalizeNumber = (value: string) => {
  const cleaned = normalizeCsvCell(value).replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const createProspectFromCsvRow = (row: string[], headerMap: CsvHeaderMap): NewProspect | null => {
  const rawNom = getRowValue(row, headerMap, 'nom');
  const rawPrenom = getRowValue(row, headerMap, 'prenom');
  const email = getRowValue(row, headerMap, 'email');
  const telephone = getRowValue(row, headerMap, 'telephone');
  const diplomeVise = getRowValue(row, headerMap, 'diplomeVise');
  const situationPro = getRowValue(row, headerMap, 'situationPro');
  const metierActuel = getRowValue(row, headerMap, 'metierActuel');
  const resumeAppel = getRowValue(row, headerMap, 'resumeAppel');
  const objections = getRowValue(row, headerMap, 'objections');

  if (!rawNom && !rawPrenom && !email && !telephone) {
    return null;
  }

  const nom = rawNom || 'Sans nom';
  const prenom = rawPrenom || 'Sans prénom';

  const prochainRappel = normalizeDate(getRowValue(row, headerMap, 'prochainRappel'));
  const prochainRappelHeure = normalizeTime(getRowValue(row, headerMap, 'prochainRappelHeure'));
  const dernierContact = normalizeDate(getRowValue(row, headerMap, 'dernierContact'));

  return {
    nom,
    prenom,
    telephone,
    email,
    situationPro,
    metierActuel,
    diplomeVise,
    financement: normalizeFinancement(getRowValue(row, headerMap, 'financement')),
    urgence: normalizeUrgence(getRowValue(row, headerMap, 'urgence')),
    statut: normalizeStatut(getRowValue(row, headerMap, 'statut')),
    dernierContact,
    prochainRappel,
    prochainRappelHeure,
    resumeAppel,
    objections,
    offreProposee: normalizeOffre(getRowValue(row, headerMap, 'offreProposee')),
    statutPaiement: normalizeStatutPaiement(getRowValue(row, headerMap, 'statutPaiement')),
  };
};

export const getImportedCaValue = (row: string[], headerMap: CsvHeaderMap) =>
  normalizeNumber(getRowValue(row, headerMap, 'caGenere'));
