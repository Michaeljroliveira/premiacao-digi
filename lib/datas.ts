// lib/datas.ts
// Função robusta para parsing de datas no formato YYYY-MM-DD HH:MM:SS

export function parseData(valor: any): string | null {
  if (!valor) return null;

  // Se já é uma string no formato ISO
  if (typeof valor === "string") {
    const trimmed = valor.trim();
    if (trimmed === "") return null;

    // Formato: YYYY-MM-DD HH:MM:SS ou YYYY-MM-DD
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const ano = parseInt(match[1]);
      const mes = match[2];
      const dia = match[3];

      // Validação: ano deve ser entre 2020 e 2100
      if (ano < 2020 || ano > 2100) {
        // Tentar corrigir anos errados (2016 → 2026)
        const anoCorrigido = ano + 10;
        if (anoCorrigido >= 2020 && anoCorrigido <= 2100) {
          return `${anoCorrigido}-${mes}-${dia}`;
        }
        return null;
      }

      return `${ano}-${mes}-${dia}`;
    }

    // Formato: DD/MM/YYYY HH:MM:SS
    const match2 = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (match2) {
      const dia = match2[1];
      const mes = match2[2];
      const ano = parseInt(match2[3]);
      if (ano < 2020 || ano > 2100) return null;
      return `${ano}-${mes}-${dia}`;
    }
  }

  // Se é um objeto Date
  if (valor instanceof Date) {
    if (isNaN(valor.getTime())) return null;
    const ano = valor.getFullYear();
    if (ano < 2020 || ano > 2100) return null;
    const mes = String(valor.getMonth() + 1).padStart(2, "0");
    const dia = String(valor.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  // Se é um número (data serial do Excel)
  if (typeof valor === "number") {
    // Excel: 1 = 1900-01-01 (com bug de 1900)
    const excelEpoch = new Date(1899, 11, 30);
    const data = new Date(excelEpoch.getTime() + valor * 24 * 60 * 60 * 1000);
    const ano = data.getFullYear();
    if (ano < 2020 || ano > 2100) return null;
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  return null;
}

export function parseDataCompleta(valor: any): Date | null {
  const dataStr = parseData(valor);
  if (!dataStr) return null;
  const data = new Date(dataStr + "T12:00:00");
  if (isNaN(data.getTime())) return null;
  return data;
}
