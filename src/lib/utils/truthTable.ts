import type { ParsedExpression, TruthTableRow } from '$lib/types';
import { evaluate } from './evaluator';

export function generateTruthTable(parsed: ParsedExpression): TruthTableRow[] {
	const { variables } = parsed;
	const rows: TruthTableRow[] = [];
	const numRows = Math.pow(2, variables.length);

	for (let i = 0; i < numRows; i++) {
		const values: Record<string, boolean> = {};
		variables.forEach((v, idx) => {
			values[v] = Boolean((i >> (variables.length - 1 - idx)) & 1);
		});
		const output = evaluate(parsed, values);
		rows.push({ values, output });
	}

	return rows;
}
