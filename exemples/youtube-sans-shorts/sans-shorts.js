// Un lien vers un Short ouvre la même vidéo dans le lecteur normal.
function sansShorts() {
  const m = location.pathname.match(/^\/shorts\/([\w-]{6,})/);
  if (m) location.replace('/watch?v=' + m[1]);
}
sansShorts();
// YouTube change de page sans recharger : on vérifie à chaque navigation.
document.addEventListener('yt-navigate-finish', sansShorts);
