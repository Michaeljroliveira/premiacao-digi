"use client";

import { useState } from "react";

import Header from "@/components/Header";
import UploadArea from "@/components/UploadArea";
import DashboardKPIs from "@/components/DashboardKPIs";
import TabelaTecnicos from "@/components/TabelaTecnicos";
import DetalheTecnico from "@/components/DetalheTecnico";

import { lerPlanilha } from "@/lib/excel";
import { validarPlanilha } from "@/lib/validacao";
import { processarDados } from "@/lib/processamento";

import {
  gerarResumoTecnicos,
  calcularEstatisticasGerais,
  DiaTecnico,
  ResumoTecnico,
} from "@/lib/rewards";

import { gerarResumoSupervisor } from "@/lib/supervisores";

export default function Home() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dados, setDados] = useState<any[]>([]);
  const [resumo, setResumo] = useState<any>(null);
  const [tecnicos, setTecnicos] = useState<ResumoTecnico[]>([]);
  const [diasTecnicos, setDiasTecnicos] = useState<DiaTecnico[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [erro, setErro] = useState("");
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<string | null>(
    null
  );
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);

  async function carregar(file: File) {
    setArquivo(file);

    try {
      const linhas = await lerPlanilha(file);
      const validacao = validarPlanilha(linhas);

      if (!validacao.valido) {
        setErro(validacao.erro);
        setResumo(null);
        setDados([]);
        setTecnicos([]);
        setDiasTecnicos([]);
        setEstatisticas(null);
        return;
      }

      setErro("");
      setDados(linhas);

      const resultado = processarDados(linhas);
      setResumo(resultado);

      const premiacao = gerarResumoTecnicos(resultado.dadosValidos);
      setDiasTecnicos(premiacao.diasTecnicos);

      // Calcular resumo do supervisor (bónus de supervisão)
      const resumoSupervisor = gerarResumoSupervisor("Supervisor", premiacao.diasTecnicos);

      // Criar linha do supervisor como se fosse mais um "técnico"
      const linhaSupervisor: ResumoTecnico & {
        isSupervisor: boolean;
        bonusSupervisor: number;
      } = {
        tecnico: "SUPERVISOR",
        diasTrabalhados: new Set(premiacao.diasTecnicos.map((d) => d.data)).size,
        diasComPremio: resumoSupervisor.tecnicosProdutivos,
        diasSemPremio: 0,
        instalacoes: resumoSupervisor.instalacoesTotais,
        premioTotal: resumoSupervisor.bonus,
        potencialAdicional: 0,
        isSupervisor: true,
        bonusSupervisor: resumoSupervisor.bonus,
      } as any;

      setTecnicos([linhaSupervisor, ...premiacao.resumoTecnicos]);

      setEstatisticas(
        calcularEstatisticasGerais(premiacao.resumoTecnicos)
      );
    } catch (error) {
      console.error(error);
      setErro("Erro ao ler a planilha.");
      setResumo(null);
      setDados([]);
      setTecnicos([]);
      setDiasTecnicos([]);
      setEstatisticas(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <Header />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <UploadArea onFileSelected={carregar} />

        {erro && (
          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5">
            <h2 className="font-bold text-red-700">Erro na planilha</h2>
            <p className="mt-2 text-red-600">{erro}</p>
          </div>
        )}

        {arquivo && (
          <div className="mt-6 rounded-2xl bg-white shadow border border-gray-200 p-6">
            <h2 className="text-xl font-bold">Arquivo carregado</h2>
            <p className="mt-3">
              <strong>Nome:</strong> {arquivo.name}
            </p>
            <p>
              <strong>Linhas:</strong> {dados.length}
            </p>
          </div>
        )}

        {resumo && estatisticas && (
          <DashboardKPIs
            totalTecnicos={resumo.totalTecnicos}
            totalServicos={resumo.totalLinhas}
            totalInstalacoes={resumo.totalValidos}
            totalIgnorados={resumo.totalIgnorados}
            premioTotal={estatisticas.premioTotal}
            potencialAdicional={estatisticas.potencialAdicional}
            diasTrabalhados={estatisticas.diasTrabalhados}
            diasPremiados={estatisticas.diasPremiados}
          />
        )}

        {tecnicos.length > 0 && (
          <TabelaTecnicos
            tecnicos={tecnicos}
            onSelecionar={(tecnico, isSup) => {
              setTecnicoSelecionado(tecnico);
              setIsSupervisor(isSup);
              setDrawerAberto(true);
            }}
          />
        )}
      </div>

      <DetalheTecnico
        aberto={drawerAberto}
        tecnico={tecnicoSelecionado}
        dias={diasTecnicos}
        isSupervisor={isSupervisor}
        onFechar={() => {
          setDrawerAberto(false);
          setTecnicoSelecionado(null);
          setIsSupervisor(false);
        }}
      />
    </main>
  );
}
