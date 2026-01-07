<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ExpressionInput from '$lib/components/ExpressionInput.svelte';
	import CircuitCanvas from '$lib/components/CircuitCanvas.svelte';
	import ExpressionInfo from '$lib/components/ExpressionInfo.svelte';
	import TruthTable from '$lib/components/TruthTable.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import { expressionStore } from '$lib/stores/expression.svelte';
</script>

<svelte:head>
	<title>Visualisasi SOP & POS - Logic Gate Simulator</title>
</svelte:head>

<div class="container">
	<Header />

	<ExpressionInput
		value={expressionStore.expression}
		onchange={(value) => expressionStore.setExpression(value)}
		onvisualize={() => expressionStore.visualize()}
		onreset={() => expressionStore.reset()}
	/>

	{#if expressionStore.error}
		<div class="error-message">{expressionStore.error}</div>
	{/if}

	<CircuitCanvas
		parsedExpression={expressionStore.parsedExpression}
		expression={expressionStore.expression}
		hoveredWire={expressionStore.hoveredWire}
		onhoverwire={(wire) => expressionStore.setHoveredWire(wire)}
	/>

	<div class="info-panel">
		<ExpressionInfo
			parsedExpression={expressionStore.parsedExpression}
			expression={expressionStore.expression}
		/>
		<TruthTable parsedExpression={expressionStore.parsedExpression} />
	</div>

	<Legend />
</div>

<style>
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 20px;
	}

	.info-panel {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
		margin-top: 20px;
	}

	.error-message {
		background: rgba(233, 69, 96, 0.2);
		border: 1px solid #e94560;
		color: #ff6b6b;
		padding: 15px;
		border-radius: 10px;
		margin-bottom: 20px;
		text-align: center;
	}
</style>
