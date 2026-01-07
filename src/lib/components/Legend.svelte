<script lang="ts">
	const legendItems = [
		{ label: 'Variabel A', colorClass: 'color-var-a' },
		{ label: 'Variabel B', colorClass: 'color-var-b' },
		{ label: 'Variabel C', colorClass: 'color-var-c' },
		{ label: 'AND Gate', colorClass: 'color-and' },
		{ label: 'OR Gate', colorClass: 'color-or' },
		{ label: 'Output', colorClass: 'color-output' }
	];
</script>

<div class="info-card">
	<h3>Legenda</h3>
	<div class="legend">
		{#each legendItems as item}
			<div class="legend-item">
				<div class="legend-color {item.colorClass}"></div>
				{item.label}
			</div>
		{/each}
	</div>
	<div class="hint">Hover mouse di atas kabel untuk melihat koneksi dengan lebih jelas</div>
</div>

<style>
	.info-card {
		background: #0f3460;
		border-radius: 15px;
		padding: 20px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
		margin-top: 20px;
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

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
		margin-top: 10px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.9rem;
	}

	.legend-color {
		width: 20px;
		height: 20px;
		border-radius: 4px;
	}

	.color-var-a {
		background: #00d9ff;
	}
	.color-var-b {
		background: #00ff88;
	}
	.color-var-c {
		background: #ffaa00;
	}
	.color-and {
		background: #00ff88;
	}
	.color-or {
		background: #ffaa00;
	}
	.color-output {
		background: #ff00ff;
	}

	.hint {
		background: rgba(0, 217, 255, 0.1);
		border: 1px solid #00d9ff;
		border-radius: 8px;
		padding: 10px 15px;
		margin-top: 15px;
		font-size: 0.85rem;
		color: #aaa;
	}
</style>
