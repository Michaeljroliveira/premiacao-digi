import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DiaTecnico } from "@/lib/rewards";

export function exportarTecnicoPDF(
  tecnico: string,
  dias: DiaTecnico[]
) {

  const historico = dias
    .filter((d) => d.tecnico === tecnico)
    .sort((a, b) => a.data.localeCompare(b.data));

  const totalPremio = historico.reduce(
    (soma, item) => soma + item.premio,
    0
  );

  const totalInstalacoes = historico.reduce(
    (soma, item) => soma + item.instalacoes,
    0
  );

  const diasPremiados = historico.filter(
    (d) => d.recebeuPremio
  ).length;

  const diasSemPremio = historico.length - diasPremiados;

  const pdf = new jsPDF();

  pdf.setFontSize(20);

  pdf.text("DIGI PERFORMANCE", 14, 18);

  pdf.setFontSize(11);

  pdf.text(
    "Relatório de Auditoria de Premiação",
    14,
    26
  );

  pdf.setFontSize(16);

  pdf.text(tecnico, 14, 40);

  pdf.setFontSize(11);

  pdf.text(
    `Dias Trabalhados: ${historico.length}`,
    14,
    52
  );

  pdf.text(
    `Dias Premiados: ${diasPremiados}`,
    14,
    60
  );

  pdf.text(
    `Dias sem Prêmio: ${diasSemPremio}`,
    14,
    68
  );

  pdf.text(
    `Instalações: ${totalInstalacoes}`,
    14,
    76
  );

  pdf.text(
    `Prêmio Total: € ${totalPremio.toFixed(2)}`,
    14,
    84
  );

  autoTable(pdf, {

    startY: 95,

    head: [[
      "Data",
      "Instalações",
      "Prêmio",
      "Situação"
    ]],

    body: historico.map((dia) => [

      dia.data,

      dia.instalacoes,

      `€ ${dia.premio.toFixed(2)}`,

      dia.recebeuPremio
        ? "Premiado"
        : "Sem prêmio"

    ])

  });

  pdf.save(
    `Relatorio_${tecnico}.pdf`
  );

}