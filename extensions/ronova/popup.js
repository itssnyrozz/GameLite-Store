// Les extensions n'acceptent pas le JavaScript écrit directement dans le HTML : il va dans ce fichier.
const n = document.getElementById('n');
chrome.storage.local.get({ clics: 0 }, d => { n.textContent = d.clics; });
document.getElementById('b').onclick = () => {
  const v = Number(n.textContent) + 1;
  n.textContent = v;
  chrome.storage.local.set({ clics: v });
};
