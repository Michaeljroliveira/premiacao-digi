"use client";

import { WOIgnorada } from "@/lib/processamento";

interface Props {
  aberto: boolean;
  ignorados: WOIgnorada[];
  onFechar: () => void;
}

export default function ModalIgnorados({
  aberto,
  ignorados,
  onFechar,
}: Props) {
  if (!aberto) return null;

  // Agrupar por motivo
  const porMotivo = ignorados.reduce((acc, wo) => {
    if (!acc[wo.motivo]) acc[wo.motivo] = [];
    acc[wo.motivo].push(wo);
    return acc;
  }, {} as Record<string, WOIgnorada[]>);

  const motivosOrdenados = Object.entries(porMotivo).sort(
    (a, b) => b[1].length - a[1].length
  );

  function exportarCSV() {
    const header = "ID,Estado,Tipo,Tecnico,Data,Motivo\n";
    const linhas = ignorados
      .map(
        (wo) =>
          `"${wo.id}","${wo.estado}","${wo.tipo}","${wo.tecnico}","${wo.data}","${wo.motivo}"`
      )
      .join("\n");
    const csv = header + linhas;

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "wos_ignoradas.csv";
    link.click();
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onFechar}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Cabeçalho */}
          <div className="bg-red-600 text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                🚫 WOs Ignoradas ({ignorados.length})
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Ordens de serviço que não contam para prémio
              </p>
            </div>
            <button
              onClick={onFechar}
              className="text-3xl hover:opacity-80"
            >
              ×
            </button>
          </div>

          {/* Resumo por motivo */}
          <div className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {motivosOrdenados.map(([motivo, wos]) => (
                <div
                  key={motivo}
                  className="bg-white rounded-lg p-3 border-l-4 border-red-400"
                >
                  <p className="text-xs text-gray-500 truncate" title={motivo}>
                    {motivo}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {wos.length}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Botão exportar */}
          <div className="px-6 py-3 border-b flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Total: <b>{ignorados.length}</b> WOs ignoradas
            </p>
            <button
              onClick={exportarCSV}
              className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              📥 Exportar CSV
            </button>
          </div>

          {/* Tabela */}
          <div className="flex-1 overflow-y-auto p-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left text-xs font-bold">ID</th>
                  <th className="p-2 text-left text-xs font-bold">Estado</th>
                  <th className="p-2 text-left text-xs font-bold">Tipo</th>
                  <th className="p-2 text-left text-xs font-bold">Técnico</th>
                  <th className="p-2 text-left text-xs font-bold">Data</th>
                  <th className="p-2 text-left text-xs font-bold">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {ignorados.map((wo, i) => (
                  <tr
                    key={`${wo.id}-${i}`}
                    className="border-b hover:bg-red-50"
                  >
                    <td className="p-2 font-mono text-xs">{wo.id}</td>
                    <td className="p-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          wo.estado === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : wo.estado === "Failed Installation"
                            ? "bg-orange-100 text-orange-700"
                            : wo.estado === "Scheduled"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {wo.estado}
                      </span>
                    </td>
                    <td className="p-2 text-xs">{wo.tipo}</td>
                    <td className="p-2 text-xs text-gray-600 truncate max-w-[180px]">
                      {wo.tecnico}
                    </td>
                    <td className="p-2 text-xs text-gray-500">
                      {String(wo.data).slice(0, 16)}
                    </td>
                    <td className="p-2 text-xs text-red-700 font-semibold">
                      {wo.motivo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
