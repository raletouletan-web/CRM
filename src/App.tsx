import { useState, useMemo, useRef } from 'react';
import { getOfferValue, useCRMStore } from './store';
import { Prospect, NewProspect, STATUTS_PIPELINE, SITUATIONS_PRO, FINANCEMENTS, OFFRES, STATUTS_PAIEMENT } from './types';
import { buildCsvHeaderMap, createProspectFromCsvRow, getDefaultCsvHeaderMap, hasRecognizedCsvHeaders, parseCsv } from './utils/csv';

// Icons
const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PipelineIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

// Badge de statut
const StatutBadge = ({ statut }: { statut: string }) => {
  const styles: Record<string, string> = {
    'Nouveau lead': 'bg-blue-100 text-blue-800',
    'À appeler': 'bg-yellow-100 text-yellow-800',
    'Appelé': 'bg-indigo-100 text-indigo-800',
    'Relance': 'bg-orange-100 text-orange-800',
    'RDV prévu': 'bg-purple-100 text-purple-800',
    'Closé': 'bg-green-100 text-green-800',
    'Perdu': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[statut] || 'bg-gray-100 text-gray-800'}`}>
      {statut}
    </span>
  );
};

// Badge d'urgence
const UrgenceBadge = ({ urgence }: { urgence: string }) => {
  const styles: Record<string, string> = {
    chaud: 'bg-orange-500 text-white',
    moyen: 'bg-yellow-500 text-white',
    froid: 'bg-cyan-500 text-white',
  };
  const icons: Record<string, string> = {
    chaud: '🔥',
    moyen: '⚡',
    froid: '❄️',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[urgence] || ''}`}>
      {icons[urgence]} {urgence}
    </span>
  );
};

