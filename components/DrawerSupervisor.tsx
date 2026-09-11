"use client";

import { exportarSupervisorPDF } from "@/lib/pdfSupervisor";
import { DiaTecnico } from "@/lib/rewards";
import { gerarResumoSupervisor } from "@/lib/supervisores";

interface Props {
  aberto: boolean;
  nome: string;
  dias: DiaTecnico[];
  onFechar: () => void;
}

export default function DrawerSupervisor({
  aberto,
  nome,
  dias,
  onFechar,
}: Props) {
  if (!aberto) return null;

  const resumo = gerarResumoSupervisor(nome, dias);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onFechar} />

      <aside className="fixed right-0 top-0 h-screen w-[620px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#001EFF] to-[#001AB0] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/70 text-xs tracking-widest">
                SUPERVISOR
              </p>
              <h2 className="text-2xl font-bold">👔 {nome}</h2>
              <p className="text-white/80 text-sm mt-1">
                {resumo.tabelaAplicada}
              </p>
            </div>
            <button onClick={onFechar} className="text-3xl">
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Cards consolidados */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-gray-500 text-sm">Técnicos Produtivos</p>
              <h2 className="text-3xl font-bold text-[#001EFF]">
                {resumo.tecnicosProdutivos}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                de {resumo.tecnicosTotais} na equipa
              </p>
            </div>
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-gray-500 text-sm">Instalações Válidas</p>
              <h2 className="text-3xl font-bold text-green-700">
                {resumo.instalacoesTotais}
              </h2>
              {resumo.instalacoesExcluidas > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ {resumo.instalacoesExcluidas} excluídas
                </p>
              )}
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-gray-500 text-sm">Patamar Atingido</p>
              <h2 className="text-3xl font-bold text-amber-600">
                {resumo.patamarAtingido}/3
              </h2>
            </div>
            <div className="rounded-xl bg-green-100 p-4">
              <p className="text-gray-500 text-sm">Bónus Atual</p>
              <h2 className="text-3xl font-bold text-green-800">
                € {resumo.bonus}
              </h2>
            </div>
          </div>

          {/* Aviso de exclusão */}
          {resumo.instalacoesExcluidas > 0 && (
            <div className="mt-4 rounded-lg bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-xs text-red-800">
                ⚠️ <b>{resumo.tecnicosTotais - resumo.tecnicosProdutivos} técnico(s)</b>{" "}
                com menos de 12 dias trabalhados foram excluídos do cálculo.
                As suas <b>{resumo.instalacoesExcluidas} instalações</b> não
                contam para o bónus.
              </p>
            </div>
          )}

          {/* Barra de progresso */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progresso até ao próximo patamar</span>
              <span>{resumo.progresso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#001EFF] to-green-500 h-3 rounded-full transition-all"
                style={{ width: `${resumo.progresso}%` }}
              />
            </div>
          </div>

          {/* Patamares */}
          <div className="mt-6 space-y-2">
            {resumo.patamares.map((p, i) => {
              const atingido = i < resumo.patamarAtingido;
              return (
                <div
                  key={i}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    atingido
                      ? "bg-green-50 border-l-4 border-green-500"
                      : "bg-gray-50 border-l-4 border-gray-300"
                  }`}
                >
                  <div>
                    <p
                      className={`font-bold text-sm ${
                        atingido ? "text-green-700" : "text-gray-500"
                      }`}
                    >
                      Patamar {i + 1}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.instalacoes} instalações
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        atingido ? "text-green-700" : "text-gray-400"
                      }`}
                    >
                      € {p.bonus}
                    </p>
                    {atingido && (
                      <p className="text-xs text-green-600">✓ Atingido</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info próximo patamar */}
          {resumo.proximoPatamar ? (
            <div className="mt-4 rounded-lg bg-amber-50 border-2 border-amber-400 p-4">
              <p className="text-amber-800 text-sm font-bold">
                🎯 Faltam {resumo.faltamProximo} instalações para o próximo
                patamar
              </p>
              <p className="text-amber-700 text-xs mt-1">
                Próximo bónus: € {resumo.proximoPatamar.bonus}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-green-50 border-2 border-green-500 p-4">
              <p className="text-green-800 text-sm font-bold">
                🏆 Patamar máximo atingido! Parabéns!
              </p>
            </div>
          )}

          {/* Botão PDF */}
          <button
            onClick={() => exportarSupervisorPDF(nome, dias)}
            className="mt-6 w-full bg-[#001EFF] hover:bg-blue-700 transition rounded-xl text-white font-bold py-4"
          >
            📄 Exportar Relatório Supervisor (PDF)
          </button>

          {/* Ranking interno */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">
              Ranking da Equipa ({resumo.rankingInterno.length} técnicos)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Só técnicos com ≥12 dias contam para o bónus
            </p>

            <div className="space-y-2">
              {resumo.rankingInterno.map((t, i) => (
                <div
                  key={t.email}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    t.produtivo
                      ? "bg-white border-gray-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-400 w-6">
                      {i + 1}
                    </span>
                    <div>
                      <p
                        className={`font-semibold text-sm ${
                          t.produtivo ? "text-[#001EFF]" : "text-red-700"
                        }`}
                      >
                        {t.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.dias} dias • {t.instalacoes} instalações
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      t.produtivo
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t.produtivo ? "✓ Produtivo" : "⚠️ Não conta"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
