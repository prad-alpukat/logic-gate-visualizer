import type { ParsedExpression, WirePath, Point, GateResult } from '$lib/types';
import { COLORS, getVarColor } from './colors';
import { drawInput, drawNotGate, drawAndGate, drawOrGate, drawOutput } from './gates';
import { drawWire, drawDot } from './wires';

export interface DrawCircuitResult {
	wirePaths: WirePath[];
	canvasHeight: number;
}

export function drawCircuit(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	parsed: ParsedExpression,
	expr: string,
	hoveredWire: WirePath | null
): DrawCircuitResult {
	const { isPOS, variables, terms } = parsed;

	// Reset wire paths
	const wirePaths: WirePath[] = [];

	// Layout calculations
	const startX = 60;
	const inputSpacing = 70;
	const termSpacing = 100;
	const padding = 100;

	// Calculate required canvas height
	const inputsHeight = variables.length * inputSpacing;
	const termsHeight = terms.length * termSpacing;
	const requiredHeight = Math.max(inputsHeight, termsHeight) + padding * 2;
	const minHeight = 450;
	const canvasHeight = Math.max(minHeight, requiredHeight);

	canvas.height = canvasHeight;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Calculate vertical center positions
	const inputStartY = (canvasHeight - inputsHeight) / 2 + inputSpacing / 2;
	const termStartY = (canvasHeight - termsHeight) / 2 + termSpacing / 2;

	// Bus lines X positions - vertical channels for each variable
	const busStartX = startX + 140;
	const busSpacing = 18;

	// Draw inputs and NOT gates
	const inputOutputs: Record<string, Point> = {};
	const notOutputs: Record<string, Point> = {};
	const busLines: Record<string, number> = {};

	variables.forEach((v, i) => {
		const y = inputStartY + i * inputSpacing;
		const inputPos = drawInput(ctx, startX, y, v, hoveredWire);
		inputOutputs[v] = { x: inputPos.x, y: inputPos.y };

		// Draw NOT gate
		const notGate = drawNotGate(ctx, startX + 55, y, v, hoveredWire);
		notOutputs[v] = notGate.output;

		// Wire from input to NOT gate
		const wireId = `input-${v}`;
		drawWire(
			ctx,
			[
				{ x: inputPos.x, y: inputPos.y },
				{ x: notGate.input.x, y: notGate.input.y }
			],
			getVarColor(v),
			v,
			2.5,
			wireId,
			hoveredWire,
			wirePaths
		);

		// Bus line positions (non-negated and negated)
		busLines[v] = busStartX + i * busSpacing * 2;
		busLines[v + "'"] = busStartX + i * busSpacing * 2 + busSpacing;
	});

	// Calculate Y range needed for each bus line
	const busYRange: Record<string, { min: number; max: number }> = {};

	// Initialize with input positions
	variables.forEach((v) => {
		busYRange[v] = { min: inputOutputs[v].y, max: inputOutputs[v].y };
		busYRange[v + "'"] = { min: notOutputs[v].y, max: notOutputs[v].y };
	});

	// Calculate term gate positions first to know Y range
	const termGateX = busStartX + variables.length * busSpacing * 2 + 80;
	terms.forEach((term, termIdx) => {
		const numInputs = term.length;
		const termY = termStartY + termIdx * termSpacing;
		const height = Math.max(50, numInputs * 22);
		const halfHeight = height / 2;

		term.forEach((lit, litIdx) => {
			const varKey = lit.negated ? lit.variable + "'" : lit.variable;
			const inputY = termY - halfHeight + (height / (numInputs + 1)) * (litIdx + 1);

			if (busYRange[varKey]) {
				busYRange[varKey].min = Math.min(busYRange[varKey].min, inputY);
				busYRange[varKey].max = Math.max(busYRange[varKey].max, inputY);
			}
		});
	});

	// Draw vertical bus lines from inputs (only as long as needed)
	variables.forEach((v) => {
		const color = getVarColor(v);
		const inputY = inputOutputs[v].y;

		// Non-negated bus line
		const busX = busLines[v];
		const yRange = busYRange[v];
		const busMinY = Math.min(yRange.min, inputY) - 10;
		const busMaxY = Math.max(yRange.max, inputY) + 10;

		// Draw as two separate paths for proper rounded corners
		// Path 1: From input to junction, then up to top (L-shape)
		drawWire(
			ctx,
			[
				{ x: inputOutputs[v].x, y: inputY },
				{ x: busX, y: inputY },
				{ x: busX, y: busMinY }
			],
			color,
			v,
			2,
			`bus-${v}-top`,
			hoveredWire,
			wirePaths
		);

		// Path 2: From junction down to bottom
		drawWire(
			ctx,
			[
				{ x: busX, y: inputY },
				{ x: busX, y: busMaxY }
			],
			color,
			v,
			2,
			`bus-${v}-bottom`,
			hoveredWire,
			wirePaths
		);

		// Draw dot at junction
		drawDot(ctx, busX, inputY, color, 4, hoveredWire, v);

		// Negated bus line
		const busXNeg = busLines[v + "'"];
		const notY = notOutputs[v].y;
		const yRangeNeg = busYRange[v + "'"];
		const busMinYNeg = Math.min(yRangeNeg.min, notY) - 10;
		const busMaxYNeg = Math.max(yRangeNeg.max, notY) + 10;

		// Path 1: From NOT output to junction, then up to top (L-shape)
		drawWire(
			ctx,
			[
				{ x: notOutputs[v].x, y: notY },
				{ x: busXNeg, y: notY },
				{ x: busXNeg, y: busMinYNeg }
			],
			color,
			v + "'",
			2,
			`bus-${v}'-top`,
			hoveredWire,
			wirePaths
		);

		// Path 2: From junction down to bottom
		drawWire(
			ctx,
			[
				{ x: busXNeg, y: notY },
				{ x: busXNeg, y: busMaxYNeg }
			],
			color,
			v + "'",
			2,
			`bus-${v}'-bottom`,
			hoveredWire,
			wirePaths
		);

		drawDot(ctx, busXNeg, notY, color, 4, hoveredWire, v + "'");
	});

	// Term gate outputs
	const termOutputs: Point[] = [];
	const termGateData: { gate: GateResult; termY: number }[] = [];

	// Draw term gates
	terms.forEach((term, termIdx) => {
		const numInputs = term.length;
		const termY = termStartY + termIdx * termSpacing;

		let gate: GateResult;
		if (isPOS) {
			gate = drawOrGate(ctx, termGateX, termY, numInputs, hoveredWire);
		} else {
			gate = drawAndGate(ctx, termGateX, termY, numInputs, hoveredWire);
		}

		termGateData.push({ gate, termY });
		termOutputs.push(gate.output);
	});

	// Draw connections from bus to term gates with proper routing
	terms.forEach((term, termIdx) => {
		const { gate } = termGateData[termIdx];

		term.forEach((lit, litIdx) => {
			const varKey = lit.negated ? lit.variable + "'" : lit.variable;
			const busX = busLines[varKey];
			const targetPos = gate.inputs[litIdx];
			const color = getVarColor(lit.variable);

			const wireId = `term${termIdx}-${lit.variable}${lit.negated ? "'" : ''}`;

			// Simple direct horizontal line from bus to gate input
			drawWire(
				ctx,
				[
					{ x: busX, y: targetPos.y },
					{ x: targetPos.x, y: targetPos.y }
				],
				color,
				varKey,
				2.5,
				wireId,
				hoveredWire,
				wirePaths
			);

			// Draw junction dot on bus
			drawDot(ctx, busX, targetPos.y, color, 4, hoveredWire, varKey);
		});
	});

	// Draw final gate
	const finalGateX = termGateX + 140;
	const finalGateY = canvasHeight / 2;

	if (terms.length > 1) {
		let finalGate: GateResult;
		if (isPOS) {
			finalGate = drawAndGate(ctx, finalGateX, finalGateY, terms.length, hoveredWire);
		} else {
			finalGate = drawOrGate(ctx, finalGateX, finalGateY, terms.length, hoveredWire);
		}

		// Connect term outputs to final gate with proper routing
		termOutputs.forEach((termOut, idx) => {
			const targetPos = finalGate.inputs[idx];
			const wireId = `final-term${idx}`;
			const color = isPOS ? COLORS.and : COLORS.or;

			// Route: horizontal from term output, then vertical, then horizontal to final gate
			const midX = finalGateX - 30 - (terms.length - 1 - idx) * 12;

			drawWire(
				ctx,
				[
					{ x: termOut.x, y: termOut.y },
					{ x: midX, y: termOut.y },
					{ x: midX, y: targetPos.y },
					{ x: targetPos.x, y: targetPos.y }
				],
				color,
				`Term ${idx + 1}`,
				2.5,
				wireId,
				hoveredWire,
				wirePaths
			);
		});

		// Draw output
		const outputX = finalGateX + 180;
		const outputPos = drawOutput(ctx, outputX, finalGateY, hoveredWire);
		drawWire(
			ctx,
			[
				{ x: finalGate.output.x, y: finalGate.output.y },
				{ x: outputPos.x, y: outputPos.y }
			],
			COLORS.output,
			'Output',
			3,
			'output',
			hoveredWire,
			wirePaths
		);
	} else if (terms.length === 1) {
		const outputX = termGateX + 120;
		const outputPos = drawOutput(ctx, outputX, termOutputs[0].y, hoveredWire);
		drawWire(
			ctx,
			[
				{ x: termOutputs[0].x, y: termOutputs[0].y },
				{ x: outputPos.x, y: outputPos.y }
			],
			COLORS.output,
			'Output',
			3,
			'output',
			hoveredWire,
			wirePaths
		);
	}

	// Draw title
	ctx.fillStyle = COLORS.text;
	ctx.font = 'bold 14px Courier New';
	ctx.textAlign = 'left';
	ctx.fillText(`Rangkaian ${isPOS ? 'POS' : 'SOP'}: ${expr}`, 20, 22);

	return { wirePaths, canvasHeight };
}
