import { interpolateTable } from "@/performance/ATLC";

interface TableEntry {
	vy: number;
	rateOfClimb: number;
}
interface WeightValue<T> {
	[weight: string]: T;
}
interface BestClimbValues {
	[altitude: string]: WeightValue<TableEntry | null>;
}

const bestClimbDI0: BestClimbValues = {
	"0": {
		"5000": { vy: 111, rateOfClimb: 3650 },
		"6000": { vy: 112, rateOfClimb: 2980 },
		"7000": { vy: 113, rateOfClimb: 2490 },
		"8000": { vy: 115, rateOfClimb: 2120 },
		"9000": { vy: 116, rateOfClimb: 1820 },
		"10000": { vy: 118, rateOfClimb: 1580 },
		"10500": { vy: 119, rateOfClimb: 1480 },
		"11700": { vy: 121, rateOfClimb: 1250 }
	},
	"2500": {
		"5000": { vy: 111, rateOfClimb: 3590 },
		"6000": { vy: 113, rateOfClimb: 2930 },
		"7000": { vy: 114, rateOfClimb: 2450 },
		"8000": { vy: 115, rateOfClimb: 2080 },
		"9000": { vy: 117, rateOfClimb: 1790 },
		"10000": { vy: 119, rateOfClimb: 1550 },
		"10500": { vy: 119, rateOfClimb: 1440 },
		"11700": { vy: 122, rateOfClimb: 1220 }
	},
	"5000": {
		"5000": { vy: 109, rateOfClimb: 3390 },
		"6000": { vy: 110, rateOfClimb: 2760 },
		"7000": { vy: 111, rateOfClimb: 2300 },
		"8000": { vy: 113, rateOfClimb: 1940 },
		"9000": { vy: 115, rateOfClimb: 1660 },
		"10000": { vy: 116, rateOfClimb: 1430 },
		"10500": { vy: 117, rateOfClimb: 1330 },
		"11700": { vy: 119, rateOfClimb: 1110 }
	},
	"7500": {
		"5000": { vy: 106, rateOfClimb: 3190 },
		"6000": { vy: 107, rateOfClimb: 2580 },
		"7000": { vy: 109, rateOfClimb: 2140 },
		"8000": { vy: 110, rateOfClimb: 1800 },
		"9000": { vy: 112, rateOfClimb: 1530 },
		"10000": { vy: 114, rateOfClimb: 1310 },
		"10500": { vy: 115, rateOfClimb: 1210 },
		"11700": { vy: 117, rateOfClimb: 1010 }
	},
	"10000": {
		"5000": { vy: 103, rateOfClimb: 2990 },
		"6000": { vy: 105, rateOfClimb: 2410 },
		"7000": { vy: 106, rateOfClimb: 1990 },
		"8000": { vy: 108, rateOfClimb: 1670 },
		"9000": { vy: 110, rateOfClimb: 1410 },
		"10000": { vy: 112, rateOfClimb: 1190 },
		"10500": { vy: 113, rateOfClimb: 1100 },
		"11700": { vy: 115, rateOfClimb: 900 }
	},
	"12500": {
		"5000": { vy: 101, rateOfClimb: 2790 },
		"6000": { vy: 102, rateOfClimb: 2250 },
		"7000": { vy: 104, rateOfClimb: 1850 },
		"8000": { vy: 106, rateOfClimb: 1530 },
		"9000": { vy: 108, rateOfClimb: 1280 },
		"10000": { vy: 110, rateOfClimb: 1080 },
		"10500": { vy: 111, rateOfClimb: 990 },
		"11700": { vy: 113, rateOfClimb: 800 }
	},
	"15000": {
		"5000": { vy: 98, rateOfClimb: 2600 },
		"6000": { vy: 100, rateOfClimb: 2080 },
		"7000": { vy: 102, rateOfClimb: 1700 },
		"8000": { vy: 104, rateOfClimb: 1400 },
		"9000": { vy: 106, rateOfClimb: 1160 },
		"10000": { vy: 108, rateOfClimb: 960 },
		"10500": { vy: 109, rateOfClimb: 870 },
		"11700": { vy: 111, rateOfClimb: 690 }
	},
	"17500": {
		"5000": { vy: 95, rateOfClimb: 2410 },
		"6000": { vy: 97, rateOfClimb: 1920 },
		"7000": { vy: 99, rateOfClimb: 1550 },
		"8000": { vy: 101, rateOfClimb: 1270 },
		"9000": { vy: 104, rateOfClimb: 1040 },
		"10000": { vy: 106, rateOfClimb: 850 },
		"10500": { vy: 107, rateOfClimb: 760 },
		"11700": { vy: 110, rateOfClimb: 580 }
	},
	"20000": {
		"5000": { vy: 93, rateOfClimb: 2230 },
		"6000": { vy: 95, rateOfClimb: 1760 },
		"7000": { vy: 97, rateOfClimb: 1410 },
		"8000": { vy: 99, rateOfClimb: 1140 },
		"9000": { vy: 102, rateOfClimb: 920 },
		"10000": { vy: 104, rateOfClimb: 730 },
		"10500": { vy: 105, rateOfClimb: 650 },
		"11700": { vy: 108, rateOfClimb: 480 }
	},
	"22500": {
		"5000": { vy: 91, rateOfClimb: 2050 },
		"6000": { vy: 93, rateOfClimb: 1600 },
		"7000": { vy: 95, rateOfClimb: 1270 },
		"8000": { vy: 97, rateOfClimb: 1010 },
		"9000": { vy: 100, rateOfClimb: 790 },
		"10000": { vy: 102, rateOfClimb: 610 },
		"10500": { vy: 103, rateOfClimb: 540 },
		"11700": { vy: 106, rateOfClimb: 370 }
	},
	"25000": {
		"5000": { vy: 88, rateOfClimb: 1870 },
		"6000": { vy: 90, rateOfClimb: 1440 },
		"7000": { vy: 93, rateOfClimb: 1120 },
		"8000": { vy: 95, rateOfClimb: 870 },
		"9000": { vy: 98, rateOfClimb: 670 },
		"10000": { vy: 100, rateOfClimb: 500 },
		"10500": { vy: 102, rateOfClimb: 420 },
		"11700": { vy: 106, rateOfClimb: 260 }
	},
	"27500": {
		"5000": { vy: 86, rateOfClimb: 1690 },
		"6000": { vy: 88, rateOfClimb: 1280 },
		"7000": { vy: 91, rateOfClimb: 980 },
		"8000": { vy: 93, rateOfClimb: 740 },
		"9000": { vy: 96, rateOfClimb: 550 },
		"10000": { vy: 99, rateOfClimb: 380 },
		"10500": { vy: 101, rateOfClimb: 300 },
		"11700": { vy: 106, rateOfClimb: 140 }
	},
	"30000": {
		"5000": { vy: 83, rateOfClimb: 1510 },
		"6000": { vy: 86, rateOfClimb: 1130 },
		"7000": { vy: 89, rateOfClimb: 840 },
		"8000": { vy: 91, rateOfClimb: 610 },
		"9000": { vy: 94, rateOfClimb: 420 },
		"10000": { vy: 98, rateOfClimb: 260 },
		"10500": { vy: 101, rateOfClimb: 190 },
		"11700": { vy: 106, rateOfClimb: 30 }
	},
	"32500": {
		"5000": { vy: 81, rateOfClimb: 1340 },
		"6000": { vy: 84, rateOfClimb: 970 },
		"7000": { vy: 87, rateOfClimb: 700 },
		"8000": { vy: 90, rateOfClimb: 480 },
		"9000": { vy: 93, rateOfClimb: 290 },
		"10000": { vy: 98, rateOfClimb: 140 },
		"10500": { vy: 101, rateOfClimb: 70 },
		"11700": null,
	},
	"35000": {
		"5000": { vy: 79, rateOfClimb: 1160 },
		"6000": { vy: 82, rateOfClimb: 820 },
		"7000": { vy: 85, rateOfClimb: 550 },
		"8000": { vy: 88, rateOfClimb: 340 },
		"9000": { vy: 93, rateOfClimb: 170 },
		"10000": { vy: 98, rateOfClimb: 10 },
		"10500": null,
		"11700": null,
	},
	"37500": {
		"5000": { vy: 77, rateOfClimb: 980 },
		"6000": { vy: 80, rateOfClimb: 660 },
		"7000": { vy: 83, rateOfClimb: 410 },
		"8000": { vy: 88, rateOfClimb: 200 },
		"9000": { vy: 93, rateOfClimb: 30 },
		"10000": null,
		"10500": null,
		"11700": null,
	},
	"40000": {
		"5000": { vy: 75, rateOfClimb: 800 },
		"6000": { vy: 78, rateOfClimb: 490 },
		"7000": { vy: 82, rateOfClimb: 250 },
		"8000": { vy: 88, rateOfClimb: 50 },
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null,
	},
	"42500": {
		"5000": { vy: 73, rateOfClimb: 620 },
		"6000": { vy: 76, rateOfClimb: 330 },
		"7000": { vy: 82, rateOfClimb: 90 },
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null,
	},
	"45000": {
		"5000": { vy: 71, rateOfClimb: 440 },
		"6000": { vy: 76, rateOfClimb: 160 },
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null,
	}
};
const bestClimbDI50: BestClimbValues = {
	"0": {
		"5000": { vy: 106, rateOfClimb: 3540 },
		"6000": { vy: 107, rateOfClimb: 2880 },
		"7000": { vy: 108, rateOfClimb: 2410 },
		"8000": { vy: 110, rateOfClimb: 2040 },
		"9000": { vy: 111, rateOfClimb: 1750 },
		"10000": { vy: 113, rateOfClimb: 1510 },
		"10500": { vy: 114, rateOfClimb: 1410 },
		"11700": { vy: 116, rateOfClimb: 1190 }
	},
	"2500": {
		"5000": { vy: 106, rateOfClimb: 3470 },
		"6000": { vy: 107, rateOfClimb: 2830 },
		"7000": { vy: 109, rateOfClimb: 2360 },
		"8000": { vy: 110, rateOfClimb: 2000 },
		"9000": { vy: 112, rateOfClimb: 1710 },
		"10000": { vy: 113, rateOfClimb: 1470 },
		"10500": { vy: 114, rateOfClimb: 1370 },
		"11700": { vy: 116, rateOfClimb: 1150 }
	},
	"5000": {
		"5000": { vy: 103, rateOfClimb: 3270 },
		"6000": { vy: 105, rateOfClimb: 2660 },
		"7000": { vy: 106, rateOfClimb: 2210 },
		"8000": { vy: 108, rateOfClimb: 1860 },
		"9000": { vy: 109, rateOfClimb: 1580 },
		"10000": { vy: 111, rateOfClimb: 1360 },
		"10500": { vy: 112, rateOfClimb: 1260 },
		"11700": { vy: 114, rateOfClimb: 1050 }
	},
	"7500": {
		"5000": { vy: 101, rateOfClimb: 3080 },
		"6000": { vy: 102, rateOfClimb: 2490 },
		"7000": { vy: 104, rateOfClimb: 2060 },
		"8000": { vy: 105, rateOfClimb: 1730 },
		"9000": { vy: 107, rateOfClimb: 1460 },
		"10000": { vy: 109, rateOfClimb: 1240 },
		"10500": { vy: 110, rateOfClimb: 1150 },
		"11700": { vy: 112, rateOfClimb: 940 }
	},
	"10000": {
		"5000": { vy: 98, rateOfClimb: 2880 },
		"6000": { vy: 100, rateOfClimb: 2320 },
		"7000": { vy: 101, rateOfClimb: 1910 },
		"8000": { vy: 103, rateOfClimb: 1590 },
		"9000": { vy: 105, rateOfClimb: 1340 },
		"10000": { vy: 107, rateOfClimb: 1130 },
		"10500": { vy: 108, rateOfClimb: 1030 },
		"11700": { vy: 110, rateOfClimb: 840 }
	},
	"12500": {
		"5000": { vy: 96, rateOfClimb: 2690 },
		"6000": { vy: 97, rateOfClimb: 2160 },
		"7000": { vy: 99, rateOfClimb: 1760 },
		"8000": { vy: 101, rateOfClimb: 1460 },
		"9000": { vy: 103, rateOfClimb: 1210 },
		"10000": { vy: 105, rateOfClimb: 1010 },
		"10500": { vy: 106, rateOfClimb: 920 },
		"11700": { vy: 109, rateOfClimb: 730 }
	},
	"15000": {
		"5000": { vy: 93, rateOfClimb: 2500 },
		"6000": { vy: 95, rateOfClimb: 2000 },
		"7000": { vy: 97, rateOfClimb: 1620 },
		"8000": { vy: 99, rateOfClimb: 1330 },
		"9000": { vy: 101, rateOfClimb: 1090 },
		"10000": { vy: 103, rateOfClimb: 900 },
		"10500": { vy: 104, rateOfClimb: 810 },
		"11700": { vy: 107, rateOfClimb: 630 }
	},
	"17500": {
		"5000": { vy: 91, rateOfClimb: 2320 },
		"6000": { vy: 93, rateOfClimb: 1840 },
		"7000": { vy: 95, rateOfClimb: 1480 },
		"8000": { vy: 97, rateOfClimb: 1200 },
		"9000": { vy: 99, rateOfClimb: 970 },
		"10000": { vy: 101, rateOfClimb: 780 },
		"10500": { vy: 102, rateOfClimb: 700 },
		"11700": { vy: 106, rateOfClimb: 520 }
	},
	"20000": {
		"5000": { vy: 89, rateOfClimb: 2140 },
		"6000": { vy: 91, rateOfClimb: 1680 },
		"7000": { vy: 93, rateOfClimb: 1340 },
		"8000": { vy: 95, rateOfClimb: 1070 },
		"9000": { vy: 97, rateOfClimb: 850 },
		"10000": { vy: 99, rateOfClimb: 670 },
		"10500": { vy: 101, rateOfClimb: 590 },
		"11700": { vy: 106, rateOfClimb: 410 }
	},
	"22500": {
		"5000": { vy: 86, rateOfClimb: 1960 },
		"6000": { vy: 88, rateOfClimb: 1520 },
		"7000": { vy: 91, rateOfClimb: 1190 },
		"8000": { vy: 93, rateOfClimb: 940 },
		"9000": { vy: 95, rateOfClimb: 730 },
		"10000": { vy: 98, rateOfClimb: 550 },
		"10500": { vy: 101, rateOfClimb: 470 },
		"11700": { vy: 106, rateOfClimb: 300 }
	},
	"25000": {
		"5000": { vy: 84, rateOfClimb: 1780 },
		"6000": { vy: 86, rateOfClimb: 1370 },
		"7000": { vy: 89, rateOfClimb: 1050 },
		"8000": { vy: 91, rateOfClimb: 810 },
		"9000": { vy: 94, rateOfClimb: 610 },
		"10000": { vy: 98, rateOfClimb: 430 },
		"10500": { vy: 101, rateOfClimb: 360 },
		"11700": { vy: 106, rateOfClimb: 190 }
	},
	"27500": {
		"5000": { vy: 82, rateOfClimb: 1610 },
		"6000": { vy: 84, rateOfClimb: 1210 },
		"7000": { vy: 87, rateOfClimb: 910 },
		"8000": { vy: 89, rateOfClimb: 680 },
		"9000": { vy: 93, rateOfClimb: 480 },
		"10000": { vy: 98, rateOfClimb: 310 },
		"10500": { vy: 101, rateOfClimb: 240 },
		"11700": { vy: 106, rateOfClimb: 70 }
	},
	"30000": {
		"5000": { vy: 80, rateOfClimb: 1430 },
		"6000": { vy: 82, rateOfClimb: 1060 },
		"7000": { vy: 85, rateOfClimb: 770 },
		"8000": { vy: 88, rateOfClimb: 550 },
		"9000": { vy: 93, rateOfClimb: 360 },
		"10000": { vy: 98, rateOfClimb: 190 },
		"10500": { vy: 101, rateOfClimb: 120 },
		"11700": null
	},
	"32500": {
		"5000": { vy: 78, rateOfClimb: 1260 },
		"6000": { vy: 80, rateOfClimb: 900 },
		"7000": { vy: 83, rateOfClimb: 630 },
		"8000": { vy: 88, rateOfClimb: 410 },
		"9000": { vy: 93, rateOfClimb: 230 },
		"10000": { vy: 98, rateOfClimb: 70 },
		"10500": null,
		"11700": null
	},
	"35000": {
		"5000": { vy: 76, rateOfClimb: 1090 },
		"6000": { vy: 78, rateOfClimb: 750 },
		"7000": { vy: 82, rateOfClimb: 490 },
		"8000": { vy: 88, rateOfClimb: 280 },
		"9000": { vy: 93, rateOfClimb: 90 },
		"10000": null,
		"10500": null,
		"11700": null
	},
	"37500": {
		"5000": { vy: 73, rateOfClimb: 910 },
		"6000": { vy: 77, rateOfClimb: 590 },
		"7000": { vy: 82, rateOfClimb: 340 },
		"8000": { vy: 88, rateOfClimb: 130 },
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"40000": {
		"5000": { vy: 71, rateOfClimb: 730 },
		"6000": { vy: 76, rateOfClimb: 430 },
		"7000": { vy: 82, rateOfClimb: 180 },
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"42500": {
		"5000": { vy: 70, rateOfClimb: 550 },
		"6000": { vy: 76, rateOfClimb: 260 },
		"7000": { vy: 82, rateOfClimb: 20 },
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"45000": {
		"5000": { vy: 70, rateOfClimb: 370 },
		"6000": { vy: 76, rateOfClimb: 80 },
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	}
};
const bestClimbDI100: BestClimbValues = {
	"0": {
		"5000": { vy: 101, rateOfClimb: 3440 },
		"6000": { vy: 103, rateOfClimb: 2800 },
		"7000": { vy: 104, rateOfClimb: 2330 },
		"8000": { vy: 105, rateOfClimb: 1970 },
		"9000": { vy: 107, rateOfClimb: 1690 },
		"10000": { vy: 109, rateOfClimb: 1450 },
		"10500": { vy: 109, rateOfClimb: 1350 },
		"11700": { vy: 111, rateOfClimb: 1140 }
	},
	"2500": {
		"5000": { vy: 102, rateOfClimb: 3370 },
		"6000": { vy: 103, rateOfClimb: 2740 },
		"7000": { vy: 104, rateOfClimb: 2280 },
		"8000": { vy: 106, rateOfClimb: 1920 },
		"9000": { vy: 107, rateOfClimb: 1640 },
		"10000": { vy: 109, rateOfClimb: 1410 },
		"10500": { vy: 110, rateOfClimb: 1310 },
		"11700": { vy: 112, rateOfClimb: 1100 }
	},
	"5000": {
		"5000": { vy: 99, rateOfClimb: 3170 },
		"6000": { vy: 100, rateOfClimb: 2570 },
		"7000": { vy: 102, rateOfClimb: 2130 },
		"8000": { vy: 103, rateOfClimb: 1790 },
		"9000": { vy: 105, rateOfClimb: 1520 },
		"10000": { vy: 107, rateOfClimb: 1300 },
		"10500": { vy: 108, rateOfClimb: 1200 },
		"11700": { vy: 110, rateOfClimb: 990 }
	},
	"7500": {
		"5000": { vy: 97, rateOfClimb: 2980 },
		"6000": { vy: 98, rateOfClimb: 2400 },
		"7000": { vy: 100, rateOfClimb: 1980 },
		"8000": { vy: 101, rateOfClimb: 1660 },
		"9000": { vy: 103, rateOfClimb: 1400 },
		"10000": { vy: 105, rateOfClimb: 1180 },
		"10500": { vy: 106, rateOfClimb: 1090 },
		"11700": { vy: 108, rateOfClimb: 890 }
	},
	"10000": {
		"5000": { vy: 94, rateOfClimb: 2790 },
		"6000": { vy: 96, rateOfClimb: 2240 },
		"7000": { vy: 97, rateOfClimb: 1840 },
		"8000": { vy: 99, rateOfClimb: 1530 },
		"9000": { vy: 101, rateOfClimb: 1270 },
		"10000": { vy: 103, rateOfClimb: 1070 },
		"10500": { vy: 104, rateOfClimb: 980 },
		"11700": { vy: 106, rateOfClimb: 780 }
	},
	"12500": {
		"5000": { vy: 92, rateOfClimb: 2600 },
		"6000": { vy: 93, rateOfClimb: 2080 },
		"7000": { vy: 95, rateOfClimb: 1690 },
		"8000": { vy: 97, rateOfClimb: 1390 },
		"9000": { vy: 99, rateOfClimb: 1150 },
		"10000": { vy: 101, rateOfClimb: 950 },
		"10500": { vy: 102, rateOfClimb: 860 },
		"11700": { vy: 106, rateOfClimb: 680 }
	},
	"15000": {
		"5000": { vy: 90, rateOfClimb: 2420 },
		"6000": { vy: 91, rateOfClimb: 1920 },
		"7000": { vy: 93, rateOfClimb: 1550 },
		"8000": { vy: 95, rateOfClimb: 1260 },
		"9000": { vy: 97, rateOfClimb: 1030 },
		"10000": { vy: 99, rateOfClimb: 840 },
		"10500": { vy: 101, rateOfClimb: 750 },
		"11700": { vy: 106, rateOfClimb: 570 }
	},
	"17500": {
		"5000": { vy: 87, rateOfClimb: 2240 },
		"6000": { vy: 89, rateOfClimb: 1760 },
		"7000": { vy: 91, rateOfClimb: 1410 },
		"8000": { vy: 93, rateOfClimb: 1140 },
		"9000": { vy: 95, rateOfClimb: 910 },
		"10000": { vy: 98, rateOfClimb: 730 },
		"10500": { vy: 101, rateOfClimb: 640 },
		"11700": { vy: 106, rateOfClimb: 460 }
	},
	"20000": {
		"5000": { vy: 85, rateOfClimb: 2060 },
		"6000": { vy: 87, rateOfClimb: 1610 },
		"7000": { vy: 89, rateOfClimb: 1270 },
		"8000": { vy: 91, rateOfClimb: 1010 },
		"9000": { vy: 93, rateOfClimb: 790 },
		"10000": { vy: 98, rateOfClimb: 610 },
		"10500": { vy: 101, rateOfClimb: 530 },
		"11700": { vy: 106, rateOfClimb: 350 }
	},
	"22500": {
		"5000": { vy: 83, rateOfClimb: 1880 },
		"6000": { vy: 85, rateOfClimb: 1450 },
		"7000": { vy: 87, rateOfClimb: 1130 },
		"8000": { vy: 89, rateOfClimb: 880 },
		"9000": { vy: 93, rateOfClimb: 670 },
		"10000": { vy: 98, rateOfClimb: 490 },
		"10500": { vy: 101, rateOfClimb: 410 },
		"11700": { vy: 106, rateOfClimb: 240 }
	},
	"25000": {
		"5000": { vy: 81, rateOfClimb: 1710 },
		"6000": { vy: 83, rateOfClimb: 1300 },
		"7000": { vy: 85, rateOfClimb: 990 },
		"8000": { vy: 88, rateOfClimb: 750 },
		"9000": { vy: 93, rateOfClimb: 550 },
		"10000": { vy: 98, rateOfClimb: 370 },
		"10500": { vy: 101, rateOfClimb: 290 },
		"11700": { vy: 106, rateOfClimb: 120 }
	},
	"27500": {
		"5000": { vy: 79, rateOfClimb: 1530 },
		"6000": { vy: 81, rateOfClimb: 1150 },
		"7000": { vy: 83, rateOfClimb: 850 },
		"8000": { vy: 88, rateOfClimb: 620 },
		"9000": { vy: 93, rateOfClimb: 420 },
		"10000": { vy: 98, rateOfClimb: 250 },
		"10500": { vy: 101, rateOfClimb: 170 },
		"11700": { vy: 106, rateOfClimb: 0 }
	},
	"30000": {
		"5000": { vy: 77, rateOfClimb: 1360 },
		"6000": { vy: 79, rateOfClimb: 990 },
		"7000": { vy: 82, rateOfClimb: 710 },
		"8000": { vy: 88, rateOfClimb: 480 },
		"9000": { vy: 93, rateOfClimb: 290 },
		"10000": { vy: 98, rateOfClimb: 120 },
		"10500": { vy: 101, rateOfClimb: 50 },
		"11700": null
	},
	"32500": {
		"5000": { vy: 75, rateOfClimb: 1190 },
		"6000": { vy: 77, rateOfClimb: 840 },
		"7000": { vy: 82, rateOfClimb: 570 },
		"8000": { vy: 88, rateOfClimb: 350 },
		"9000": { vy: 93, rateOfClimb: 160 },
		"10000": { vy: 98, rateOfClimb: 0 },
		"10500": null,
		"11700": null
	},
	"35000": {
		"5000": { vy: 73, rateOfClimb: 1020 },
		"6000": { vy: 76, rateOfClimb: 690 },
		"7000": { vy: 82, rateOfClimb: 430 },
		"8000": { vy: 88, rateOfClimb: 210 },
		"9000": { vy: 93, rateOfClimb: 20 },
		"10000": null,
		"10500": null,
		"11700": null
	},
	"37500": {
		"5000": { vy: 71, rateOfClimb: 850 },
		"6000": { vy: 76, rateOfClimb: 530 },
		"7000": { vy: 82, rateOfClimb: 270 },
		"8000": { vy: 88, rateOfClimb: 60 },
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"40000": {
		"5000": { vy: 70, rateOfClimb: 670 },
		"6000": { vy: 76, rateOfClimb: 360 },
		"7000": { vy: 82, rateOfClimb: 110 },
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"42500": {
		"5000": { vy: 70, rateOfClimb: 490 },
		"6000": { vy: 76, rateOfClimb: 190 },
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"45000": {
		"5000": { vy: 70, rateOfClimb: 300 },
		"6000": { vy: 76, rateOfClimb: 10 },
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	}
};
const bestClimbDI200: BestClimbValues = {
	"0": {
		"5000": { vy: 94, rateOfClimb: 3270 },
		"6000": { vy: 96, rateOfClimb: 2650 },
		"7000": { vy: 97, rateOfClimb: 2200 },
		"8000": { vy: 98, rateOfClimb: 1850 },
		"9000": { vy: 100, rateOfClimb: 1580 },
		"10000": { vy: 102, rateOfClimb: 1350 },
		"10500": { vy: 102, rateOfClimb: 1250 },
		"11700": { vy: 106, rateOfClimb: 1040 }
	},
	"2500": {
		"5000": { vy: 94, rateOfClimb: 3200 },
		"6000": { vy: 96, rateOfClimb: 2590 },
		"7000": { vy: 97, rateOfClimb: 2140 },
		"8000": { vy: 98, rateOfClimb: 1800 },
		"9000": { vy: 100, rateOfClimb: 1530 },
		"10000": { vy: 102, rateOfClimb: 1300 },
		"10500": { vy: 103, rateOfClimb: 1200 },
		"11700": { vy: 106, rateOfClimb: 1000 }
	},
	"5000": {
		"5000": { vy: 92, rateOfClimb: 3000 },
		"6000": { vy: 93, rateOfClimb: 2420 },
		"7000": { vy: 95, rateOfClimb: 2000 },
		"8000": { vy: 96, rateOfClimb: 1670 },
		"9000": { vy: 98, rateOfClimb: 1410 },
		"10000": { vy: 100, rateOfClimb: 1190 },
		"10500": { vy: 101, rateOfClimb: 1090 },
		"11700": { vy: 106, rateOfClimb: 890 }
	},
	"7500": {
		"5000": { vy: 90, rateOfClimb: 2820 },
		"6000": { vy: 91, rateOfClimb: 2260 },
		"7000": { vy: 93, rateOfClimb: 1860 },
		"8000": { vy: 95, rateOfClimb: 1540 },
		"9000": { vy: 96, rateOfClimb: 1290 },
		"10000": { vy: 98, rateOfClimb: 1080 },
		"10500": { vy: 101, rateOfClimb: 980 },
		"11700": { vy: 106, rateOfClimb: 780 }
	},
	"10000": {
		"5000": { vy: 88, rateOfClimb: 2630 },
		"6000": { vy: 89, rateOfClimb: 2100 },
		"7000": { vy: 91, rateOfClimb: 1710 },
		"8000": { vy: 93, rateOfClimb: 1410 },
		"9000": { vy: 94, rateOfClimb: 1170 },
		"10000": { vy: 98, rateOfClimb: 960 },
		"10500": { vy: 101, rateOfClimb: 870 },
		"11700": { vy: 106, rateOfClimb: 680 }
	},
	"12500": {
		"5000": { vy: 86, rateOfClimb: 2450 },
		"6000": { vy: 87, rateOfClimb: 1950 },
		"7000": { vy: 89, rateOfClimb: 1570 },
		"8000": { vy: 91, rateOfClimb: 1280 },
		"9000": { vy: 93, rateOfClimb: 1050 },
		"10000": { vy: 98, rateOfClimb: 850 },
		"10500": { vy: 101, rateOfClimb: 760 },
		"11700": { vy: 106, rateOfClimb: 570 }
	},
	"15000": {
		"5000": { vy: 83, rateOfClimb: 2270 },
		"6000": { vy: 85, rateOfClimb: 1790 },
		"7000": { vy: 87, rateOfClimb: 1430 },
		"8000": { vy: 89, rateOfClimb: 1160 },
		"9000": { vy: 93, rateOfClimb: 930 },
		"10000": { vy: 98, rateOfClimb: 730 },
		"10500": { vy: 101, rateOfClimb: 640 },
		"11700": { vy: 106, rateOfClimb: 460 }
	},
	"17500": {
		"5000": { vy: 81, rateOfClimb: 2100 },
		"6000": { vy: 83, rateOfClimb: 1640 },
		"7000": { vy: 85, rateOfClimb: 1300 },
		"8000": { vy: 88, rateOfClimb: 1030 },
		"9000": { vy: 93, rateOfClimb: 810 },
		"10000": { vy: 98, rateOfClimb: 620 },
		"10500": { vy: 101, rateOfClimb: 530 },
		"11700": { vy: 106, rateOfClimb: 340 }
	},
	"20000": {
		"5000": { vy: 79, rateOfClimb: 1920 },
		"6000": { vy: 81, rateOfClimb: 1490 },
		"7000": { vy: 83, rateOfClimb: 1160 },
		"8000": { vy: 88, rateOfClimb: 900 },
		"9000": { vy: 93, rateOfClimb: 680 },
		"10000": { vy: 98, rateOfClimb: 500 },
		"10500": { vy: 101, rateOfClimb: 410 },
		"11700": { vy: 106, rateOfClimb: 230 }
	},
	"22500": {
		"5000": { vy: 77, rateOfClimb: 1750 },
		"6000": { vy: 79, rateOfClimb: 1330 },
		"7000": { vy: 82, rateOfClimb: 1020 },
		"8000": { vy: 88, rateOfClimb: 770 },
		"9000": { vy: 93, rateOfClimb: 560 },
		"10000": { vy: 98, rateOfClimb: 370 },
		"10500": { vy: 101, rateOfClimb: 290 },
		"11700": { vy: 106, rateOfClimb: 110 }
	},
	"25000": {
		"5000": { vy: 75, rateOfClimb: 1580 },
		"6000": { vy: 78, rateOfClimb: 1180 },
		"7000": { vy: 82, rateOfClimb: 880 },
		"8000": { vy: 88, rateOfClimb: 640 },
		"9000": { vy: 93, rateOfClimb: 430 },
		"10000": { vy: 98, rateOfClimb: 250 },
		"10500": { vy: 101, rateOfClimb: 160 },
		"11700": null
	},
	"27500": {
		"5000": { vy: 73, rateOfClimb: 1410 },
		"6000": { vy: 76, rateOfClimb: 1030 },
		"7000": { vy: 82, rateOfClimb: 740 },
		"8000": { vy: 88, rateOfClimb: 500 },
		"9000": { vy: 93, rateOfClimb: 300 },
		"10000": { vy: 98, rateOfClimb: 120 },
		"10500": { vy: 101, rateOfClimb: 30 },
		"11700": null
	},
	"30000": {
		"5000": { vy: 72, rateOfClimb: 1240 },
		"6000": { vy: 76, rateOfClimb: 880 },
		"7000": { vy: 82, rateOfClimb: 600 },
		"8000": { vy: 88, rateOfClimb: 360 },
		"9000": { vy: 93, rateOfClimb: 160 },
		"10000": null,
		"10500": null,
		"11700": null
	},
	"32500": {
		"5000": { vy: 70, rateOfClimb: 1080 },
		"6000": { vy: 76, rateOfClimb: 730 },
		"7000": { vy: 82, rateOfClimb: 450 },
		"8000": { vy: 88, rateOfClimb: 220 },
		"9000": { vy: 93, rateOfClimb: 20 },
		"10000": null,
		"10500": null,
		"11700": null
	},
	"35000": {
		"5000": { vy: 70, rateOfClimb: 910 },
		"6000": { vy: 76, rateOfClimb: 570 },
		"7000": { vy: 82, rateOfClimb: 300 },
		"8000": { vy: 88, rateOfClimb: 70 },
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"37500": {
		"5000": { vy: 70, rateOfClimb: 730 },
		"6000": { vy: 76, rateOfClimb: 410 },
		"7000": { vy: 82, rateOfClimb: 140 },
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"40000": {
		"5000": { vy: 70, rateOfClimb: 550 },
		"6000": { vy: 76, rateOfClimb: 230 },
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"42500": {
		"5000": { vy: 70, rateOfClimb: 360 },
		"6000": { vy: 76, rateOfClimb: 50 },
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"45000": {
		"5000": { vy: 70, rateOfClimb: 170 },
		"6000": null,
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	}
};
const bestClimbDI400: BestClimbValues = {
	"0": {
		"5000": { vy: 84, rateOfClimb: 3010 },
		"6000": { vy: 86, rateOfClimb: 2430 },
		"7000": { vy: 87, rateOfClimb: 2000 },
		"8000": { vy: 89, rateOfClimb: 1670 },
		"9000": { vy: 93, rateOfClimb: 1400 },
		"10000": { vy: 98, rateOfClimb: 1180 },
		"10500": { vy: 101, rateOfClimb: 1070 },
		"11700": { vy: 106, rateOfClimb: 860 }
	},
	"2500": {
		"5000": { vy: 84, rateOfClimb: 2930 },
		"6000": { vy: 85, rateOfClimb: 2360 },
		"7000": { vy: 87, rateOfClimb: 1940 },
		"8000": { vy: 88, rateOfClimb: 1610 },
		"9000": { vy: 93, rateOfClimb: 1350 },
		"10000": { vy: 98, rateOfClimb: 1120 },
		"10500": { vy: 101, rateOfClimb: 1020 },
		"11700": { vy: 106, rateOfClimb: 810 }
	},
	"5000": {
		"5000": { vy: 82, rateOfClimb: 2750 },
		"6000": { vy: 84, rateOfClimb: 2200 },
		"7000": { vy: 85, rateOfClimb: 1800 },
		"8000": { vy: 88, rateOfClimb: 1480 },
		"9000": { vy: 93, rateOfClimb: 1230 },
		"10000": { vy: 98, rateOfClimb: 1010 },
		"10500": { vy: 101, rateOfClimb: 910 },
		"11700": { vy: 106, rateOfClimb: 700 }
	},
	"7500": {
		"5000": { vy: 80, rateOfClimb: 2570 },
		"6000": { vy: 82, rateOfClimb: 2050 },
		"7000": { vy: 83, rateOfClimb: 1660 },
		"8000": { vy: 88, rateOfClimb: 1360 },
		"9000": { vy: 93, rateOfClimb: 1100 },
		"10000": { vy: 98, rateOfClimb: 890 },
		"10500": { vy: 101, rateOfClimb: 790 },
		"11700": { vy: 106, rateOfClimb: 580 }
	},
	"10000": {
		"5000": { vy: 78, rateOfClimb: 2390 },
		"6000": { vy: 80, rateOfClimb: 1890 },
		"7000": { vy: 82, rateOfClimb: 1520 },
		"8000": { vy: 88, rateOfClimb: 1230 },
		"9000": { vy: 93, rateOfClimb: 980 },
		"10000": { vy: 98, rateOfClimb: 770 },
		"10500": { vy: 101, rateOfClimb: 670 },
		"11700": { vy: 106, rateOfClimb: 470 }
	},
	"12500": {
		"5000": { vy: 77, rateOfClimb: 2220 },
		"6000": { vy: 78, rateOfClimb: 1740 },
		"7000": { vy: 82, rateOfClimb: 1390 },
		"8000": { vy: 88, rateOfClimb: 1100 },
		"9000": { vy: 93, rateOfClimb: 850 },
		"10000": { vy: 98, rateOfClimb: 650 },
		"10500": { vy: 101, rateOfClimb: 550 },
		"11700": { vy: 106, rateOfClimb: 350 }
	},
	"15000": {
		"5000": { vy: 75, rateOfClimb: 2050 },
		"6000": { vy: 77, rateOfClimb: 1590 },
		"7000": { vy: 82, rateOfClimb: 1250 },
		"8000": { vy: 88, rateOfClimb: 960 },
		"9000": { vy: 93, rateOfClimb: 730 },
		"10000": { vy: 98, rateOfClimb: 520 },
		"10500": { vy: 101, rateOfClimb: 420 },
		"11700": { vy: 106, rateOfClimb: 230 }
	},
	"17500": {
		"5000": { vy: 73, rateOfClimb: 1880 },
		"6000": { vy: 76, rateOfClimb: 1440 },
		"7000": { vy: 82, rateOfClimb: 1110 },
		"8000": { vy: 88, rateOfClimb: 830 },
		"9000": { vy: 93, rateOfClimb: 600 },
		"10000": { vy: 98, rateOfClimb: 400 },
		"10500": { vy: 101, rateOfClimb: 300 },
		"11700": { vy: 106, rateOfClimb: 110 }
	},
	"20000": {
		"5000": { vy: 71, rateOfClimb: 1710 },
		"6000": { vy: 76, rateOfClimb: 1290 },
		"7000": { vy: 82, rateOfClimb: 970 },
		"8000": { vy: 88, rateOfClimb: 690 },
		"9000": { vy: 93, rateOfClimb: 470 },
		"10000": { vy: 98, rateOfClimb: 270 },
		"10500": { vy: 101, rateOfClimb: 170 },
		"11700": null
	},
	"22500": {
		"5000": { vy: 69, rateOfClimb: 1550 },
		"6000": { vy: 76, rateOfClimb: 1140 },
		"7000": { vy: 82, rateOfClimb: 820 },
		"8000": { vy: 88, rateOfClimb: 550 },
		"9000": { vy: 93, rateOfClimb: 330 },
		"10000": { vy: 98, rateOfClimb: 140 },
		"10500": { vy: 101, rateOfClimb: 40 },
		"11700": null
	},
	"25000": {
		"5000": { vy: 69, rateOfClimb: 1380 },
		"6000": { vy: 76, rateOfClimb: 990 },
		"7000": { vy: 82, rateOfClimb: 670 },
		"8000": { vy: 88, rateOfClimb: 410 },
		"9000": { vy: 93, rateOfClimb: 190 },
		"10000": { vy: 98, rateOfClimb: 0 },
		"10500": null,
		"11700": null
	},
	"27500": {
		"5000": { vy: 70, rateOfClimb: 1210 },
		"6000": { vy: 76, rateOfClimb: 830 },
		"7000": { vy: 82, rateOfClimb: 520 },
		"8000": { vy: 88, rateOfClimb: 260 },
		"9000": { vy: 93, rateOfClimb: 50 },
		"10000": null,
		"10500": null,
		"11700": null
	},
	"30000": {
		"5000": { vy: 70, rateOfClimb: 1040 },
		"6000": { vy: 76, rateOfClimb: 670 },
		"7000": { vy: 82, rateOfClimb: 370 },
		"8000": { vy: 88, rateOfClimb: 110 },
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"32500": {
		"5000": { vy: 70, rateOfClimb: 870 },
		"6000": { vy: 76, rateOfClimb: 510 },
		"7000": { vy: 82, rateOfClimb: 210 },
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"35000": {
		"5000": { vy: 70, rateOfClimb: 690 },
		"6000": { vy: 76, rateOfClimb: 340 },
		"7000": { vy: 82, rateOfClimb: 50 },
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"37500": {
		"5000": { vy: 70, rateOfClimb: 500 },
		"6000": { vy: 76, rateOfClimb: 160 },
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"40000": {
		"5000": { vy: 70, rateOfClimb: 300 },
		"6000": null,
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	},
	"42500": {
		"5000": { vy: 70, rateOfClimb: 100 },
		"6000": null,
		"7000": null,
		"8000": null,
		"9000": null,
		"10000": null,
		"10500": null,
		"11700": null
	}
};

export function bestClimb(weight: number, densityAltitude: number, dragIndex: number): TableEntry | null {
	function getDITableEntry(table: BestClimbValues): TableEntry | null {
		let entry = {
			vy: interpolateTable(table, densityAltitude, weight, values => values?.vy ?? null),
			rateOfClimb: interpolateTable(table, densityAltitude, weight, values => values?.rateOfClimb ?? null),
		};
		if (entry.vy === null || entry.rateOfClimb === null) return null;
		return entry as TableEntry;
	}

	let bestClimbTable = {
		"0": getDITableEntry(bestClimbDI0),
		"50": getDITableEntry(bestClimbDI50),
		"100": getDITableEntry(bestClimbDI100),
		"200": getDITableEntry(bestClimbDI200),
		"400": getDITableEntry(bestClimbDI400),
	};

	let bestClimb = {
		vy: interpolateTable({ "0": bestClimbTable }, 0, dragIndex, values => values?.vy ?? null),
		rateOfClimb: interpolateTable({ "0": bestClimbTable }, 0, dragIndex, values => values?.rateOfClimb ?? null),
	};
	if (bestClimb.vy === null || bestClimb.rateOfClimb === null) return null;
	return bestClimb as TableEntry;
}
