import type { Literal, ParsedExpression } from '$lib/types';

export function parseExpression(expr: string): ParsedExpression {
	expr = expr.trim();

	// Detect type (SOP or POS)
	const isPOS =
		expr.includes('(') &&
		(expr.includes('·') || expr.includes('*') || expr.includes(')(') || /\)\s*\(/.test(expr));

	// Extract variables
	const variables = [...new Set(expr.match(/[A-Z]/gi) || [])].sort().map((v) => v.toUpperCase());

	let terms: Literal[][] = [];

	if (isPOS) {
		const termMatches = expr.match(/\([^)]+\)/g) || [];
		terms = termMatches.map((term) => {
			const literals = term
				.replace(/[()]/g, '')
				.split(/[+\s]+/)
				.filter((l) => l);
			return literals.map((lit) => ({
				variable: lit.replace(/'/g, '').toUpperCase(),
				negated: lit.includes("'")
			}));
		});
	} else {
		const termStrings = expr.split(/[+\s]+/).filter((t) => t.trim());
		terms = termStrings.map((term) => {
			const literals: Literal[] = [];
			let i = 0;
			while (i < term.length) {
				if (/[A-Z]/i.test(term[i])) {
					const variable = term[i].toUpperCase();
					const negated = term[i + 1] === "'";
					literals.push({ variable, negated });
					i += negated ? 2 : 1;
				} else {
					i++;
				}
			}
			return literals;
		});
	}

	return { isPOS, variables, terms };
}
