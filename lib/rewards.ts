import { parseData } from "@/lib/datas";

export interface ResumoTecnico {
  tecnico: string;
  diasTrabalhados: number;
  diasComPremio: number;
  diasSemPremio: number;
  diasCom3: number;
  diasCom4: number;
  diasCom5mais: number;
  instalacoes: number;
  premioTotal: number;
  potencialAdicional: number;
}

export interface DiaTecnico {
  tecnico: string;
  data: string;
  instalacoes: number;
  premio: number;
  recebeuPremio: boolean;
  faltaramInstalacoes: number;
}

export interface ResultadoPremiacao {
  resumoTecnicos: ResumoTecnico[];
  diasTecnicos: DiaTecnico[];
}

export interface PerfilTecnico {
  tipo: "elite" | "consistente" | "evolucao" | "abaixo" | "irregular";
  titulo: string;
  mensagem: string;
  lema: string;
  cor: string;
}

// Meta diária de referência (4 instalações)
const META_DIARIA = 4;
const PREMIO_META = 35; // 4 instalações = 15 + 20 = 35

export function calcularPremio(quantidade: number): number {
  if (quantidade < 3) return 0;
  return 15 + (quantidade - 3) * 20;
}

export function gerarResumoTecnicos(servicos: any[]): ResultadoPremiacao {
  const agrupado = new Map<string, number>();

  for (const servico of servicos) {
    const tecnico = servico["Persona asignada"];
    const dataStr = parseData(servico["Citada"]);

    if (!tecnico || !dataStr) continue;

    const chave = `${tecnico}|${dataStr}`;
    agrupado.set(chave, (agrupado.get(chave) || 0) + 1);
  }

  const resumo = new Map<string, ResumoTecnico>();
  const diasTecnicos: DiaTecnico[] = [];

  for (const [chave, quantidade] of agrupado.entries()) {
    const [tecnico, data] = chave.split("|");
    const premio = calcularPremio(quantidade);

    diasTecnicos.push({
      tecnico,
      data,
      instalacoes: quantidade,
      premio,
      recebeuPremio: premio > 0,
      faltaramInstalacoes:
        premio === 0 ? Math.max(0, META_DIARIA - quantidade) : 0,
    });

    if (!resumo.has(tecnico)) {
      resumo.set(tecnico, {
        tecnico,
        diasTrabalhados: 0,
        diasComPremio: 0,
        diasSemPremio: 0,
        diasCom3: 0,
        diasCom4: 0,
        diasCom5mais: 0,
        instalacoes: 0,
        premioTotal: 0,
        potencialAdicional: 0,
      });
    }

    const item = resumo.get(tecnico)!;
    item.diasTrabalhados++;
    item.instalacoes += quantidade;
    item.premioTotal += premio;

    if (premio > 0) {
      item.diasComPremio++;
    } else {
      item.diasSemPremio++;
    }

    // Categorização por faixa
    if (quantidade === 3) item.diasCom3++;
    else if (quantidade === 4) item.diasCom4++;
    else if (quantidade >= 5) item.diasCom5mais++;

    // NOVO: Potencial Adicional = diferença para 35€ (meta 4 instalações)
    if (premio < PREMIO_META) {
      item.potencialAdicional += PREMIO_META - premio;
    }
  }

  diasTecnicos.sort((a, b) => {
    if (a.tecnico !== b.tecnico) return a.tecnico.localeCompare(b.tecnico);
    return a.data.localeCompare(b.data);
  });

  return {
    resumoTecnicos: Array.from(resumo.values()),
    diasTecnicos,
  };
}

