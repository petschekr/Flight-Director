<template>
	<div>
		<div class="flex flex-1 items-center justify-between">
			<div class="mr-2">
				<h1 class="text-2xl font-semibold text-gray-900">Daily Ops</h1>
				<h2 class="text-sm font-medium text-gray-500">Make sure callsign and take-off date are correct</h2>
			</div>
			<div class="flex flex-1 justify-end">
				<div class="w-40">
					<label for="callsign" class="block text-sm font-medium text-gray-700">Callsign:</label>
					<select id="callsign" v-model="selectedCallsign"
						class="mt-1 block w-full rounded-md font-bold border-gray-300 py-2 pl-3 pr-10 text-base focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm">
						<option v-for="callsign in callsigns" :key="callsign.id">{{callsign.callsign}}</option>
					</select>
				</div>
				<div class="ml-5 w-40">
					<label for="takeoff-date" class="block text-sm font-medium text-gray-700">Take-off Date:</label>
					<div class="mt-1">
						<input type="date" id="takeoff-date" v-model="selectedDate"
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
					</div>
				</div>
			</div>
		</div>
		<CardList :files="files" />
	</div>
</template>

<script setup lang="ts">
import { inject, ref, watch, computed, type Ref } from "vue"
import type { Configuration } from "@/models/configuration";

import CardList from "@/components/CardList.vue";

const configuration = inject<Ref<Configuration | null>>("configuration");

const selectedCallsign = ref(localStorage.getItem("callsign"));
watch(selectedCallsign, () => {
	localStorage.setItem("callsign", selectedCallsign.value || "");
});

const selectedDate = ref(new Date().toISOString().split("T")[0]); // Returns today's date

const callsigns = computed(() => {
	if (!configuration || !configuration.value) return [];
	return configuration.value["Daily Ops"].callsigns.map((callsign, index) => ({ id: index, callsign }));
});
const files = computed(() => {
	if (!configuration || !configuration.value) return [];
	return configuration.value["Daily Ops"].files;
});

</script>
