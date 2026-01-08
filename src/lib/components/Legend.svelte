<script lang="ts">
	const legendItems = [
		{ label: 'A', color: '#0d99ff' },
		{ label: 'B', color: '#14ae5c' },
		{ label: 'C', color: '#f5a623' },
		{ label: 'D', color: '#a855f7' },
		{ label: 'AND', color: '#14ae5c' },
		{ label: 'OR', color: '#f5a623' },
		{ label: 'OUT', color: '#ff00ff' }
	];
</script>

<div class="legend-panel">
	<div class="legend-header">
		<span class="legend-title">Wire Colors</span>
	</div>
	<div class="legend-grid">
		{#each legendItems as item}
			<div class="legend-item">
				<div class="legend-color" style="background: {item.color}"></div>
				<span class="legend-label">{item.label}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.legend-panel {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.legend-header {
		display: flex;
		align-items: center;
	}

	.legend-title {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.legend-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		background: var(--bg-tertiary);
		border-radius: 4px;
	}

	.legend-color {
		width: 10px;
		height: 10px;
		border-radius: 2px;
	}

	.legend-label {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-secondary);
	}
</style>
