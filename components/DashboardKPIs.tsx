import KpiCard from "./KpiCard";

interface DashboardKPIsProps {
  totalTecnicos: number;
  totalServicos: number;
  totalInstalacoes: number;
  totalIgnorados: number;
  premioTotal: number;
  valorPerdido: number;
  diasTrabalhados: number;
  diasPremiados: number;
}

export default function DashboardKPIs({
  totalTecnicos,
  totalServicos,
  totalInstalacoes,
  totalIgnorados,
  premioTotal,
  valorPerdido,
  diasTrabalhados,
  diasPremiados,
}: DashboardKPIsProps) {
  return (
    <section className="mt-8">

      <div className="mb-4">

        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard Geral
        </h2>

        <p className="text-gray-500">
          Resumo da produtividade da planilha importada.
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <KpiCard
          titulo="👷 Técnicos"
          valor={totalTecnicos}
        />

        <KpiCard
          titulo="📄 Serviços"
          valor={totalServicos}
        />

        <KpiCard
          titulo="✅ Instalações"
          valor={totalInstalacoes}
        />

        <KpiCard
          titulo="🚫 Ignorados"
          valor={totalIgnorados}
        />

        <KpiCard
          titulo="💰 Prêmio Total (€)"
          valor={`€ ${premioTotal}`}
        />

        <KpiCard
          titulo="📉 Valor Perdido (€)"
          valor={`€ ${valorPerdido}`}
        />

        <KpiCard
          titulo="📅 Dias Trabalhados"
          valor={diasTrabalhados}
        />

        <KpiCard
          titulo="🏆 Dias Premiados"
          valor={diasPremiados}
        />

      </div>

    </section>
  );
}