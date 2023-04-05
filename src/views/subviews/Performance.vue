<template>
	<dl class="grid grid-cols-1 gap-5 sm:grid-cols-4">
		<div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
			<dt class="truncate text-sm font-medium text-gray-500">Best Glide Speed (Feathered)</dt>
			<dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{{bestGlideSpeedFeathered}} KIAS</dd>
		</div>
		<div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
			<dt class="truncate text-sm font-medium text-gray-500">Glide Range (Feathered)</dt>
			<dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{{bestGlideRangeFeathered}} NM</dd>
		</div>
		<div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
			<dt class="truncate text-sm font-medium text-gray-500">Best Glide Speed (Unfeathered)</dt>
			<dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{{bestGlideSpeedUnfeathered}} KIAS</dd>
		</div>
		<div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
			<dt class="truncate text-sm font-medium text-gray-500">Glide Range (Unfeathered)</dt>
			<dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{{bestGlideRangeUnfeathered}} NM</dd>
		</div>
	</dl>
	<p class="text-center mt-4 font-semibold text-lg">{{aircraftWeight.toLocaleString()}} lbs // Drag Index: {{dragIndex}} // {{altitude.toLocaleString()}} ft</p>
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
				<div class="grid grid-cols-3 gap-6">
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
						<label for="altitude" class="block text-sm font-medium text-gray-700">Altitude</label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input type="number" id="altitude" v-model="altitude" min="5000" max="45000" step="1000"
								class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm z-10" />
							<span
								class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">ft</span>
						</div>
						<p class="mt-2 text-sm text-gray-500">Height above terrain</p>
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

import * as GlidePerformance from "@/performance/glide";

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

const aircraftWeight = ref(parseInt(localStorage.getItem("aircraftWeight") ?? "5000"));
const fuelFlow = ref(parseInt(localStorage.getItem("fuelFlow") ?? "200"));
const altitude = ref(parseInt(localStorage.getItem("altitude") ?? "20000"));

const bestGlideSpeedFeathered = computed(() => performance.value ? GlidePerformance.bestGlideSpeed(performance.value, dragIndex.value, true, aircraftWeight.value)?.toFixed(0) ?? "--" : "--");
const bestGlideSpeedUnfeathered = computed(() => performance.value ? GlidePerformance.bestGlideSpeed(performance.value, dragIndex.value, false, aircraftWeight.value)?.toFixed(0) ?? "--" : "--");
const bestGlideRangeFeathered = computed(() => performance.value ? GlidePerformance.bestGlideRange(performance.value, dragIndex.value, true, altitude.value)?.toFixed(1) ?? "--" : "--");
const bestGlideRangeUnfeathered = computed(() => performance.value ? GlidePerformance.bestGlideRange(performance.value, dragIndex.value, false, altitude.value)?.toFixed(1) ?? "--" : "--");

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
	localStorage.setItem("fuelFlow", fuelFlow.value.toString());
	localStorage.setItem("altitude", altitude.value.toString());
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
	let response = await fetch("/performance");
	performance.value = toml.parse(await response.text());
}
catch (err) {
	if (openAlert) {
		await openAlert("Couldn't load configuration", "Error parsing performance configuration file: " + err);
	}
	window.location.assign("/");
}
</script>
