<script lang="ts">
	import type { ParsedExpression, TruthTableRow } from '$lib/types';
	import { generateTruthTable } from '$lib/utils/truthTable';

	interface Props {
		parsedExpression: ParsedExpression | null;
		onformulachange?: (formula: string) => void;
	}

	let { parsedExpression, onformulachange }: Props = $props();

	// Default 3 variables for interactive mode
	const defaultVariables = ['A', 'B', 'C'];

	// Editable truth table state
	let editableOutputs = $state<boolean[]>(new Array(8).fill(false));

	// Generate editable table rows
	let editableTable = $derived.by(() => {
		const rows: TruthTableRow[] = [];
		const numRows = Math.pow(2, defaultVariables.length);

		for (let i = 0; i < numRows; i++) {
			const values: Record<string, boolean> = {};
			defaultVariables.forEach((v, idx) => {
				values[v] = Boolean((i >> (defaultVariables.length - 1 - idx)) & 1);
			});
			rows.push({ values, output: editableOutputs[i] });
		}
		return rows;
	});

	// Use parsed expression table if available, otherwise use editable
	let displayTable = $derived(parsedExpression ? generateTruthTable(parsedExpression) : editableTable);
	let displayVariables = $derived(parsedExpression ? parsedExpression.variables : defaultVariables);

	// Toggle output for editable mode
	function toggleOutput(index: number) {
		if (!parsedExpression) {
			editableOutputs[index] = !editableOutputs[index];
			// Notify parent of formula change
			if (onformulachange) {
				onformulachange(sopFormula);
			}
		}
	}

	// Generate SOP (Sum of Products) from minterms (where output = 1)
	function generateSOP(table: TruthTableRow[], variables: string[]): string {
		const minterms = table
			.map((row, index) => ({ row, index }))
			.filter(({ row }) => row.output)
			.map(({ row }) => {
				const term = variables.map((v) => (row.values[v] ? v : v + "'")).join('');
				return term;
			});

		if (minterms.length === 0) return '0';
		if (minterms.length === table.length) return '1';

		return minterms.join(' + ');
	}

	// Generate POS (Product of Sums) from maxterms (where output = 0)
	function generatePOS(table: TruthTableRow[], variables: string[]): string {
		const maxterms = table
			.map((row, index) => ({ row, index }))
			.filter(({ row }) => !row.output)
			.map(({ row }) => {
				const term = variables.map((v) => (row.values[v] ? v + "'" : v)).join(' + ');
				return `(${term})`;
			});

		if (maxterms.length === 0) return '1';
		if (maxterms.length === table.length) return '0';

		return maxterms.join(' · ');
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

	// Clear all outputs
	function clearAll() {
		editableOutputs = new Array(8).fill(false);
	}

	// Set all outputs
	function setAll() {
		editableOutputs = new Array(8).fill(true);
	}

	let sopFormula = $derived(
		displayTable.length > 0 ? generateSOP(displayTable, displayVariables) : ''
	);

	let posFormula = $derived(
		displayTable.length > 0 ? generatePOS(displayTable, displayVariables) : ''
	);

	let mintermNotation = $derived(displayTable.length > 0 ? getMintermNotation(displayTable) : '');
	let maxtermNotation = $derived(displayTable.length > 0 ? getMaxtermNotation(displayTable) : '');

	let isEditable = $derived(!parsedExpression);
</script>

<div class="info-card">
	<h3>Tabel Kebenaran</h3>

	{#if isEditable}
		<div class="edit-controls">
			<span class="edit-hint">Klik pada kolom Y untuk toggle nilai</span>
			<div class="edit-buttons">
				<button class="edit-btn" onclick={clearAll}>Reset 0</button>
				<button class="edit-btn" onclick={setAll}>Set 1</button>
			</div>
		</div>
	{/if}

	<div class="truth-table-container">
		<table class="truth-table">
			<thead>
				<tr>
					<th class="row-num">#</th>
					{#each displayVariables as variable}
						<th>{variable}</th>
					{/each}
					<th class:clickable={isEditable}>Y</th>
				</tr>
			</thead>
			<tbody>
				{#each displayTable as row, index}
					<tr>
						<td class="row-num">{index}</td>
						{#each displayVariables as variable}
							<td>{row.values[variable] ? '1' : '0'}</td>
						{/each}
						<td
							class={row.output ? 'output-1' : 'output-0'}
							class:clickable={isEditable}
							onclick={() => toggleOutput(index)}
							onkeydown={(e) => e.key === 'Enter' && toggleOutput(index)}
							role={isEditable ? 'button' : undefined}
							tabindex={isEditable ? 0 : undefined}
						>
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

	.edit-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
		padding: 10px 15px;
		background: rgba(0, 217, 255, 0.1);
		border: 1px solid rgba(0, 217, 255, 0.3);
		border-radius: 8px;
	}

	.edit-hint {
		color: #00d9ff;
		font-size: 0.85rem;
	}

	.edit-buttons {
		display: flex;
		gap: 8px;
	}

	.edit-btn {
		background: #1a1a2e;
		color: #00d9ff;
		border: 1px solid #00d9ff;
		padding: 5px 12px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s;
	}

	.edit-btn:hover {
		background: #00d9ff;
		color: #1a1a2e;
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

	.truth-table th.clickable {
		background: linear-gradient(135deg, #1a1a2e, #2a2a4e);
		cursor: pointer;
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

	.truth-table td.clickable {
		cursor: pointer;
		transition: all 0.15s;
		user-select: none;
	}

	.truth-table td.clickable:hover {
		background: rgba(0, 217, 255, 0.2);
		transform: scale(1.1);
	}

	.truth-table td.clickable.output-1:hover {
		background: rgba(0, 255, 136, 0.3);
		box-shadow: inset 0 0 10px rgba(0, 255, 136, 0.3);
	}

	.truth-table td.clickable.output-0:hover {
		background: rgba(255, 107, 107, 0.3);
		box-shadow: inset 0 0 10px rgba(255, 107, 107, 0.3);
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
