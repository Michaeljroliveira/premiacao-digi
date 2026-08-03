"use client";

import { exportarTecnicoPDF } from "@/lib/pdf";
import { DiaTecnico } from "@/lib/rewards";

interface Props {
  aberto: boolean;
  tecnico: string | null;
  dias: DiaTecnico[];
  onFechar: () => void;
}

export default function DetalheTecnico({
  aberto,
  tecnico,
  dias,
  onFechar,
}: Props) {
  if (!aberto || !tecnico) return null;

  const historico = dias
    .filter((d) => d.tecnico === tecnico)
    .sort((a, b) => a.data.localeCompare(b.data));

  const totalPremio = historico.reduce(
    (total, dia) => total + dia.premio,
    0
  );

  const totalInstalacoes = historico.reduce(
    (total, dia) => total + dia.instalacoes,
    0
  );

  const diasPremiados = historico.filter(
    (d) => d.recebeuPremio
  ).length;

  const diasSemPremio = historico.length - diasPremiados;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onFechar}
      />

      <aside className="fixed right-0 top-0 h-screen w-[560px] bg-white shadow-2xl z-50 overflow-y-auto">

        <div className="bg-[#001EFF] text-white p-6">

          <div className="flex justify-between items-center">

            <div>

              <h2 className="text-2xl font-bold">
                {tecnico}
              </h2>

              <p className="text-white/80">
                Auditoria de Premiação
              </p>

            </div>

            <button
              onClick={onFechar}
              className="text-3xl"
            >
              ×
            </button>

          </div>

        </div>

        <div className="p-6">

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-xl bg-blue-50 p-4">

              <p className="text-gray-500 text-sm">

                Dias Trabalhados

              </p>

              <h2 className="text-3xl font-bold">

                {historico.length}

              </h2>

            </div>

            <div className="rounded-xl bg-green-50 p-4">

              <p className="text-gray-500 text-sm">

                Prêmio Total

              </p>

              <h2 className="text-3xl font-bold text-green-700">

                € {totalPremio.toFixed(2)}

              </h2>

            </div>

            <div className="rounded-xl bg-indigo-50 p-4">

              <p className="text-gray-500 text-sm">

                Instalações

              </p>

              <h2 className="text-3xl font-bold">

                {totalInstalacoes}

              </h2>

            </div>

            <div className="rounded-xl bg-yellow-50 p-4">

              <p className="text-gray-500 text-sm">

                Dias Premiados

              </p>

              <h2 className="text-3xl font-bold">

                {diasPremiados}

              </h2>

            </div>

          </div>

          <button
            onClick={() =>
              exportarTecnicoPDF(tecnico, dias)
            }
            className="mt-6 w-full bg-[#001EFF] hover:bg-blue-700 transition rounded-xl text-white font-bold py-4"
          >
            📄 Exportar Relatório PDF
          </button>

          <div className="mt-8">

            <h3 className="text-xl font-bold mb-4">

              Histórico Diário

            </h3>

            <div className="space-y-4">

              {historico.map((dia) => (

                <div
                  key={dia.data}
                  className="border rounded-xl p-4 shadow-sm"
                >

                  <div className="flex justify-between">

                    <strong>

                      {dia.data}

                    </strong>

                    <strong
                      className={
                        dia.premio > 0
                          ? "text-green-700"
                          : "text-red-600"
                      }
                    >

                      € {dia.premio.toFixed(2)}

                    </strong>

                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">

                    <div>

                      <p className="text-sm text-gray-500">

                        Instalações

                      </p>

                      <strong>

                        {dia.instalacoes}

                      </strong>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Situação

                      </p>

                      <strong
                        className={
                          dia.recebeuPremio
                            ? "text-green-700"
                            : "text-red-600"
                        }
                      >

                        {dia.recebeuPremio
                          ? "Premiado"
                          : "Sem Prêmio"}

                      </strong>

                    </div>

                  </div>

                  {!dia.recebeuPremio && (

                    <div className="mt-3 text-sm text-red-600">

                      Faltaram{" "}

                      <strong>

                        {dia.faltaramInstalacoes}

                      </strong>

                      {" "}instalação(ões) para receber premiação.

                    </div>

                  )}

                </div>

              ))}

            </div>

          </div>

          <div className="mt-10 border-t pt-6">

            <div className="flex justify-between">

              <strong>

                Dias sem prêmio

              </strong>

              <strong>

                {diasSemPremio}

              </strong>

            </div>

            <div className="flex justify-between mt-2">

              <strong>

                Total recebido

              </strong>

              <strong className="text-green-700">

                € {totalPremio.toFixed(2)}

              </strong>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
}