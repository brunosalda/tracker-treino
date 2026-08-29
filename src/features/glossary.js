import { GLOSSARY } from '../data/library.js';

function abrirGlossario(id) {
  const item = GLOSSARY[id];
  if (!item) return;
  document.getElementById('glossary-title').textContent = item.titulo;
  document.getElementById('glossary-text').textContent = item.texto;
  document.getElementById('glossary-overlay').classList.add('active');
}
function fecharGlossario() {
  document.getElementById('glossary-overlay').classList.remove('active');
}

window.abrirGlossario = abrirGlossario;
window.fecharGlossario = fecharGlossario;
