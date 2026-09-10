"use client";

import { exportarTecnicoPDF } from "@/lib/pdf";
import { DiaTecnico, classificarPerfil } from "@/lib/rewards";
import DrawerSupervisor from "./DrawerSupervisor";

interface Props {
  aberto: boolean;
  tecnico: string | null;
  dias: DiaTecnico[];
  telefoneWhatsApp?: string;
  isSupervisor?: boolean;
  onFechar: () => void;
}

const PREMIO_META = 35;

export default function DetalheTecnico({
  aberto,
  tecnico,
  dias,
  telefoneWhatsApp,
  isSupervisor,
  onFechar,
}: Props) {
  // Se é supervisor, delega para o DrawerSupervisor
  if (isSupervisor && aberto && tecnico) {
    return (
      <DrawerSupervisor
        aberto={aberto}
        nome={tecnico}
        dias={dias}
        onFechar={onFechar}
      />
    );
  }

  if (!aberto || !tecnico) return null;

  const historico = dias
    .filter((d) => d.tecnico === tecnico)
    .sort((a, b) => a.data.localeCompare(b.data));

  const totalPremio = historico.reduce((s, d) => s + d.premio, 0);
  const totalInstalacoes = historico.reduce((s, d) => s + d.instalacoes, 0);
  const diasPremiados = historico.filter((d) => d.recebeuPremio).length;
  const diasSemPremio = historico.length - diasPremiados;

  const potencialAdicional = historico.reduce((soma, d) => {
    if (d.premio < PREMIO_META) return soma + (PREMIO_META - d.premio);
    return soma;
  }, 0);

  const perfil = classificarPerfil(tecnico, dias);

  const diasCom5mais = historico.filter((d) => d.instalacoes >= 5).length;
  const diasCom4 = historico.filter((d) => d.instalacoes === 4).length;
  const diasCom3 = historico.filter((d) => d.instalacoes === 3).length;

  function enviarWhatsApp() {
    if (!telefoneWhatsApp) {
      alert("Número de WhatsApp não encontrado.");
      return;
    }
    const nome = tecnico!.split("@")[0].split(".")[0];
    const nomeCapital = nome.charAt(0).toUpperCase() + nome.slice(1);
    const mensagem =
      `Olá ${nomeCapital}! 👋\n\n` +
      `O teu relatório de premiação mensal já está disponível.\n\n` +
      `📊 *Resumo:*\n` +
      `• Prémio Total: € ${totalPremio.toFixed(2)}\n` +
      `• Instalações: ${totalInstalacoes}\n` +
      `• Dias Premiados: ${diasPremiados}\n\n` +
      `Continua assim 💪`;
    const telefoneLimpo = telefoneWhatsApp.replace(/\D/g, "");
    window.open(
      `https://wa.me/${telefoneLimpo}?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onFechar} />
      <aside className="fixed right-0 top-0 h-screen w-[560px] bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="bg-[#001EFF] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{tecnico}</h2>
              <p className="text-white/80">Auditoria de Premiação</p>
            </div>
            <button onClick={onFechar} className="text-3xl">
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-gray-500 text-sm">Dias Trabalhados</p>
              <h2 className="text-3xl font-bold">{historico.length}</h2>
            </div>
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-gray-500 text-sm">Prémio Total</p>
              <h2 className="text-3xl font-bold text-green-700">
                € {totalPremio.toFixed(2)}
              </h2>
            </div>
            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-gray-500 text-sm">Instalações</p>
              <h2 className="text-3xl font-bold">{totalInstalacoes}</h2>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-gray-500 text-sm">Dias Premiados</p>
              <h2 className="text-3xl font-bold">{diasPremiados}</h2>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-amber-50 border-2 border-amber-400 p-5">
            <p className="text-amber-700 text-sm font-semibold">
              🎯 Potencial Adicional
            </p>
            <h2 className="text-4xl font-bold text-amber-600 mt-2">
              € {potencialAdicional.toFixed(2)}
            </h2>
          </div>

          <div
            className="mt-4 rounded-xl p-5"
            style={{
              background: `${perfil.cor}15`,
              borderLeft: `4px solid ${perfil.cor}`,
            }}
          >
            <p
              className="font-bold text-sm mb-2"
              style={{ color: perfil.cor }}
            >
              {perfil.titulo}
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {perfil.mensagem}
            </p>
            <p
              className="text-sm font-bold mt-3 italic"
              style={{ color: perfil.cor }}
            >
              {perfil.lema}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-yellow-100 p-3 text-center">
              <p className="text-xs text-yellow-800">5+ inst.</p>
              <p className="text-2xl font-bold text-yellow-700">
                {diasCom5mais}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3 text-center">
              <p className="text-xs text-green-800">4 inst.</p>
              <p className="text-2xl font-bold text-green-700">{diasCom4}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 text-center">
              <p className="text-xs text-blue-800">3 inst.</p>
              <p className="text-2xl font-bold text-blue-700">{diasCom3}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => exportarTecnicoPDF(tecnico, dias)}
              className="w-full bg-[#001EFF] hover:bg-blue-700 transition rounded-xl text-white font-bold py-4"
            >
              📄 Exportar PDF
            </button>
            <button
              onClick={enviarWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 transition rounded-xl text-white font-bold py-4"
            >
              💬 WhatsApp
            </button>
          </div>

          {telefoneWhatsApp && (
            <p className="text-xs text-gray-500 text-center mt-2">
              WhatsApp: {telefoneWhatsApp}
            </p>
          )}

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Histórico Diário</h3>
            <div className="space-y-4">
              {historico.map((dia) => {
                const potencialDia =
                  dia.premio < PREMIO_META ? PREMIO_META - dia.premio : 0;
                return (
                  <div
                    key={dia.data}
                    className="border rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <strong>{dia.data}</strong>
                      <strong
                        className={
                          dia.premio >= PREMIO_META
                            ? "text-green-700"
                            : dia.premio > 0
                            ? "text-amber-600"
                            : "text-red-600"
                        }
                      >
                        € {dia.premio.toFixed(2)}
                      </strong>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500">Instalações</p>
                        <strong>{dia.instalacoes}</strong>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Situação</p>
                        <strong>
                          {dia.premio >= PREMIO_META
                            ? "🏆 Meta plena"
                            : dia.premio > 0
                            ? "✅ Premiado"
                            : "⚠️ Sem prémio"}
                        </strong>
                      </div>
                    </div>
                    {potencialDia > 0 && (
                      <div className="mt-3 text-sm text-amber-700 bg-amber-50 rounded-lg p-2">
                        💡 Potencial:{" "}
                        <strong>€ {potencialDia.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 border-t pt-6">
            <div className="flex justify-between">
              <strong>Dias sem prémio</strong>
              <strong>{diasSemPremio}</strong>
            </div>
            <div className="flex justify-between mt-2">
              <strong>Total recebido</strong>
              <strong className="text-green-700">
                € {totalPremio.toFixed(2)}
              </strong>
            </div>
            <div className="flex justify-between mt-2">
              <strong>Potencial Adicional</strong>
              <strong className="text-amber-600">
                € {potencialAdicional.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
