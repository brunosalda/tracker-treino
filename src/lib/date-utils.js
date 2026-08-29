export function hojeStr() { const d = new Date(); if (d.getHours() < 4) { d.setDate(d.getDate() - 1); } return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }

// Mesma regra de virada do dia (às 4h), mas pra um timestamp qualquer — usado
// pra datar uma corrida importada do Garmin pelo horário real da atividade,
// não pela data em que o arquivo foi importado.
export function dataDoTimestamp(isoStr) {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return hojeStr();
  if (d.getHours() < 4) { d.setDate(d.getDate() - 1); }
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
