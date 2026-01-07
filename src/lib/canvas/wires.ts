import type { Point, WirePath } from '$lib/types';
import { COLORS } from './colors';

export function drawWire(
	ctx: CanvasRenderingContext2D,
	points: Point[],
	color: string,
	label: string,
	lineWidth: number,
	wireId: string | null,
	hoveredWire: WirePath | null,
	wirePaths: WirePath[]
): void {
	const path: WirePath = { points: [...points], color, label, lineWidth, id: wireId };
	wirePaths.push(path);

	// Highlight all wires with the same label (variable), not just the same wireId
	const isHovered = hoveredWire && hoveredWire.label === label;
	const isDimmed = hoveredWire && hoveredWire.label !== label;

	ctx.beginPath();
	ctx.strokeStyle = isHovered ? '#ffffff' : isDimmed ? COLORS.dimmed : color;
	ctx.lineWidth = isHovered ? lineWidth + 2 : lineWidth;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	if (isHovered) {
		ctx.shadowColor = color;
		ctx.shadowBlur = 10;
	}

	const cornerRadius = 6; // Small rounded corners

	ctx.moveTo(points[0].x, points[0].y);

	if (points.length === 2) {
		// Simple line, no corners
		ctx.lineTo(points[1].x, points[1].y);
	} else {
		// Use arcTo for rounded corners at each turn
		for (let i = 1; i < points.length - 1; i++) {
			ctx.arcTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, cornerRadius);
		}
		// Draw final segment to last point
		ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
	}

	ctx.stroke();

	ctx.shadowBlur = 0;
}

export function drawDot(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	color: string,
	radius: number,
	hoveredWire: WirePath | null,
	label?: string
): void {
	// Highlight dots with the same label as hovered wire
	const isHovered = hoveredWire && label && hoveredWire.label === label;
	const isDimmed = hoveredWire && (!label || hoveredWire.label !== label);

	ctx.beginPath();

	if (isHovered) {
		ctx.fillStyle = '#ffffff';
		ctx.shadowColor = color;
		ctx.shadowBlur = 10;
		ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
	} else {
		ctx.fillStyle = isDimmed ? COLORS.dimmed : color;
		ctx.arc(x, y, radius, 0, Math.PI * 2);
	}

	ctx.fill();
	ctx.shadowBlur = 0;
}

function distanceToSegment(
	px: number,
	py: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	const A = px - x1;
	const B = py - y1;
	const C = x2 - x1;
	const D = y2 - y1;

	const dot = A * C + B * D;
	const lenSq = C * C + D * D;
	let param = -1;

	if (lenSq !== 0) param = dot / lenSq;

	let xx: number, yy: number;

	if (param < 0) {
		xx = x1;
		yy = y1;
	} else if (param > 1) {
		xx = x2;
		yy = y2;
	} else {
		xx = x1 + param * C;
		yy = y1 + param * D;
	}

	const dx = px - xx;
	const dy = py - yy;
	return Math.sqrt(dx * dx + dy * dy);
}

export function findNearestWire(
	mouseX: number,
	mouseY: number,
	wirePaths: WirePath[]
): WirePath | null {
	let nearest: WirePath | null = null;
	let minDist = 15; // Detection threshold

	for (const wire of wirePaths) {
		for (let i = 0; i < wire.points.length - 1; i++) {
			const p1 = wire.points[i];
			const p2 = wire.points[i + 1];
			const dist = distanceToSegment(mouseX, mouseY, p1.x, p1.y, p2.x, p2.y);

			if (dist < minDist) {
				minDist = dist;
				nearest = wire;
			}
		}
	}

	return nearest;
}
