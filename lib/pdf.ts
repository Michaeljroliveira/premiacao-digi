import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DiaTecnico, classificarPerfil } from "@/lib/rewards";

const PREMIO_META = 35;
const META_DIARIA = 4;

// Cores RGB da paleta
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

export function exportarTecnicoPDF(tecnico: string, dias: DiaTecnico[]) {
  const historico = dias
    .filter((d) => d.tecnico === tecnico)
    .sort((a, b) => a.data.localeCompare(b.data));

  const totalPremio = historico.reduce((s, d) => s + d.premio, 0);
  const totalInstalacoes = historico.reduce((s, d) => s + d.instalacoes, 0);
  const diasPremiados = historico.filter((d) => d.recebeuPremio).length;
  const diasSemPremio = historico.length - diasPremiados;

  const diasCom3 = historico.filter((d) => d.instalacoes === 3).length;
  const diasCom4 = historico.filter((d) => d.instalacoes === 4).length;
  const diasCom5mais = historico.filter((d) => d.instalacoes >= 5).length;
  const diasCom0a2 = historico.filter((d) => d.instalacoes <= 2).length;

  const potencialAdicional = historico.reduce((soma, d) => {
    if (d.premio < PREMIO_META) return soma + (PREMIO_META - d.premio);
    return soma;
  }, 0);

  const perfil = classificarPerfil(tecnico, dias);

  // Nome limpo (parte antes do @, primeira letra maiúscula)
  const nomeRaw = tecnico.split("@")[0].replace(/\./g, " ");
  const nome = nomeRaw
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

  // Mês de referência (extraído da primeira data)
  let mesReferencia = "";
  if (historico.length > 0) {
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    const [ano, mes] = historico[0].data.split("-");
    mesReferencia = `${meses[parseInt(mes) - 1]} ${ano}`;
  }

  const pdf = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // ============ CABEÇALHO ============
  pdf.setFillColor(...CORES.azulEscuro);
  pdf.rect(0, 0, pageWidth, 32, "F");

  pdf.setTextColor(...CORES.branco);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("DIGI PERFORMANCE", margin, 15);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Relatório de Auditoria de Premiação", margin, 23);

  // Linha decorativa
  pdf.setDrawColor(...CORES.ambar);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 27, margin + 40, 27);

  // ============ NOME DO TÉCNICO ============
  let y = 45;
  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("TÉCNICO", margin, y - 5);

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(nome, margin, y + 3);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...CORES.cinzaTexto);
  pdf.text(tecnico, margin, y + 9);

  pdf.setTextColor(...CORES.azulDIGI);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(mesReferencia.toUpperCase(), pageWidth - margin, y + 3, {
    align: "right",
  });

  // ============ RESUMO ============
  y = 70;
  pdf.setDrawColor(...CORES.cinzaClaro);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageWidth - margin, y);

  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("RESUMO MENSAL", margin, y + 8);

  y = y + 18;
  const resumoItems = [
    ["Dias Trabalhados", historico.length.toString()],
    ["Dias Premiados", diasPremiados.toString()],
    ["Dias sem Prémio", diasSemPremio.toString()],
    ["Instalações Totais", totalInstalacoes.toString()],
  ];

  pdf.setFontSize(10);
  const colWidth = contentWidth / 2;

  resumoItems.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * colWidth;
    const yItem = y + row * 8;

    pdf.setTextColor(...CORES.cinzaTexto);
    pdf.setFont("helvetica", "normal");
    pdf.text(item[0], x, yItem);

    pdf.setTextColor(...CORES.azulEscuro);
    pdf.setFont("helvetica", "bold");
    pdf.text(item[1], x + colWidth - 30, yItem);
  });

  // Prémio Total (destaque)
  y = y + 20;
  pdf.setFillColor(...CORES.verdeFundo);
  pdf.roundedRect(margin, y - 5, contentWidth, 14, 2, 2, "F");

  pdf.setTextColor(...CORES.verdeTexto);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("PRÉMIO TOTAL", margin + 4, y + 3);

  pdf.setFontSize(16);
  pdf.text(`€ ${totalPremio.toFixed(2)}`, pageWidth - margin - 4, y + 3, {
    align: "right",
  });

  // ============ POTENCIAL ADICIONAL ============
  y = y + 22;
  pdf.setFillColor(...CORES.ambarFundo);
  pdf.roundedRect(margin, y - 5, contentWidth, 18, 2, 2, "F");

  pdf.setDrawColor(...CORES.ambar);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y - 5, margin, y + 13);

  pdf.setTextColor(...CORES.ambarTexto);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("POTENCIAL ADICIONAL", margin + 4, y + 1);

  pdf.setFontSize(18);
  pdf.text(`€ ${potencialAdicional.toFixed(2)}`, margin + 4, y + 10);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "Diferença para a meta de 4 instalações/dia",
    pageWidth - margin - 4,
    y + 10,
    { align: "right" }
  );

  // ============ DISTRIBUIÇÃO POR FAIXA ============
  y = y + 28;
  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("DISTRIBUIÇÃO POR FAIXA", margin, y);

  y = y + 6;
  const faixas = [
    { label: "5+ instalações", valor: diasCom5mais, cor: CORES.ambar },
    { label: "4 instalações", valor: diasCom4, cor: CORES.verde },
    { label: "3 instalações", valor: diasCom3, cor: CORES.azulDIGI },
    { label: "0-2 instalações", valor: diasCom0a2, cor: CORES.vermelho },
  ];

  const faixaWidth = contentWidth / 4;
  faixas.forEach((faixa, i) => {
    const x = margin + i * faixaWidth;

    pdf.setFillColor(...CORES.azulClaro);
    pdf.roundedRect(x + 1, y, faixaWidth - 2, 16, 1.5, 1.5, "F");

    pdf.setFillColor(...faixa.cor);
    pdf.rect(x + 1, y, 1.5, 16, "F");

    pdf.setTextColor(...CORES.cinzaTexto);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(faixa.label, x + 4, y + 6);

    pdf.setTextColor(...faixa.cor);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(faixa.valor.toString(), x + 4, y + 13);
  });

  // ============ MENSAGEM MOTIVACIONAL ============
  y = y + 26;
  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("MENSAGEM", margin, y);

  y = y + 6;
  pdf.setFillColor(...CORES.azulClaro);
  const mensagemLines = pdf.splitTextToSize(perfil.mensagem, contentWidth - 12);
  const mensagemHeight = mensagemLines.length * 4.5 + 22;

  pdf.roundedRect(margin, y, contentWidth, mensagemHeight, 2, 2, "F");

  pdf.setFillColor(...CORES.azulDIGI);
  pdf.rect(margin, y, 1.5, mensagemHeight, "F");

  pdf.setTextColor(...CORES.azulDIGI);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  const tituloLimpo = perfil.titulo.replace(/[^\x00-\x7F]/g, "").trim();
  const tituloLines = pdf.splitTextToSize(tituloLimpo, contentWidth - 12);
  pdf.text(tituloLines, margin + 5, y + 6);

  const offsetTitulo = tituloLines.length * 5;
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  pdf.text(mensagemLines, margin + 5, y + 6 + offsetTitulo + 4);

  // Lema
  y = y + mensagemHeight + 4;
  const lemaLimpo = perfil.lema.replace(/[^\x00-\x7F]/g, "").trim();
  const lemaLines = pdf.splitTextToSize(lemaLimpo, contentWidth - 12);

  pdf.setFillColor(...CORES.azulEscuro);
  pdf.roundedRect(margin, y, contentWidth, lemaLines.length * 5 + 8, 2, 2, "F");

  pdf.setTextColor(...CORES.branco);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bolditalic");
  pdf.text(lemaLines, margin + 6, y + 6);

  // ============ HISTÓRICO DIÁRIO ============
  pdf.addPage();
  y = 20;

  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("HISTÓRICO DIÁRIO", margin, y);

  pdf.setDrawColor(...CORES.ambar);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y + 2, margin + 30, y + 2);

  y = y + 8;

  // Tabela com autoTable
  autoTable(pdf, {
    startY: y,
    head: [["Data", "Instalações", "Prémio", "Situação"]],
    body: historico.map((dia) => {
      let situacao = "Sem prémio";
      if (dia.instalacoes >= 5) situacao = "Excelente";
      else if (dia.instalacoes === 4) situacao = "Meta plena";
      else if (dia.instalacoes === 3) situacao = "Premiado";

      return [
        dia.data,
        dia.instalacoes.toString(),
        `€ ${dia.premio.toFixed(2)}`,
        situacao,
      ];
    }),
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
      0: { cellWidth: 35, fontStyle: "bold" },
      1: { halign: "center", cellWidth: 35 },
      2: { halign: "right", cellWidth: 40, fontStyle: "bold" },
      3: { halign: "center", cellWidth: 60 },
    },
    didParseCell: (data) => {
      // Colorir a coluna "Situação"
      if (data.section === "body" && data.column.index === 3) {
        const text = String(data.cell.raw);
        if (text === "Excelente") {
          data.cell.styles.textColor = CORES.ambarTexto;
          data.cell.styles.fontStyle = "bold";
        } else if (text === "Meta plena") {
          data.cell.styles.textColor = CORES.verdeTexto;
          data.cell.styles.fontStyle = "bold";
        } else if (text === "Premiado") {
          data.cell.styles.textColor = CORES.azulDIGI;
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = CORES.vermelhoTexto;
        }
      }
      // Colorir a coluna "Prémio"
      if (data.section === "body" && data.column.index === 2) {
        const premio = parseFloat(String(data.cell.raw).replace("€ ", ""));
        if (premio >= PREMIO_META) {
          data.cell.styles.textColor = CORES.verdeTexto;
        } else if (premio > 0) {
          data.cell.styles.textColor = CORES.ambarTexto;
        } else {
          data.cell.styles.textColor = CORES.vermelhoTexto;
        }
      }
    },
  });

  // ============ RODAPÉ em todas as páginas ============
  const totalPaginas = pdf.getNumberOfPages();
  const dataGeracao = new Date().toLocaleDateString("pt-PT");

  for (let i = 1; i <= totalPaginas; i++) {
    pdf.setPage(i);

    // Linha do rodapé
    pdf.setDrawColor(...CORES.cinzaClaro);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    pdf.setFontSize(7);
    pdf.setTextColor(...CORES.cinzaTexto);
    pdf.setFont("helvetica", "normal");

    pdf.text(
      `DIGI Performance • Gerado em ${dataGeracao}`,
      margin,
      pageHeight - 10
    );

    pdf.text(
      `Página ${i} de ${totalPaginas}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" }
    );
  }

  pdf.save(`Relatorio_${nome.replace(/ /g, "_")}.pdf`);
}
