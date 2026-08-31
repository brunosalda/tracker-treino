import { SUPA_URL, supaHeaders } from '../lib/storage.js';
import { hojeStr } from '../lib/date-utils.js';

const TABELAS_BACKUP = ['logs', 'meals', 'lastset', 'misc_kv', 'garmin_activities'];

async function buscarTabela(tabela) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${tabela}?select=*`, { headers: supaHeaders() });
  if (!res.ok) throw new Error(`Falha ao ler ${tabela}: ${res.status}`);
  return res.json();
}

async function exportarBackup() {
  const status = document.getElementById('backup-status');
  if (status) status.textContent = 'Gerando backup...';

  try {
    const dados = {};
    for (const tabela of TABELAS_BACKUP) {
      dados[tabela] = await buscarTabela(tabela);
    }

    const payload = {
      app: 'FitnessHub',
      geradoEm: new Date().toISOString(),
      tabelas: dados
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-fitnesshub-${hojeStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const totalRegistros = Object.values(dados).reduce((s, rows) => s + rows.length, 0);
    if (status) status.textContent = `Backup baixado com ${totalRegistros} registros.`;
  } catch (err) {
    if (status) status.textContent = `Erro ao gerar backup: ${err.message}`;
  }
}

window.exportarBackup = exportarBackup;
