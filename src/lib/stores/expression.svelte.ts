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
			const parsed = parseExpression(exprToUse);
			// Clear first to force re-render
			parsedExpression = null;

			// First render
			setTimeout(() => {
				expression = exprToUse;
				parsedExpression = parsed;
				hoveredWire = null;
				error = null;

				// Second render to ensure canvas updates
				setTimeout(() => {
					parsedExpression = null;
					setTimeout(() => {
						parsedExpression = parsed;
					}, 10);
				}, 50);
			}, 10);

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
