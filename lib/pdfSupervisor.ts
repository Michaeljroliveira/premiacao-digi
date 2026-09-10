import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DiaTecnico } from "@/lib/rewards";
import { gerarResumoSupervisor } from "@/lib/supervisores";

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
  cinzaTexto: [108, 117, 125] as [number, number, number],
  cinzaClaro: [233, 236, 239] as [number, number, number],
  branco: [255, 255, 255] as [number, number, number],
};

function limparTexto(texto: string): string {
  return texto
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{1F000}-\u{1F2FF}]/gu, "")
    .trim();
}

export function exportarSupervisorPDF(
  nomeSupervisor: string,
  dias: DiaTecnico[]
) {
  const resumo = gerarResumoSupervisor(nomeSupervisor, dias);

  // Ranking interno dos técnicos
  const tecnicosMap = new Map<
    string,
    { instalacoes: number; dias: number; premio: number }
  >();

  for (const dia of dias) {
    if (!tecnicosMap.has(dia.tecnico)) {
      tecnicosMap.set(dia.tecnico, { instalacoes: 0, dias: 0, premio: 0 });
    }
    const t = tecnicosMap.get(dia.tecnico)!;
    t.instalacoes += dia.instalacoes;
    t.dias += 1;
    t.premio += dia.premio;
  }

  const ranking = Array.from(tecnicosMap.entries())
    .map(([email, dados]) => ({
      email,
      nome: email
        .split("@")[0]
        .replace(/\./g, " ")
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" "),
      ...dados,
      produtivo: dados.dias >= 12,
    }))
    .sort((a, b) => b.instalacoes - a.instalacoes);

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

  // ============ NOME DO SUPERVISOR ============
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

  // ============ RESUMO EM CARDS ============
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
    { label: "Tecnicos Produtivos", valor: resumo.tecnicosProdutivos, cor: CORES.azulDIGI },
    { label: "Instalacoes Totais", valor: resumo.instalacoesTotais, cor: CORES.verde },
    { label: "Patamar Atingido", valor: resumo.patamarAtingido, cor: CORES.ambar },
    { label: "Bonus Atual", valor: `€ ${resumo.bonus}`, cor: CORES.verde },
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
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(String(item.valor), x + boxWidth / 2, y + 16, {
      align: "center",
    });
  });

  // ============ PROGRESSO DOS PATAMARES ============
  y = y + 28;
  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("PROGRESSO DOS PATAMARES", margin, y);

  y = y + 8;
  resumo.patamares.forEach((p, i) => {
    const atingido = i < resumo.patamarAtingido;
    const atual = i === resumo.patamarAtingido - 1;

    // Linha do patamar
    pdf.setFillColor(
      ...(atingido ? CORES.verdeFundo : CORES.azulClaro)
    );
    pdf.roundedRect(margin, y, contentWidth, 10, 1, 1, "F");

    if (atingido) {
      pdf.setFillColor(...CORES.verde);
      pdf.rect(margin, y, 1.5, 10, "F");
    } else if (atual) {
      pdf.setFillColor(...CORES.ambar);
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

  // Info "falta X para próximo patamar"
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

  // ============ RANKING DA EQUIPA (nova pagina) ============
  pdf.addPage();
  y = 20;

  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("RANKING DA EQUIPA", margin, y);

  pdf.setDrawColor(...CORES.ambar);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y + 2, margin + 30, y + 2);

  y = y + 10;

  autoTable(pdf, {
    startY: y,
    head: [["#", "Tecnico", "Dias", "Instalacoes", "Premio", "Status"]],
    body: ranking.map((t, i) => [
      String(i + 1),
      t.nome,
      String(t.dias),
      String(t.instalacoes),
      `€ ${t.premio.toFixed(2)}`,
      t.produtivo ? "Produtivo" : "Nao produtivo",
    ]),
    theme: "striped",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: CORES.azulEscuro,
    },
    headStyles: {
      fillColor: CORES.azulEscuro,
      textColor: CORES.branco,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: CORES.azulClaro,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 60, fontStyle: "bold" },
      2: { halign: "center", cellWidth: 15 },
      3: { halign: "center", cellWidth: 25 },
      4: { halign: "right", cellWidth: 30, fontStyle: "bold" },
      5: { halign: "center", cellWidth: 30 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text === "Produtivo") {
          data.cell.styles.textColor = CORES.verdeTexto;
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = CORES.vermelho;
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
