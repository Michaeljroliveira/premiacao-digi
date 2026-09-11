import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DiaTecnico } from "@/lib/rewards";
import { gerarResumoSupervisor, MIN_DIAS_PRODUTIVO } from "@/lib/supervisores";

const CORES = {
  azulEscuro: [26, 26, 46] as [number, number, number],
  azulDIGI: [0, 30, 255] as [number, number, number],
  azulClaro: [245, 247, 251] as [number, number, number],
  ambar: [255, 193, 7] as [number, number, number],
  ambarFundo: [255, 249, 230] as [number, number, number],
  ambarTexto: [133, 100, 4] as [number, number, number],
  verde: [40, 167, 69] as [number, number, number],
  verdeFundo: [212, 237, 218] as [number, number, number],
  verdeTexto: [21, 87, 36] as [number, number, number],
  vermelho: [220, 53, 69] as [number, number, number],
  vermelhoFundo: [248, 215, 218] as [number, number, number],
  vermelhoTexto: [114, 28, 36] as [number, number, number],
  cinzaTexto: [108, 117, 125] as [number, number, number],
  cinzaClaro: [233, 236, 239] as [number, number, number],
  branco: [255, 255, 255] as [number, number, number],
};

export function exportarSupervisorPDF(
  nomeSupervisor: string,
  dias: DiaTecnico[]
) {
  const resumo = gerarResumoSupervisor(nomeSupervisor, dias);

  const pdf = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // ============ CABECALHO ============
  pdf.setFillColor(...CORES.azulEscuro);
  pdf.rect(0, 0, pageWidth, 32, "F");

  pdf.setTextColor(...CORES.branco);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("DIGI PERFORMANCE", margin, 15);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Relatorio de Supervisao", margin, 23);

  pdf.setDrawColor(...CORES.ambar);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 27, margin + 40, 27);

  // ============ NOME ============
  let y = 45;

  pdf.setTextColor(...CORES.cinzaTexto);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("SUPERVISOR", margin, y - 5);

  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(nomeSupervisor, margin, y + 3);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...CORES.cinzaTexto);
  pdf.text(`Tabela aplicada: ${resumo.tabelaAplicada}`, margin, y + 9);

  // ============ CARDS RESUMO ============
  y = 70;
  pdf.setDrawColor(...CORES.cinzaClaro);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageWidth - margin, y);

  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("RESUMO DA EQUIPA", margin, y + 7);

  y = y + 14;

  const cards = [
    {
      label: "Tecnicos Produtivos",
      valor: `${resumo.tecnicosProdutivos}/${resumo.tecnicosTotais}`,
      cor: CORES.azulDIGI,
    },
    {
      label: "Instalacoes Validas",
      valor: resumo.instalacoesTotais,
      cor: CORES.verde,
    },
    {
      label: "Patamar Atingido",
      valor: `${resumo.patamarAtingido}/3`,
      cor: CORES.ambar,
    },
    {
      label: "Bonus Atual",
      valor: `€ ${resumo.bonus}`,
      cor: CORES.verde,
    },
  ];

  const boxWidth = (contentWidth - 9) / 4;
  cards.forEach((item, i) => {
    const x = margin + i * (boxWidth + 3);
    pdf.setFillColor(...CORES.azulClaro);
    pdf.roundedRect(x, y, boxWidth, 20, 1.5, 1.5, "F");
    pdf.setFillColor(...item.cor);
    pdf.rect(x, y, boxWidth, 1.2, "F");

    pdf.setTextColor(...CORES.cinzaTexto);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(item.label, x + boxWidth / 2, y + 8, { align: "center" });

    pdf.setTextColor(...item.cor);
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text(String(item.valor), x + boxWidth / 2, y + 16, {
      align: "center",
    });
  });

  // ============ AVISO EXCLUSAO ============
  if (resumo.instalacoesExcluidas > 0) {
    y = y + 26;
    pdf.setFillColor(...CORES.vermelhoFundo);
    pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
    pdf.setFillColor(...CORES.vermelho);
    pdf.rect(margin, y, 1.5, 12, "F");

    pdf.setTextColor(...CORES.vermelhoTexto);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    const excluidos = resumo.tecnicosTotais - resumo.tecnicosProdutivos;
    pdf.text(
      `${excluidos} tecnico(s) excluido(s) - menos de ${MIN_DIAS_PRODUTIVO} dias trabalhados`,
      margin + 5,
      y + 5
    );
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `${resumo.instalacoesExcluidas} instalacoes nao contam para o bonus`,
      margin + 5,
      y + 9
    );
    y += 4;
  }

  // ============ PROGRESSO DOS PATAMARES ============
  y = y + 20;
  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("PROGRESSO DOS PATAMARES", margin, y);

  y = y + 8;
  resumo.patamares.forEach((p, i) => {
    const atingido = i < resumo.patamarAtingido;

    pdf.setFillColor(...(atingido ? CORES.verdeFundo : CORES.azulClaro));
    pdf.roundedRect(margin, y, contentWidth, 10, 1, 1, "F");

    if (atingido) {
      pdf.setFillColor(...CORES.verde);
      pdf.rect(margin, y, 1.5, 10, "F");
    }

    pdf.setTextColor(
      ...(atingido ? CORES.verdeTexto : CORES.cinzaTexto)
    );
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Patamar ${i + 1}`, margin + 5, y + 6);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(`${p.instalacoes} instalacoes`, margin + 30, y + 6);
    pdf.text(`€ ${p.bonus}`, pageWidth - margin - 5, y + 6, {
      align: "right",
    });

    if (atingido) {
      pdf.setTextColor(...CORES.verde);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("OK", margin + 80, y + 6);
    }

    y += 12;
  });

  // Info proximo patamar
  if (resumo.proximoPatamar) {
    y += 2;
    pdf.setFillColor(...CORES.ambarFundo);
    pdf.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
    pdf.setFillColor(...CORES.ambar);
    pdf.rect(margin, y, 1.5, 14, "F");

    pdf.setTextColor(...CORES.ambarTexto);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      `Faltam ${resumo.faltamProximo} instalacoes para o proximo patamar`,
      margin + 5,
      y + 6
    );
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(
      `Proximo bonus: € ${resumo.proximoPatamar.bonus}`,
      margin + 5,
      y + 11
    );
    y += 18;
  } else {
    y += 2;
    pdf.setFillColor(...CORES.verdeFundo);
    pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
    pdf.setTextColor(...CORES.verdeTexto);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Patamar maximo atingido!", margin + 5, y + 8);
    y += 16;
  }

  // ============ RANKING (nova pagina) ============
  pdf.addPage();
  y = 20;

  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("RANKING DA EQUIPA", margin, y);

  pdf.setDrawColor(...CORES.ambar);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y + 2, margin + 30, y + 2);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...CORES.cinzaTexto);
  pdf.text(
    `Apenas tecnicos com >= ${MIN_DIAS_PRODUTIVO} dias contam para o bonus`,
    margin,
    y + 7
  );

  y = y + 12;

  autoTable(pdf, {
    startY: y,
    head: [["#", "Tecnico", "Dias", "Instalacoes", "Status"]],
    body: resumo.rankingInterno.map((t, i) => [
      String(i + 1),
      t.nome,
      String(t.dias),
      String(t.instalacoes),
      t.produtivo
        ? "Produtivo"
        : `Nao conta (<${MIN_DIAS_PRODUTIVO} dias)`,
    ]),
    theme: "striped",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: CORES.azulEscuro,
    },
    headStyles: {
      fillColor: CORES.azulEscuro,
      textColor: CORES.branco,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: CORES.azulClaro,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 65, fontStyle: "bold" },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "center", cellWidth: 30 },
      4: { halign: "center", cellWidth: 55 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const text = String(data.cell.raw);
        if (text === "Produtivo") {
          data.cell.styles.textColor = CORES.verdeTexto;
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = CORES.vermelho;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // ============ RODAPE ============
  const totalPaginas = pdf.getNumberOfPages();
  const dataGeracao = new Date().toLocaleDateString("pt-PT");

  for (let i = 1; i <= totalPaginas; i++) {
    pdf.setPage(i);

    pdf.setDrawColor(...CORES.cinzaClaro);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    pdf.setFontSize(7);
    pdf.setTextColor(...CORES.cinzaTexto);
    pdf.setFont("helvetica", "normal");

    pdf.text(
      `DIGI Performance  |  Supervisor: ${nomeSupervisor}  |  ${dataGeracao}`,
      margin,
      pageHeight - 10
    );

    pdf.text(
      `Pagina ${i} de ${totalPaginas}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" }
    );
  }

  pdf.save(`Relatorio_Supervisor_${nomeSupervisor.replace(/ /g, "_")}.pdf`);
}
