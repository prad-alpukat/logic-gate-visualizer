<script lang="ts">
	import { tick } from 'svelte';
	import type { ParsedExpression, TruthTableRow } from '$lib/types';
	import { generateTruthTable } from '$lib/utils/truthTable';

	interface Props {
		parsedExpression: ParsedExpression | null;
		onuseformula?: (formula: string) => void;
	}

	let { parsedExpression, onuseformula }: Props = $props();

	const defaultVariables = ['A', 'B', 'C'];
	let editableOutputs = $state<boolean[]>(new Array(8).fill(false));

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

	let displayTable = $derived(parsedExpression ? generateTruthTable(parsedExpression) : editableTable);
	let displayVariables = $derived(parsedExpression ? parsedExpression.variables : defaultVariables);

	function toggleOutput(index: number) {
		if (!parsedExpression) {
			editableOutputs[index] = !editableOutputs[index];
		}
	}

	function generateSOP(table: TruthTableRow[], variables: string[]): string {
		const minterms = table
			.filter((row) => row.output)
			.map((row) => variables.map((v) => (row.values[v] ? v : v + "'")).join(''));
		if (minterms.length === 0) return '0';
		if (minterms.length === table.length) return '1';
		return minterms.join(' + ');
	}

	function generatePOS(table: TruthTableRow[], variables: string[]): string {
		const maxterms = table
			.filter((row) => !row.output)
			.map((row) => `(${variables.map((v) => (row.values[v] ? v + "'" : v)).join(' + ')})`);
		if (maxterms.length === 0) return '1';
		if (maxterms.length === table.length) return '0';
		return maxterms.join(' · ');
	}

	function getMintermNotation(table: TruthTableRow[]): string {
		const indices = table.map((row, i) => ({ row, i })).filter(({ row }) => row.output).map(({ i }) => i);
		return indices.length ? `Σm(${indices.join(',')})` : 'Σm()';
	}

	function getMaxtermNotation(table: TruthTableRow[]): string {
		const indices = table.map((row, i) => ({ row, i })).filter(({ row }) => !row.output).map(({ i }) => i);
		return indices.length ? `ΠM(${indices.join(',')})` : 'ΠM()';
	}

	let sopFormula = $derived(displayTable.length > 0 ? generateSOP(displayTable, displayVariables) : '');
	let posFormula = $derived(displayTable.length > 0 ? generatePOS(displayTable, displayVariables) : '');
	let mintermNotation = $derived(displayTable.length > 0 ? getMintermNotation(displayTable) : '');
	let maxtermNotation = $derived(displayTable.length > 0 ? getMaxtermNotation(displayTable) : '');
	let isEditable = $derived(!parsedExpression);
	let showAlert = $state(false);
	let alertMessage = $state('');

	function handleUseFormula(formula: string) {
		if (!onuseformula || !formula) return;
		const f = String(formula);
		onuseformula(f);

		// Show alert
		alertMessage = 'Rumus berhasil dimasukkan. Klik tombol Run untuk generate rangkaian.';
		showAlert = true;
		setTimeout(() => {
			showAlert = false;
		}, 3000);
	}
</script>

