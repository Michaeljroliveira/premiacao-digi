interface Tecnico {
  tecnico: string;
  diasTrabalhados: number;
  diasComPremio: number;
  diasSemPremio: number;
  instalacoes: number;
  premioTotal: number;
  potencialAdicional: number;
  isSupervisor?: boolean;
  bonusSupervisor?: number;
}

interface Props {
  tecnicos: Tecnico[];
  onSelecionar: (tecnico: string, isSupervisor: boolean) => void;
}

export default function TabelaTecnicos({
  tecnicos,
  onSelecionar,
}: Props) {
  // Separar supervisor dos técnicos
  const supervisor = tecnicos.find((t) => t.isSupervisor);
  const tecnicosNormais = tecnicos.filter((t) => !t.isSupervisor);

  const ranking = [...tecnicosNormais].sort(
    (a, b) => b.premioTotal - a.premioTotal
  );

  return (
    <section className="mt-10">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b px-6 py-5">
          <h2 className="text-2xl font-bold">Ranking de Premiação</h2>
          <p className="text-gray-500 mt-1">
            Clique sobre um técnico para visualizar os detalhes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#001EFF] text-white">
              <tr>
                <th className="p-4 text-center">#</th>
                <th className="p-4 text-left">Técnico</th>
                <th className="p-4 text-center">Dias</th>
                <th className="p-4 text-center">Premiados</th>
                <th className="p-4 text-center">Sem Prémio</th>
                <th className="p-4 text-center">Instalações</th>
                <th className="p-4 text-center">Prémio</th>
                <th className="p-4 text-center">Potencial</th>
              </tr>
            </thead>

            <tbody>
              {/* Linha do SUPERVISOR no topo */}
              {supervisor && (
                <tr
                  onClick={() => onSelecionar(supervisor.tecnico, true)}
                  className="border-b bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 cursor-pointer transition-colors border-t-4 border-amber-400"
                >
                  <td className="text-center text-2xl">👔</td>
                  <td className="p-4 font-bold text-amber-700">
                    SUPERVISOR
                  </td>
                  <td className="text-center font-bold">
                    {supervisor.diasTrabalhados}
                  </td>
                  <td className="text-center font-bold text-green-600">
                    {supervisor.diasComPremio}
                  </td>
                  <td className="text-center font-bold text-red-600">
                    {supervisor.diasSemPremio}
                  </td>
                  <td className="text-center font-bold">
                    {supervisor.instalacoes}
                  </td>
                  <td className="text-center font-bold text-amber-700 text-lg">
                    € {supervisor.bonusSupervisor ?? 0}
                  </td>
                  <td className="text-center text-xs text-amber-700 font-semibold">
                    Bónus Supervisão
                  </td>
                </tr>
              )}

              {/* Linhas dos técnicos */}
              {ranking.map((t, index) => (
                <tr
                  key={t.tecnico}
                  onClick={() => onSelecionar(t.tecnico, false)}
                  className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="text-center font-bold">{index + 1}</td>
                  <td className="p-4 font-semibold text-[#001EFF]">
                    {t.tecnico}
                  </td>
                  <td className="text-center">{t.diasTrabalhados}</td>
                  <td className="text-center font-bold text-green-600">
                    {t.diasComPremio}
                  </td>
                  <td className="text-center font-bold text-red-600">
                    {t.diasSemPremio}
                  </td>
                  <td className="text-center">{t.instalacoes}</td>
                  <td className="text-center font-bold text-green-700">
                    € {t.premioTotal.toFixed(2)}
                  </td>
                  <td className="text-center font-bold text-amber-600">
                    € {t.potencialAdicional.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
