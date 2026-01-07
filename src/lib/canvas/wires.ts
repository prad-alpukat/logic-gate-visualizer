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

	const isHovered = hoveredWire && hoveredWire.id === wireId;
	const isDimmed = hoveredWire && hoveredWire.id !== wireId;

	ctx.beginPath();
	ctx.strokeStyle = isHovered ? '#ffffff' : isDimmed ? COLORS.dimmed : color;
	ctx.lineWidth = isHovered ? lineWidth + 2 : lineWidth;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	if (isHovered) {
		ctx.shadowColor = color;
		ctx.shadowBlur = 10;
	}

	ctx.moveTo(points[0].x, points[0].y);
	for (let i = 1; i < points.length; i++) {
		ctx.lineTo(points[i].x, points[i].y);
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
	hoveredWire: WirePath | null
): void {
	const isDimmed = hoveredWire !== null;
	ctx.beginPath();
	ctx.fillStyle = isDimmed ? COLORS.dimmed : color;
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
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
