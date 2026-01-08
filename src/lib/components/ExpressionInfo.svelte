<script lang="ts">
	import type { ParsedExpression } from '$lib/types';

	interface Props {
		parsedExpression: ParsedExpression | null;
		expression: string;
	}

	let { parsedExpression, expression }: Props = $props();
</script>

<div class="info-panel">
	{#if parsedExpression}
		<div class="info-header">
			<span class="type-badge" class:pos={parsedExpression.isPOS}>
				{parsedExpression.isPOS ? 'POS' : 'SOP'}
			</span>
			<span class="type-label">
				{parsedExpression.isPOS ? 'Product of Sums' : 'Sum of Products'}
			</span>
		</div>

		<div class="info-grid">
			<div class="info-item">
				<span class="label">Expression</span>
				<code class="value">{expression}</code>
			</div>
			<div class="info-item">
				<span class="label">Variables</span>
				<span class="value">{parsedExpression.variables.join(', ')}</span>
			</div>
			<div class="info-row">
				<div class="info-item small">
					<span class="label">Terms</span>
					<span class="value">{parsedExpression.terms.length}</span>
				</div>
				<div class="info-item small">
					<span class="label">Structure</span>
					<span class="value">{parsedExpression.isPOS ? 'AND of OR' : 'OR of AND'}</span>
				</div>
			</div>
		</div>
	{:else}
		<div class="empty-state">
			<span class="empty-icon">i</span>
			<span>Enter an expression to see details</span>
		</div>
	{/if}
</div>

<style>
	.info-panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.info-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.type-badge {
		padding: 3px 8px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		background: rgba(13, 153, 255, 0.15);
		color: var(--accent);
	}

	.type-badge.pos {
		background: rgba(242, 72, 34, 0.15);
		color: var(--error);
	}

	.type-label {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.info-row {
		display: flex;
		gap: 16px;
	}

	.info-item.small {
		flex: 1;
	}

	.label {
		font-size: 10px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.value {
		font-size: 12px;
		color: var(--text-primary);
	}

	code.value {
		font-family: 'SF Mono', 'Fira Code', monospace;
		padding: 6px 8px;
		background: var(--bg-tertiary);
		border-radius: 4px;
		word-break: break-all;
	}

	.empty-state {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px;
		background: var(--bg-tertiary);
		border-radius: 6px;
		font-size: 12px;
		color: var(--text-muted);
	}

	.empty-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		background: var(--bg-hover);
		border-radius: 50%;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
	}
</style>
