<template>
	<div class="grid grid-cols-1 gap-6 sm:px-6 lg:grid-flow-col-dense lg:grid-cols-3">
		<section class="lg:col-span-1 lg:col-start-1">
			<!-- Airport information -->
			<div class="grid grid-cols-3 gap-2">
				<div>
					<label for="icao" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">ICAO Identifier</label>
					<div class="mt-1">
						<input type="text" name="icao" id="icao" v-model="icao" @keydown.enter="($event.target as HTMLInputElement).blur()" @blur="updateAirfield" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6" placeholder="KSSC" maxlength="4" autocomplete="off" />
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

			<h1 v-if="selectedAirfield" class="mt-1 capitalize font-bold">{{ selectedAirfield?.NAME.toLowerCase().replace(/\bAB\b/ig, "AB").replace(/\bAFB\b/ig, "AFB") }}</h1>
			<h1 v-else class="mt-1 capitalize italic">Loading...</h1>
			<canvas class="mt-1 mb-3 bg-white w-full h-60 rounded-md"></canvas>

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
							<input type="number" name="wind-direction" id="wind-direction" min="0" max="360" step="5" v-model="windDirection" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">°M</span>
						</div>
					</div>
					<span class="self-end pb-1 font-semibold text-xl">@</span>
					<div class="grow">
						<label for="wind-speed" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Speed</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="wind-speed" id="wind-speed" min="0" max="100" step="1" v-model="windSpeed" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">kts</span>
						</div>
					</div>
					<span class="self-end pb-1 font-semibold text-xl">G</span>
					<div class="grow">
						<label for="wind-gust" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Gust</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="wind-gust" id="wind-gust" min="0" max="100" step="1" v-model="windGust" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">kts</span>
						</div>
					</div>
				</div>
				<div class="col-span-2 flex space-x-2">
					<div class="grow">
						<label for="temperature" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Temperature</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="temperature" id="temperature" min="-100" max="100" step="1" v-model="temperature" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">°C</span>
						</div>
					</div>
					<div class="grow">
						<label for="altimeter" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Altimeter</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="altimeter" id="altimeter" min="20.00" max="40.00" step="0.01" v-model="altimeter" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">inHg</span>
						</div>
					</div>
					<div class="grow">
						<label for="weight" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Aircraft Weight</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" id="weight" min="5000" max="11700" step="100" v-model="aircraftWeight" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">lbs</span>
						</div>
					</div>
				</div>
			</div>

			<div class="border-l-4 border-red-400 bg-red-50 p-4 mt-3">
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
				<p class="text-center mt-1 text-lg">
					PA: <span class="font-semibold">{{ pressureAltitude }} ft</span> //
					DA: <span class="font-semibold">{{ densityAltitude }} ft</span> //
					ISA <span class="font-semibold">{{ isa }} °F</span> //
					TODA: <span class="font-semibold">{{ toda }}</span>
				</p>
				<dl class="mt-2 grid grid-cols-2 xl:grid-cols-4 divide-y divide-x divide-gray-200 rounded-lg bg-white shadow">
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
import { ref, type Ref, computed, inject, watchEffect } from "vue";
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { AdjustmentsHorizontalIcon, ChevronDoubleRightIcon, RadioIcon, XCircleIcon } from "@heroicons/vue/20/solid";
import { ArrowUturnUpIcon, ArrowTrendingUpIcon, ClockIcon, FlagIcon } from "@heroicons/vue/24/outline";

import { parse } from "csv-parse/browser/esm";
import toml from "toml";

import type { Performance } from "@/models/configuration";

import * as ATLCPerformance from "@/performance/ATLC";

const openAlert = inject<(title: string, message: string, okText?: string) => Promise<void>>("openAlert");

const icao = ref(localStorage.getItem("icao") ?? "");
const windDirection = ref(parseInt(localStorage.getItem("windDirection") ?? "0"));
const windSpeed = ref(parseInt(localStorage.getItem("windSpeed") ?? "0"));
const windGust = ref(parseInt(localStorage.getItem("windGust") ?? "0"));
const temperature = ref(parseInt(localStorage.getItem("temperature") ?? "15"));
// TODO: click for unit change
const altimeter = ref(parseFloat(localStorage.getItem("altimeter") ?? "29.92"));
const aircraftWeight = ref(parseInt(localStorage.getItem("aircraftWeight") ?? "11000"));

const selectedAirfield: Ref<Airport | null> = ref(null);
const selectedAirfieldRunways: Ref<Runway[]> = ref([]);
const selectedRunway: Ref<Runway | null> = ref(null);

