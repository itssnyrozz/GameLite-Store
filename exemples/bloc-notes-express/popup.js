const notes = document.getElementById('notes');
const etat = document.getElementById('etat');
let attente;

chrome.storage.local.get({ notes: '' }, d => { notes.value = d.notes; });

notes.addEventListener('input', () => {
  etat.textContent = '…';
  clearTimeout(attente);
  attente = setTimeout(() => chrome.storage.local.set({ notes: notes.value }, () => { etat.textContent = 'Enregistré'; }), 300);
});
