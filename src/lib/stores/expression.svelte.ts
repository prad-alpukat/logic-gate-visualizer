import type { ParsedExpression, WirePath } from '$lib/types';
import { parseExpression } from '$lib/utils/parser';

function createExpressionStore() {
	let expression = $state('');
	let parsedExpression = $state<ParsedExpression | null>(null);
	let hoveredWire = $state<WirePath | null>(null);
	let error = $state<string | null>(null);

	function setExpression(value: string) {
		expression = value;
		error = null;
	}

	function visualize(expr?: string) {
		const exprToUse = expr ?? expression;
		if (!exprToUse.trim()) {
			error = 'Masukkan ekspresi boolean!';
			return false;
		}

		try {
			if (expr) {
				expression = expr;
			}
			parsedExpression = parseExpression(exprToUse);
			hoveredWire = null;
			error = null;
			return true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error parsing expression';
			return false;
		}
	}

	function reset() {
		expression = '';
		parsedExpression = null;
		hoveredWire = null;
		error = null;
	}

	function setHoveredWire(wire: WirePath | null) {
		hoveredWire = wire;
	}

	return {
		get expression() {
			return expression;
		},
		get parsedExpression() {
			return parsedExpression;
		},
		get hoveredWire() {
			return hoveredWire;
		},
		get error() {
			return error;
		},
		setExpression,
		visualize,
		reset,
		setHoveredWire
	};
}

export const expressionStore = createExpressionStore();
