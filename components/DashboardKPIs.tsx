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

        {/* BOTÃO DE TESTE — super visível */}
        <div style={{ marginBottom: "20px", padding: "20px", background: "#fef3c7", borderRadius: "10px" }}>
          <button
            onClick={() => {
              alert(`IGNORADOS: ${ignorados.length}`);
              setModalAberto(true);
            }}
            style={{
              background: "#dc2626",
              color: "white",
              padding: "20px 40px",
              fontSize: "18px",
              fontWeight: "bold",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            🚫 CLIQUE AQUI PARA VER IGNORADOS ({ignorados.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard titulo="👷 Técnicos" valor={totalTecnicos} />
          <KpiCard titulo="📄 Serviços" valor={totalServicos} />
          <KpiCard titulo="✅ Instalações" valor={totalInstalacoes} />
          <KpiCard titulo="🚫 Ignorados" valor={totalIgnorados} />
          <KpiCard titulo="💰 Prêmio Total (€)" valor={`€ ${premioTotal}`} />
          <KpiCard
            titulo="🎯 Potencial Adicional (€)"
            valor={`€ ${potencialAdicional}`}
            destaque="laranja"
          />
          <KpiCard titulo="📅 Dias Trabalhados" valor={diasTrabalhados} />
          <KpiCard titulo="🏆 Dias Premiados" valor={diasPremiados} />
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
