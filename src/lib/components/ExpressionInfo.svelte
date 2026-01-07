<script lang="ts">
	import type { ParsedExpression } from '$lib/types';

	interface Props {
		parsedExpression: ParsedExpression | null;
		expression: string;
	}

	let { parsedExpression, expression }: Props = $props();
</script>

<div class="info-card">
	<h3>Informasi Ekspresi</h3>
	<div id="expression-info">
		{#if parsedExpression}
			<span class="expression-type" class:type-pos={parsedExpression.isPOS} class:type-sop={!parsedExpression.isPOS}>
				{parsedExpression.isPOS ? 'POS (Product of Sums)' : 'SOP (Sum of Products)'}
			</span>
			<div class="expression-info">
				<strong>Ekspresi:</strong> {expression}<br />
				<strong>Variabel:</strong> {parsedExpression.variables.join(', ')}<br />
				<strong>Jumlah Term:</strong> {parsedExpression.terms.length}<br />
				<strong>Struktur:</strong>
				{parsedExpression.isPOS ? 'AND dari OR (·)' : 'OR dari AND (+)'}
			</div>
		{:else}
			<p class="placeholder">Masukkan ekspresi boolean untuk melihat informasi.</p>
		{/if}
	</div>
</div>

<style>
	.info-card {
		background: #0f3460;
		border-radius: 15px;
		padding: 20px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	h3 {
		color: #00d9ff;
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	h3::before {
		content: '';
		width: 4px;
		height: 20px;
		background: #00d9ff;
		border-radius: 2px;
	}

	.placeholder {
		color: #888;
	}

	.expression-type {
		display: inline-block;
		padding: 5px 15px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.type-sop {
		background: #00d9ff;
		color: #1a1a2e;
	}

	.type-pos {
		background: #e94560;
		color: #fff;
	}

	.expression-info {
		font-family: 'Courier New', monospace;
		background: #1a1a2e;
		padding: 15px;
		border-radius: 8px;
		margin-top: 10px;
	}
</style>
