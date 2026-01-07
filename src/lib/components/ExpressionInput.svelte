<script lang="ts">
	import ExampleButtons from './ExampleButtons.svelte';

	interface Props {
		value: string;
		onchange: (value: string) => void;
		onvisualize: () => void;
		onreset: () => void;
	}

	let { value, onchange, onvisualize, onreset }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onchange(target.value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			onvisualize();
		}
	}

	function handleExample(expr: string) {
		onchange(expr);
		onvisualize();
	}
</script>

<div class="input-section">
	<div class="input-group">
		<label for="expression-input">Ekspresi:</label>
		<input
			type="text"
			id="expression-input"
			{value}
			oninput={handleInput}
			onkeydown={handleKeydown}
			placeholder="Contoh: A'B'C' + AB'C + ABC atau (A + B + C') · (A + B' + C)"
		/>
		<button class="btn btn-primary" onclick={onvisualize}>Visualisasi</button>
		<button class="btn btn-secondary" onclick={onreset}>Reset</button>
	</div>
	<ExampleButtons onselect={handleExample} />
</div>

<style>
	.input-section {
		background: #0f3460;
		border-radius: 15px;
		padding: 25px;
		margin-bottom: 20px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	.input-group {
		display: flex;
		gap: 15px;
		flex-wrap: wrap;
		align-items: center;
	}

	.input-group label {
		font-weight: bold;
		color: #00d9ff;
		min-width: 100px;
	}

	.input-group input {
		flex: 1;
		min-width: 300px;
		padding: 15px 20px;
		border: 2px solid #1a1a2e;
		border-radius: 10px;
		background: #1a1a2e;
		color: #fff;
		font-size: 1.1rem;
		font-family: 'Courier New', monospace;
		transition: all 0.3s;
	}

	.input-group input:focus {
		outline: none;
		border-color: #00d9ff;
		box-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
	}

	.input-group input::placeholder {
		color: #555;
	}

	.btn {
		padding: 15px 30px;
		border: none;
		border-radius: 10px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #00d9ff, #0099cc);
		color: #1a1a2e;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 20px rgba(0, 217, 255, 0.4);
	}

	.btn-secondary {
		background: #e94560;
		color: #fff;
	}

	.btn-secondary:hover {
		background: #ff6b6b;
	}

	@media (max-width: 768px) {
		.input-group {
			flex-direction: column;
		}

		.input-group input {
			min-width: 100%;
		}
	}
</style>
