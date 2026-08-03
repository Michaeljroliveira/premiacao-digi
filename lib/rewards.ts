export interface ResumoTecnico {
  tecnico: string;
  diasTrabalhados: number;
  diasComPremio: number;
  diasSemPremio: number;
  instalacoes: number;
  premioTotal: number;
  valorPerdido: number;
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

export function calcularPremio(quantidade: number): number {

  if (quantidade < 3) {
    return 0;
  }

  return 15 + ((quantidade - 3) * 20);

}

export function gerarResumoTecnicos(
  servicos: any[]
): ResultadoPremiacao {

  const agrupado = new Map<string, number>();

  for (const servico of servicos) {

    const tecnico = servico["Persona asignada"];

    const data = new Date(servico["Citada"])
      .toISOString()
      .split("T")[0];

    const chave = `${tecnico}|${data}`;

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
        premio === 0
          ? Math.max(0, 3 - quantidade)
          : 0,

    });

    if (!resumo.has(tecnico)) {

      resumo.set(tecnico, {

        tecnico,

        diasTrabalhados: 0,

        diasComPremio: 0,

        diasSemPremio: 0,

        instalacoes: 0,

        premioTotal: 0,

        valorPerdido: 0,

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

      item.valorPerdido += 15;

    }

  }

  diasTecnicos.sort((a, b) => {

    if (a.tecnico !== b.tecnico) {
      return a.tecnico.localeCompare(b.tecnico);
    }

    return a.data.localeCompare(b.data);

  });

  return {

    resumoTecnicos: Array.from(resumo.values()),

    diasTecnicos,

  };

}

export function calcularEstatisticasGerais(
  tecnicos: ResumoTecnico[]
) {

  let premioTotal = 0;
  let valorPerdido = 0;
  let diasTrabalhados = 0;
  let diasPremiados = 0;
  let diasSemPremio = 0;

  for (const tecnico of tecnicos) {

    premioTotal += tecnico.premioTotal;

    valorPerdido += tecnico.valorPerdido;

    diasTrabalhados += tecnico.diasTrabalhados;

    diasPremiados += tecnico.diasComPremio;

    diasSemPremio += tecnico.diasSemPremio;

  }

  return {

    premioTotal,

    valorPerdido,

    diasTrabalhados,

    diasPremiados,

    diasSemPremio,

  };

}