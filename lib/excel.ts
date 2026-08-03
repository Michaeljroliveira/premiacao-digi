import * as XLSX from "xlsx";

export function lerPlanilha(file: File) {
  return new Promise<any[]>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const json = XLSX.utils.sheet_to_json(sheet);

        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}