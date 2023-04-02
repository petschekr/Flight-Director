/**
 * Calculate pressure altitude
 * @param fieldElevation Elevation of the airfield in feet
 * @param altimeter Current altimeter setting in inches of mercury (e.g. 29.92)
 * @returns The pressure altitude of the field in feet
 */
export function pressureAltitude(fieldElevation: number, altimeter: number): number {
	return Math.round(fieldElevation + 1000 * (29.92 - altimeter));
}

/**
 * Calculate density altitude
 * @param fieldElevation Elevation of the airfield in feet
 * @param altimeter Current altimeter setting in inches of mercury (e.g. 29.92)
 * @param oat Outside air temperature in degrees Celsius
 * @returns The density altitude of the field in feet
 */
export function densityAltitude(fieldElevation: number, altimeter: number, oat: number) {
	return Math.round(pressureAltitude(fieldElevation, altimeter) + 120 * (oat - ISA(fieldElevation)));
}

/**
 * Convert Celsius to Fahrenheit
 * @param c Degrees Celsius
 * @returns Degrees Fahrenheit
 */
export function cToF(c: number): number {
	return c * (9 / 5) + 32;
}

/**
 * Calculate ISA temperature
 * @param fieldElevation Elevation of the airfield in feet
 * @returns ISA temperature in Celsius at the airfield
 */
export function ISA(fieldElevation: number): number {
	return 15 - (2 * (fieldElevation / 1000)); // 2 deg C lapse rate per 1000 ft
}

/**
 * Calculates difference from International Standard Atmosphere (ISA)
 * ISA is defined as 15 degrees C at 0 ft with a -2 degrees per 1,000 feet lapse rate
 * Used in the 1Q-9(M)A-1-1 performance charts
 * @param fieldElevation Elevation of the airfield in feet
 * @param oat Outside air temperature in degrees *Celsius*
 * @returns The difference from ISA in degrees *Fahrenheit*
 */
export function deltaISA_F(fieldElevation: number, oat: number): number {
	return cToF(oat) - cToF(ISA(fieldElevation));
}

/**
 * Derives a ratio for how far an input is between two boundaries
 * @param n Input number
 * @param inMin Minimum value of the input number
 * @param inMax Maximum value of the input number
 * @param outMin Minimum value of the output (defaults to 0)
 * @param outMax Maximum value of the output (defaults to 1)
 * @returns The scaled input number
 */
