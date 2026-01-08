<script lang="ts">
	import ExpressionInput from '$lib/components/ExpressionInput.svelte';
	import CircuitCanvas from '$lib/components/CircuitCanvas.svelte';
	import ExpressionInfo from '$lib/components/ExpressionInfo.svelte';
	import TruthTable from '$lib/components/TruthTable.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import { expressionStore } from '$lib/stores/expression.svelte';

	let rightPanelOpen = $state(true);
	let rightPanelTab = $state<'table' | 'info'>('table');

	// Derive store values for reactivity
	let currentExpression = $derived(expressionStore.expression);
	let currentParsedExpression = $derived(expressionStore.parsedExpression);
	let currentHoveredWire = $derived(expressionStore.hoveredWire);
	let currentError = $derived(expressionStore.error);
</script>

<svelte:head>
	<title>Logic Gate Visualizer</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="app">
	<!-- Top Bar -->
	<header class="topbar">
		<div class="topbar-left">
			<div class="logo">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
				</svg>
				<span>Logic Gate Visualizer</span>
			</div>
		</div>

		<div class="topbar-center">
			<ExpressionInput
				value={currentExpression}
				onchange={(value) => expressionStore.setExpression(value)}
				onvisualize={(expr) => expressionStore.visualize(expr)}
				onreset={() => expressionStore.reset()}
			/>
		</div>

		<div class="topbar-right">
			<button
				class="icon-btn"
				class:active={rightPanelOpen}
				onclick={() => (rightPanelOpen = !rightPanelOpen)}
				title="Toggle Panel"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="3" y="3" width="18" height="18" rx="2"/>
					<path d="M15 3v18"/>
				</svg>
			</button>
		</div>
	</header>

	{#if currentError}
		<div class="toast error">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"/>
				<line x1="15" y1="9" x2="9" y2="15"/>
				<line x1="9" y1="9" x2="15" y2="15"/>
			</svg>
			{currentError}
		</div>
	{/if}

	<!-- Main Area -->
	<div class="main">
		<!-- Canvas -->
		<div class="canvas-area">
			<CircuitCanvas
				parsedExpression={currentParsedExpression}
				expression={currentExpression}
				hoveredWire={currentHoveredWire}
				onhoverwire={(wire) => expressionStore.setHoveredWire(wire)}
			/>
		</div>

		<!-- Right Panel -->
		{#if rightPanelOpen}
			<aside class="panel">
				<div class="panel-tabs">
					<button
						class="tab"
						class:active={rightPanelTab === 'table'}
						onclick={() => (rightPanelTab = 'table')}
					>
						Truth Table
					</button>
					<button
						class="tab"
						class:active={rightPanelTab === 'info'}
						onclick={() => (rightPanelTab = 'info')}
					>
						Info
					</button>
				</div>

				<div class="panel-content">
					{#if rightPanelTab === 'table'}
						<TruthTable
							parsedExpression={currentParsedExpression}
							onuseformula={(formula) => expressionStore.setExpression(formula)}
						/>
					{:else}
						<ExpressionInfo
							parsedExpression={currentParsedExpression}
							expression={currentExpression}
						/>
						<div class="panel-divider"></div>
						<Legend />
					{/if}
				</div>
			</aside>
		{/if}
	</div>

	<!-- Bottom Bar -->
	<footer class="bottombar">
		<div class="bottombar-left">
			{#if currentParsedExpression}
				<span class="status-badge success">
					{currentParsedExpression.isPOS ? 'POS' : 'SOP'}
				</span>
				<span class="status-text">
					{currentParsedExpression.variables.length} variables
					<span class="separator">·</span>
					{currentParsedExpression.terms.length} terms
				</span>
			{:else}
				<span class="status-text muted">Enter a boolean expression to start</span>
			{/if}
		</div>
		<div class="bottombar-right">
			<span class="hint">Scroll to zoom · Drag to pan</span>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--bg-primary);
	}

	/* Top Bar */
	.topbar {
		display: flex;
		align-items: center;
		height: 48px;
		padding: 0 12px;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-color);
		gap: 16px;
		flex-shrink: 0;
	}

	.topbar-left {
		flex-shrink: 0;
	}

	.topbar-center {
		flex: 1;
		max-width: 600px;
	}

	.topbar-right {
		flex-shrink: 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text-primary);
		font-weight: 600;
		font-size: 14px;
	}

	.logo svg {
		color: var(--accent);
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		border-radius: 6px;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s;
	}

	.icon-btn:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.icon-btn.active {
		background: var(--bg-tertiary);
		color: var(--accent);
	}

	/* Toast */
	.toast {
		position: fixed;
		top: 60px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: var(--bg-tertiary);
		border: 1px solid var(--error);
		border-radius: 8px;
		font-size: 13px;
		color: var(--error);
		z-index: 1000;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}

	/* Main */
	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.canvas-area {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	/* Panel */
	.panel {
		width: 320px;
		background: var(--bg-secondary);
		border-left: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.panel-tabs {
		display: flex;
		padding: 0 12px;
		border-bottom: 1px solid var(--border-color);
		gap: 4px;
	}

	.tab {
		padding: 12px 12px;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		margin-bottom: -1px;
	}

	.tab:hover {
		color: var(--text-primary);
	}

	.tab.active {
		color: var(--text-primary);
		border-bottom-color: var(--accent);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.panel-divider {
		height: 1px;
		background: var(--border-color);
		margin: 16px 0;
	}

	/* Bottom Bar */
	.bottombar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 28px;
		padding: 0 12px;
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-color);
		font-size: 11px;
		flex-shrink: 0;
	}

	.bottombar-left,
	.bottombar-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-badge {
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.status-badge.success {
		background: rgba(20, 174, 92, 0.15);
		color: var(--success);
	}

	.status-text {
		color: var(--text-secondary);
	}

	.status-text.muted {
		color: var(--text-muted);
	}

	.separator {
		margin: 0 4px;
		opacity: 0.5;
	}

	.hint {
		color: var(--text-muted);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.logo span {
			display: none;
		}

		.panel {
			position: fixed;
			right: 0;
			top: 48px;
			bottom: 28px;
			z-index: 50;
			box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
		}

		.topbar-center {
			max-width: none;
		}
	}
</style>
