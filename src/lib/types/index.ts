export interface Point {
	x: number;
	y: number;
}

export interface Literal {
	variable: string;
	negated: boolean;
}

export interface ParsedExpression {
	isPOS: boolean;
	variables: string[];
	terms: Literal[][];
}

export interface TruthTableRow {
	values: Record<string, boolean>;
	output: boolean;
}

export interface WirePath {
	points: Point[];
	color: string;
	label: string;
	lineWidth: number;
	id: string | null;
}

export interface GateOutput {
	x: number;
	y: number;
}

export interface GateResult {
	inputs: Point[];
	output: Point;
	width: number;
	height: number;
}

export interface NotGateResult {
	input: Point;
	output: Point;
}
