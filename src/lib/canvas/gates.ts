import type { Point, GateResult, NotGateResult, WirePath } from '$lib/types';
import { COLORS, getVarColor } from './colors';

export function drawInput(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	label: string,
	hoveredWire: WirePath | null
): Point {
	const color = getVarColor(label);
	const isDimmed = hoveredWire && !hoveredWire.id?.includes(label);

	ctx.beginPath();
	ctx.fillStyle = COLORS.gateFill;
	ctx.strokeStyle = isDimmed ? COLORS.dimmed : color;
	ctx.lineWidth = 3;
	ctx.arc(x, y, 22, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = isDimmed ? COLORS.dimmed : color;
	ctx.font = 'bold 18px Courier New';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(label, x, y);

	return { x: x + 22, y };
}

export function drawNotGate(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	label: string,
	hoveredWire: WirePath | null
): NotGateResult {
	const color = getVarColor(label);
	const isDimmed = hoveredWire && !hoveredWire.id?.includes(label + "'");

	ctx.beginPath();
	ctx.fillStyle = COLORS.gateFill;
	ctx.strokeStyle = isDimmed ? COLORS.dimmed : color;
	ctx.lineWidth = 2;

	// Triangle
	ctx.moveTo(x, y - 12);
	ctx.lineTo(x + 24, y);
	ctx.lineTo(x, y + 12);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	// Circle (bubble)
	ctx.beginPath();
	ctx.arc(x + 29, y, 5, 0, Math.PI * 2);
	ctx.fillStyle = COLORS.gateFill;
	ctx.fill();
	ctx.stroke();

	// Label
	ctx.fillStyle = isDimmed ? COLORS.dimmed : '#fff';
	ctx.font = '11px Courier New';
	ctx.textAlign = 'center';
	ctx.fillText(label + "'", x + 12, y - 18);

	return { input: { x, y }, output: { x: x + 34, y } };
}

export function drawAndGate(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	inputs: number,
	hoveredWire: WirePath | null
): GateResult {
	const height = Math.max(50, inputs * 22);
	const halfHeight = height / 2;
	const isDimmed = hoveredWire !== null;

	ctx.beginPath();
	ctx.fillStyle = COLORS.gateFill;
	ctx.strokeStyle = isDimmed ? COLORS.dimmed : COLORS.and;
	ctx.lineWidth = 2.5;

	ctx.moveTo(x, y - halfHeight);
	ctx.lineTo(x + 30, y - halfHeight);
	ctx.arc(x + 30, y, halfHeight, -Math.PI / 2, Math.PI / 2);
	ctx.lineTo(x, y + halfHeight);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = isDimmed ? COLORS.dimmed : '#fff';
	ctx.font = 'bold 11px Courier New';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('AND', x + 22, y);

	const inputPositions: Point[] = [];
	for (let i = 0; i < inputs; i++) {
		const inputY = y - halfHeight + (height / (inputs + 1)) * (i + 1);
		inputPositions.push({ x, y: inputY });
	}

	return {
		inputs: inputPositions,
		output: { x: x + 30 + halfHeight, y },
		width: 30 + halfHeight,
		height
	};
}

export function drawOrGate(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	inputs: number,
	hoveredWire: WirePath | null
): GateResult {
	const height = Math.max(50, inputs * 22);
	const halfHeight = height / 2;
	const isDimmed = hoveredWire !== null;

	ctx.beginPath();
	ctx.fillStyle = COLORS.gateFill;
	ctx.strokeStyle = isDimmed ? COLORS.dimmed : COLORS.or;
	ctx.lineWidth = 2.5;

	ctx.moveTo(x, y - halfHeight);
	ctx.quadraticCurveTo(x + 15, y, x, y + halfHeight);
	ctx.quadraticCurveTo(x + 35, y + halfHeight, x + 55, y);
	ctx.quadraticCurveTo(x + 35, y - halfHeight, x, y - halfHeight);
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = isDimmed ? COLORS.dimmed : '#fff';
	ctx.font = 'bold 11px Courier New';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('OR', x + 28, y);

	const inputPositions: Point[] = [];
	for (let i = 0; i < inputs; i++) {
		const inputY = y - halfHeight + (height / (inputs + 1)) * (i + 1);
		inputPositions.push({ x: x + 8, y: inputY });
	}

	return {
		inputs: inputPositions,
		output: { x: x + 55, y },
		width: 55,
		height
	};
}

export function drawOutput(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	hoveredWire: WirePath | null
): Point {
	const isDimmed = hoveredWire !== null;

	ctx.beginPath();
	ctx.fillStyle = COLORS.gateFill;
	ctx.strokeStyle = isDimmed ? COLORS.dimmed : COLORS.output;
	ctx.lineWidth = 3;
	ctx.arc(x, y, 22, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = isDimmed ? COLORS.dimmed : COLORS.output;
	ctx.font = 'bold 16px Courier New';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('Y', x, y);

	return { x: x - 22, y };
}
