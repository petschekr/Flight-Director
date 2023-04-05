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

// TODO: this is totally wrong (it's for 25k feet)
export function bestClimbSpeed(weight: number): number {
	return Math.ceil(calculatePolynomial([5.9546, 47.485], weight / 1000));
}

/**
 * Calculates the speed aircaft should maintain on approach when ATLC landing and 4-blade prop equipped
 * @param weight Aircraft weight in pounds
 * @returns ATLC approach speed in knots
 */
export function approachSpeed(weight: number): number {
	if (weight > 10500) {
		return Math.round(calculatePolynomial([4.1667, 79.25], weight / 1000));
	}
	else {
		return Math.round(calculatePolynomial([-0.7131, 17.221, 19.572], weight / 1000));
	}
}

export function takeoffRoll(weight: number, pressureAltitude: number, deltaISA_F: number, headwind: number = 0, slopePercent: number = 0): number | null {
	type WeightIncrements = "5000" | "6000" | "7000" | "8000" | "9000" | "10000" | "10500" | "11700";
	type ISA_Increments = "0" | "30" | "40" | "50" | "60" | "70";
	const primaryEquations: {
		[ISA in ISA_Increments]: {
			[Weight in WeightIncrements]: [number, number, number];
		};
	} = {
		"0": {
			"5000": [-0.7143, 28.429, 647.14],
			"6000": [0.1786, 42.821, 829.64],
			"7000": [-1.7857, 67.786, 1113.6],
			"8000": [1.6071, 78.107, 1407.5],
			"9000": [8.2143, 76.214, 1815],
			"10000": [4.1071, 138.32, 2253.2],
			"10500": [3.5714, 157.86, 2514.3],
			"11700": [5.8929, 226.54, 3269.6],
		},
		"30": {
			"5000": [4.8214, 9.6071, 731.79],
			"6000": [-1.6071, 59.464, 996.07],
			"7000": [-1.5179, 89.732, 1278.8],
			"8000": [1.9643, 86.75, 1751.8],
			"9000": [0.4464, 127.05, 2249.1],
			"10000": [8.2143, 147.93, 2795.7],
			"10500": [14.107, 147.18, 3176.1],
			"11700": [15.179, 255.54, 4205.4],
		},
		"40": {
			"5000": [-3.3929, 57.821, 798.21],
			"6000": [6.5179, 20.125, 1129.1],
			"7000": [6.5179, 41.839, 1499.8],
			"8000": [11.429, 43.286, 1997.9],
			"9000": [12.857, 85.256, 2491.4],
			"10000": [8.5714, 165.43, 3102.9],
			"10500": [8.0357, 314.11, 3491.1],
			"11700": [19.821, 273.46, 4664.6],
		},
		"50": {
			"5000": [-2.3214, 50.464, 901.79],
			"6000": [4.4643, 53.393, 1193.9],
			"7000": [3.4821, 73.446, 1629.5],
			"8000": [5.8929, 102.82, 2093.9],
			"9000": [4.5536, 151.95, 2685.9],
			"10000": [12.054, 193.3, 3393.7],
			"10500": [25, 202.14, 3823.1],
			"11700": [19.196, 341.16, 5179.5],
		},
		"60": {
			"5000": [6.3393, 11.732, 980.89],
			"6000": [4.5536, 65.661, 1276.6],
			"7000": [1.7857, 93.929, 1752.1],
			"8000": [2.1429, 140.14, 2250],
			"9000": [13.839, 140.09, 2943.7],
			"10000": [12.054, 230.45, 3750.9],
			"10500": [13.036, 268.25, 4238.2],
			"11700": [17.321, 424.39, 5756.1],
		},
		"70": {
			"5000": [-4.0179, 77.232, 998.75],
			"6000": [5, 44.571, 1448.6],
			"7000": [10.179, 64.25, 1921.1],
			"8000": [4.8214, 133.89, 2486.1],
			"9000": [7.0738, 192.01, 3220.9],
			"10000": [11.696, 267.66, 4114.5],
			"10500": [7.8571, 341.71, 4677.9],
			"11700": [34.821, 433.75, 6508.9],
		},
	};

	const headwindCorrectionEquations: {
		[ISA in ISA_Increments]: {
			[TakeoffRoll: string]: [number, number, number];
		};
	} = {
		"0": {
			"600": [0.1071, -14.786, 611.43],
			"1200": [0.2, -26.2, 1206],
			"1750": [0.1143, -30.571, 1746.9],
			"2300": [0.1286, -37.943, 2305.7],
			"2850": [0.1179, -44.564, 2865.6],
			"3450": [0.1786, -53.643, 3455.7],
			"4000": [0.1214, -57.157, 4008.3],
			"4550": [0.2143, -66.571, 4562.9],
		},
		"30": {
			"750": [-0.0375, -12.25, 750],
			"1500": [0.125, -27.5, 1500],
			"2220": [0.2125, -40.25, 2220],
			"2970": [0.2125, -50.25, 2970],
			"3650": [0.1875, -56.25, 3650],
			"4400": [0.25, -67.5, 4400],
			"5100": [0.125, -70, 5100],
			"5850": [0.3125, -83.75, 5850],
		},
		"40": {
			"875": [0.1875, -22.5, 875],
			"1665": [0.1437, -31.125, 1665],
			"2490": [0.175, -43, 2490],
			"3300": [0.25, -55, 3300],
			"4075": [0.1563, -59.375, 4075],
			"4950": [0.3125, -76.25, 4950],
			"5750": [0.25, -82.5, 5750],
			"6525": [0.2925, -90.45, 6525],
		},
		"50": {
			"925": [0.1562, -21.875, 925],
			"1830": [0.2625, -38.75, 1830],
			"2750": [0.0625, -41.25, 2750],
			"3650": [0.3125, -61.25, 3650],
			"4600": [0.25, -70, 4600],
			"5500": [0.3125, -81.25, 5500],
			"6450": [0.25, -90, 6450],
			"7400": [0.3125, -101.25, 7400],
		},
		"60": {
			"1000": [0.1875, -25, 1000],
			"2000": [0.125, -35, 2000],
			"3050": [0.125, -47.5, 3050],
			"4100": [0.1875, -61.25, 4100],
			"5150": [0.1875, -73.75, 5150],
			"6200": [0.1875, -85, 6200],
			"7250": [0.125, -92.5, 7250],
			"8350": [0.375, -112.5, 8350],
		},
		"70": {
			"1000": [0.125, -22.5, 1000],
			"2250": [0.25, -42.5, 2250],
			"3475": [0.2188, -58.125, 3475],
			"4650": [0.1875, -68.75, 4650],
			"5950": [0.3125, -88.75, 5950],
			"7075": [0.1875, -95, 7075],
			"8350": [0.25, -110, 8350],
			"9525": [0.4063, -126.87, 9525],
		},
	};
	const tailwindCorrectionEquations: {
		[ISA in ISA_Increments]: {
			[TakeoffRoll: string]: [number, number, number];
		};
	} = {
		"0": {
			"625":  [0.125, 11.25, 625],
			"1200": [0.125, 18.75, 1200],
			"1750": [0.25, 27.5, 1750],
			"2300": [-0.25, 45, 2300],
			"2850": [-0.5, 57.5, 2850],
			"3450": [0.25, 47.5, 3450],
			"4000": [0.5, 50, 4000],
			"4550": [0.25, 62.5, 4550],
		},
		"30": {
			"750":  [-0.5, 25, 750],
			"1500": [-0.25, 32.5, 1500],
			"2220": [0.1, 37, 2220],
			"2970": [-0.15, 49.5, 2970],
			"3650": [0.35, 51.5, 3650],
			"4400": [0, 65, 4400],
			"5100": [-0.75, 87.5, 5100],
			"5850": [0.25, 77.5, 5850],
		},
		"40": {
			"875":  [0.375, 8.75, 875],
			"1665": [-0.125, 31.75, 1665],
			"2490": [0.1, 40, 2490],
			"3300": [0.25, 47.5, 3300],
			"4075": [-0.475, 72.25, 4075],
			"4950": [-0.125, 71.25, 4950],
			"5750": [0.25, 72.5, 5750],
			"6525": [-0.375, 96.25, 6525],
		},
		"50": {
			"925":  [0.0375, 8.75, 925],
			"1830": [0.05, 32.5, 1830],
			"2750": [0, 45, 2750],
			"3650": [-0.25, 62.5, 3650],
			"4600": [0.5, 60, 4600],
			"5500": [-0.25, 82.5, 5500],
			"6450": [-0.25, 92.5, 6450],
			"7400": [0.35, 89.5, 7400],
		},
		"60": {
			"1000": [0.5, 10, 1000],
			"2000": [-0.25, 42.5, 2000],
			"3050": [0, 50, 3050],
			"4100": [0, 65, 4100],
			"5150": [-0.25, 82.5, 5150],
			"6200": [0, 90, 6200],
			"7250": [0, 100, 7250],
			"8350": [0, 110, 8350],
		},
		"70": {
			"1000": [-0.125, 26.25, 1000],
			"2250": [0.25, 32.5, 2250],
			"3475": [0.125, 51.25, 3475],
			"4650": [-0.25, 77.5, 4650],
			"5950": [0.625, 68.75, 5950],
			"7075": [0.125, 96.25, 7075],
			"8350": [-0.125, 111.25, 8350],
			"9525": [0.125, 121.25, 9525],
		},
	};

	type SlopeIncrements = "-3" | "-2" | "-1" | "0" | "1" | "2" | "3";
	const slopeCorrectionEquations: {
		[ISA in ISA_Increments]: {
			[Slope in SlopeIncrements]: [number, number, number];
		}
	} = {
		"0": {
			"-3": [-45, 1020, -30],
			"-2": [-85, 1347, -520],
			"-1": [-65, 1250, -290],
			"0": [0, 1000, 0],
			"1": [-67.5, 1592.5, -840],
			"2": [-75, 1825, -1125],
			"3": [75, 1225, -350],
		},
		"30": {
			"-3": [-30, 936, 74],
			"-2": [-25, 955, 95],
			"-1": [-37.5, 1107.5, -107.5],
			"0": [0, 1000, 0],
			"1": [6.25, 1133.8, -196.25],
			"2": [37.5, 1162.5, -287.5],
			"3": [175, 755, 95],
		},
		"40": {
			"-3": [-50, 1100, -250],
			"-2": [-6.25, 768.75, 543.75],
			"-1": [-12.5, 927.5, 232.5],
			"0": [0, 1000, 0],
			"1": [18.75, 1038.8, -21.25],
			"2": [62.5, 972.5, 17.5],
			"3": [325, -355, 2160],
		},
		"50": {
			"-3": [-36.5, 1002.5, -67.5],
			"-2": [-12.5, 847.5, 317.5],
			"-1": [12.5, 732.5, 597.5],
			"0": [0, 1000, 0],
			"1": [7.1429, 1168.6, -365.71],
			"2": [107.14, 678.57, 454.29],
			"3": [450, -1290, 3805],
		},
		"60": {
			"-3": [-30.357, 936.79, 87.857],
			"-2": [-24.107, 946.61, 118.21],
			"-1": [-16.964, 1008, -23.214],
			"0": [0, 1000, 0],
			"1": [12.5, 1122.5, -305],
			"2": [133.93, 509.64, 705],
			"3": [550, -1980, 5035],
		},
		"70": {
			"-3": [-25.893, 894.82, 178.93],
			"-2": [-20.089, 911.7, 189.46],
			"-1": [-8.0357, 909.82, 237.5],
			"0": [0, 1000, 0],
			"1": [28.571, 957.14, 85.714],
			"2": [216.96, -213.75, 2254.6],
			"3": [575, -2025, 4925],
		},
	};

	if (deltaISA_F < 0) {
		deltaISA_F = 0;
	}
	if (pressureAltitude < 0) {
		pressureAltitude = 0;
	}

	let takeoffRoll = interpolateTable(primaryEquations, deltaISA_F, weight, equation => {
		return calculatePolynomial(equation, pressureAltitude / 1000);
	});
	if (takeoffRoll === null) return null;

	if (headwind > 0) {
		// Apply headwind correction
		headwind *= 0.5;
		takeoffRoll = interpolateTable(headwindCorrectionEquations, deltaISA_F, takeoffRoll, equation => calculatePolynomial(equation, Math.abs(headwind)));
	}
	else if (headwind < 0) {
		// Apply tailwind correction
		headwind *= 1.5;
		takeoffRoll = interpolateTable(tailwindCorrectionEquations, deltaISA_F, takeoffRoll, equation => calculatePolynomial(equation, Math.abs(headwind)));
	}
	if (takeoffRoll === null) return null;

	if (Math.abs(slopePercent) > 3) return null;
	if (slopePercent !== 0) {
		takeoffRoll = interpolateTable(slopeCorrectionEquations, deltaISA_F, slopePercent, equation => calculatePolynomial(equation, takeoffRoll! / 1000));
	}
	if (takeoffRoll === null) return null;

	return takeoffRoll;
}

