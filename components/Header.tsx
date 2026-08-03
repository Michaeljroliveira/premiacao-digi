"use client";

import { useEffect, useState } from "react";

export default function Header() {

  const [data, setData] = useState("");

  useEffect(() => {

    setData(
      new Date().toLocaleString("pt-PT")
    );

  }, []);

  return (

    <header className="bg-[#001EFF] rounded-b-3xl shadow-xl">

      <div className="max-w-7xl mx-auto py-10 px-8 text-center text-white">

        <h1 className="text-5xl font-extrabold tracking-wide">

          DIGI Performance

        </h1>

        <p className="mt-3 text-xl opacity-90">

          Sistema Inteligente de Auditoria de Produção

        </p>

        <div className="mt-6 inline-flex bg-white/10 rounded-full px-5 py-2">

          <span className="text-sm">

            Última atualização:
            {" "}
            {data || "--/--/---- --:--"}

          </span>

        </div>

      </div>

    </header>

  );

}