export function hojeStr() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }

// Data a partir de um timestamp qualquer — usado pra datar uma corrida
// importada do Garmin pelo horário real da atividade, não pela data em
// que o arquivo foi importado.
export function dataDoTimestamp(isoStr) {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return hojeStr();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