// Composant Toast
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  const bg = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  useState(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  });
  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in flex items-center gap-2`}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  );
};

const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const serializeCallHistory = (callHistory: Prospect['callHistory'] | undefined) => {
  if (!callHistory || callHistory.length === 0) return '';

  return callHistory
    .map((entry, index) => {
      const parts = [`Appel ${index + 1}`, formatDateTime(entry.calledAt)];
      if (entry.resumeAppel) parts.push(`Résumé: ${entry.resumeAppel.replace(/\n/g, ' ')}`);
      if (entry.objections) parts.push(`Objections: ${entry.objections.replace(/\n/g, ' ')}`);
      return parts.join(' - ');
    })
    .join(' | ');
};

const normalizeDuplicateText = (value: string | null | undefined) =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalizeDuplicatePhone = (value: string | null | undefined) =>
  (value ?? '').replace(/\D/g, '');

const getProspectDuplicateKeys = (prospect: Pick<Prospect | NewProspect, 'nom' | 'prenom' | 'email' | 'telephone' | 'diplomeVise'>) => {
  const keys: string[] = [];
  const email = normalizeDuplicateText(prospect.email);
  const telephone = normalizeDuplicatePhone(prospect.telephone);
  const nom = normalizeDuplicateText(prospect.nom);
  const prenom = normalizeDuplicateText(prospect.prenom);
  const diplomeVise = normalizeDuplicateText(prospect.diplomeVise);

  if (email) keys.push(`email:${email}`);
  if (telephone) keys.push(`telephone:${telephone}`);
  if (nom && prenom) {
    keys.push(`identite:${nom}|${prenom}|${diplomeVise}`);
  }

  return keys;
};

// Modal Formulaire Prospect
const ProspectModal = ({ 
  prospect, 
  onClose, 
  onSave 
}: { 
  prospect?: Prospect; 
  onClose: () => void; 
  onSave: () => void;
}) => {
  const { prospects, addProspect, updateProspect, incrementAppels } = useCRMStore();
  const currentProspect = prospect ? prospects.find((p) => p.id === prospect.id) ?? prospect : undefined;
  const callHistory = useMemo(
    () => [...(currentProspect?.callHistory ?? [])].sort((a, b) => b.calledAt.localeCompare(a.calledAt)),
    [currentProspect]
  );
  const [form, setForm] = useState<NewProspect>({
    nom: prospect?.nom || '',
    prenom: prospect?.prenom || '',
    telephone: prospect?.telephone || '',
    email: prospect?.email || '',
    situationPro: prospect?.situationPro || '',
    metierActuel: prospect?.metierActuel || '',
    diplomeVise: prospect?.diplomeVise || '',
    financement: prospect?.financement || 'Non défini',
    urgence: prospect?.urgence || 'moyen',
    statut: prospect?.statut || 'Nouveau lead',
    dernierContact: prospect?.dernierContact || null,
    prochainRappel: prospect?.prochainRappel || null,
    prochainRappelHeure: prospect?.prochainRappelHeure || null,
    resumeAppel: prospect?.resumeAppel || '',
    objections: prospect?.objections || '',
    offreProposee: prospect?.offreProposee || '',
    statutPaiement: prospect?.statutPaiement || 'Non proposé',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.prenom) return;
    
    if (prospect) {
      updateProspect(prospect.id, form);
    } else {
      addProspect(form);
    }
    onSave();
    onClose();
  };

  const handleIncrementAppel = () => {
    if (currentProspect) {
      const effectiveContactDate = form.dernierContact || new Date().toISOString().split('T')[0];

      incrementAppels(currentProspect.id, {
        resumeAppel: form.resumeAppel,
        objections: form.objections,
        contactDate: effectiveContactDate,
      });
      setForm((prev) => ({
        ...prev,
        dernierContact: effectiveContactDate,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {prospect ? 'Modifier le prospect' : 'Nouveau prospect'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <CloseIcon />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Identité */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">👤</span>
              Identité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Profil */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">🎯</span>
              Profil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Situation pro</label>
                <select
                  value={form.situationPro}
                  onChange={(e) => setForm({ ...form, situationPro: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {SITUATIONS_PRO.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Métier actuel</label>
                <input
                  type="text"
                  value={form.metierActuel}
                  onChange={(e) => setForm({ ...form, metierActuel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Diplôme visé</label>
                <input
                  type="text"
                  value={form.diplomeVise}
                  onChange={(e) => setForm({ ...form, diplomeVise: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Financement</label>
                <select
                  value={form.financement}
                  onChange={(e) => setForm({ ...form, financement: e.target.value as NewProspect['financement'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {FINANCEMENTS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Urgence</label>
                <select
                  value={form.urgence}
                  onChange={(e) => setForm({ ...form, urgence: e.target.value as NewProspect['urgence'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="chaud">🔥 Chaud</option>
                  <option value="moyen">⚡ Moyen</option>
                  <option value="froid">❄️ Froid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Suivi commercial */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">📞</span>
              Suivi commercial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Statut</label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value as NewProspect['statut'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {STATUTS_PIPELINE.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre d'appels</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={currentProspect?.nbAppels || 0}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                  />
                  {currentProspect && (
                    <button
                      type="button"
                      onClick={handleIncrementAppel}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <PhoneIcon /> +1
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Dernier contact</label>
                <input
                  type="date"
                  value={form.dernierContact || ''}
                  onChange={(e) => setForm({ ...form, dernierContact: e.target.value || null })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  En cliquant sur <span className="font-semibold">+1</span>, l’historique utilisera cette date avec l’heure actuelle. Si elle est vide, la date du jour sera utilisée.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Date prochain rappel ⚠️</label>
                <input
                  type="date"
                  value={form.prochainRappel || ''}
                  onChange={(e) => setForm({ ...form, prochainRappel: e.target.value || null })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Heure du rappel</label>
                <input
                  type="time"
                  value={form.prochainRappelHeure || ''}
                  onChange={(e) => setForm({ ...form, prochainRappelHeure: e.target.value || null })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Résumé appel</label>
                <textarea
                  value={form.resumeAppel}
                  onChange={(e) => setForm({ ...form, resumeAppel: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notes importantes de l'appel..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Objections</label>
                <textarea
                  value={form.objections}
                  onChange={(e) => setForm({ ...form, objections: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Objections rencontrées..."
                />
              </div>
            </div>
          </div>

          {currentProspect && (
            <div>
              <div className="flex items-center justify-between mb-4 gap-3">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-700">🕘</span>
                  Historique des appels
                </h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {currentProspect.nbAppels} appel{currentProspect.nbAppels > 1 ? 's' : ''}
                </span>
              </div>

              {callHistory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  Aucun appel enregistré pour ce prospect.
                </div>
              ) : (
                <div className="space-y-3">
                  {callHistory.map((entry, index) => (
                    <div key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-slate-800">
                          Appel #{currentProspect.nbAppels - index}
                        </p>
                        <span className="text-sm text-slate-500">{formatDateTime(entry.calledAt)}</span>
                      </div>
                      {(entry.resumeAppel || entry.objections) && (
                        <div className="mt-3 space-y-2">
                          {entry.resumeAppel && (
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Résumé</p>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.resumeAppel}</p>
                            </div>
                          )}
                          {entry.objections && (
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-red-400">Objections</p>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.objections}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Closing */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">💰</span>
              Closing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Offre proposée</label>
                <select
                  value={form.offreProposee}
                  onChange={(e) => setForm({ ...form, offreProposee: e.target.value as NewProspect['offreProposee'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {OFFRES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Statut paiement</label>
                <select
                  value={form.statutPaiement}
                  onChange={(e) => setForm({ ...form, statutPaiement: e.target.value as NewProspect['statutPaiement'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {STATUTS_PAIEMENT.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">CA généré</label>
                <input
                  type="number"
                  value={form.statutPaiement === 'Payé' && form.offreProposee ? form.offreProposee : (prospect?.caGenere || 0)}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {prospect ? 'Enregistrer' : 'Créer le prospect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Vue Dashboard
const Dashboard = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { prospects, getProspectsToRemind, getStats } = useCRMStore();
  const stats = getStats();
  const prospectsToRemind = getProspectsToRemind();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Total Leads</p>
          <p className="text-3xl font-bold text-slate-800">{stats.totalLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Appels effectués</p>
          <p className="text-3xl font-bold text-slate-800">{stats.totalAppels}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Closings</p>
          <p className="text-3xl font-bold text-green-600">{stats.totalClosings}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">CA Total</p>
          <p className="text-3xl font-bold text-blue-600">{stats.caTotal.toLocaleString()} €</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <p className="text-sm opacity-80 mb-1">Taux de Closing</p>
          <p className="text-3xl font-bold">{stats.tauxClosing.toFixed(1)}%</p>
          <p className="text-xs opacity-70 mt-2">{stats.totalClosings} / {stats.totalLeads} leads</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <p className="text-sm opacity-80 mb-1">CA / Lead</p>
          <p className="text-3xl font-bold">{stats.caParLead.toFixed(0)} €</p>
          <p className="text-xs opacity-70 mt-2">Revenu moyen par prospect</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <p className="text-sm opacity-80 mb-1">Appels / Closing</p>
          <p className="text-3xl font-bold">{stats.appelsParClosing.toFixed(1)}</p>
          <p className="text-xs opacity-70 mt-2">Rendement de vos appels</p>
        </div>
      </div>

      {/* Rappels du jour */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">🔔</span> Rappels aujourd'hui
            {prospectsToRemind.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {prospectsToRemind.length}
              </span>
            )}
          </h2>
          <span className="text-sm text-slate-500">{today}</span>
        </div>
        
        {prospectsToRemind.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <span className="text-4xl mb-2 block">✅</span>
            <p>Aucun rappel prévu pour aujourd'hui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prospectsToRemind.map((prospect) => (
              <div 
                key={prospect.id} 
                className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-lg">
                    {prospect.urgence === 'chaud' ? '🔥' : prospect.urgence === 'moyen' ? '⚡' : '❄️'}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">{prospect.prenom} {prospect.nom}</p>
                    <p className="text-sm text-slate-500">{prospect.telephone || 'Pas de téléphone'}</p>
                  </div>
                </div>
                <StatutBadge statut={prospect.statut} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline rapide */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Pipeline rapide</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STATUTS_PIPELINE.map((statut) => {
            const count = prospects.filter(p => p.statut === statut).length;
            return (
              <button
                key={statut}
                onClick={() => onNavigate('prospects')}
                className="flex-shrink-0 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-600 transition-colors"
              >
                {statut} <span className="ml-1 text-blue-600">({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Vue Prospects
const ProspectsList = ({ 
  setSelectedProspect, 
  setShowModal,
  filterToday 
}: { 
  setSelectedProspect: (p: Prospect | undefined) => void;
  setShowModal: (show: boolean) => void;
  filterToday?: boolean;
}) => {
  const { prospects, deleteProspect, clearAllProspects, addProspect } = useCRMStore();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const today = new Date().toISOString().split('T')[0];

  // Export CSV
  const handleExportCSV = () => {
    // En-têtes CSV correspondant à toutes les colonnes
      const headers = [
        'ID', 'Nom', 'Prénom', 'Téléphone', 'Email',
        'Situation Pro', 'Métier Actuel', 'Diplôme Visé',
        'Financement', 'Urgence', 'Statut', 'Nombre Appels',
        'Dernier Contact', 'Prochain Rappel', 'Heure Rappel',
        'Résumé Appel', 'Objections', 'Historique Appels', 'Offre Proposée',
        'Statut Paiement', 'CA Généré', 'Date Création'
      ];

      const rows = prospects.map(p => [
        p.id,
        p.nom,
        p.prenom,
        p.telephone,
        p.email,
        p.situationPro,
        p.metierActuel,
        p.diplomeVise,
        p.financement,
        p.urgence,
        p.statut,
        p.nbAppels.toString(),
        p.dernierContact || '',
        p.prochainRappel || '',
        p.prochainRappelHeure || '',
        p.resumeAppel.replace(/\n/g, ' '),
        p.objections.replace(/\n/g, ' '),
        serializeCallHistory(p.callHistory),
        p.offreProposee,
        p.statutPaiement,
        p.caGenere.toString(),
        p.createdAt
      ]);

    // Créer le contenu CSV
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    // Ajouter BOM pour UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Télécharger
    const link = document.createElement('a');
    link.href = url;
    link.download = `prospects_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({ message: `${prospects.length} prospects exportés avec succès !`, type: 'success' });
  };

  // Import CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const resetFileInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCsv(text);

        if (rows.length === 0) {
          setToast({ message: 'Fichier CSV vide ou format invalide', type: 'error' });
          resetFileInput();
          return;
        }

        const firstRow = rows[0];
        const hasHeaders = hasRecognizedCsvHeaders(firstRow);
        const headerMap = hasHeaders ? buildCsvHeaderMap(firstRow) : getDefaultCsvHeaderMap();
        const dataRows = hasHeaders ? rows.slice(1) : rows;
        const parsedProspects = dataRows
          .map((row) => createProspectFromCsvRow(row, headerMap))
          .filter((prospect): prospect is NewProspect => Boolean(prospect));

        if (parsedProspects.length === 0) {
          setToast({
            message: 'Aucun prospect valide détecté. Vérifiez les colonnes du CSV.',
            type: 'error',
          });
          resetFileInput();
          return;
        }

        const existingKeys = new Set(prospects.flatMap((prospect) => getProspectDuplicateKeys(prospect)));
        const seenImportKeys = new Set<string>();
        const uniqueProspects: NewProspect[] = [];
        const duplicateProspects: NewProspect[] = [];

        parsedProspects.forEach((prospect) => {
          const keys = getProspectDuplicateKeys(prospect);
          const isDuplicate = keys.length > 0 && keys.some((key) => existingKeys.has(key) || seenImportKeys.has(key));

          if (isDuplicate) {
            duplicateProspects.push(prospect);
            return;
          }

          uniqueProspects.push(prospect);
          keys.forEach((key) => seenImportKeys.add(key));
        });

        let prospectsToImport = uniqueProspects;
        let skippedDuplicates = duplicateProspects.length;

        if (duplicateProspects.length > 0) {
          const shouldImportDuplicates = window.confirm(
            `${duplicateProspects.length} doublon(s) détecté(s) sur ${parsedProspects.length} prospect(s).\n\n` +
              `OK = importer aussi les doublons\n` +
              `Annuler = ignorer les doublons et importer seulement les nouveaux prospects.`
          );

          if (shouldImportDuplicates) {
            prospectsToImport = [...uniqueProspects, ...duplicateProspects];
            skippedDuplicates = 0;
          }
        }

        prospectsToImport.forEach((prospect) => addProspect(prospect));

        if (prospectsToImport.length === 0) {
          setToast({
            message: 'Import annulé : tous les prospects du fichier sont des doublons.',
            type: 'error',
          });
        } else if (skippedDuplicates > 0) {
          setToast({
            message: `${prospectsToImport.length} prospect(s) importé(s), ${skippedDuplicates} doublon(s) ignoré(s).`,
            type: 'success',
          });
        } else {
          setToast({
            message: `${prospectsToImport.length} prospects importés avec succès !`,
            type: 'success',
          });
        }
      } catch (error) {
        setToast({ message: 'Erreur lors de l\'import du fichier', type: 'error' });
      }

      resetFileInput();
    };

    reader.readAsText(file, 'UTF-8');
  };

  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const matchesSearch = 
        p.nom.toLowerCase().includes(search.toLowerCase()) ||
        p.prenom.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.telephone.includes(search);
      
      const matchesStatut = statutFilter ? p.statut === statutFilter : true;
      
      const matchesToday = filterToday 
        ? p.prochainRappel === today && p.statut !== 'Closé' && p.statut !== 'Perdu'
        : true;
      
      return matchesSearch && matchesStatut && matchesToday;
    }).sort((a, b) => {
      // Trier par urgence puis par date de rappel
      const urgencyOrder = { chaud: 0, moyen: 1, froid: 2 };
      if (a.urgence !== b.urgence) {
        return urgencyOrder[a.urgence] - urgencyOrder[b.urgence];
      }
      if (a.prochainRappel && b.prochainRappel) {
        return a.prochainRappel.localeCompare(b.prochainRappel);
      }
      return 0;
    });
  }, [prospects, search, statutFilter, filterToday, today]);

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          {STATUTS_PIPELINE.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        
        {/* Boutons Import/Export */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            title="Importer CSV"
          >
            <UploadIcon />
            <span className="hidden sm:inline">Importer</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            title="Exporter CSV"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button
            onClick={() => {
              if (prospects.length === 0) {
                setToast({ message: 'Aucun prospect à supprimer.', type: 'error' });
                return;
              }

              const confirmed = window.confirm(
                `Vous êtes sur le point de supprimer définitivement ${prospects.length} prospect(s).\n\nCette action est irréversible. Voulez-vous continuer ?`
              );

              if (!confirmed) return;

              clearAllProspects();
              setShowDeleteConfirm(null);
              setToast({ message: 'Tous les prospects ont été supprimés.', type: 'success' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
            title="Supprimer tous les prospects"
          >
            <TrashIcon />
            <span className="hidden sm:inline">Tout effacer</span>
          </button>
        </div>

        {filterToday && (
          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium flex items-center gap-2">
            🔔 Aujourd'hui ({filteredProspects.length})
          </span>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          <button 
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-3">
        {filteredProspects.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center text-slate-400">
            <span className="text-4xl mb-2 block">📭</span>
            <p>Aucun prospect trouvé</p>
          </div>
        ) : (
          filteredProspects.map((prospect) => (
            <div 
              key={prospect.id}
              className={`bg-white p-4 rounded-xl shadow-sm border transition-all hover:shadow-md ${
                prospect.prochainRappel === today && prospect.statut !== 'Closé' && prospect.statut !== 'Perdu'
                  ? 'border-red-200 bg-red-50/50'
                  : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-lg font-bold text-slate-600">
                    {prospect.prenom[0]}{prospect.nom[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{prospect.prenom} {prospect.nom}</h3>
                      <UrgenceBadge urgence={prospect.urgence} />
                      {prospect.prochainRappel === today && prospect.statut !== 'Closé' && prospect.statut !== 'Perdu' && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                          ⚠️ À rappeler
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{prospect.telephone || '—'} • {prospect.email || '—'}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <StatutBadge statut={prospect.statut} />
                      {prospect.financement && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                          💳 {prospect.financement}
                        </span>
                      )}
                      {prospect.offreProposee && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">
                          {prospect.offreProposee} €
                        </span>
                      )}
                      {prospect.nbAppels > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          📞 {prospect.nbAppels} appel{prospect.nbAppels > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedProspect(prospect);
                      setShowModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Modifier"
                  >
                    <EditIcon />
                  </button>
                  {showDeleteConfirm === prospect.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          deleteProspect(prospect.id);
                          setShowDeleteConfirm(null);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-xs"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg text-xs"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(prospect.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
              {prospect.resumeAppel && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">📝 Dernier résumé:</p>
                  <p className="text-sm text-slate-700 line-clamp-2">{prospect.resumeAppel}</p>
                </div>
              )}
              {prospect.objections && (
                <div className="mt-2">
                  <p className="text-xs text-red-500 mb-1">⚠️ Objections:</p>
                  <p className="text-sm text-slate-700 line-clamp-1">{prospect.objections}</p>
                </div>
              )}
              {prospect.prochainRappel && (
                <p className="text-xs text-slate-400 mt-2">
                  📅 Prochain rappel: {new Date(prospect.prochainRappel).toLocaleDateString('fr-FR')}
                  {prospect.prochainRappelHeure && (
                    <span className="ml-1">
                      🕐 {prospect.prochainRappelHeure}
                    </span>
                  )}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Vue Pipeline Kanban
const Pipeline = () => {
  const { prospects } = useCRMStore();

  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUTS_PIPELINE.map((statut) => {
          const statutProspects = prospects.filter(p => p.statut === statut);
          const colors: Record<string, string> = {
            'Nouveau lead': 'bg-blue-50 border-blue-200',
            'À appeler': 'bg-yellow-50 border-yellow-200',
            'Appelé': 'bg-indigo-50 border-indigo-200',
            'Relance': 'bg-orange-50 border-orange-200',
            'RDV prévu': 'bg-purple-50 border-purple-200',
            'Closé': 'bg-green-50 border-green-200',
            'Perdu': 'bg-red-50 border-red-200',
          };
          
          return (
            <div 
              key={statut}
              className={`flex-shrink-0 w-72 p-4 rounded-xl border-2 ${colors[statut]}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700">{statut}</h3>
                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                  {statutProspects.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {statutProspects.map((prospect) => (
                  <div 
                    key={prospect.id}
                    className="bg-white p-3 rounded-lg shadow-sm border border-slate-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold">
                        {prospect.prenom[0]}{prospect.nom[0]}
                      </span>
                      <span className="font-medium text-sm">{prospect.prenom} {prospect.nom}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <UrgenceBadge urgence={prospect.urgence} />
                    </div>
                    {prospect.offreProposee && (
                      <p className="text-sm font-mono text-green-600 mt-2">{prospect.offreProposee} €</p>
                    )}
                  </div>
                ))}
                {statutProspects.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Vide
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Vue Stats détaillées
const Stats = () => {
  const { prospects, getStats } = useCRMStore();
  const stats = getStats();

  // Calculs supplémentaires
  const closingsParOffre = prospects
    .filter(p => p.statut === 'Closé' && p.offreProposee)
    .reduce((acc, p) => {
      acc[p.offreProposee] = (acc[p.offreProposee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const prospectsParUrgence = {
    chaud: prospects.filter(p => p.urgence === 'chaud').length,
    moyen: prospects.filter(p => p.urgence === 'moyen').length,
    froid: prospects.filter(p => p.urgence === 'froid').length,
  };

  const moyenneAppelsParLead = stats.totalLeads > 0 
    ? (stats.totalAppels / stats.totalLeads).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-2">Total Leads</p>
          <p className="text-4xl font-bold text-slate-800">{stats.totalLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-2">CA Total</p>
          <p className="text-4xl font-bold text-green-600">{stats.caTotal.toLocaleString()} €</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-2">Taux de Closing</p>
          <p className="text-4xl font-bold text-blue-600">{stats.tauxClosing.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-2">CA / Lead</p>
          <p className="text-4xl font-bold text-purple-600">{stats.caParLead.toFixed(0)} €</p>
        </div>
      </div>

      {/* Graphiques simples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Par urgence */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Répartition par urgence</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">🔥 Chaud</span>
                <span className="text-sm font-medium">{prospectsParUrgence.chaud}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${stats.totalLeads > 0 ? (prospectsParUrgence.chaud / stats.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">⚡ Moyen</span>
                <span className="text-sm font-medium">{prospectsParUrgence.moyen}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ width: `${stats.totalLeads > 0 ? (prospectsParUrgence.moyen / stats.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">❄️ Froid</span>
                <span className="text-sm font-medium">{prospectsParUrgence.froid}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${stats.totalLeads > 0 ? (prospectsParUrgence.froid / stats.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Closings par offre */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Closings par offre</h3>
          <div className="space-y-4">
            {OFFRES.filter((offre) => offre !== 'Autre').map((offre) => (
              <div key={offre}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">Offre {offre}</span>
                  <span className="text-sm font-medium">{closingsParOffre[offre] || 0} closings</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${stats.totalClosings > 0 ? ((closingsParOffre[offre] || 0) / stats.totalClosings) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {((closingsParOffre[offre] || 0) * getOfferValue(offre)).toLocaleString()} € générés
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats détaillées */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Statistiques détaillées</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{stats.totalAppels}</p>
            <p className="text-sm text-slate-500">Total appels</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{stats.totalClosings}</p>
            <p className="text-sm text-slate-500">Closings</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{moyenneAppelsParLead}</p>
            <p className="text-sm text-slate-500">Appels / lead</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{stats.appelsParClosing.toFixed(1)}</p>
            <p className="text-sm text-slate-500">Appels / closing</p>
          </div>
        </div>
      </div>

      {/* Tableau des closings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Prospects closés</h3>
        {prospects.filter(p => p.statut === 'Closé').length === 0 ? (
          <p className="text-center text-slate-400 py-4">Aucun closing pour le moment</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-500 border-b">
                  <th className="pb-2">Prospect</th>
                  <th className="pb-2">Offre</th>
                  <th className="pb-2">Paiement</th>
                  <th className="pb-2">CA</th>
                </tr>
              </thead>
              <tbody>
                {prospects.filter(p => p.statut === 'Closé').map((p) => (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="py-3">{p.prenom} {p.nom}</td>
                    <td className="py-3">{p.offreProposee || '—'} €</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.statutPaiement === 'Payé' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.statutPaiement}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-medium text-green-600">
                      {p.statutPaiement === 'Payé' && p.offreProposee 
                        ? `${p.offreProposee} €` 
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Application principale
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { getProspectsToRemind } = useCRMStore();
  const remindCount = getProspectsToRemind().length;

  const handleSave = () => {
    setToast({ message: selectedProspect ? 'Prospect mis à jour !' : 'Prospect créé !', type: 'success' });
    setSelectedProspect(undefined);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { id: 'prospects', label: 'Prospects', icon: <UsersIcon /> },
    { id: 'pipeline', label: 'Pipeline', icon: <PipelineIcon /> },
    { id: 'stats', label: 'Statistiques', icon: <ChartIcon /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            CRM Prospection
          </h1>
          <p className="text-sm text-slate-500 mt-1">Gérez vos leads</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.id === 'prospects' && remindCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {remindCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              setSelectedProspect(undefined);
              setShowModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <PlusIcon />
            Nouveau prospect
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {navItems.find(n => n.id === currentPage)?.label}
            </h2>
            <p className="text-sm text-slate-500">
              {currentPage === 'dashboard' && 'Vue d\'ensemble de votre activité'}
              {currentPage === 'prospects' && 'Gérez et suivez vos prospects'}
              {currentPage === 'pipeline' && 'Visualisez votre entonnoir de vente'}
              {currentPage === 'stats' && 'Analysez vos performances'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {remindCount > 0 && (
              <button
                onClick={() => setCurrentPage('prospects')}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <BellIcon />
                <span className="font-medium">{remindCount} à rappeler</span>
              </button>
            )}
            <button
              onClick={() => {
                setSelectedProspect(undefined);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              Ajouter
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
          {currentPage === 'prospects' && (
            <ProspectsList 
              setSelectedProspect={setSelectedProspect} 
              setShowModal={setShowModal}
              filterToday={false}
            />
          )}
          {currentPage === 'pipeline' && <Pipeline />}
          {currentPage === 'stats' && <Stats />}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <ProspectModal
          prospect={selectedProspect}
          onClose={() => {
            setShowModal(false);
            setSelectedProspect(undefined);
          }}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
