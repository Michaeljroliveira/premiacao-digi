"use client";

import { useState } from "react";
import KpiCard from "./KpiCard";
import ModalIgnorados from "./ModalIgnorados";
import { WOIgnorada } from "@/lib/processamento";

interface DashboardKPIsProps {
  totalTecnicos: number;
  totalServicos: number;
  totalInstalacoes: number;
  totalIgnorados: number;
  premioTotal: number;
  potencialAdicional: number;
  diasTrabalhados: number;
  diasPremiados: number;
  ignorados?: WOIgnorada[];
}

export default function DashboardKPIs({
  totalTecnicos,
  totalServicos,
  totalInstalacoes,
  totalIgnorados,
  premioTotal,
  potencialAdicional,
  diasTrabalhados,
  diasPremiados,
  ignorados = [],
}: DashboardKPIsProps) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
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
          <KpiCard titulo="👷 Técnicos" valor={totalTecnicos} />

          <KpiCard titulo="📄 Serviços" valor={totalServicos} />

          <KpiCard titulo="✅ Instalações" valor={totalInstalacoes} />

          {/* Card Ignorados CLICÁVEL */}
          <div
            onClick={() => ignorados.length > 0 && setModalAberto(true)}
            className={
              ignorados.length > 0
                ? "cursor-pointer hover:scale-105 transition-transform"
                : ""
            }
          >
            <KpiCard
              titulo={`🚫 Ignorados${ignorados.length > 0 ? " (clique para ver)" : ""}`}
              valor={totalIgnorados}
              destaque="vermelho"
            />
          </div>

          <KpiCard
            titulo="💰 Prêmio Total (€)"
            valor={`€ ${premioTotal}`}
          />

          <KpiCard
            titulo="🎯 Potencial Adicional (€)"
            valor={`€ ${potencialAdicional}`}
            destaque="laranja"
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

      <ModalIgnorados
        aberto={modalAberto}
        ignorados={ignorados}
        onFechar={() => setModalAberto(false)}
      />
    </>
  );
}
