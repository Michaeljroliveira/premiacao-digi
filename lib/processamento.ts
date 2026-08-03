export function processarDados(dados: any[]) {

    const validos = dados.filter(item => {

        return (
            item["Estado"] === "Finished" &&
            (
                item["Tipo de instalación"] === "FTTH DIGI" ||
                item["Tipo de instalación"] === "FTTH Pro-Digi"
            )

        );

    });

    const tecnicos = new Set(
        validos.map(item => item["Persona asignada"])
    );

    return {

        totalLinhas: dados.length,

        totalValidos: validos.length,

        totalIgnorados: dados.length - validos.length,

        totalTecnicos: tecnicos.size,

        dadosValidos: validos

    };

}