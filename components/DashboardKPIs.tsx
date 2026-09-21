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

  function abrirModal() {
    console.log("Click no card ignorados! Total:", ignorados.length);
    if (ignorados.length > 0) {
      setModalAberto(true);
    } else {
      alert("Nenhuma WO ignorada nesta planilha.");
    }
  }

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

          {/* Card Ignorados - BOTÃO DIRETO */}
          <button
            type="button"
            onClick={abrirModal}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "left",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(220,38,38,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px -1px rgba(0,0,0,0.1)";
            }}
          >
            <p
              style={{
                color: "#6b7280",
                fontSize: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>🚫 Ignorados</span>
              <span
                style={{
                  fontSize: "10px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                }}
              >
                VER DETALHES →
              </span>
            </p>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                marginTop: "16px",
                color: "#dc2626",
              }}
            >
              {totalIgnorados}
            </h2>
          </button>

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
