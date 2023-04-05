import type { Performance } from "@/models/configuration";

// TODO: use common interpolateTable() code from ATLC.ts
function interpolateFromData(performanceInfo: Performance, dragIndex: number, feathered: boolean, tableName: keyof Performance, rowKey: string, rowValue: string, compareValue: number): number | null {
	let dragIndexWithProp = dragIndex + (feathered ? performanceInfo.Propeller.feathered : performanceInfo.Propeller.unfeathered);

	let dragIndices = Object.keys(performanceInfo[tableName]).map(key => parseInt(key));
	let topIndex = dragIndices.findIndex(value => value >= dragIndexWithProp);
	if (topIndex === -1) {
		return null; // Value too big
	}
	let bottomIndex = topIndex - 1;
	if (dragIndexWithProp === dragIndices[topIndex]) {
		bottomIndex = topIndex;
	}
	if (bottomIndex < 0) {
		return null; // Value too small
	}

	// TODO: returns NaN when should return 0 for n, inMin, and inMax being same
	function scale(n: number, inMin: number, inMax: number, outMin: number = 0, outMax: number = 1): number {
		return (n - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}

	let bottomDragIndex = dragIndices[bottomIndex];
	let topDragIndex = dragIndices[topIndex];
	let dragIndexRatio = scale(dragIndexWithProp, bottomDragIndex, topDragIndex);

	let bottomRow: any[] = Object.values(performanceInfo[tableName])[bottomIndex];
	let topRow: any[] = Object.values(performanceInfo[tableName])[topIndex];
	topIndex = topRow.findIndex(value => value[rowKey] >= compareValue);
	if (topIndex === -1) {
		return null; // Value too big
	}
	bottomIndex = topIndex - 1;
	if (compareValue === topRow[topIndex][rowKey]) {
		bottomIndex = topIndex;
	}
	if (bottomIndex < 0) {
		return null; // Value too small
	}

	let weightRatio = scale(compareValue, bottomRow[bottomIndex][rowKey], bottomRow[topIndex][rowKey]);

	let speed1 = bottomRow[bottomIndex][rowValue];
	let speed2 = bottomRow[topIndex][rowValue];
	let speed3 = topRow[bottomIndex][rowValue];
	let speed4 = topRow[topIndex][rowValue];

	let dragWeightedSpeed1 = isNaN(dragIndexRatio) ? speed1 : speed1 * (1 - dragIndexRatio) + speed3 * dragIndexRatio;
	let dragWeightedSpeed2 = isNaN(dragIndexRatio) ? speed2 : speed2 * (1 - dragIndexRatio) + speed4 * dragIndexRatio;
	let speed = isNaN(weightRatio) ? dragWeightedSpeed1 : dragWeightedSpeed1 * (1 - weightRatio) + dragWeightedSpeed2 * weightRatio;

	return speed;
}

export function bestGlideSpeed(performanceInfo: Performance, dragIndex: number, feathered: boolean, weight: number): number | null {
	return interpolateFromData(performanceInfo, dragIndex, feathered, "Glide Speed", "weight", "speed", weight);
}

export function bestGlideRange(performanceInfo: Performance, dragIndex: number, feathered: boolean, altitude: number): number | null {
	return interpolateFromData(performanceInfo, dragIndex, feathered, "Glide Range", "altitude", "range", altitude);
}
