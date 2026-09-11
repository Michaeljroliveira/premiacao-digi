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

// ============ TIPOS ============
export interface TecnicoInfo {
  email: string;
  nome: string;
  dias: number;
  instalacoes: number;
  produtivo: boolean;
}

export interface ResumoSupervisor {
  nome: string;
  tecnicosProdutivos: number;
  tecnicosTotais: number;
  instalacoesTotais: number; // Só de produtivos
  instalacoesExcluidas: number; // Dos não produtivos (para transparência)
  bonus: number;
  patamarAtingido: number;
  proximoPatamar: { instalacoes: number; bonus: number } | null;
  faltamProximo: number;
  progresso: number;
  tabelaAplicada: string;
  patamares: { instalacoes: number; bonus: number }[];
  rankingInterno: TecnicoInfo[];
}

// ============ CÁLCULOS ============

/**
 * Analisa cada técnico individualmente: dias trabalhados, instalações e se é produtivo
 */
export function analisarTecnicos(dias: DiaTecnico[]): TecnicoInfo[] {
  const mapa = new Map<
    string,
    { dias: Set<string>; instalacoes: number }
  >();

  for (const dia of dias) {
    if (!mapa.has(dia.tecnico)) {
      mapa.set(dia.tecnico, { dias: new Set(), instalacoes: 0 });
    }
    const info = mapa.get(dia.tecnico)!;
    info.dias.add(dia.data);
    info.instalacoes += dia.instalacoes;
  }

  const resultado: TecnicoInfo[] = [];
  for (const [email, info] of mapa.entries()) {
    const nome = email
      .split("@")[0]
      .replace(/\./g, " ")
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

    resultado.push({
      email,
      nome,
      dias: info.dias.size,
      instalacoes: info.instalacoes,
      produtivo: info.dias.size >= MIN_DIAS_PRODUTIVO,
    });
  }

  return resultado.sort((a, b) => b.instalacoes - a.instalacoes);
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
 * (já filtradas só dos produtivos) e no número de técnicos produtivos
 */
export function calcularBonusSupervisor(
  instalacoesTotais: number,
  tecnicosProdutivos: number
): {
  tabela: TabelaPatamares;
  bonus: number;
  patamarAtingido: number;
  proximoPatamar: { instalacoes: number; bonus: number } | null;
  faltamProximo: number;
  progresso: number;
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

  let proximoPatamar: { instalacoes: number; bonus: number } | null = null;
  let faltamProximo = 0;

  if (patamarAtingido < tabela.patamares.length) {
    proximoPatamar = tabela.patamares[patamarAtingido];
    faltamProximo = proximoPatamar.instalacoes - instalacoesTotais;
  }

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
 * Gera o resumo completo do supervisor.
 *
 * IMPORTANTE: só conta instalações de técnicos com ≥12 dias trabalhados.
 */
export function gerarResumoSupervisor(
  nome: string,
  dias: DiaTecnico[]
): ResumoSupervisor {
  // 1. Analisar cada técnico
  const rankingInterno = analisarTecnicos(dias);

  // 2. Separar produtivos e não produtivos
  const produtivos = rankingInterno.filter((t) => t.produtivo);
  const naoProdutivos = rankingInterno.filter((t) => !t.produtivo);

  const emailsProdutivos = new Set(produtivos.map((t) => t.email));

  // 3. Somar instalações APENAS dos produtivos
  const instalacoesTotais = produtivos.reduce(
    (soma, t) => soma + t.instalacoes,
    0
  );

  const instalacoesExcluidas = naoProdutivos.reduce(
    (soma, t) => soma + t.instalacoes,
    0
  );

  // 4. Calcular bónus
  const resultado = calcularBonusSupervisor(
    instalacoesTotais,
    produtivos.length
  );

  return {
    nome,
    tecnicosProdutivos: produtivos.length,
    tecnicosTotais: rankingInterno.length,
    instalacoesTotais,
    instalacoesExcluidas,
    bonus: resultado.bonus,
    patamarAtingido: resultado.patamarAtingido,
    proximoPatamar: resultado.proximoPatamar,
    faltamProximo: resultado.faltamProximo,
    progresso: resultado.progresso,
    tabelaAplicada: resultado.tabela.label,
    patamares: resultado.tabela.patamares,
    rankingInterno,
  };
}