export function landingRoll(weight: number, densityAltitude: number, headwind: number = 0, slopePercent: number = 0): number | null {
	type WeightIncrements = "5000" | "6000" | "7000" | "8000" | "9000" | "10000" | "10500" | "11700";
	const primaryEquations: {
		[Weight in WeightIncrements]: [number, number, number];
	} = {
		"5000": [2.381, 47.381, 1357.1],
		"6000": [2.1905, 62.619, 1753.6],
		"7000": [1.9048, 80.476, 2225],
		"8000": [3.619, 91.905, 2714.3],
		"9000": [3.2381, 110.95, 3264.3],
		"10000": [2.7619, 122.62, 3742.9],
		"10500": [3.0476, 126.19, 3925],
		"11700": [3.8095, 146.67, 4742.9],
	};

	type LandingRollIncrementsWind = "1200" | "2000" | "2750" | "3550" | "4300" | "5100" | "5800" | "6700";
	const headwindCorrectionEquations: {
		[LandingRoll in LandingRollIncrementsWind]: [number, number, number];
	} = {
		"1200": [0.2143, -29.571, 1200],
		"2000": [0.4286, -48.143, 2000],
		"2750": [0.3571, -56.286, 2750],
		"3550": [0.5357, -72.929, 3550],
		"4300": [0.4286, -77.143, 4300],
		"5100": [0.6071, -93.786, 5100],
		"5800": [0.5357, -96.929, 5800],
		"6700": [0.6429, -111.71, 6700],
	};
	const tailwindCorrectionEquations: {
		[LandingRoll in LandingRollIncrementsWind]: [number, number, number];
	} = {
		"1200": [0.5, 30, 1200],
		"2000": [0.5, 45, 2000],
		"2750": [1.25, 47.5, 2750],
		"3550": [1.5, 55, 3550],
		"4300": [1.25, 72.5, 4300],
		"5100": [1.75, 72.5, 5100],
		"5800": [0, 120, 5800],
		"6700": [1.5, 95, 6700],
	};

	type LandingRollIncrementsSlope = "1200" | "2000" | "2750" | "3500" | "4300" | "5100" | "5850" | "6600";
	const slopeCorrectionEquations: {
		[LandingRoll in LandingRollIncrementsSlope]: [number, number, number];
	} = {
		"1200": [4.4643, -61.607, 1200],
		"2000": [4.7619, -89.286, 1973.8],
		"2750": [8.9286, -130.36, 2742.9],
		"3500": [16.071, -198.21, 3514.3],
		"4300": [19.048, -257.14, 4309.5],
		"5100": [20.833, -319.64, 5088.1],
		"5850": [27.976, -380.36, 5845.2],
		"6600": [33.333, -439.29, 6631],
	};

	let landingRoll = interpolateTable({ "0": primaryEquations }, 0, weight, equation => {
		if (equation === null) return null;
		return calculatePolynomial(equation, densityAltitude / 1000);
	});
	if (landingRoll === null) return null;

	if (headwind > 0) {
		// Apply headwind correction
		headwind *= 0.5;
		landingRoll = interpolateTable({ "0": headwindCorrectionEquations }, 0, landingRoll, equation => calculatePolynomial(equation, Math.abs(headwind)));
	}
	else if (headwind < 0) {
		// Apply tailwind correction
		headwind *= 1.5;
		landingRoll = interpolateTable({ "0": tailwindCorrectionEquations }, 0, landingRoll, equation => calculatePolynomial(equation, Math.abs(headwind)));
	}
	if (landingRoll === null) return null;

	if (Math.abs(slopePercent) > 3) return null;
	if (slopePercent !== 0) {
		landingRoll = interpolateTable({ "0": slopeCorrectionEquations }, 0, landingRoll, equation => calculatePolynomial(equation, slopePercent));
	}
	if (landingRoll === null) return null;

	// Add 1,500 ft to landing ground roll for total distance from threshold for ATLC
	landingRoll += 1500;

	return landingRoll;
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
export function refusalSpeed(weight: number, pressureAltitude: number, deltaISA_F: number, runwayLength: number, headwind: number = 0): number | null {
	type ISA_Increments = "0" | "30" | "40" | "50"; // | "60" | "70";
	type Weight_Increments = "5000" | "6000" | "7000" | "8000" | "9000" | "10000" | "10500" | "11700";
	type Runway_Increments = "3000" | "4000" | "5000" | "6000" | "7000" | "8000" | "9000" | "10000" | "11000" | "12000";
	const equations1: {
		[ISA in ISA_Increments]: {
			[Weight in Weight_Increments]: [number, number];
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
			[RunwayLength in Runway_Increments]: number[];
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
	let uncorrectedSpeed = interpolateTable(equations2, deltaISA_F, runwayLength, equation => {
		if (equation === null) return null;
		if (intermediateResult === null) return null;
		return calculatePolynomial(equation, intermediateResult);
	});
	if (uncorrectedSpeed === null) return null;

	return uncorrectedSpeed + headwind; // 100% of headwind/tailwind applied to refusal speed
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
	let xValues = Object.keys(table).map(key => parseInt(key)).sort((a, b) => a - b);
	let topXIndex: number = xValues.findIndex(value => value >= x);
	if (topXIndex === -1) {
		return null; // Value too big
	}
	let bottomXIndex: number = topXIndex - 1;
	if (x === xValues[topXIndex]) {
		bottomXIndex = topXIndex;
	}
	if (bottomXIndex < 0) {
		return null; // Value too small
	}

	let topXValue = xValues[topXIndex];
	let bottomXValue = xValues[bottomXIndex];
	let xRatio = scale(x, bottomXValue, topXValue);

	let y1Values = Object.keys(table[bottomXValue]).map(key => parseInt(key)).sort((a, b) => a - b);
	let topY1Index = y1Values.findIndex(value => value >= y);
	if (topY1Index === -1) {
		return null; // Value too big
	}
	let bottomY1Index = topY1Index - 1;
	if (y === y1Values[topY1Index]) {
		bottomY1Index = topY1Index;
	}
	if (bottomY1Index < 0) {
		return null; // Value too small
	}

	let topY1Value = y1Values[topY1Index];
	let bottomY1Value = y1Values[bottomY1Index];
	let y1Ratio = scale(y, bottomY1Value, topY1Value);

	let y2Values = Object.keys(table[topXValue]).map(key => parseInt(key)).sort((a, b) => a - b);
	let topY2Index = y2Values.findIndex(value => value >= y);
	if (topY2Index === -1) {
		return null; // Value too big
	}
	let bottomY2Index = topY2Index - 1;
	if (y === y2Values[topY2Index]) {
		bottomY2Index = topY2Index;
	}
	if (bottomY2Index < 0) {
		return null; // Value too small
	}

	let topY2Value = y2Values[topY2Index];
	let bottomY2Value = y2Values[bottomY2Index];
	let y2Ratio = scale(y, bottomY2Value, topY2Value);

	let bottomLeft = extractor(table[bottomXValue][bottomY1Value]);
	let bottomRight = extractor(table[bottomXValue][topY1Value]);
	let topLeft = extractor(table[topXValue][bottomY2Value]);
	let topRight = extractor(table[topXValue][topY2Value]);
	if (bottomLeft === null || bottomRight === null || topLeft === null || topRight === null) {
		return null;
	}

	let bottom = bottomLeft * (1 - y1Ratio) + bottomRight * y1Ratio;
	let top = topLeft * (1 - y2Ratio) + topRight * y2Ratio;
	let solution = bottom * (1 - xRatio) + top * xRatio;
	return solution;
}
