import { DiaTecnico } from "@/lib/rewards";

// ============ REGRAS DE NEGÓCIO ============
export const MIN_DIAS_PRODUTIVO = 12;

interface TabelaPatamares {
  minTecnicos: number;
  maxTecnicos: number;
  label: string;
  patamares: { instalacoes: number; bonus: number }[];
}

export const TABELAS_SUPERVISOR: TabelaPatamares[] = [
  {
    minTecnicos: 1,
    maxTecnicos: 5,
    label: "1 a 5 técnicos",
    patamares: [
      { instalacoes: 200, bonus: 120 },
      { instalacoes: 240, bonus: 144 },
      { instalacoes: 280, bonus: 168 },
    ],
  },
  {
    minTecnicos: 6,
    maxTecnicos: 10,
    label: "6 a 10 técnicos",
    patamares: [
      { instalacoes: 425, bonus: 255 },
      { instalacoes: 510, bonus: 306 },
      { instalacoes: 595, bonus: 357 },
    ],
  },
  {
    minTecnicos: 11,
    maxTecnicos: 15,
    label: "11 a 15 técnicos",
    patamares: [
      { instalacoes: 650, bonus: 390 },
      { instalacoes: 780, bonus: 468 },
      { instalacoes: 910, bonus: 546 },
    ],
  },
  {
    minTecnicos: 16,
    maxTecnicos: 999,
    label: "16 ou mais técnicos",
    patamares: [
      { instalacoes: 750, bonus: 450 },
      { instalacoes: 900, bonus: 540 },
      { instalacoes: 1050, bonus: 630 },
    ],
  },
];

// ============ CÁLCULOS ============

/**
 * Conta técnicos produtivos (≥12 dias únicos com instalações)
 * Recebe a lista de dias-técnico e devolve a contagem de técnicos produtivos
 */
export function contarTecnicosProdutivos(dias: DiaTecnico[]): number {
  const diasPorTecnico = new Map<string, Set<string>>();

  for (const dia of dias) {
    if (!diasPorTecnico.has(dia.tecnico)) {
      diasPorTecnico.set(dia.tecnico, new Set());
    }
    diasPorTecnico.get(dia.tecnico)!.add(dia.data);
  }

  let produtivos = 0;
  for (const [, dias] of diasPorTecnico.entries()) {
    if (dias.size >= MIN_DIAS_PRODUTIVO) {
      produtivos++;
    }
  }

  return produtivos;
}

/**
 * Identifica qual tabela se aplica ao número de técnicos produtivos
 */
export function identificarTabela(tecnicosProdutivos: number): TabelaPatamares {
  for (const tabela of TABELAS_SUPERVISOR) {
    if (
      tecnicosProdutivos >= tabela.minTecnicos &&
      tecnicosProdutivos <= tabela.maxTecnicos
    ) {
      return tabela;
    }
  }
  return TABELAS_SUPERVISOR[0];
}

/**
 * Calcula o bónus do supervisor com base nas instalações totais
 * e no número de técnicos produtivos
 */
export function calcularBonusSupervisor(
  instalacoesTotais: number,
  tecnicosProdutivos: number
): {
  tabela: TabelaPatamares;
  bonus: number;
  patamarAtingido: number; // 0, 1, 2, 3
  proximoPatamar: { instalacoes: number; bonus: number } | null;
  faltamProximo: number;
  progresso: number; // 0-100%
} {
  const tabela = identificarTabela(tecnicosProdutivos);

  let patamarAtingido = 0;
  let bonus = 0;

  for (let i = tabela.patamares.length - 1; i >= 0; i--) {
    if (instalacoesTotais >= tabela.patamares[i].instalacoes) {
      patamarAtingido = i + 1;
      bonus = tabela.patamares[i].bonus;
      break;
    }
  }

  // Próximo patamar
  let proximoPatamar: { instalacoes: number; bonus: number } | null = null;
  let faltamProximo = 0;

  if (patamarAtingido < tabela.patamares.length) {
    proximoPatamar = tabela.patamares[patamarAtingido];
    faltamProximo = proximoPatamar.instalacoes - instalacoesTotais;
  }

  // Progresso em relação ao próximo patamar (ou 100% se atingiu o último)
  let progresso = 0;
  if (patamarAtingido === 0) {
    progresso = (instalacoesTotais / tabela.patamares[0].instalacoes) * 100;
  } else if (patamarAtingido === tabela.patamares.length) {
    progresso = 100;
  } else {
    const anterior = tabela.patamares[patamarAtingido - 1].instalacoes;
    const proximo = tabela.patamares[patamarAtingido].instalacoes;
    progresso =
      ((instalacoesTotais - anterior) / (proximo - anterior)) * 100;
  }

  return {
    tabela,
    bonus,
    patamarAtingido,
    proximoPatamar,
    faltamProximo,
    progresso: Math.round(progresso),
  };
}

/**
 * Interface do resultado consolidado do supervisor
 */
export interface ResumoSupervisor {
  nome: string;
  tecnicosProdutivos: number;
  tecnicosTotais: number;
  instalacoesTotais: number;
  bonus: number;
  patamarAtingido: number;
  proximoPatamar: { instalacoes: number; bonus: number } | null;
  faltamProximo: number;
  progresso: number;
  tabelaAplicada: string;
  patamares: { instalacoes: number; bonus: number }[];
}

/**
 * Gera o resumo completo do supervisor
 */
export function gerarResumoSupervisor(
  nome: string,
  dias: DiaTecnico[]
): ResumoSupervisor {
  const tecnicosUnicos = new Set(dias.map((d) => d.tecnico));
  const tecnicosTotais = tecnicosUnicos.size;

  const tecnicosProdutivos = contarTecnicosProdutivos(dias);

  const instalacoesTotais = dias.reduce((soma, d) => soma + d.instalacoes, 0);

  const resultado = calcularBonusSupervisor(
    instalacoesTotais,
    tecnicosProdutivos
  );

  return {
    nome,
    tecnicosProdutivos,
    tecnicosTotais,
    instalacoesTotais,
    bonus: resultado.bonus,
    patamarAtingido: resultado.patamarAtingido,
    proximoPatamar: resultado.proximoPatamar,
    faltamProximo: resultado.faltamProximo,
    progresso: resultado.progresso,
    tabelaAplicada: resultado.tabela.label,
    patamares: resultado.tabela.patamares,
  };
}
