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
	let canvasWrapper: HTMLDivElement;
	let wirePaths: WirePath[] = [];
	let canvasHeight = $state(500);

	// Zoom state
	let zoom = $state(1);
	const MIN_ZOOM = 0.5;
	const MAX_ZOOM = 2;
	const ZOOM_STEP = 0.1;

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

	function zoomIn() {
		zoom = Math.min(MAX_ZOOM, zoom + ZOOM_STEP);
	}

	function zoomOut() {
		zoom = Math.max(MIN_ZOOM, zoom - ZOOM_STEP);
	}

	function resetZoom() {
		zoom = 1;
	}

	function handleWheel(e: WheelEvent) {
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			if (e.deltaY < 0) {
				zoomIn();
			} else {
				zoomOut();
			}
		}
	}

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

	let zoomPercent = $derived(Math.round(zoom * 100));
</script>

<div class="canvas-container">
	<div class="zoom-controls">
		<button class="zoom-btn" onclick={zoomOut} disabled={zoom <= MIN_ZOOM} title="Zoom Out">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"/>
				<line x1="21" y1="21" x2="16.65" y2="16.65"/>
				<line x1="8" y1="11" x2="14" y2="11"/>
			</svg>
		</button>
		<span class="zoom-level">{zoomPercent}%</span>
		<button class="zoom-btn" onclick={zoomIn} disabled={zoom >= MAX_ZOOM} title="Zoom In">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"/>
				<line x1="21" y1="21" x2="16.65" y2="16.65"/>
				<line x1="11" y1="8" x2="11" y2="14"/>
				<line x1="8" y1="11" x2="14" y2="11"/>
			</svg>
		</button>
		<button class="zoom-btn reset" onclick={resetZoom} disabled={zoom === 1} title="Reset Zoom">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
				<path d="M3 3v5h5"/>
			</svg>
		</button>
	</div>

	<div
		class="breadboard"
		bind:this={breadboard}
		style="min-height: {canvasHeight * zoom}px"
		onwheel={handleWheel}
	>
		<div
			class="canvas-wrapper"
			bind:this={canvasWrapper}
			style="transform: scale({zoom}); transform-origin: top center;"
		>
			<canvas
				bind:this={canvas}
				id="circuit-canvas"
				width="1200"
				height={canvasHeight}
				onmousemove={handleMouseMove}
				onmouseleave={handleMouseLeave}
			></canvas>
		</div>
		{#if tooltipVisible}
			<div
				class="tooltip"
				style="left: {tooltipX * zoom}px; top: {tooltipY * zoom}px; border-color: {tooltipColor}; display: block;"
			>
				{tooltipText}
			</div>
		{/if}
	</div>

	<div class="zoom-hint">
		Ctrl + Scroll untuk zoom
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

	.zoom-controls {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 15px;
		position: relative;
		z-index: 20;
	}

	.zoom-btn {
		background: #1a1a2e;
		border: 1px solid #00d9ff;
		color: #00d9ff;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.zoom-btn:hover:not(:disabled) {
		background: #00d9ff;
		color: #1a1a2e;
	}

	.zoom-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.zoom-btn.reset {
		margin-left: 5px;
		border-color: #ffaa00;
		color: #ffaa00;
	}

	.zoom-btn.reset:hover:not(:disabled) {
		background: #ffaa00;
		color: #1a1a2e;
	}

	.zoom-level {
		font-family: 'Courier New', monospace;
		color: #00d9ff;
		font-size: 0.9rem;
		min-width: 50px;
		text-align: center;
	}

	.zoom-hint {
		position: absolute;
		bottom: 10px;
		right: 15px;
		font-size: 0.75rem;
		color: #666;
		z-index: 20;
	}

	.breadboard {
		background: linear-gradient(180deg, #2d4a2d 0%, #1e3a1e 50%, #2d4a2d 100%);
		border: 3px solid #0a1f0a;
		border-radius: 10px;
		min-height: 500px;
		position: relative;
		overflow: auto;
	}

	.canvas-wrapper {
		transition: transform 0.15s ease-out;
		display: flex;
		justify-content: center;
	}

	canvas {
		position: relative;
		z-index: 10;
		display: block;
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
