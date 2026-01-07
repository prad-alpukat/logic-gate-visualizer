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

	// Pan/Drag state
	let isPanning = $state(false);
	let panX = $state(0);
	let panY = $state(0);
	let startPanX = $state(0);
	let startPanY = $state(0);
	let startMouseX = $state(0);
	let startMouseY = $state(0);

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
		panX = 0;
		panY = 0;
	}

	function resetPan() {
		panX = 0;
		panY = 0;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (e.deltaY < 0) {
			zoomIn();
		} else {
			zoomOut();
		}
	}

	// Pan handlers
	function handlePanStart(e: MouseEvent) {
		// Left click to drag
		if (e.button === 0) {
			e.preventDefault();
			isPanning = true;
			startMouseX = e.clientX;
			startMouseY = e.clientY;
			startPanX = panX;
			startPanY = panY;
		}
	}

	function handlePanMove(e: MouseEvent) {
		if (isPanning) {
			const deltaX = e.clientX - startMouseX;
			const deltaY = e.clientY - startMouseY;
			panX = startPanX + deltaX;
			panY = startPanY + deltaY;
		}
	}

	function handlePanEnd() {
		isPanning = false;
	}

	function getMousePos(e: MouseEvent): { x: number; y: number } {
		const rect = canvas.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) * (canvas.width / rect.width),
			y: (e.clientY - rect.top) * (canvas.height / rect.height)
		};
	}

	function handleMouseMove(e: MouseEvent) {
		// Handle panning
		if (isPanning) {
			handlePanMove(e);
			return;
		}

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
		isPanning = false;
	}

	function handleMouseUp() {
		isPanning = false;
	}

	let zoomPercent = $derived(Math.round(zoom * 100));
	let cursorStyle = $derived(isPanning ? 'grabbing' : 'grab');
	let hasPanned = $derived(panX !== 0 || panY !== 0);
</script>

<svelte:window onmouseup={handleMouseUp} />

<div class="canvas-container">
	<div class="controls-bar">
		<div class="zoom-controls">
			<button class="ctrl-btn" onclick={zoomOut} disabled={zoom <= MIN_ZOOM} title="Zoom Out (-)">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"/>
					<line x1="21" y1="21" x2="16.65" y2="16.65"/>
					<line x1="8" y1="11" x2="14" y2="11"/>
				</svg>
			</button>
			<span class="zoom-level">{zoomPercent}%</span>
			<button class="ctrl-btn" onclick={zoomIn} disabled={zoom >= MAX_ZOOM} title="Zoom In (+)">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"/>
					<line x1="21" y1="21" x2="16.65" y2="16.65"/>
					<line x1="11" y1="8" x2="11" y2="14"/>
					<line x1="8" y1="11" x2="14" y2="11"/>
				</svg>
			</button>
			<button class="ctrl-btn reset" onclick={resetZoom} disabled={zoom === 1 && !hasPanned} title="Reset View">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
					<path d="M3 3v5h5"/>
				</svg>
			</button>
		</div>

		<div class="pan-controls">
			<button class="ctrl-btn pan" onclick={resetPan} disabled={!hasPanned} title="Reset Position">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 9l-3 3 3 3"/>
					<path d="M9 5l3-3 3 3"/>
					<path d="M15 19l3 3 3-3"/>
					<path d="M19 9l3 3-3 3"/>
					<line x1="2" y1="12" x2="22" y2="12"/>
					<line x1="12" y1="2" x2="12" y2="22"/>
				</svg>
			</button>
			<span class="pan-hint">Drag untuk geser</span>
		</div>
	</div>

	<div
		class="breadboard"
		class:panning={isPanning}
		bind:this={breadboard}
		style="min-height: {Math.max(canvasHeight * zoom, 450)}px"
		onwheel={handleWheel}
		onmousedown={handlePanStart}
		oncontextmenu={(e) => e.preventDefault()}
	>
		<div
			class="canvas-wrapper"
			bind:this={canvasWrapper}
			style="transform: translate({panX}px, {panY}px) scale({zoom}); transform-origin: top center;"
		>
			<canvas
				bind:this={canvas}
				id="circuit-canvas"
				width="1200"
				height={canvasHeight}
				style="cursor: {cursorStyle}"
				onmousemove={handleMouseMove}
				onmouseleave={handleMouseLeave}
			></canvas>
		</div>
		{#if tooltipVisible && !isPanning}
			<div
				class="tooltip"
				style="left: {tooltipX * zoom + panX}px; top: {tooltipY * zoom + panY}px; border-color: {tooltipColor}; display: block;"
			>
				{tooltipText}
			</div>
		{/if}
	</div>

	<div class="controls-hint">
		Scroll = Zoom | Drag = Pan
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

	.controls-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
		position: relative;
		z-index: 20;
		flex-wrap: wrap;
		gap: 10px;
	}

	.zoom-controls,
	.pan-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.ctrl-btn {
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

	.ctrl-btn:hover:not(:disabled) {
		background: #00d9ff;
		color: #1a1a2e;
	}

	.ctrl-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.ctrl-btn.reset {
		margin-left: 5px;
		border-color: #ffaa00;
		color: #ffaa00;
	}

	.ctrl-btn.reset:hover:not(:disabled) {
		background: #ffaa00;
		color: #1a1a2e;
	}

	.ctrl-btn.pan {
		border-color: #00ff88;
		color: #00ff88;
	}

	.ctrl-btn.pan:hover:not(:disabled) {
		background: #00ff88;
		color: #1a1a2e;
	}

	.zoom-level {
		font-family: 'Courier New', monospace;
		color: #00d9ff;
		font-size: 0.9rem;
		min-width: 50px;
		text-align: center;
	}

	.pan-hint {
		font-size: 0.75rem;
		color: #666;
	}

	.controls-hint {
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
		overflow: hidden;
	}

	.breadboard.panning {
		cursor: grabbing;
	}

	.canvas-wrapper {
		transition: transform 0.1s ease-out;
		display: flex;
		justify-content: center;
		will-change: transform;
	}

	.breadboard.panning .canvas-wrapper {
		transition: none;
	}

	canvas {
		position: relative;
		z-index: 10;
		display: block;
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

	@media (max-width: 600px) {
		.controls-bar {
			flex-direction: column;
			align-items: flex-start;
		}

		.pan-hint {
			display: none;
		}
	}
</style>
