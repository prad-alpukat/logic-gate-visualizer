<script lang="ts">
	interface Props {
		onselect: (expr: string) => void;
	}

	let { onselect }: Props = $props();

	const examples = [
		{ label: "A'B'C' + AB'C + ABC", value: "A'B'C' + AB'C + ABC" },
		{ label: "AB + A'B'", value: "AB + A'B'" },
		{ label: "A'B + AB' (XOR)", value: "A'B + AB'" },
		{ label: "(A+B+C')·(A+B'+C)·(A'+B+C)", value: "(A + B + C') · (A + B' + C) · (A' + B + C)" },
		{ label: "(A + B) · (A' + B')", value: "(A + B) · (A' + B')" },
		{ label: "ABC + A'BC + AB'C", value: "ABC + A'BC + AB'C" },
		{
			label: 'POS 5 Term',
			value: "(A + B + C') · (A + B' + C) · (A + B' + C') · (A' + B + C) · (A' + B' + C)"
		}
	];
</script>

<div class="examples">
	<p>Contoh ekspresi (klik untuk mencoba):</p>
	<div class="example-buttons">
		{#each examples as example}
			<button class="example-btn" onclick={() => onselect(example.value)}>
				{example.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.examples {
		margin-top: 15px;
		padding-top: 15px;
		border-top: 1px solid #1a1a2e;
	}

	.examples p {
		color: #888;
		margin-bottom: 10px;
		font-size: 0.9rem;
	}

	.example-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.example-btn {
		background: #1a1a2e;
		color: #00d9ff;
		border: 1px solid #00d9ff;
		padding: 8px 15px;
		border-radius: 5px;
		cursor: pointer;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		transition: all 0.3s;
	}

	.example-btn:hover {
		background: #00d9ff;
		color: #1a1a2e;
	}
</style>