export function classificarPerfil(
  tecnico: string,
  dias: DiaTecnico[]
): PerfilTecnico {
  const diasTecnico = dias.filter((d) => d.tecnico === tecnico);
  const total = diasTecnico.length;
  if (total === 0) {
    return {
      tipo: "abaixo",
      titulo: "📊 SEM DADOS",
      mensagem: "Sem dados suficientes para análise.",
      lema: "Cada dia é uma nova oportunidade.",
      cor: "#667eea",
    };
  }

  const nome = tecnico.split("@")[0].replace(/\./g, " ").split(" ")[0];
  const nomeCapital = nome.charAt(0).toUpperCase() + nome.slice(1);

  const c3 = diasTecnico.filter((d) => d.instalacoes === 3).length;
  const c4 = diasTecnico.filter((d) => d.instalacoes === 4).length;
  const c5 = diasTecnico.filter((d) => d.instalacoes >= 5).length;
  const c02 = diasTecnico.filter((d) => d.instalacoes <= 2).length;

  const pct5 = c5 / total;
  const pct4 = c4 / total;
  const pct3 = c3 / total;
  const pct02 = c02 / total;

  // ELITE: muitos dias com 5+
  if (pct5 >= 0.3 || pct4 + pct5 >= 0.8) {
    return {
      tipo: "elite",
      titulo: "🏆 VOCÊ ESTÁ NO TOPO. E ISSO É SÓ O COMEÇO.",
      mensagem: `${nomeCapital}, este mês você fez o que poucos fazem: transformou excelência em rotina. ${c5} dias a 5+ instalações. Você não está a competir com a equipa — está a competir consigo mesmo.

A pergunta não é "como faço mais?". A pergunta é: "quanto tempo consigo manter isto?"

Porque o verdadeiro campeão não é quem brilha um dia. É quem brilha todos os dias — mesmo quando ninguém está a ver.

Continue. O topo não é um lugar. É um hábito.`,
      lema: "🔥 A disciplina é a ponte entre metas e conquistas.",
      cor: "#ffc107",
    };
  }

  // CONSISTENTE: maioria 4
  if (pct4 >= 0.7) {
    return {
      tipo: "consistente",
      titulo: "💪 VOCÊ JÁ PROVOU QUE CONSEGUE. AGORA É HORA DE SUBIR.",
      mensagem: `${nomeCapital}, 4 instalações por dia já é a sua zona de conforto. E isso é perigoso.

A zona de conforto é onde os sonhos vão para morrer.

Você já tem o hábito. Já tem a disciplina. Já tem a consistência. O que falta? Uma decisão: subir para 5.

Não amanhã. Não na segunda. Hoje.

A diferença entre 4 e 5 é 1 instalação. 20€ a mais. Todos os dias. Faça as contas.`,
      lema: "🚀 A qualidade de vida é diretamente proporcional ao nível de exigência que você aplica a si mesmo.",
      cor: "#28a745",
    };
  }

  // EVOLUÇÃO: maioria 3, alguns 4+
  if (pct3 >= 0.5) {
    return {
      tipo: "evolucao",
      titulo: "📈 VOCÊ ESTÁ A 1 INSTALAÇÃO DE MUDAR TUDO.",
      mensagem: `${nomeCapital}, este mês você fez 3 instalações várias vezes. Mas também fez 4 e 5. Sabe o que isso significa?

Significa que a capacidade já existe. O que falta é a decisão.

O sucesso não é um salto gigante. É um passo pequeno, repetido todos os dias. Você já deu o primeiro passo. Agora é só não parar.

1 instalação. €20. Todos os dias. É este o preço da sua evolução.`,
      lema: "🎯 O momento em que você decide agir é o momento em que o seu destino muda.",
      cor: "#667eea",
    };
  }

  // ABAIXO DA META: maioria 0-2
  if (pct02 >= 0.5) {
    return {
      tipo: "abaixo",
      titulo: "🎯 EU ACREDITO EM VOCÊ. AGORA VOCÊ PRECISA ACREDITAR TAMBÉM.",
      mensagem: `${nomeCapital}, este mês teve dias difíceis. Eu sei. Acontece a todos. Mas aqui está a verdade que ninguém te conta:

A diferença entre quem vence e quem fica pelo caminho não é talento. É a decisão de tentar mais uma vez.

A matemática é simples:
3 instalações = €15
4 instalações = €35
A diferença é 1 instalação. Vale €20 todos os dias.

Não precisa ser perfeito. Precisa ser consistente. Comece com 3 dias seguidos. Depois 5. Depois o mês inteiro.`,
      lema: "💡 O sucesso é a soma de pequenos esforços repetidos dia após dia.",
      cor: "#dc3545",
    };
  }

  // IRREGULAR
  return {
    tipo: "irregular",
    titulo: "⚖️ CONSISTÊNCIA. É ISSO QUE MUDA TUDO.",
    mensagem: `${nomeCapital}, este mês você oscilou. Teve dias incríveis. Teve dias fracos. E isso é o maior obstáculo que existe no caminho do sucesso.

Não é a falta de capacidade. É a falta de consistência.

A regra é simples:
7 instalações num dia + 1 no outro = €75 + €0 = €75
4 instalações + 4 instalações = €35 + €35 = €70

Parece parecido? Não é. Um é sorte. O outro é construção de riqueza.

O campeão não é aquele que corre mais rápido. É aquele que corre todos os dias.`,
    lema: "🔥 A consistência é mais importante que a intensidade. Sempre foi. Sempre será.",
    cor: "#fd7e14",
  };
}

export function calcularEstatisticasGerais(tecnicos: ResumoTecnico[]) {
  let premioTotal = 0;
  let potencialAdicional = 0;
  let diasTrabalhados = 0;
  let diasPremiados = 0;
  let diasSemPremio = 0;

  for (const tecnico of tecnicos) {
    premioTotal += tecnico.premioTotal;
    potencialAdicional += tecnico.potencialAdicional;
    diasTrabalhados += tecnico.diasTrabalhados;
    diasPremiados += tecnico.diasComPremio;
    diasSemPremio += tecnico.diasSemPremio;
  }

  return {
    premioTotal,
    valorPerdido: potencialAdicional,
    potencialAdicional,
    diasTrabalhados,
    diasPremiados,
    diasSemPremio,
  };
}
