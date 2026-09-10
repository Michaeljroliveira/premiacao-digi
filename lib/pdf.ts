import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DiaTecnico, classificarPerfil } from "@/lib/rewards";

const PREMIO_META = 35;
const META_DIARIA = 4;

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

// Remove emojis que o jsPDF nao suporta
function limparTexto(texto: string): string {
  return texto
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{1F000}-\u{1F2FF}]/gu, "")
    .trim();
}

// Quebra texto em paragrafos (por \n\n) e depois em linhas
function dividirEmParagrafos(
  texto: string,
  pdf: jsPDF,
  larguraMaxima: number
): string[][] {
  const limpo = limparTexto(texto);
  const paragrafos = limpo.split(/\n\n+/);
  return paragrafos.map((p) => {
    const linhaUnica = p.replace(/\n/g, " ").trim();
    if (!linhaUnica) return [];
    return pdf.splitTextToSize(linhaUnica, larguraMaxima) as string[];
  });
}

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

  const nomeRaw = tecnico.split("@")[0].replace(/\./g, " ");
  const nome = nomeRaw
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

  let mesReferencia = "";
  if (historico.length > 0) {
    const meses = [
      "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    const [ano, mes] = historico[0].data.split("-");
    mesReferencia = `${meses[parseInt(mes) - 1]} ${ano}`;
  }

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
  pdf.text("Relatorio de Auditoria de Premiacao", margin, 23);

  pdf.setDrawColor(...CORES.ambar);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 27, margin + 40, 27);

  // ============ NOME DO TECNICO ============
  let y = 45;

  pdf.setTextColor(...CORES.cinzaTexto);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("TECNICO", margin, y - 5);

  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(nome, margin, y + 3);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...CORES.cinzaTexto);
  pdf.text(tecnico, margin, y + 9);

  pdf.setTextColor(...CORES.azulDIGI);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(mesReferencia.toUpperCase(), pageWidth - margin, y + 3, {
    align: "right",
  });

  // ============ RESUMO MENSAL ============
  y = 70;
  pdf.setDrawColor(...CORES.cinzaClaro);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageWidth - margin, y);

  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("RESUMO MENSAL", margin, y + 7);

  y = y + 14;

  const resumo = [
    { label: "Dias Trabalhados", valor: historico.length, cor: CORES.azulDIGI },
    { label: "Dias Premiados", valor: diasPremiados, cor: CORES.verde },
    { label: "Dias sem Premio", valor: diasSemPremio, cor: CORES.vermelho },
    { label: "Instalacoes", valor: totalInstalacoes, cor: CORES.azulDIGI },
  ];

  const boxWidth = (contentWidth - 9) / 4;
  resumo.forEach((item, i) => {
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
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(item.valor.toString(), x + boxWidth / 2, y + 16, {
      align: "center",
    });
  });

  // ============ PREMIO TOTAL ============
  y = y + 26;
  pdf.setFillColor(...CORES.verdeFundo);
  pdf.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");

  pdf.setTextColor(...CORES.verdeTexto);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("PREMIO TOTAL", margin + 5, y + 9);

  pdf.setFontSize(16);
  pdf.text(`€ ${totalPremio.toFixed(2)}`, pageWidth - margin - 5, y + 9, {
    align: "right",
  });

  // ============ POTENCIAL ADICIONAL ============
  y = y + 18;
  pdf.setFillColor(...CORES.ambarFundo);
  pdf.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");
  pdf.setFillColor(...CORES.ambar);
  pdf.rect(margin, y, 1.5, 16, "F");

  pdf.setTextColor(...CORES.ambarTexto);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("POTENCIAL ADICIONAL", margin + 5, y + 6);

  pdf.setFontSize(16);
  pdf.text(`€ ${potencialAdicional.toFixed(2)}`, margin + 5, y + 13);

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "Diferenca para a meta de 4 instalacoes/dia",
    pageWidth - margin - 5,
    y + 13,
    { align: "right" }
  );

  // ============ DISTRIBUICAO POR FAIXA ============
  y = y + 24;
  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("DISTRIBUICAO POR FAIXA", margin, y);

  y = y + 6;
  const faixas = [
    { label: "5+ inst.", valor: diasCom5mais, cor: CORES.ambar },
    { label: "4 inst.", valor: diasCom4, cor: CORES.verde },
    { label: "3 inst.", valor: diasCom3, cor: CORES.azulDIGI },
    { label: "0-2 inst.", valor: diasCom0a2, cor: CORES.vermelho },
  ];

  const faixaWidth = (contentWidth - 9) / 4;
  faixas.forEach((faixa, i) => {
    const x = margin + i * (faixaWidth + 3);
    pdf.setFillColor(...CORES.azulClaro);
    pdf.roundedRect(x, y, faixaWidth, 14, 1.5, 1.5, "F");
    pdf.setFillColor(...faixa.cor);
    pdf.rect(x, y, 1.5, 14, "F");

    pdf.setTextColor(...CORES.cinzaTexto);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(faixa.label, x + 4, y + 5);

    pdf.setTextColor(...faixa.cor);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(faixa.valor.toString(), x + 4, y + 12);
  });

  // ============ MENSAGEM MOTIVACIONAL + LEMA ============
  y = y + 22;
  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("MENSAGEM", margin, y);

  y = y + 5;

  // Preparar textos
  const tituloLimpo = limparTexto(perfil.titulo);
  const lemaLimpo = limparTexto(perfil.lema);

  // Processar mensagem em paragrafos
  pdf.setFontSize(8.5);
  const paragrafos = dividirEmParagrafos(
    perfil.mensagem,
    pdf,
    contentWidth - 12
  );

  // Calcular altura total do bloco
  const alturaLinha = 4;
  const espacoParagrafo = 3;
  const alturaTitulo = 6;
  let alturaParagrafos = 0;
  paragrafos.forEach((linhas) => {
    if (linhas.length > 0) {
      alturaParagrafos += linhas.length * alturaLinha + espacoParagrafo;
    }
  });

  const tituloLines = pdf.splitTextToSize(tituloLimpo, contentWidth - 12);
  const alturaTituloReal = tituloLines.length * 4.5;

  pdf.setFontSize(9);
  const lemaLines = pdf.splitTextToSize(lemaLimpo, contentWidth - 20);
  const alturaLema = lemaLines.length * 4.5 + 8;

  const alturaBloco =
    alturaTituloReal + alturaParagrafos + alturaLema + 14;

  // Bloco fundo claro
  pdf.setFillColor(...CORES.azulClaro);
  pdf.roundedRect(margin, y, contentWidth, alturaBloco, 2, 2, "F");

  pdf.setFillColor(...CORES.azulDIGI);
  pdf.rect(margin, y, 1.5, alturaBloco, "F");

  // Titulo
  pdf.setTextColor(...CORES.azulDIGI);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text(tituloLines, margin + 6, y + 6);

  // Paragrafos (cada um separado)
  let cursorY = y + 6 + alturaTituloReal + 2;
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");

  paragrafos.forEach((linhas) => {
    if (linhas.length === 0) {
      cursorY += espacoParagrafo;
      return;
    }
    pdf.text(linhas, margin + 6, cursorY);
    cursorY += linhas.length * alturaLinha + espacoParagrafo;
  });

  // Lema destacado
  const lemaY = cursorY + 2;
  pdf.setFillColor(...CORES.azulEscuro);
  pdf.roundedRect(
    margin + 4,
    lemaY - 4,
    contentWidth - 8,
    alturaLema,
    1.5,
    1.5,
    "F"
  );

  pdf.setTextColor(...CORES.branco);
  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "bolditalic");
  pdf.text(lemaLines, margin + 9, lemaY + 2);

  // ============ HISTORICO DIARIO (nova pagina) ============
  pdf.addPage();
  y = 20;

  pdf.setTextColor(...CORES.azulEscuro);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("HISTORICO DIARIO", margin, y);

  pdf.setDrawColor(...CORES.ambar);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y + 2, margin + 30, y + 2);

  y = y + 10;

  autoTable(pdf, {
    startY: y,
    head: [["Data", "Instalacoes", "Premio", "Situacao"]],
    body: historico.map((dia) => {
      let situacao = "Sem premio";
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
      `DIGI Performance  |  Gerado em ${dataGeracao}`,
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

  pdf.save(`Relatorio_${nome.replace(/ /g, "_")}.pdf`);
}
