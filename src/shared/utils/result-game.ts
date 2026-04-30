type ResultadoGame = "A" | "B" | "EMPATE";

export function determinarResultado(jogo: {
	gols_a: number | null;
	gols_b: number | null;
}): ResultadoGame | null {
	if (jogo.gols_a === null || jogo.gols_b === null) return null;

	if (jogo.gols_a > jogo.gols_b) return "A";
	if (jogo.gols_b > jogo.gols_a) return "B";
	return "EMPATE";
}

export function verificarAcerto(
	palpite: string,
	resultado: ResultadoGame | null,
): boolean {
	return palpite === resultado;
}
