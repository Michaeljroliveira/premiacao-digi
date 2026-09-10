import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DiaTecnico, classificarPerfil } from "@/lib/rewards";

const PREMIO_META = 35; // Meta: 4 instalações/dia = €35

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

  // Potencial Adicional = soma de (35 - premio) para dias abaixo da meta
  const potencialAdicional = historico.reduce((soma, d) => {
    if (d.premio < PREMIO_META) return soma + (PREMIO_META - d.premio);
    return soma;
  }, 0);

  // Classificar perfil do técnico
  const perfil = classificarPerfil(tecnico, dias);

  const pdf = new jsPDF();

  // ===== CABEÇALHO =====
  pdf.setFillColor(26, 26, 46);
  pdf.rect(0, 0, 210, 30, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text("DIGI PERFORMANCE", 14, 15);
  pdf.setFontSize(10);
  pdf.text("Relatório de Auditoria de Premiação", 14, 23);

  // ===== NOME DO TÉCNICO =====
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.text(tecnico, 14, 45);

  // ===== RESUMO =====
  pdf.setFontSize(11);
  pdf.text(`Dias Trabalhados: ${historico.length}`, 14, 58);
  pdf.text(`Dias Premiados: ${diasPremiados}`, 14, 65);
  pdf.text(`Dias sem Prémio: ${diasSemPremio}`, 14, 72);
  pdf.text(`Instalações: ${totalInstalacoes}`, 14, 79);
  pdf.text(`Prémio Total: € ${totalPremio.toFixed(2)}`, 14, 86);

  // ===== POTENCIAL ADICIONAL =====
  pdf.setFillColor(255, 249, 230);
  pdf.rect(14, 92, 182, 20, "F");
  pdf.setDrawColor(255, 193, 7);
  pdf.rect(14, 92, 182, 20, "S");

  pdf.setFontSize(10);
  pdf.setTextColor(133, 100, 4);
  pdf.text("🎯 POTENCIAL ADICIONAL", 18, 100);
  pdf.setFontSize(16);
  pdf.setTextColor(220, 53, 69);
  pdf.text(`€ ${potencialAdicional.toFixed(2)}`, 18, 108);

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `(Dias abaixo da meta de 4 instalações × €35 de referência)`,
    60,
    108
  );

  // ===== ANÁLISE DE DIAS =====
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.text(
    `Dias com 5+ instalações: ${diasCom5mais} | Dias com 4: ${diasCom4} | Dias com 3: ${diasCom3} | Dias com 0-2: ${diasSemPremio}`,
    14,
    122
  );

  // ===== MENSAGEM PERSONALIZADA =====
  const startY = 132;
  pdf.setFillColor(245, 247, 250);
  pdf.rect(14, startY, 182, 70, "F");
  pdf.setDrawColor(102, 126, 234);
  pdf.rect(14, startY, 182, 70, "S");

  pdf.setFontSize(11);
  pdf.setTextColor(26, 26, 46);
  pdf.text(perfil.titulo, 18, startY + 8);

  pdf.setFontSize(9);
  pdf.setTextColor(60, 60, 60);
  const linhas = pdf.splitTextToSize(perfil.mensagem, 174);
  pdf.text(linhas, 18, startY + 18);

  // ===== LEMA =====
  const lemaY = startY + 70 + 8;
  pdf.setFillColor(26, 26, 46);
  pdf.rect(14, lemaY, 182, 14, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  const lemaLinhas = pdf.splitTextToSize(perfil.lema, 174);
  pdf.text(lemaLinhas, 18, lemaY + 9);

  // ===== TABELA DETALHADA =====
  autoTable(pdf, {
    startY: lemaY + 22,
    head: [["Data", "Instalações", "Prémio", "Situação"]],
    body: historico.map((dia) => [
      dia.data,
      dia.instalacoes,
      `€ ${dia.premio.toFixed(2)}`,
      dia.recebeuPremio
        ? dia.instalacoes >= 5
          ? "🏆 Excelente"
          : "✅ Premiado"
        : "⚠️ Sem prémio",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [26, 26, 46] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // ===== RODAPÉ =====
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `DIGI Performance • ${new Date().toLocaleDateString("pt-PT")} • Página ${i}/${pages}`,
      14,
      290
    );
  }

  pdf.save(`Relatorio_${tecnico}.pdf`);
}
