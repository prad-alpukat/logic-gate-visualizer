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
	const termSpacing = 85;
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
	const busSpacing = 15;

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

	// Draw vertical bus lines from inputs
	variables.forEach((v, i) => {
		const color = getVarColor(v);

		// Non-negated bus line
		const busX = busLines[v];
		const wireIdNormal = `bus-${v}`;
		drawWire(
			ctx,
			[
				{ x: inputOutputs[v].x, y: inputOutputs[v].y },
				{ x: busX, y: inputOutputs[v].y },
				{ x: busX, y: padding - 20 },
				{ x: busX, y: canvasHeight - padding + 20 }
			],
			color,
			v,
			2,
			wireIdNormal,
			hoveredWire,
			wirePaths
		);

		// Draw dot at junction
		drawDot(ctx, busX, inputOutputs[v].y, color, 4, hoveredWire);

		// Negated bus line
		const busXNeg = busLines[v + "'"];
		const wireIdNeg = `bus-${v}'`;
		drawWire(
			ctx,
			[
				{ x: notOutputs[v].x, y: notOutputs[v].y },
				{ x: busXNeg, y: notOutputs[v].y },
				{ x: busXNeg, y: padding - 20 },
				{ x: busXNeg, y: canvasHeight - padding + 20 }
			],
			color,
			v + "'",
			2,
			wireIdNeg,
			hoveredWire,
			wirePaths
		);

		drawDot(ctx, busXNeg, notOutputs[v].y, color, 4, hoveredWire);
	});

	// Calculate term gate positions
	const termGateX = busStartX + variables.length * busSpacing * 2 + 60;
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

	// Draw connections from bus to term gates
	terms.forEach((term, termIdx) => {
		const { gate } = termGateData[termIdx];

		term.forEach((lit, litIdx) => {
			const varKey = lit.negated ? lit.variable + "'" : lit.variable;
			const busX = busLines[varKey];
			const targetPos = gate.inputs[litIdx];
			const color = getVarColor(lit.variable);

			// Calculate horizontal routing with offset to avoid overlap
			const routeX = termGateX - 20 - litIdx * 12;

			const wireId = `term${termIdx}-${lit.variable}${lit.negated ? "'" : ''}`;

			// Draw from bus to gate input
			drawWire(
				ctx,
				[
					{ x: busX, y: targetPos.y },
					{ x: routeX, y: targetPos.y },
					{ x: routeX, y: targetPos.y },
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
			drawDot(ctx, busX, targetPos.y, color, 4, hoveredWire);
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

		// Connect term outputs to final gate
		termOutputs.forEach((termOut, idx) => {
			const targetPos = finalGate.inputs[idx];
			const routeX = finalGateX - 25 - idx * 10;
			const wireId = `final-term${idx}`;
			const color = isPOS ? COLORS.and : COLORS.or;

			drawWire(
				ctx,
				[
					{ x: termOut.x, y: termOut.y },
					{ x: routeX, y: termOut.y },
					{ x: routeX, y: targetPos.y },
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
