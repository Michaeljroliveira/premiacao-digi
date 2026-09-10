interface Tecnico {
  tecnico: string;
  diasTrabalhados: number;
  diasComPremio: number;
  diasSemPremio: number;
  instalacoes: number;
  premioTotal: number;
  potencialAdicional: number;
}

interface Props {
  tecnicos: Tecnico[];
  onSelecionar: (tecnico: string) => void;
}

export default function TabelaTecnicos({
  tecnicos,
  onSelecionar,
}: Props) {
  const ranking = [...tecnicos].sort(
    (a, b) => b.premioTotal - a.premioTotal
  );

  return (
    <section className="mt-10">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b px-6 py-5">
          <h2 className="text-2xl font-bold">
            Ranking de Premiação
          </h2>
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
                <th className="p-4 text-center">Sem Prêmio</th>
                <th className="p-4 text-center">Instalações</th>
                <th className="p-4 text-center">Prêmio</th>
                <th className="p-4 text-center">Potencial</th>
              </tr>
            </thead>

            <tbody>
              {ranking.map((t, index) => (
                <tr
                  key={t.tecnico}
                  onClick={() => onSelecionar(t.tecnico)}
                  className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="text-center font-bold">
                    {index + 1}
                  </td>

                  <td className="p-4 font-semibold text-[#001EFF]">
                    {t.tecnico}
                  </td>

                  <td className="text-center">
                    {t.diasTrabalhados}
                  </td>

                  <td className="text-center font-bold text-green-600">
                    {t.diasComPremio}
                  </td>

                  <td className="text-center font-bold text-red-600">
                    {t.diasSemPremio}
                  </td>

                  <td className="text-center">
                    {t.instalacoes}
                  </td>

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
