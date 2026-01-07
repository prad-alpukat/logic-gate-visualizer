import type { ParsedExpression } from '$lib/types';

export function evaluate(parsed: ParsedExpression, values: Record<string, boolean>): boolean {
	const { isPOS, terms } = parsed;

	if (isPOS) {
		// POS: AND of ORs
		return terms.every((term) => {
			return term.some((lit) => {
				const val = values[lit.variable];
				return lit.negated ? !val : val;
			});
		});
	} else {
		// SOP: OR of ANDs
		return terms.some((term) => {
			return term.every((lit) => {
				const val = values[lit.variable];
				return lit.negated ? !val : val;
			});
		});
	}
}
