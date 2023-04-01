<template>
	<div class="grid grid-cols-1 gap-6 sm:px-6 lg:grid-flow-col-dense lg:grid-cols-3">
		<section class="lg:col-span-1 lg:col-start-1">
			<!-- Airport information -->
			<div class="grid grid-cols-3 gap-2">
				<div>
					<label for="icao" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">ICAO Identifier</label>
					<div class="mt-1">
						<input type="text" name="icao" id="icao" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6" placeholder="KSSC" maxlength="4" />
					</div>
				</div>
				<Listbox as="div" v-model="selected" class="col-span-2">
					<ListboxLabel class="block text-sm font-medium leading-6 text-gray-900">Runway</ListboxLabel>
					<div class="relative mt-1">
						<ListboxButton class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm sm:leading-6">
							<span class="inline-flex w-full truncate">
								<span class="truncate font-semibold">{{ selected.name }}</span>
								<span class="ml-2 truncate text-gray-500">{{ selected.notes }}</span>
							</span>
							<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
							</span>
						</ListboxButton>

						<transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
							<ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
								<ListboxOption as="template" v-for="runway in runways" :key="runway.notes" :value="runway" v-slot="{ active, selected }">
									<li :class="[active ? 'bg-sky-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
										<div class="flex">
											<span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']">{{ runway.name }}</span>
											<span :class="[active ? 'text-sky-200' : 'text-gray-500', 'ml-2 truncate']">{{ runway.notes }}</span>
										</div>

										<span v-if="selected" :class="[active ? 'text-white' : 'text-sky-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
											<CheckIcon class="h-5 w-5" />
										</span>
									</li>
								</ListboxOption>
							</ListboxOptions>
						</transition>
					</div>
				</Listbox>
			</div>

			<canvas class="my-3 bg-white w-full h-60 rounded-md"></canvas>

			<div>
				<div class="sm:hidden">
					<label for="tabs" class="sr-only">Select a tab</label>
					<!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
					<select id="tabs" name="tabs" class="block w-full rounded-md border-gray-300 focus:border-sky-500 focus:ring-sky-500">
						<option v-for="tab in tabs" :key="tab.name" :selected="tab.current">{{ tab.name }}</option>
					</select>
				</div>
				<div class="hidden sm:block">
					<div class="border-b border-gray-200">
						<nav class="-mb-px flex space-x-4 justify-between" aria-label="Tabs">
							<a v-for="tab in tabs" :key="tab.name" :href="tab.href" :class="[tab.current ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium grow']" :aria-current="tab.current ? 'page' : undefined">
								<component :is="tab.icon" :class="[tab.current ? 'text-sky-500' : 'text-gray-400 group-hover:text-gray-500', '-ml-0.5 mr-2 h-5 w-5']" aria-hidden="true" />
								<span>{{ tab.name }}</span>
							</a>
						</nav>
					</div>
				</div>
			</div>
		</section>
		<section class="lg:col-span-2 lg:col-start-2">
			<!-- Aircraft information -->
			<div class="grid grid-cols-2 gap-y-2">
				<div class="col-span-2 flex space-x-2">
					<div class="grow">
						<label for="wind-direction" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Wind Direction</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="wind-direction" id="wind-direction" min="0" max="360" step="5" value="0" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">°M</span>
						</div>
					</div>
					<span class="self-end pb-1 font-semibold text-xl">@</span>
					<div class="grow">
						<label for="wind-speed" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Speed</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="wind-speed" id="wind-speed" min="0" max="100" step="1" value="0" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">kts</span>
						</div>
					</div>
					<span class="self-end pb-1 font-semibold text-xl">G</span>
					<div class="grow">
						<label for="wind-gust" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Gust</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="wind-gust" id="wind-gust" min="0" max="100" step="1" value="0" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">kts</span>
						</div>
					</div>
				</div>
				<div class="col-span-2 flex space-x-2">
					<div class="grow">
						<label for="temperature" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Temperature</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="temperature" id="temperature" min="-100" max="100" step="1" value="0" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">°C</span>
						</div>
					</div>
					<div class="grow">
						<label for="altimeter" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Altimeter</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="altimeter" id="altimeter" min="20.00" max="40.00" step="0.01" value="29.92" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">inHg</span>
						</div>
					</div>
					<div class="grow">
						<label for="weight" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Aircraft Weight</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" id="weight" v-model="aircraftWeight" min="5000" max="11700" step="100" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">lbs</span>
						</div>
					</div>
				</div>
			</div>

			<div class="border-l-4 border-red-400 bg-red-50 p-4 my-3">
				<div class="flex">
					<div class="flex-shrink-0">
						<XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Error(s) detected! </h3>
						<div class="mt-2 text-sm text-red-700">
							<ul role="list" class="list-disc space-y-1 pl-5">
								<li>Your password must be at least 8 characters</li>
								<li>Your password must include at least one pro wrestling finishing move</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<div>
				<dl class="mt-5 grid grid-cols-2 xl:grid-cols-4 divide-y divide-x divide-gray-200 rounded-lg bg-white shadow">
					<div v-for="item in takeOffStats" :key="item.name" class="px-4 py-5 flex items-center first:border-t-[1px] max-xl:odd:!border-l-0">
						<div :class="[item.color, 'rounded-md p-2 mr-3']">
							<component :is="item.icon" class="h-5 w-5 text-white" aria-hidden="true" />
						</div>
						<div>
							<dt>
								<p class="truncate text-base font-medium text-gray-500">{{ item.name }}</p>
							</dt>
							<dd class="flex items-center">
								<p class="text-2xl font-semibold text-gray-900">{{ item.stat }} <span class="text-lg font-normal">{{ item.unit }}</span></p>
							</dd>
						</div>
					</div>
				</dl>
			</div>
		</section>
	</div>

	<div class="bg-white px-4 py-5 mt-6 shadow sm:rounded-lg sm:p-6">
		<div class="md:grid md:grid-cols-4 md:gap-6">
			<div class="md:col-span-1">
				<h3 class="text-lg font-medium leading-6 text-gray-900">Drag Index</h3>
				<p class="mt-1 text-sm text-gray-500">Check your aircraft's configuration to set these correctly. 4-blade prop drag is assumed and automatically added for best glide calculation.</p>
			</div>
			<div class="mt-5 space-y-6 md:col-span-3 md:mt-0">
				<fieldset class="border-t border-b border-gray-200">
					<div class="divide-y divide-gray-200">
						<div v-for="dragItem in dragItems" :key="dragItem.index" class="relative flex items-start py-4">
							<div class="min-w-0 flex-1 text-sm">
								<label :for="dragItem.name.replace(/ /g, '')" class="font-medium text-gray-700">{{dragItem.name}}</label>
							</div>
							<div class="ml-3 flex h-5 items-center">
								<input v-if="dragItem.multiple" :id="dragItem.name.replace(/ /g, '')" @input="e => updateDragItemSelections(e, dragItem.index)" :value="dragItemSelections[dragItem.index] ?? 0"
									type="number" min="0" class="w-16 rounded border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
								<input v-else :id="dragItem.name.replace(/ /g, '')" @input="e => updateDragItemSelections(e, dragItem.index)" :checked="dragItemSelections[dragItem.index] ? true : false"
									type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
							</div>
						</div>
					</div>
				</fieldset>
				<p class="text-center font-semibold">Drag Index: {{dragIndex}}</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, type Ref, computed, inject } from "vue";
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { AdjustmentsHorizontalIcon, ChevronDoubleRightIcon, RadioIcon, XCircleIcon } from "@heroicons/vue/20/solid";
import { ArrowUturnUpIcon, ArrowPathIcon, ArrowTrendingUpIcon, ClockIcon, FlagIcon, LifebuoyIcon } from "@heroicons/vue/24/outline";

