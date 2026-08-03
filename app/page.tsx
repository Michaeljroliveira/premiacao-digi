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

export default function Home() {

  const [arquivo, setArquivo] = useState<File | null>(null);

  const [dados, setDados] = useState<any[]>([]);

  const [resumo, setResumo] = useState<any>(null);

  const [tecnicos, setTecnicos] = useState<ResumoTecnico[]>([]);

  const [diasTecnicos, setDiasTecnicos] = useState<DiaTecnico[]>([]);

  const [estatisticas, setEstatisticas] = useState<any>(null);

  const [erro, setErro] = useState("");

  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<string | null>(null);

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

        setDrawerAberto(false);

        setTecnicoSelecionado(null);

        return;

      }

      setErro("");

      setDados(linhas);

      const resultado = processarDados(linhas);

      setResumo(resultado);

      const premiacao = gerarResumoTecnicos(
        resultado.dadosValidos
      );

      setTecnicos(
        premiacao.resumoTecnicos
      );

      setDiasTecnicos(
        premiacao.diasTecnicos
      );

      setEstatisticas(
        calcularEstatisticasGerais(
          premiacao.resumoTecnicos
        )
      );

    } catch (error) {

      console.error(error);

      setErro("Erro ao ler a planilha.");

      setResumo(null);

      setDados([]);

      setTecnicos([]);

      setDiasTecnicos([]);

      setEstatisticas(null);

      setDrawerAberto(false);

      setTecnicoSelecionado(null);

    }

  }

  return (

    <main className="min-h-screen bg-[#F5F7FB]">

      <Header />

      <div className="max-w-7xl mx-auto px-8 py-8">

        <UploadArea onFileSelected={carregar} />

        {erro && (

          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5">

            <h2 className="font-bold text-red-700">

              Erro na planilha

            </h2>

            <p className="mt-2 text-red-600">

              {erro}

            </p>

          </div>

        )}

        {arquivo && (

          <div className="mt-6 rounded-2xl bg-white shadow border border-gray-200 p-6">

            <h2 className="text-xl font-bold">

              Arquivo carregado

            </h2>

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
            valorPerdido={estatisticas.valorPerdido}
            diasTrabalhados={estatisticas.diasTrabalhados}
            diasPremiados={estatisticas.diasPremiados}
          />

        )}

        {tecnicos.length > 0 && (

          <TabelaTecnicos
            tecnicos={tecnicos}
            onSelecionar={(tecnico) => {

              setTecnicoSelecionado(tecnico);

              setDrawerAberto(true);

            }}
          />

        )}

      </div>

      <DetalheTecnico
        aberto={drawerAberto}
        tecnico={tecnicoSelecionado}
        dias={diasTecnicos}
        onFechar={() => {

          setDrawerAberto(false);

          setTecnicoSelecionado(null);

        }}
      />

    </main>

  );

}