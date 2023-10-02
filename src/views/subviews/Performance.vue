<template>
	<div class="grid grid-cols-1 xl:grid-cols-2 gap-3">
		<dl v-for="(substats, title) in stats" :class="['grid divide-y divide-x divide-gray-200 rounded-lg bg-white shadow', `grid-cols-${substats?.length}`]">
			<p :class="['text-center font-bold text-gray-600 py-2', `col-span-${substats?.length}`]">
				{{ title }}
			</p>
			<div v-for="stat in substats" :key="stat.name" class="px-4 py-4 flex justify-center items-center first:border-t-[1px] max-xl:odd:!border-l-0">
				<div :class="[stat.color, 'w-2 h-full mr-3 rounded-xl']"></div>
				<div>
					<dt>
						<p class="text-base leading-4 mb-2 font-medium text-gray-600">{{ stat.name }}</p>
					</dt>
					<dd class="flex items-center">
						<p class="text-2xl font-semibold text-gray-900 leading-5">
							{{ stat.stat ?? "--" }}
							<span class="text-xl font-normal">{{ stat.unit }}</span>
						</p>
					</dd>
				</div>
			</div>
		</dl>
	</div>

	<p class="text-center mt-4 font-semibold text-lg">{{aircraftWeight.toLocaleString()}} lbs // Drag Index: {{dragIndex}} // DA: {{ densityAltitude.toLocaleString() }} ft // HAT: {{heightAboveTerrain.toLocaleString()}} ft</p>
	<p class="text-center mb-4 font-semibold text-sm">Engine Out Drag Index: {{(dragIndex + (performance?.Propeller.feathered ?? 0)).toLocaleString()}} ({{(dragIndex + (performance?.Propeller.unfeathered ?? 0)).toLocaleString()}} unfeathered)</p>

	<div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
		<div class="md:grid md:grid-cols-4 md:gap-6">
			<div class="md:col-span-1">
				<h3 class="text-lg font-medium leading-6 text-gray-900">Aircraft Information</h3>
				<p class="mt-1 text-sm text-gray-500">
					Garbage in, garbage out.
					<br />
					Set an average fuel flow to automatically update the aircaft weight.
				</p>
			</div>
			<div class="mt-5 space-y-6 md:col-span-3 md:mt-0">
				<div class="grid grid-cols-4 gap-6">
					<div class="col-span-3 sm:col-span-1">
						<label for="weight" class="block text-sm font-medium text-gray-700">Aircraft Weight</label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input type="number" id="weight" v-model="aircraftWeight" min="5000" max="11700" step="100"
								class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm z-10" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">lbs</span>
						</div>
						<p class="mt-2 text-sm text-gray-500">Use Total AV Weight on VIT 99</p>
					</div>
					<div class="col-span-3 sm:col-span-1">
						<label for="density-altitude" class="block text-sm font-medium text-gray-700">Density Altitude</label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input type="number" id="density-altitude" v-model="densityAltitude" min="5000" max="45000" step="500"
								class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm z-10" />
							<span
								class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">ft</span>
						</div>
						<p class="mt-2 text-sm text-gray-500">Pressure altitude corrected for temperature</p>
					</div>
					<div class="col-span-3 sm:col-span-1">
						<label for="fuel-flow" class="block text-sm font-medium text-gray-700">Fuel Flow</label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input type="number" id="fuel-flow" v-model="fuelFlow" min="0" max="300" step="10"
								class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm z-10" />
							<span
								class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">lbs/hour</span>
						</div>
						<p class="mt-2 text-sm text-gray-500">Used to automatically update weight. Set to 0 to disable.</p>
					</div>
					<div class="col-span-3 sm:col-span-1">
						<label for="height-above-terrain" class="block text-sm font-medium text-gray-700">Height Above Terrain</label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input type="number" id="height-above-terrain" v-model="heightAboveTerrain" min="5000" max="45000" step="1000"
								class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm z-10" />
							<span
								class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">ft</span>
						</div>
						<p class="mt-2 text-sm text-gray-500">Affects glide distance</p>
					</div>
				</div>
			</div>

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
import { ref, type Ref, inject, computed, watchEffect, onMounted, onUnmounted } from "vue";

import toml from "toml";

import { bestGlideSpeed, bestGlideRange } from "@/performance/glide";
import { bestRange } from "@/performance/range";

import type { Performance } from "@/models/configuration";
const performance: Ref<Performance | null> = ref(null);

const openAlert = inject<(title: string, message: string, okText?: string) => Promise<void>>("openAlert");

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

