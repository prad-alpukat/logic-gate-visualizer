<script lang="ts">
	import { tick, onMount } from 'svelte';
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

	let canvas = $state<HTMLCanvasElement | null>(null);
	let container: HTMLDivElement;
	let wirePaths: WirePath[] = [];
	let canvasHeight = $state(500);
	let mounted = $state(false);

	let zoom = $state(1);
	const MIN_ZOOM = 0.3;
	const MAX_ZOOM = 3;

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
	let tooltipColor = $state('#0d99ff');

	onMount(() => {
		mounted = true;
	});

	$effect(() => {
		// Track reactive dependencies
		const expr = parsedExpression;
		const wire = hoveredWire;
		const exprStr = expression;
		const isMounted = mounted;
		const canvasEl = canvas;

		if (!isMounted || !canvasEl) return;

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		if (expr) {
			const result = drawCircuit(canvasEl, ctx, expr, exprStr, wire);
			wirePaths = result.wirePaths;
			canvasHeight = result.canvasHeight;
		} else {
			ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
			wirePaths = [];
		}
	});

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * delta));
	}

	function handlePanStart(e: MouseEvent) {
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
			panX = startPanX + (e.clientX - startMouseX);
			panY = startPanY + (e.clientY - startMouseY);
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
				tooltipX = e.clientX - canvasRect.left + 12;
				tooltipY = e.clientY - canvasRect.top - 28;
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

	function resetView() {
		zoom = 1;
		panX = 0;
		panY = 0;
	}

	let zoomPercent = $derived(Math.round(zoom * 100));
	let hasMoved = $derived(zoom !== 1 || panX !== 0 || panY !== 0);

	let isFullscreen = $state(false);

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			container?.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	$effect(() => {
		function handleFullscreenChange() {
			isFullscreen = !!document.fullscreenElement;
		}
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
	});
</script>

<svelte:window onmouseup={handlePanEnd} />

<div class="canvas-container" class:fullscreen={isFullscreen} bind:this={container}>
	<!-- Floating Controls -->
	<div class="controls">
		<button class="ctrl-btn" onclick={() => (zoom = Math.min(MAX_ZOOM, zoom * 1.2))} title="Zoom in">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
			</svg>
		</button>
		<span class="zoom-label">{zoomPercent}%</span>
		<button class="ctrl-btn" onclick={() => (zoom = Math.max(MIN_ZOOM, zoom * 0.8))} title="Zoom out">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M8 11h6"/>
			</svg>
		</button>
		<div class="ctrl-divider"></div>
		<button class="ctrl-btn" onclick={resetView} disabled={!hasMoved} title="Reset view">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
			</svg>
		</button>
		<button class="ctrl-btn" onclick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
			{#if isFullscreen}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
				</svg>
			{:else}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
				</svg>
			{/if}
		</button>
	</div>

	<!-- Canvas Area -->
	<div
		class="viewport"
		class:panning={isPanning}
		onwheel={handleWheel}
		onmousedown={handlePanStart}
		oncontextmenu={(e) => e.preventDefault()}
		role="application"
	>
		<div
			class="canvas-wrapper"
			style="transform: translate({panX}px, {panY}px) scale({zoom})"
		>
			<canvas
				bind:this={canvas}
				width="1200"
				height={canvasHeight}
				onmousemove={handleMouseMove}
				onmouseleave={handleMouseLeave}
			></canvas>
		</div>

		{#if tooltipVisible && !isPanning}
			<div
				class="tooltip"
				style="left: {tooltipX}px; top: {tooltipY}px; --color: {tooltipColor}"
			>
				{tooltipText}
			</div>
		{/if}

		{#if !parsedExpression}
			<div class="empty-state">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
				</svg>
				<p>Enter a boolean expression to visualize</p>
				<span>Example: AB + A'C or (A + B)(A' + C)</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.canvas-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		background: #1a1a1a;
		overflow: hidden;
	}

	.canvas-container.fullscreen {
		width: 100vw;
		height: 100vh;
	}

	/* Controls */
	.controls {
		position: absolute;
		top: 12px;
		left: 12px;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		z-index: 10;
	}

	.ctrl-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: transparent;
		border: none;
		border-radius: 4px;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s;
	}

	.ctrl-btn:hover:not(:disabled) {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.ctrl-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.zoom-label {
		min-width: 42px;
		text-align: center;
		font-size: 11px;
		font-weight: 500;
		color: var(--text-secondary);
		font-variant-numeric: tabular-nums;
	}

	.ctrl-divider {
		width: 1px;
		height: 16px;
		background: var(--border-color);
		margin: 0 4px;
	}

	/* Viewport */
	.viewport {
		flex: 1;
		overflow: hidden;
		cursor: grab;
		position: relative;
	}

	.viewport.panning {
		cursor: grabbing;
	}

	.canvas-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100%;
		transform-origin: center center;
		transition: transform 0.1s ease-out;
	}

	.viewport.panning .canvas-wrapper {
		transition: none;
	}

	canvas {
		display: block;
	}

	/* Tooltip */
	.tooltip {
		position: absolute;
		padding: 6px 10px;
		background: var(--bg-secondary);
		border: 1px solid var(--color);
		border-radius: 6px;
		font-size: 12px;
		font-family: 'SF Mono', monospace;
		color: var(--color);
		pointer-events: none;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	/* Empty State */
	.empty-state {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		color: var(--text-muted);
	}

	.empty-state svg {
		opacity: 0.3;
	}

	.empty-state p {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.empty-state span {
		font-size: 12px;
		font-family: 'SF Mono', monospace;
		opacity: 0.6;
	}
</style>
