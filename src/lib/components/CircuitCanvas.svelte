<script lang="ts">
	import type { ParsedExpression, WirePath } from '$lib/types';
	import { drawCircuit } from '$lib/canvas/circuit';
	import { findNearestWire } from '$lib/canvas/wires';

	interface Props {
		parsedExpression: ParsedExpression | null;
		expression: string;
		hoveredWire: WirePath | null;
		onhoverwire: (wire: WirePath | null) => void;
	}

	let { parsedExpression, expression, hoveredWire, onhoverwire }: Props = $props();

	let canvas: HTMLCanvasElement;
	let breadboard: HTMLDivElement;
	let wirePaths: WirePath[] = [];
	let canvasHeight = $state(500);

	let tooltipVisible = $state(false);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipText = $state('');
	let tooltipColor = $state('#00d9ff');

	$effect(() => {
		if (canvas && parsedExpression) {
			const ctx = canvas.getContext('2d');
			if (ctx) {
				const result = drawCircuit(canvas, ctx, parsedExpression, expression, hoveredWire);
				wirePaths = result.wirePaths;
				canvasHeight = result.canvasHeight;
			}
		} else if (canvas && !parsedExpression) {
			const ctx = canvas.getContext('2d');
			if (ctx) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
			wirePaths = [];
		}
	});

	function getMousePos(e: MouseEvent): { x: number; y: number } {
		const rect = canvas.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) * (canvas.width / rect.width),
			y: (e.clientY - rect.top) * (canvas.height / rect.height)
		};
	}

	function handleMouseMove(e: MouseEvent) {
		if (!parsedExpression) return;

		const pos = getMousePos(e);
		const nearestWire = findNearestWire(pos.x, pos.y, wirePaths);

		if (nearestWire !== hoveredWire) {
			onhoverwire(nearestWire);

			if (nearestWire) {
				tooltipVisible = true;
				const canvasRect = canvas.getBoundingClientRect();
				tooltipX = e.clientX - canvasRect.left + 15;
				tooltipY = e.clientY - canvasRect.top - 30;
				tooltipText = nearestWire.label || nearestWire.id || '';
				tooltipColor = nearestWire.color;
			} else {
				tooltipVisible = false;
			}
		}
	}

	function handleMouseLeave() {
		if (hoveredWire) {
			onhoverwire(null);
			tooltipVisible = false;
		}
	}
</script>

<div class="canvas-container">
	<div class="breadboard" bind:this={breadboard} style="min-height: {canvasHeight}px">
		<canvas
			bind:this={canvas}
			id="circuit-canvas"
			width="1200"
			height={canvasHeight}
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
		></canvas>
		{#if tooltipVisible}
			<div
				class="tooltip"
				style="left: {tooltipX}px; top: {tooltipY}px; border-color: {tooltipColor}; display: block;"
			>
				{tooltipText}
			</div>
		{/if}
	</div>
</div>

<style>
	.canvas-container {
		background: #1e3a1e;
		border-radius: 15px;
		padding: 20px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
		position: relative;
		overflow: hidden;
	}

	.canvas-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
		background-size: 20px 20px;
		pointer-events: none;
	}

	.breadboard {
		background: linear-gradient(180deg, #2d4a2d 0%, #1e3a1e 50%, #2d4a2d 100%);
		border: 3px solid #0a1f0a;
		border-radius: 10px;
		min-height: 500px;
		position: relative;
	}

	canvas {
		position: relative;
		z-index: 10;
		display: block;
		margin: 0 auto;
		cursor: crosshair;
	}

	.tooltip {
		position: absolute;
		background: rgba(0, 0, 0, 0.9);
		color: #fff;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 12px;
		font-family: 'Courier New', monospace;
		pointer-events: none;
		z-index: 100;
		border: 1px solid #00d9ff;
	}
</style>
