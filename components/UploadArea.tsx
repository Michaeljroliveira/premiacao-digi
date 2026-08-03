"use client";

import { useRef } from "react";

type Props = {
  onFileSelected: (file: File) => void;
};

export default function UploadArea({ onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-200">

      <h2 className="text-2xl font-bold mb-6">
        Upload da Planilha
      </h2>

      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer border-2 border-dashed border-blue-500 rounded-xl p-16 text-center hover:bg-blue-50 transition"
      >
        <h3 className="text-2xl font-semibold">
          Clique aqui para selecionar a planilha
        </h3>

        <p className="mt-3 text-gray-500">
          Arquivo Excel (.xlsx)
        </p>

        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".xlsx"
          onChange={(e) => {
            if (!e.target.files?.length) return;
            onFileSelected(e.target.files[0]);
          }}
        />
      </div>

    </div>
  );
}