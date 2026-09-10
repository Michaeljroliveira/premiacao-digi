// Lista de tipos de instalação que NÃO contam para prémio
const TIPOS_EXCLUIDOS = [
  "catv",
  "ftth downgrade digi to smart",
  "ftth upgrade digi to pro-digi",
  "iptv",
  "fwa",
];

export function processarDados(dados: any[]) {
  // Filtra: apenas "Finished" E tipo NÃO excluído
  const validos = dados.filter((item) => {
    if (item["Estado"] !== "Finished") return false;

    const tipo = (item["Tipo de instalación"] || "").toLowerCase().trim();
    if (tipo === "") return false;

    return !TIPOS_EXCLUIDOS.includes(tipo);
  });

  const tecnicos = new Set(
    validos.map((item) => item["Persona asignada"]).filter(Boolean)
  );

  return {
    totalLinhas: dados.length,
    totalValidos: validos.length,
    totalIgnorados: dados.length - validos.length,
    totalTecnicos: tecnicos.size,
    dadosValidos: validos,
  };
}