import { parse } from "csv-parse/browser/esm";
import toml from "toml";

import type { Performance } from "@/models/configuration";

const openAlert = inject<(title: string, message: string, okText?: string) => Promise<void>>("openAlert");

////////////////////////////////////////////

const takeOffStats = [
	{ name: "Accel Check", icon: ClockIcon, color: "bg-amber-500", stat: "15", unit: "Sec" },
	{ name: "Refusal", icon: FlagIcon, color: "bg-red-500", stat: "--", unit: "KIAS" },
	{ name: "Rotate", icon: ArrowUturnUpIcon, color: "bg-sky-500", stat: "97", unit: "KIAS" },
	{ name: "Liftoff", icon: ArrowTrendingUpIcon, color: "bg-green-500", stat: "104", unit: "KIAS" },
];

const tabs = [
	{ name: "Presets", href: "#", icon: AdjustmentsHorizontalIcon, current: true },
	{ name: "Runways", href: "#", icon: ChevronDoubleRightIcon, current: false },
	{ name: "Frequencies", href: "#", icon: RadioIcon, current: false },
];

const runways = [
	{ name: "04L", notes: "Best Wind" },
	{ name: "04R", notes: "Best Wind" },
	{ name: "22L", notes: "" },
	{ name: "22R", notes: "" },
];

const selected = ref(runways[0])

///////////////////////////////////////////

const performance: Ref<Performance | null> = ref(null);

const dragItems = computed(() => {
	if (!performance.value) return [];
	return performance.value["Drag Index"].map((item, index) => ({ ...item, index }));
});
const dragItemSelections: Ref<number[]> = ref(JSON.parse(localStorage.getItem("dragItemSelections") ?? "[]"));

const dragIndex = computed(() => {
	if (!performance.value) return 0;
	let dragIndex = 0;
	for (let [index, dragItem] of performance.value["Drag Index"].entries()) {
		dragIndex += dragItem.drag * (dragItemSelections.value[index] ?? 0);
	}
	return dragIndex;
});

function updateDragItemSelections(event: Event, index: number) {
	if (!performance.value) return [];

	let target = event.target as HTMLInputElement;
	let value = 0;
	if (target.type === "checkbox") {
		value = target.checked ? 1 : 0;
	}
	else if (target.type === "number") {
		value = parseInt(target.value);
	}
	dragItemSelections.value[index] = value;
}

