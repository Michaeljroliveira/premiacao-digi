type Props = {
  titulo: string;
  valor: string | number;
  destaque?: "laranja" | "verde" | "vermelho" | "azul";
};

export default function KpiCard({ titulo, valor, destaque }: Props) {
  const cores: Record<string, string> = {
    laranja: "text-amber-500",
    verde: "text-green-600",
    vermelho: "text-red-600",
    azul: "text-[#001EFF]",
  };

  const corValor = destaque ? cores[destaque] : cores.azul;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <p className="text-gray-500 text-sm">{titulo}</p>
      <h2 className={`text-4xl font-bold mt-4 ${corValor}`}>
        {valor}
      </h2>
    </div>
  );
}
