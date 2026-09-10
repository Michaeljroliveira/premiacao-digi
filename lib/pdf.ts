import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DiaTecnico } from "@/lib/rewards";

// ALTERADO: valor de referência para dia não produtivo
const VALOR_DIA_NAO_PRODUTIVO = 35;

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

  // ALTERADO: cálculo do valor perdido
  const valorPerdido = diasSemPremio * VALOR_DIA_NAO_PRODUTIVO;

  const pdf = new jsPDF();

  pdf.setFontSize(20);
  pdf.text("DIGI PERFORMANCE", 14, 18);

  pdf.setFontSize(11);
  pdf.text("Relatório de Auditoria de Premiação", 14, 26);

  pdf.setFontSize(16);
  pdf.text(tecnico, 14, 40);

  pdf.setFontSize(11);

  pdf.text(`Dias Trabalhados: ${historico.length}`, 14, 52);
  pdf.text(`Dias Premiados: ${diasPremiados}`, 14, 60);
  pdf.text(`Dias sem Prêmio: ${diasSemPremio}`, 14, 68);
  pdf.text(`Instalações: ${totalInstalacoes}`, 14, 76);
  pdf.text(`Prêmio Total: € ${totalPremio.toFixed(2)}`, 14, 84);

  // NOVO: linha do valor perdido
  pdf.setTextColor(220, 53, 69); // vermelho
  pdf.text(
    `Valor Perdido: € ${valorPerdido.toFixed(2)}`,
    14,
    92
  );
  pdf.setTextColor(0, 0, 0);

  // NOVO: texto explicativo
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `(Dias não produtivos × €${VALOR_DIA_NAO_PRODUTIVO} - referência: 4 instalações/dia)`,
    14,
    99
  );
  pdf.setTextColor(0, 0, 0);

  autoTable(pdf, {
    startY: 110,
    head: [["Data", "Instalações", "Prêmio", "Situação"]],
    body: historico.map((dia) => [
      dia.data,
      dia.instalacoes,
      `€ ${dia.premio.toFixed(2)}`,
      dia.recebeuPremio ? "Premiado" : "Sem prêmio",
    ]),
  });

  pdf.save(`Relatorio_${tecnico}.pdf`);

}