const aircraftWeight = ref(parseInt(localStorage.getItem("aircraftWeight") ?? "11700"));
const densityAltitude = ref(parseInt(localStorage.getItem("densityAltitude") ?? "25000"));
const fuelFlow = ref(parseInt(localStorage.getItem("fuelFlow") ?? "200"));
const heightAboveTerrain = ref(parseInt(localStorage.getItem("heightAboveTerrain") ?? "20000"));

const stats = computed(() => {
	if (!performance.value) return {};

	const bestGlideSpeedFeathered = bestGlideSpeed(performance.value, dragIndex.value, true, aircraftWeight.value)?.toFixed(0);
	const bestGlideSpeedUnfeathered = bestGlideSpeed(performance.value, dragIndex.value, false, aircraftWeight.value)?.toFixed(0);
	const bestGlideRangeFeathered = bestGlideRange(performance.value, dragIndex.value, true, heightAboveTerrain.value)?.toFixed(1);
	const bestGlideRangeUnfeathered = bestGlideRange(performance.value, dragIndex.value, false, heightAboveTerrain.value)?.toFixed(1);

	const bestRangeValues = bestRange(aircraftWeight.value, densityAltitude.value, dragIndex.value);

	function round(input: number | null): string {
		if (input && !isNaN(input)) {
			return Math.round(input).toString();
		}
		return "--";
	}

	return {
		"Best Glide - Feathered": [
			{ name: "Glide Speed", color: "bg-red-500", stat: bestGlideSpeedFeathered, unit: "KIAS" },
			{ name: "Glide Range", color: "bg-amber-500", stat: bestGlideRangeFeathered, unit: "NM" },
		],
		"Best Glide - Unfeathered": [
			{ name: "Glide Speed", color: "bg-red-500", stat: bestGlideSpeedUnfeathered, unit: "KIAS" },
			{ name: "Glide Range", color: "bg-amber-500", stat: bestGlideRangeUnfeathered, unit: "NM" },
		],
		"Best Range - 100% Engine Speed": [
			{ name: "Best Range Speed", color: "bg-green-500", stat: round(bestRangeValues.max.kias), unit: "KIAS" },
			{ name: "Best Range Speed", color: "bg-green-700", stat: round(bestRangeValues.max.ktas), unit: "KTAS" },
			{ name: "Fuel Flow", color: "bg-blue-500", stat: round(bestRangeValues.max.ff), unit: "lbs/hr" },
		],
		"Best Range - Min Engine Speed": [
			{ name: "Best Range Speed", color: "bg-green-500", stat: round(bestRangeValues.min.kias), unit: "KIAS" },
			{ name: "Best Range Speed", color: "bg-green-700", stat: round(bestRangeValues.min.ktas), unit: "KTAS" },
			{ name: "Fuel Flow", color: "bg-blue-500", stat: round(bestRangeValues.min.ff), unit: "lbs/hr" },
		],
	};
});

function weightUpdater(secondsElapsed: number = 60) {
	aircraftWeight.value -= Math.round(fuelFlow.value / 60 * secondsElapsed / 60); // Fuel flow per minute * minutes elapsed
	if (aircraftWeight.value < 5000) {
		aircraftWeight.value = 5000;
	}
}
let weightUpdateInterval: number | null = null;
// Save values to localStorage when updated
watchEffect(() => {
	if (weightUpdateInterval) {
		clearInterval(weightUpdateInterval);
	}
	weightUpdateInterval = window.setInterval(weightUpdater, 60 * 1000); // Runs every minute

	localStorage.setItem("aircraftWeight", aircraftWeight.value.toString());
	localStorage.setItem("densityAltitude", densityAltitude.value.toString());
	localStorage.setItem("fuelFlow", fuelFlow.value.toString());
	localStorage.setItem("heightAboveTerrain", heightAboveTerrain.value.toString());
	localStorage.setItem("dragItemSelections", JSON.stringify(dragItemSelections.value));
});

onMounted(() => {
	let lastWeightUpdate = localStorage.getItem("lastWeightUpdate");
	if (!lastWeightUpdate) return;
	let secondsElapsed = (new Date().valueOf() - parseInt(lastWeightUpdate)) / 1000;
	if (secondsElapsed < 60) return;
	weightUpdater(secondsElapsed);
});
onUnmounted(() => {
	localStorage.setItem("lastWeightUpdate", new Date().valueOf().toString());
});

// Load configuration
try {
	let response = await fetch("/api/performance");
	performance.value = toml.parse(await response.text());
}
catch (err) {
	if (openAlert) {
		await openAlert("Couldn't load configuration", "Error parsing performance configuration file: " + err);
	}
	window.location.assign("/");
}
</script>
