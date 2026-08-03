export const COLUNAS_OBRIGATORIAS = [
  "Estado",
  "Tipo de instalación",
  "Persona asignada",
  "Citada",
];

export function validarPlanilha(dados: any[]) {

  if (!dados.length) {
    return {
      valido: false,
      erro: "A planilha está vazia."
    };
  }

  const colunas = Object.keys(dados[0]);

  const faltando = COLUNAS_OBRIGATORIAS.filter(
    coluna => !colunas.includes(coluna)
  );

  if (faltando.length > 0) {
    return {
      valido: false,
      erro: `Colunas não encontradas: ${faltando.join(", ")}`
    };
  }

  return {
    valido: true,
    erro: ""
  };

}