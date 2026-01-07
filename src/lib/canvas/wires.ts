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

	const radius = 10; // Corner radius

	ctx.moveTo(points[0].x, points[0].y);

	if (points.length === 2) {
		// Simple line, no corners
		ctx.lineTo(points[1].x, points[1].y);
	} else {
		// Draw path with rounded corners using quadratic curves
		for (let i = 0; i < points.length - 1; i++) {
			const current = points[i];
			const next = points[i + 1];

			if (i === 0) {
				// First segment: draw line towards corner point, stopping before it
				if (points.length > 2) {
					const corner = points[1];
					const dx = corner.x - current.x;
					const dy = corner.y - current.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const stopDist = Math.max(0, dist - radius);
					const ratio = dist > 0 ? stopDist / dist : 0;
					ctx.lineTo(current.x + dx * ratio, current.y + dy * ratio);
				} else {
					ctx.lineTo(next.x, next.y);
				}
			} else if (i === points.length - 2) {
				// Last segment: curve from previous corner to end
				const prev = points[i - 1];
				// Draw curve at current corner point
				const dx = next.x - current.x;
				const dy = next.y - current.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const startDist = Math.min(radius, dist / 2);
				const ratio = dist > 0 ? startDist / dist : 0;
				const curveEnd = { x: current.x + dx * ratio, y: current.y + dy * ratio };
				ctx.quadraticCurveTo(current.x, current.y, curveEnd.x, curveEnd.y);
				ctx.lineTo(next.x, next.y);
			} else {
				// Middle corners
				const nextNext = points[i + 2];
				// Draw curve at current corner
				const dx1 = next.x - current.x;
				const dy1 = next.y - current.y;
				const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
				const dx2 = nextNext.x - next.x;
				const dy2 = nextNext.y - next.y;
				const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

				const r1 = Math.min(radius, dist1 / 2);
				const r2 = Math.min(radius, dist2 / 2);

				const curveEnd = { x: next.x + (dx2 / dist2) * r2, y: next.y + (dy2 / dist2) * r2 };
				ctx.quadraticCurveTo(next.x, next.y, curveEnd.x, curveEnd.y);
			}
		}
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