<div class="truth-table-panel">
	{#if showAlert}
		<div class="alert">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M20 6L9 17l-5-5"/>
			</svg>
			{alertMessage}
		</div>
	{/if}

	{#if isEditable}
		<div class="edit-hint">
			<span>Click Y to toggle</span>
			<div class="edit-actions">
				<button onclick={() => (editableOutputs = new Array(8).fill(false))}>Clear</button>
				<button onclick={() => (editableOutputs = new Array(8).fill(true))}>Fill</button>
			</div>
		</div>
	{/if}

	<table class="table">
		<thead>
			<tr>
				<th class="idx">#</th>
				{#each displayVariables as v}
					<th>{v}</th>
				{/each}
				<th class="output">Y</th>
			</tr>
		</thead>
		<tbody>
			{#each displayTable as row, i}
				<tr>
					<td class="idx">{i}</td>
					{#each displayVariables as v}
						<td>{row.values[v] ? '1' : '0'}</td>
					{/each}
					<td
						class="output"
						class:one={row.output}
						class:clickable={isEditable}
						onclick={() => toggleOutput(i)}
						onkeydown={(e) => e.key === 'Enter' && toggleOutput(i)}
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
		<div class="formula-group">
			<div class="formula-header">
				<span class="badge sop">SOP</span>
				<span class="notation">{mintermNotation}</span>
				{#if sopFormula && sopFormula !== '0' && sopFormula !== '1' && onuseformula}
					<button class="use-btn" onclick={() => handleUseFormula(sopFormula)} title="Use SOP formula">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7"/>
						</svg>
					</button>
				{/if}
			</div>
			<code class="expression">{sopFormula}</code>
		</div>

		<div class="formula-group">
			<div class="formula-header">
				<span class="badge pos">POS</span>
				<span class="notation">{maxtermNotation}</span>
				{#if posFormula && posFormula !== '0' && posFormula !== '1' && onuseformula}
					<button class="use-btn" onclick={() => handleUseFormula(posFormula)} title="Use POS formula">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7"/>
						</svg>
					</button>
				{/if}
			</div>
			<code class="expression">{posFormula}</code>
		</div>
	</div>
</div>

<style>
	.truth-table-panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.alert {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: rgba(20, 174, 92, 0.15);
		border: 1px solid var(--success);
		border-radius: 6px;
		font-size: 12px;
		color: var(--success);
		animation: slideIn 0.2s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.edit-hint {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 10px;
		background: var(--bg-tertiary);
		border-radius: 6px;
		font-size: 11px;
		color: var(--text-muted);
	}

	.edit-actions {
		display: flex;
		gap: 4px;
	}

	.edit-actions button {
		padding: 4px 8px;
		background: var(--bg-hover);
		border: none;
		border-radius: 4px;
		color: var(--text-secondary);
		font-size: 11px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.edit-actions button:hover {
		background: var(--accent);
		color: white;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'SF Mono', monospace;
		font-size: 12px;
	}

	.table th,
	.table td {
		padding: 8px 6px;
		text-align: center;
		border-bottom: 1px solid var(--border-color);
	}

	.table th {
		font-weight: 500;
		color: var(--text-secondary);
		font-size: 11px;
		text-transform: uppercase;
	}

	.table td {
		color: var(--text-primary);
	}

	.table .idx {
		color: var(--text-muted);
		width: 24px;
	}

	.table .output {
		font-weight: 600;
	}

	.table .output.one {
		color: var(--success);
	}

	.table .output:not(.one) {
		color: var(--text-muted);
	}

	.table .output.clickable {
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.1s;
	}

	.table .output.clickable:hover {
		background: var(--bg-hover);
	}

	.table tbody tr:hover {
		background: var(--bg-tertiary);
	}

	.formulas {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 4px;
	}

	.formula-group {
		padding: 10px;
		background: var(--bg-tertiary);
		border-radius: 6px;
	}

	.formula-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.badge {
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
	}

	.badge.sop {
		background: rgba(13, 153, 255, 0.15);
		color: var(--accent);
	}

	.badge.pos {
		background: rgba(242, 72, 34, 0.15);
		color: var(--error);
	}

	.notation {
		font-family: 'SF Mono', monospace;
		font-size: 11px;
		color: var(--text-muted);
		flex: 1;
	}

	.use-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		background: var(--bg-hover);
		border: none;
		border-radius: 4px;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s;
		margin-left: auto;
	}

	.use-btn:hover {
		background: var(--accent);
		color: white;
	}

	.expression {
		display: block;
		font-family: 'SF Mono', monospace;
		font-size: 12px;
		color: var(--text-primary);
		word-break: break-all;
		line-height: 1.5;
	}
</style>
