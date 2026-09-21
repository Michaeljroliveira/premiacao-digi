// Tipos de instalação que NÃO contam para prémio
const TIPOS_EXCLUIDOS = [
  "catv",
  "ftth downgrade digi to smart",
  "ftth upgrade digi to pro-digi",
  "iptv",
  "fwa",
];

export interface WOIgnorada {
  id: number;
  estado: string;
  tipo: string;
  tecnico: string;
  data: string;
  motivo: string;
}

export interface ResultadoProcessamento {
  totalLinhas: number;
  totalValidos: number;
  totalIgnorados: number;
  totalTecnicos: number;
  dadosValidos: any[];
  ignorados: WOIgnorada[];
  // Decomposição por motivo
  porEstado: Record<string, number>;
  porTipo: Record<string, number>;
}

export function processarDados(dados: any[]): ResultadoProcessamento {
  const validos: any[] = [];
  const ignorados: WOIgnorada[] = [];
  const porEstado: Record<string, number> = {};
  const porTipo: Record<string, number> = {};

  for (const item of dados) {
    const estado = (item["Estado"] || "").trim();
    const tipo = (item["Tipo de instalación"] || "").trim();
    const tipoLower = tipo.toLowerCase();
    const tecnico = item["Persona asignada"] || "Sem técnico";
    const data = item["Citada"] || item["Creada"] || "";
    const id = item["Id Instalación"] || 0;

    // Verificar estado
    if (estado !== "Finished") {
      const motivo = `Estado: ${estado || "(vazio)"}`;
      ignorados.push({ id, estado, tipo, tecnico, data, motivo });
      porEstado[estado || "(vazio)"] = (porEstado[estado || "(vazio)"] || 0) + 1;
      continue;
    }

    // Verificar tipo de instalação
    if (TIPOS_EXCLUIDOS.includes(tipoLower)) {
      const motivo = `Tipo excluído: ${tipo}`;
      ignorados.push({ id, estado, tipo, tecnico, data, motivo });
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
      continue;
    }

    // Verificar data válida
    if (!data || data === "") {
      const motivo = "Sem data (Citada e Creada vazias)";
      ignorados.push({ id, estado, tipo, tecnico, data, motivo });
      porTipo["(sem data)"] = (porTipo["(sem data)"] || 0) + 1;
      continue;
    }

    // Válido
    validos.push(item);
  }

  const tecnicos = new Set(
    validos.map((item) => item["Persona asignada"]).filter(Boolean)
  );

  return {
    totalLinhas: dados.length,
    totalValidos: validos.length,
    totalIgnorados: ignorados.length,
    totalTecnicos: tecnicos.size,
    dadosValidos: validos,
    ignorados,
    porEstado,
    porTipo,
  };
}
