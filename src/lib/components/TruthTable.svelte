<script lang="ts">
	import type { ParsedExpression, TruthTableRow } from '$lib/types';
	import { generateTruthTable } from '$lib/utils/truthTable';

	interface Props {
		parsedExpression: ParsedExpression | null;
	}

	let { parsedExpression }: Props = $props();

	let truthTable = $derived(parsedExpression ? generateTruthTable(parsedExpression) : []);

	// Generate SOP (Sum of Products) from minterms (where output = 1)
	function generateSOP(table: TruthTableRow[], variables: string[]): string {
		const minterms = table
			.map((row, index) => ({ row, index }))
			.filter(({ row }) => row.output)
			.map(({ row, index }) => {
				const term = variables
					.map((v) => (row.values[v] ? v : v + "'"))
					.join('');
				return { term, index };
			});

		if (minterms.length === 0) return '0';
		if (minterms.length === table.length) return '1';

		return minterms.map((m) => m.term).join(' + ');
	}

	// Generate POS (Product of Sums) from maxterms (where output = 0)
	function generatePOS(table: TruthTableRow[], variables: string[]): string {
		const maxterms = table
			.map((row, index) => ({ row, index }))
			.filter(({ row }) => !row.output)
			.map(({ row, index }) => {
				const term = variables
					.map((v) => (row.values[v] ? v + "'" : v))
					.join(' + ');
				return { term: `(${term})`, index };
			});

		if (maxterms.length === 0) return '1';
		if (maxterms.length === table.length) return '0';

		return maxterms.map((m) => m.term).join(' · ');
	}

	// Generate minterm notation (e.g., Σm(0,3,5))
	function getMintermNotation(table: TruthTableRow[]): string {
		const indices = table
			.map((row, index) => ({ row, index }))
			.filter(({ row }) => row.output)
			.map(({ index }) => index);

		if (indices.length === 0) return 'Σm()';
		return `Σm(${indices.join(', ')})`;
	}

	// Generate maxterm notation (e.g., ΠM(1,2,4))
	function getMaxtermNotation(table: TruthTableRow[]): string {
		const indices = table
			.map((row, index) => ({ row, index }))
			.filter(({ row }) => !row.output)
			.map(({ index }) => index);

		if (indices.length === 0) return 'ΠM()';
		return `ΠM(${indices.join(', ')})`;
	}

	let sopFormula = $derived(
		parsedExpression && truthTable.length > 0
			? generateSOP(truthTable, parsedExpression.variables)
			: ''
	);

	let posFormula = $derived(
		parsedExpression && truthTable.length > 0
			? generatePOS(truthTable, parsedExpression.variables)
			: ''
	);

	let mintermNotation = $derived(truthTable.length > 0 ? getMintermNotation(truthTable) : '');
	let maxtermNotation = $derived(truthTable.length > 0 ? getMaxtermNotation(truthTable) : '');
</script>

<div class="info-card">
	<h3>Tabel Kebenaran</h3>
	<div class="truth-table-container">
		{#if parsedExpression && truthTable.length > 0}
			<table class="truth-table">
				<thead>
					<tr>
						<th class="row-num">#</th>
						{#each parsedExpression.variables as variable}
							<th>{variable}</th>
						{/each}
						<th>Y</th>
					</tr>
				</thead>
				<tbody>
					{#each truthTable as row, index}
						<tr>
							<td class="row-num">{index}</td>
							{#each parsedExpression.variables as variable}
								<td>{row.values[variable] ? '1' : '0'}</td>
							{/each}
							<td class={row.output ? 'output-1' : 'output-0'}>
								{row.output ? '1' : '0'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<div class="formulas">
				<h4>Rumus dari Tabel Kebenaran</h4>

				<div class="formula-section">
					<div class="formula-label sop-label">SOP (Sum of Products)</div>
					<div class="formula-notation">{mintermNotation}</div>
					<div class="formula-expression">{sopFormula}</div>
				</div>

				<div class="formula-section">
					<div class="formula-label pos-label">POS (Product of Sums)</div>
					<div class="formula-notation">{maxtermNotation}</div>
					<div class="formula-expression">{posFormula}</div>
				</div>
			</div>
		{:else}
			<p class="placeholder">Tabel kebenaran akan muncul di sini.</p>
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

	.truth-table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'Courier New', monospace;
	}

	.truth-table th,
	.truth-table td {
		padding: 8px 12px;
		text-align: center;
		border: 1px solid #1a1a2e;
	}

	.truth-table th {
		background: #1a1a2e;
		color: #00d9ff;
	}

	.truth-table tr:nth-child(even) {
		background: rgba(0, 0, 0, 0.2);
	}

	.truth-table .output-1 {
		color: #00ff88;
		font-weight: bold;
	}

	.truth-table .output-0 {
		color: #ff6b6b;
	}

	.truth-table .row-num {
		color: #666;
		font-size: 0.8rem;
		width: 30px;
	}

	.formulas {
		margin-top: 20px;
		padding-top: 15px;
		border-top: 1px solid #1a1a2e;
	}

	.formulas h4 {
		color: #00d9ff;
		margin-bottom: 15px;
		font-size: 0.95rem;
	}

	.formula-section {
		background: #1a1a2e;
		border-radius: 8px;
		padding: 12px 15px;
		margin-bottom: 10px;
	}

	.formula-label {
		display: inline-block;
		padding: 3px 10px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: bold;
		margin-bottom: 8px;
	}

	.sop-label {
		background: #00d9ff;
		color: #1a1a2e;
	}

	.pos-label {
		background: #e94560;
		color: #fff;
	}

	.formula-notation {
		font-family: 'Courier New', monospace;
		color: #888;
		font-size: 0.85rem;
		margin-bottom: 5px;
	}

	.formula-expression {
		font-family: 'Courier New', monospace;
		color: #fff;
		font-size: 0.95rem;
		word-break: break-all;
		line-height: 1.5;
	}
</style>
