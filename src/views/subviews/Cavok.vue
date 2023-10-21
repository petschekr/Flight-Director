<template>
	<div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
		<button @click="connect" :disabled="connecting" v-if="!connected"
			class="self-end inline-flex rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition ease-in-out duration-150 disabled:cursor-not-allowed disabled:opacity-70">
			<svg v-if="connecting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			<template v-if="!connecting">
				Connect to Cavok
			</template>
			<template v-else>
				Connecting...
			</template>
		</button>

		<div v-if="connected" class="grid grid-cols-4 gap-6">
			<Listbox as="div" v-model="selected" v-if="connected">
				<ListboxLabel class="block font-medium leading-6 text-gray-900">Cockpit</ListboxLabel>
				<div class="relative mt-2">
					<ListboxButton class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
						<span class="flex items-center">
							<span class="inline-block h-2 w-2 flex-shrink-0 rounded-full" :style="`background-color: rgb(${selected?.color.red}, ${selected?.color.green}, ${selected?.color.blue})`" />
							<span class="ml-3 block truncate">{{ selected?.callsign ?? "No cockpits available" }}</span>
						</span>
						<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
						</span>
					</ListboxButton>

					<transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
						<ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
							<ListboxOption as="template" v-for="aircraft in selectableAircraft" :value="aircraft" v-slot="{ active, selected }">
								<li :class="[active ? 'bg-sky-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
									<div class="flex items-center">
										<span class="inline-block h-2 w-2 flex-shrink-0 rounded-full" :style="`background-color: rgb(${aircraft.color.red}, ${aircraft.color.green}, ${aircraft.color.blue})`" />
										<span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate']">
											{{ aircraft.callsign }}
										</span>
									</div>

									<span v-if="selected" :class="[active ? 'text-white' : 'text-sky-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
										<CheckIcon class="h-5 w-5" aria-hidden="true" />
									</span>
								</li>
							</ListboxOption>
						</ListboxOptions>
					</transition>
				</div>
			</Listbox>

			<div class="col-span-1">
				<label for="empty-weight" class="block text-sm font-medium text-gray-700">Empty Weight</label>
				<div class="mt-1 flex rounded-md shadow-sm">
					<input type="number" id="empty-weight" v-model="aircraftEmptyWeight"
						class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm z-10" />
					<span class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">lbs</span>
				</div>
				<p class="mt-2 text-sm text-gray-500">Aircraft weight without fuel, stores, or attachments. Use the same value from aircraft presets.</p>
			</div>

			<div class="col-span-1">
				<label for="stores-weight" class="block text-sm font-medium text-gray-700">Stores Weight</label>
				<div class="mt-1 flex rounded-md shadow-sm">
					<input type="number" id="stores-weight" v-model="aircraftStoresWeight"
						class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm z-10" />
					<span class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">lbs</span>
				</div>
				<p class="mt-2 text-sm text-gray-500">Weight of stores and other attachments to the wings. Use the same value from aircraft presets.</p>
			</div>
		</div>
	</div>

	<div class="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
		<canvas class="w-full" ref="hud"></canvas>
	</div>
</template>

<script setup lang="ts">
import { ref, inject, watch, watchEffect } from "vue";
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";

import { CAVOK_MANAGER, OPEN_ALERT } from "@/types/keys";
import type { AircraftData } from "@/types/cavok";

const cavokManager = inject(CAVOK_MANAGER);
const openAlert = inject(OPEN_ALERT);

const connecting = ref(false);
const connected = ref(false);
watchEffect(() => {
	connected.value = cavokManager?.connected ?? false;
});

async function connect() {
	if (!cavokManager || !openAlert) return;

	try {
		await cavokManager.connect();
	}
	catch (err: any) {
		await openAlert("Connection failure", err.message);
		return;
	}
}

interface SelectableAircraft {
	callsign: string;
	color: {
		red: number;
		green: number;
		blue: number;
	};
}

const selectableAircraft= ref<SelectableAircraft[]>([]);
const selected = ref<typeof selectableAircraft.value[0] | undefined>(selectableAircraft.value[0]);

watch(selected, () => {
	if (!cavokManager) return;
	cavokManager.selectedCallsign = selected.value?.callsign ?? null;
});

const aircraftEmptyWeight = ref(cavokManager?.emptyWeight ?? 0);
const aircraftStoresWeight = ref(cavokManager?.storesWeight ?? 0);
watch([aircraftEmptyWeight, aircraftStoresWeight], () => {
	if (!cavokManager) return;
	cavokManager.emptyWeight = aircraftEmptyWeight.value;
	cavokManager.storesWeight = aircraftStoresWeight.value;
});

function updateSelectableAircraft(allAircraft: Map<string, AircraftData>) {
	selectableAircraft.value = [...allAircraft.values()]
		.map(aircraft => ({
			callsign: aircraft.CallsignComponent.callsign,
			color: aircraft.GCSComponent.color,
		}))
		.sort((a, b) => a.callsign.localeCompare(b.callsign));
	if (!selected.value || !selectableAircraft.value.find(aircraft => aircraft.callsign === selected.value?.callsign)) {
		selected.value = selectableAircraft.value[0];
	}
}
cavokManager?.addChangeListener(updateSelectableAircraft);

///////////////////////////////////////////////////

const hud = ref<HTMLCanvasElement | null>(null);

</script>
