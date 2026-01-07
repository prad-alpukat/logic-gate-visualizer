export const VAR_COLORS: Record<string, string> = {
	A: '#00d9ff',
	B: '#00ff88',
	C: '#ffaa00',
	D: '#ff6b6b',
	E: '#ff00ff',
	F: '#00ffff'
};

export const COLORS = {
	wire: '#00d9ff',
	wireActive: '#ffffff',
	input: '#00d9ff',
	not: '#ff6b6b',
	and: '#00ff88',
	or: '#ffaa00',
	output: '#ff00ff',
	text: '#ffffff',
	gateFill: '#1a1a2e',
	gateStroke: '#ffffff',
	dimmed: 'rgba(100, 100, 100, 0.3)'
};

export function getVarColor(variable: string): string {
	return VAR_COLORS[variable] || '#888888';
}
