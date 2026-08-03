type Props = {
  titulo: string;
  valor: string | number;
};

export default function KpiCard({ titulo, valor }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">

      <p className="text-gray-500 text-sm">
        {titulo}
      </p>

      <h2 className="text-4xl font-bold mt-4 text-[#001EFF]">
        {valor}
      </h2>

    </div>
  );
}