const pressureAltitude = computed(() => {
	if (!selectedAirfield.value) return "--";
	return ATLCPerformance.pressureAltitude(parseInt(selectedAirfield.value.ELEV), altimeter.value).toLocaleString();
});
const densityAltitude = computed(() => {
	if (!selectedAirfield.value) return "--";
	return ATLCPerformance.densityAltitude(parseInt(selectedAirfield.value.ELEV), altimeter.value, temperature.value).toLocaleString();
});
const isa = computed(() => {
	if (!selectedAirfield.value) return "--";
	let isa = Math.round(ATLCPerformance.deltaISA_F(parseInt(selectedAirfield.value.ELEV), temperature.value));
	if (isa > 0) {
		return `+${isa}`;
	}
	else {
		return isa.toString();
	}
});
const toda = computed(() => {
	if (!selectedAirfield.value || !selectedRunway.value) return "-- ft";
	console.log(selectedRunway.value);
	return `${parseInt(selectedRunway.value.LENGTH).toLocaleString()} ft (${selectedRunway.value.LOW_IDENT}/${selectedRunway.value.HIGH_IDENT})`;
});
const accelCheckTime = computed(() => {
	if (!selectedAirfield.value) return "--";
	let elevation = parseInt(selectedAirfield.value.ELEV)
	let result = ATLCPerformance.accelCheckTime(
		aircraftWeight.value,
		ATLCPerformance.pressureAltitude(elevation, altimeter.value),
		ATLCPerformance.deltaISA_F(elevation, temperature.value)
	);
	if (result === null) return "--";
	return Math.ceil(result);
});
const refusalSpeed = computed(() => {
	if (!selectedAirfield.value || !selectedRunway.value) return "--";
	let elevation = parseInt(selectedAirfield.value.ELEV)
	let result = ATLCPerformance.refusalSpeed(
		aircraftWeight.value,
		ATLCPerformance.pressureAltitude(elevation, altimeter.value),
		ATLCPerformance.deltaISA_F(elevation, temperature.value),
		parseInt(selectedRunway.value.LENGTH), // TODO: takeoff distance can differ by runway direction
	);
	if (result === null) return "--";
	return Math.round(result);
});
const rotateSpeed = computed(() => {
	let result = ATLCPerformance.rotationSpeed(aircraftWeight.value);
	return Math.round(result);
});
const liftoffSpeed = computed(() => {
	let result = ATLCPerformance.liftoffSpeed(aircraftWeight.value);
	return Math.round(result);
});

const takeOffStats = computed(() => {
	let deemphasizeRefusalSpeed = typeof refusalSpeed.value === "number" && typeof rotateSpeed.value === "number" && refusalSpeed.value <= rotateSpeed.value;
	return [
		{ name: "Accel Check", icon: ClockIcon, color: "bg-amber-500", stat: accelCheckTime.value, unit: "Sec" },
		{ name: "Refusal", icon: FlagIcon, color: deemphasizeRefusalSpeed ? "bg-red-500" : "bg-red-200", stat: refusalSpeed.value, unit: "KIAS" },
		{ name: "Rotate", icon: ArrowUturnUpIcon, color: "bg-sky-500", stat: rotateSpeed.value, unit: "KIAS" },
		{ name: "Liftoff", icon: ArrowTrendingUpIcon, color: "bg-green-500", stat: liftoffSpeed.value, unit: "KIAS" },
	];
});

const tabs = [
	{ name: "Presets", href: "#", icon: AdjustmentsHorizontalIcon, current: true },
	{ name: "Runways", href: "#", icon: ChevronDoubleRightIcon, current: false },
	{ name: "Frequencies", href: "#", icon: RadioIcon, current: false },
];

const runways = ref([
	{ name: "Loading...", notes: "" },
]);

const selected = ref(runways.value[0])

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

// Save values to localStorage when updated
watchEffect(() => {
	localStorage.setItem("dragItemSelections", JSON.stringify(dragItemSelections.value));
	localStorage.setItem("aircraftWeight", aircraftWeight.value.toString());

	localStorage.setItem("icao", icao.value.toString());
	localStorage.setItem("windDirection", windDirection.value.toString());
	localStorage.setItem("windSpeed", windSpeed.value.toString());
	localStorage.setItem("windGust", windGust.value.toString());
	localStorage.setItem("temperature", temperature.value.toString());
	localStorage.setItem("altimeter", altimeter.value.toString());
	localStorage.setItem("aircraftWeight", aircraftWeight.value.toString());
});

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
	LENGTH: string;
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

async function updateAirfield() {
	let airport: Airport | null = selectedAirfield.value;
	selectedAirfield.value = null; // Shows loading text
	try {
		airport = await getAirportInfo(icao.value);
	}
	catch (err) {
		console.warn("Airport not found");
		selectedAirfield.value = airport;
		return;
	}
	selectedAirfieldRunways.value = await getRunwayInfo(airport.ARPT_IDENT);

	selectedAirfield.value = airport;

	runways.value = selectedAirfieldRunways.value
		.flatMap(runway => [runway.HIGH_IDENT, runway.LOW_IDENT])
		.sort()
		.map(name => ({ name, notes: "" }));
	selected.value = runways.value[0]; // TODO: select best wind
	selectedRunway.value = selectedAirfieldRunways.value[0];
}
updateAirfield();

</script>