const aircraftWeight = ref(parseInt(localStorage.getItem("aircraftWeight") ?? "11000"));

// Load configuration
try {
	let response = await fetch("/performance");
	performance.value = toml.parse(await response.text());
}
catch (err) {
	if (openAlert) {
		await openAlert("Couldn't load configuration", "Error parsing performance configuration file: " + err);
	}
	window.location.assign("/");
}

///////////////////////////////////////////

async function searchTSV<T>(url: string, predicate: (record: T) => boolean): Promise<T[]> {
	return new Promise(async (resolve, reject) => {
		const parser = parse({ columns: true, delimiter: "\t" });
		let foundRecords: T[] = [];
		parser.on("readable", () => {
			let record: T;
			while ((record = parser.read()) !== null) {
				if (predicate(record)) {
					foundRecords.push(record);
				}
			}
		});
		parser.on("end", () => {
			if (foundRecords.length > 0) {
				resolve(foundRecords);
			}
			else {
				reject("Identifier not found via predicate");
			}
		});

		let tsvContents = await fetch(url);
		parser.write(await tsvContents.text());
		parser.end();
	});
}

interface Airport {
	ARPT_IDENT: string;
	BEACON: "Y" | "N";
	ELEV: string; // Leading zero padded
	ICAO: string;
	MAG_VAR: string; // e.g. W007588 0123
	NAME: string;
}
async function getAirportInfo(identifier: string): Promise<Airport> {
	return searchTSV<Airport>("/download/DAFIFT/ARPT/ARPT.TXT", record => record.ICAO.toUpperCase() === identifier.toUpperCase()).then(airport => airport[0]);
}

interface Runway {
	ARPT_IDENT: string;
	SURFACE: string; // See legend
	RWY_WIDTH: string; // Zero padded
	CLD_RWY: "C" | ""; // Closed status

	HIGH_IDENT: string;
	HIGH_HDG: string; // Float
	HE_ELEV: string; // Float
	HE_SLOPE: string; // Float
	HE_TDZE: string; // Float
	HE_DT: string; // Displaced threshold, float
	HE_DT_ELEV: string; // Float
	HELAND_DIS: string;
	HE_TAKEOFF: string;
	HE_WGS_DLAT: string;
	HE_WGS_DLONG: string;

	LOW_IDENT: string;
	LOW_HDG: string; // Float
	LE_ELEV: string; // Float
	LE_SLOPE: string; // Float
	LE_TDZE: string; // Float
	LE_DT: string; // Displaced threshold, float
	LE_DT_ELEV: string; // Float
	LELAND_DIS: string;
	LE_TAKEOFF: string;
	LE_WGS_DLAT: string;
	LE_WGS_DLONG: string;
}

async function getRunwayInfo(airportIdentifier: string): Promise<Runway[]> {
	return searchTSV<Runway>("/download/DAFIFT/ARPT/RWY.TXT", record => record.ARPT_IDENT.toUpperCase() === airportIdentifier.toUpperCase());
}

//console.log(await getRunwayInfo((await getAirportInfo("KSSC")).ARPT_IDENT));

////////////////////////////////////////////////////////////
// TODO: need test cases

function pressureAltitude(fieldElevation: number, altimeter: number): number {
	return Math.round(fieldElevation + 1000 * (29.92 - altimeter));
}

function cToF(c: number): number {
	return c * (9 / 5) + 32;
}

function deltaISA_F(fieldElevation: number, oat: number): number {
	let isa = 15 - (2 * (fieldElevation / 1000)); // 2 deg C lapse rate per 1000 ft
	return cToF(oat) - cToF(isa);
}

function scale(n: number, inMin: number, inMax: number, outMin: number = 0, outMax: number = 1): number {
	if (inMin === inMax) return 0; // Instead of NaN when all inputs are the same
	return (n - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function calculatePolynomial(polynomial: number[], x: number): number {
	let result = 0;
	for (let [index, coefficient] of polynomial.entries()) {
		result += coefficient * Math.pow(x, polynomial.length - 1 - index);
	}
	return result;
}

function accelCheckTime(weight: number, pressureAltitude: number, deltaISA_F: number): number | null {
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

function rotationSpeed(weight: number): number {
	// 4-blade ATLC
	return Math.ceil(calculatePolynomial([-0.2039, 8.4759, 27.674], weight / 1000));
}

function liftoffSpeed(weight: number): number {
	// 4-blade ATLC
	return Math.ceil(calculatePolynomial([-0.1669, 7.0359, 46.411], weight / 1000));
}

function refusalSpeed(weight: number, pressureAltitude: number, deltaISA_F: number, runwayLength: number): number | null {
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

let pa = pressureAltitude(241, 27.16);
let d_isa = deltaISA_F(241, 28);
console.log(pa, d_isa, accelCheckTime(11700, pa, d_isa));
console.log("Rotate:", rotationSpeed(11700));
console.log("Refusal:", refusalSpeed(11700, pa, d_isa, 12000));
</script>