function scale(n: number, inMin: number, inMax: number, outMin: number = 0, outMax: number = 1): number {
	if (inMin === inMax) return 0; // Instead of NaN when all inputs are the same
	return (n - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Calculates a polynomial expression
 * @param polynomial Array of polynomial coefficients in decending order (e.g. ax^2 + bx + c -> [a, b, c])
 * @param x The input variable used to solve the polynomial expression
 * @returns The polynomial solution for x
 */
function calculatePolynomial(polynomial: number[], x: number): number {
	let result = 0;
	for (let [index, coefficient] of polynomial.entries()) {
		result += coefficient * Math.pow(x, polynomial.length - 1 - index);
	}
	return result;
}

/**
 * Acceleration check time to 50 KIAS (see -1-1 for more information)
 * For 4-blade ATLC takeoffs only
 * @param weight Aircraft weight in pounds
 * @param pressureAltitude Pressure altitude in feet
 * @param deltaISA_F Difference from ISA temperature in degrees F
 * @returns The maximum number of seconds required to reach 50 KIAS on takeoff
 */
export function accelCheckTime(weight: number, pressureAltitude: number, deltaISA_F: number): number | null {
	type ISA_Increments = "0" | "30" | "40" | "50" | "60" | "70";
	type PA_Increments = "0" | "2500" | "5000" | "10000";
	const equations: {
		[ISA in ISA_Increments]: {
			// a, b, c where ax^2 + bx + c, null if no data in -1-1
			[PA in PA_Increments]: [number, number, number] | null;
		};
	} = {
		"0": {
			"0":     [-0.0345, 1.5117, 1.2078],
			"2500":  [0.0151, 0.7151, 4.8267],
			"5000":  [0.0022, 1.029, 4.0694],
			"10000": null,
		},
		"30": {
			"0":     [0.0005, 1.0227, 4.1919],
			"2500":  [0.011, 1.0035, 4.2151],
			"5000":  [-0.0006, 1.3397, 3.3828],
			"10000": null,
		},
		"40": {
			"0":     [0.0016, 1.2341, 3.6699],
			"2500":  [-0.0164, 1.5778, 2.7932],
			"5000":  [0.0086, 1.3242, 4.2301],
			"10000": null,
		},
		"50": {
			"0":     [0.0133, 1.121, 4.6135],
			"2500":  [-0.0024, 1.5486, 3.2933],
			"5000":  [0.0337, 1.0741, 5.8791],
			"10000": null,
		},
		"60": {
			"0":     [0.0039, 1.3815, 3.9481],
			"2500":  [0.0077, 1.4509, 4.2657],
			"5000":  [0.0084, 1.6237, 4.1017],
			"10000": null,
		},
		"70": {
			"0":     [0.002, 1.5448, 3.5954],
			"2500":  [-0.0024, 1.8179, 3.0678],
			"5000":  [0.0109, 1.7424, 4.1024],
			"10000": null,
		},
	};

	if (deltaISA_F < 0) {
		// If temperature is colder than ISA, return performance for standard ISA
		// This is safe because performance will always be better in colder temps
		deltaISA_F = 0;
	}
	if (pressureAltitude < 0) {
		// Same for pressure altitude
		pressureAltitude = 0;
	}

	return interpolateTable(equations, deltaISA_F, pressureAltitude, equation => {
		if (equation === null) return null;
		return calculatePolynomial(equation, weight / 1000);
	});
}

/**
 * Calculates the speed at which a positive pitch attitude should be established for takeoff
 * For 4-blade ATLC takeoffs only
 * @param weight Aircraft weight in pounds
 * @returns Rotation speed in knots
 */
export function rotationSpeed(weight: number): number {
	// 4-blade ATLC
	return Math.ceil(calculatePolynomial([-0.2039, 8.4759, 27.674], weight / 1000));
}

/**
 * Calculates the speed at which the aircraft will leave the ground after rotation during takeoff
 * For 4-blade ATLC takeoffs only
 * @param weight Aircraft weight in pounds
 * @returns Liftoff speed in knots
 */
export function liftoffSpeed(weight: number): number {
	// 4-blade ATLC
	return Math.ceil(calculatePolynomial([-0.1669, 7.0359, 46.411], weight / 1000));
}

/**
 * Calculates the speed at which the aircraft is committed to the takeoff and cannot safely stop on the runway
 * For 4-blade ATLC takeoffs only
 * @param weight Aircraft weight in pounds
 * @param pressureAltitude Pressure altitude in feet
 * @param deltaISA_F Difference from ISA temperature in degrees F
 * @param runwayLength Runway length in feet
 * @returns Refusal speed in knots
 */
export function refusalSpeed(weight: number, pressureAltitude: number, deltaISA_F: number, runwayLength: number): number | null {
	// TODO: chart data for ISA+60 and +70
	type ISA_Increments = "0" | "30" | "40" | "50"; // | "60" | "70";
	type Weight_Increments = "5000" | "6000" | "7000" | "8000" | "9000" | "10000" | "10500" | "11700";
	type Runway_Increments = "3000" | "4000" | "5000" | "6000" | "7000" | "8000" | "9000" | "10000" | "11000" | "12000";
	const equations1: {
		[ISA in ISA_Increments]: {
			[Weight in Weight_Increments]: [number, number] | null;
		};
	} = {
		"0": {
			"5000":  [-1.5971, 29.21],
			"6000":  [-1.5343, 23.819],
			"7000":  [-1.5143, 19.552],
			"8000":  [-1.4514, 16.395],
			"9000":  [-1.3743, 13.286],
			"10000": [-1.28, 10.967],
			"10500": [-1.1971, 9.8095],
			"11700": [-1.14, 7.6],
		},
		"30": {
			"5000":  [-1.6086, 29.871],
			"6000":  [-1.4829, 24.424],
			"7000":  [-1.3486, 19.871],
			"8000":  [-1.2171, 16.51],
			"9000":  [-1.1686, 14.138],
			"10000": [-1.2, 12.133],
			"10500": [-1.1114, 11.095],
			"11700": [-1.0914, 9.0286],
		},
		"40": {
			"5000":  [-1.5829, 27.557],
			"6000":  [-1.4571, 22.343],
			"7000":  [-1.34, 18.267],
			"8000":  [-1.1743, 14.786],
			"9000":  [-1.0743, 12.086],
			"10000": [-1.0286, 10.038],
			"10500": [-1.0514, 9.2952],
			"11700": [-0.9714, 7.0952],
		},
		"50": {
			"5000":  [-1.7114, 25.895],
			"6000":  [-1.4971, 20.676],
			"7000":  [-1.2514, 16.162],
			"8000":  [-1.22, 13.333],
			"9000":  [-1.1543, 10.752],
			"10000": [-1.1229, 8.7571],
			"10500": [-1.0771, 7.7095],
			"11700": [-1.0314, 5.9619],
		},
		"60": {
			"5000":  [-1.5143, 28.619],
			"6000":  [-1.3257, 23.114],
			"7000":  [-1.2371, 19.61],
			"8000":  [-1.2286, 16.905],
			"9000":  [-1.1343, 14.152],
			"10000": [-1.1086, 12.371],
			"10500": [-1.12, 11.533],
			"11700": [-1.0143, 9.419],
		},
		"70": {
			"5000":  [-1.4829, 26.49],
			"6000":  [-1.3543, 21.752],
			"7000":  [-1.2171, 18.076],
			"8000":  [-1.1629, 15.157],
			"9000":  [-1.0943, 12.819],
			"10000": [-1.0971, 11.01],
			"10500": [-1.0743, 10.152],
			"11700": [-0.9714, 8.0952],
		},
	};
	const equations2: {
		[ISA in ISA_Increments]: {
			[RunwayLength in Runway_Increments]: number[] | null;
		};
	} = {
		"0": {
			"3000":  [1, 50],
			"4000":  [-0.0040, 1.4783, 61.328],
			"5000":  [-0.0069, 1.8243, 70.818],
			"6000":  [-0.0161, 2.1552, 78.611],
			"7000":  [-0.0291, 2.4722, 85.237],
			"8000":  [-0.0419, 2.6816, 91.416],
			"9000":  [-0.0516, 2.8170, 96.874],
			"10000": [-0.0902, 3.1209, 101.34],
			"11000": [-0.0582, 2.7851, 106.28],
			"12000": [-0.0582, 2.7851, 106.28], // Doesn't exist on chart, duplicate of 11,000 ft
		},
		"30": {
			"3000":  [1, 45],
			"4000":  [-0.0095, 1.6832, 52.874],
			"5000":  [-0.0153, 2.0908, 60.794],
			"6000":  [-0.0196, 2.3025, 68.469],
			"7000":  [-0.0269, 2.5505, 74.534],
			"8000":  [-0.0282, 2.6128, 80.535],
			"9000":  [-0.0409, 2.8300, 85.306],
			"10000": [-0.0330, 2.6494, 90.590],
			"11000": [-0.0436, 2.7729, 94.330],
			"12000": [-0.0436, 2.7729, 94.330], // Doesn't exist on chart, duplicate of 11,000 ft
		},
		"40": {
			"3000":  [1, 45],
			"4000":  [-0.0105, 1.6520, 53.359],
			"5000":  [-0.0165, 2.0487, 61.406],
			"6000":  [-0.0195, 2.2520, 69.018],
			"7000":  [-0.0270, 2.4526, 75.535],
			"8000":  [-0.0344, 2.6110, 81.165],
			"9000":  [-0.0384, 2.6851, 86.201],
			"10000": [-0.0312, 2.5863, 91.097],
			"11000": [-0.0251, 2.4642, 95.544],
			"12000": [-0.0246, 2.4544, 98.984], // Values for 12,000 ft runways start at +40 ISA
		},
		"50": {
			"3000":  [1, 45],
			"4000":  [-0.0076, 1.5301, 53.745],
			"5000":  [-0.0118, 1.8773, 61.873],
			"6000":  [-0.0192, 2.1679, 69.294],
			"7000":  [-0.0248, 2.3364, 75.996],
			"8000":  [-0.0328, 2.5141, 81.552],
			"9000":  [-0.0294, 2.4372, 87.073],
			"10000": [-0.0334, 2.4626, 91.601],
			"11000": [-0.0376, 2.483, 95.643],
			"12000": [-0.0279, 2.3288, 99.281],
		},
		// "60": {
		// 	"3000":  [1, 40],
		// 	"4000":  [],
		// 	"5000":  [],
		// 	"6000":  [],
		// 	"7000":  [],
		// 	"8000":  [],
		// 	"9000":  [],
		// 	"10000": [],
		// 	"11000": [],
		// 	"12000": [],
		// },
		// "70": {
		// 	"3000":  [1, 40],
		// 	"4000":  [],
		// 	"5000":  [],
		// 	"6000":  [],
		// 	"7000":  [],
		// 	"8000":  [],
		// 	"9000":  [],
		// 	"10000": [],
		// 	"11000": [],
		// 	"12000": [],
		// },
	};

	if (deltaISA_F < 0) {
		deltaISA_F = 0;
	}
	if (pressureAltitude < 0) {
		pressureAltitude = 0;
	}
	if (runwayLength > 12000) {
		runwayLength = 12000;
	}

	let intermediateResult = interpolateTable(equations1, deltaISA_F, weight, equation => {
		if (equation === null) return null;
		return calculatePolynomial(equation, pressureAltitude / 1000);
	});
	return interpolateTable(equations2, deltaISA_F, runwayLength, equation => {
		if (equation === null) return null;
		if (intermediateResult === null) return null;
		return calculatePolynomial(equation, intermediateResult);
	});
}

/**
 * Interpolates data from a 2-dimensional table
 * @param table Table of values indexed by the x and y arguments
 * @param x Index to the X part of the table
 * @param y Index to the Y part of the table
 * @param extractor A function which evaluates a final value from a value in the table
 * @returns An interpolated value from the table
 */
function interpolateTable<T>(
	table: { [xKey: string]: { [yKey: string]: T } },
	x: number,
	y: number,
	extractor: (tableEntry: T) => number | null,
): number | null {
	let topIndex: number;
	let bottomIndex: number;

	let xValues = Object.keys(table).map(key => parseInt(key));
	topIndex = xValues.findIndex(value => value >= x);
	if (topIndex === -1) {
		return null; // Value too big
	}
	bottomIndex = topIndex - 1;
	if (x === xValues[topIndex]) {
		bottomIndex = topIndex;
	}
	if (bottomIndex < 0) {
		return null; // Value too small
	}

	let topXIndex = xValues[topIndex];
	let bottomXIndex = xValues[bottomIndex];
	let xRatio = scale(x, bottomXIndex, topXIndex);

	let yValues = Object.keys(table[Object.keys(table)[0]]).map(key => parseInt(key));
	topIndex = yValues.findIndex(value => value >= y);
	if (topIndex === -1) {
		return null; // Value too big
	}
	bottomIndex = topIndex - 1;
	if (y === yValues[topIndex]) {
		bottomIndex = topIndex;
	}
	if (bottomIndex < 0) {
		return null; // Value too small
	}

	let topYIndex = yValues[topIndex];
	let bottomYIndex = yValues[bottomIndex];
	let yRatio = scale(y, bottomYIndex, topYIndex);

	let bottomLeft = extractor(table[bottomXIndex][bottomYIndex]);
	let bottomRight = extractor(table[bottomXIndex][topYIndex]);
	let topLeft = extractor(table[topXIndex][bottomYIndex]);
	let topRight = extractor(table[topXIndex][topYIndex]);
	if (bottomLeft === null || bottomRight === null || topLeft === null || topRight === null) {
		return null;
	}

	let bottom = bottomLeft * (1 - yRatio) + bottomRight * yRatio;
	let top = topLeft * (1 - yRatio) + topRight * yRatio;
	let solution = bottom * (1 - xRatio) + top * xRatio;
	return solution;
}
