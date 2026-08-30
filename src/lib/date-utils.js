export function hojeStr() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }

// Data de "hoje" pra refeições: vira às 4h da manhã em vez de meia-noite,
// pra uma ceia tarde da noite ainda contar como o dia que já estava em curso.
export function hojeRefeicaoStr() {
  const d = new Date();
  if (d.getHours() < 4) { d.setDate(d.getDate() - 1); }
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Data a partir de um timestamp qualquer — usado pra datar uma corrida
// importada do Garmin pelo horário real da atividade, não pela data em
// que o arquivo foi importado.
export function dataDoTimestamp(isoStr) {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return hojeStr();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
