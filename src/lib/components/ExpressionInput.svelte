<script lang="ts">
	interface Props {
		value: string;
		onchange: (value: string) => void;
		onvisualize: (expr?: string) => void;
		onreset: () => void;
	}

	let { value, onchange, onvisualize, onreset }: Props = $props();
	let showExamples = $state(false);

	const examples = [
		"A'B'C' + AB'C + ABC",
		"AB + A'C + BC",
		"(A + B)(A' + C)",
		"(A + B + C')(A + B' + C)(A' + B + C)"
	];

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onchange(target.value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			onvisualize();
			showExamples = false;
		}
		if (e.key === 'Escape') {
			showExamples = false;
		}
	}

	function handleExample(expr: string) {
		onvisualize(expr);
		showExamples = false;
	}
</script>

<div class="search-bar">
	<div class="input-container">
		<svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
		</svg>
		<input
			type="text"
			{value}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={() => (showExamples = true)}
			placeholder="Enter boolean expression..."
		/>
		{#if value}
			<button class="clear-btn" onclick={onreset} title="Clear">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"/>
					<line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		{/if}
	</div>

	<button class="run-btn" onclick={() => onvisualize()}>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
			<polygon points="5 3 19 12 5 21 5 3"/>
		</svg>
		Run
	</button>

	{#if showExamples}
		<button class="backdrop" onclick={() => (showExamples = false)}></button>
		<div class="dropdown">
			<div class="dropdown-header">Examples</div>
			{#each examples as expr}
				<button class="dropdown-item" onclick={() => handleExample(expr)}>
					<code>{expr}</code>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.search-bar {
		display: flex;
		gap: 8px;
		position: relative;
	}

	.input-container {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		color: var(--text-muted);
		pointer-events: none;
	}

	input {
		width: 100%;
		height: 32px;
		padding: 0 32px 0 34px;
		background: var(--bg-tertiary);
		border: 1px solid transparent;
		border-radius: 6px;
		color: var(--text-primary);
		font-size: 13px;
		font-family: 'SF Mono', 'Fira Code', monospace;
		transition: all 0.15s;
	}

	input:hover {
		border-color: var(--border-color);
	}

	input:focus {
		outline: none;
		border-color: var(--accent);
		background: var(--bg-secondary);
	}

	input::placeholder {
		color: var(--text-muted);
	}

	.clear-btn {
		position: absolute;
		right: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		background: transparent;
		border: none;
		border-radius: 4px;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.15s;
	}

	.clear-btn:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.run-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 32px;
		padding: 0 12px;
		background: var(--accent);
		border: none;
		border-radius: 6px;
		color: white;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.run-btn:hover {
		background: var(--accent-hover);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background: transparent;
		border: none;
		z-index: 999;
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 60px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 4px;
		z-index: 1000;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}

	.dropdown-header {
		padding: 8px 10px 6px;
		font-size: 11px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.dropdown-item {
		display: block;
		width: 100%;
		padding: 8px 10px;
		background: transparent;
		border: none;
		border-radius: 4px;
		color: var(--text-primary);
		font-size: 13px;
		text-align: left;
		cursor: pointer;
		transition: background 0.1s;
	}

	.dropdown-item:hover {
		background: var(--bg-hover);
	}

	.dropdown-item code {
		font-family: 'SF Mono', 'Fira Code', monospace;
		color: var(--accent);
	}

	@media (max-width: 500px) {
		.run-btn span {
			display: none;
		}
	}
</style>
