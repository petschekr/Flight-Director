<template>
	<Nav @navigate="navigateTo" @search="searchOpen = true">
		<FileTab v-if="currentView === 'DailyOps'" tab-name="Daily Ops" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign">
			<h1 class="text-2xl font-semibold text-gray-900">Daily Ops</h1>
			<h2 class="text-sm font-medium text-gray-500">Make sure callsign and take-off date are correct</h2>
		</FileTab>
		<FileTab v-if="currentView === 'Manuals'" tab-name="Manuals" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign">
			<h1 class="text-2xl font-semibold text-gray-900">Manuals</h1>
			<h2 class="text-sm font-medium text-gray-500">Technical Orders for the MQ-9A</h2>
		</FileTab>
		<FileTab v-if="currentView === 'OpsRef'" tab-name="Operational Reference" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign">
			<h1 class="text-2xl font-semibold text-gray-900">Operational Reference</h1>
			<h2 class="text-sm font-medium text-gray-500">Resources to keep handy for all flying operations</h2>
		</FileTab>
		<FileTab v-if="currentView === 'Other'" tab-name="Other" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign">
			<h1 class="text-2xl font-semibold text-gray-900">Other Resources</h1>
			<h2 class="text-sm font-medium text-gray-500">Non-critical documents and references</h2>
		</FileTab>
		<FileTab v-if="currentView === 'AllFiles'" tab-name="All Files" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign" />

		<Performance v-if="currentView === 'Performance'" />

		<Settings v-if="currentView === 'Settings'" />

		<SearchPalette :open="searchOpen" @closed="searchOpen = false" @set-callsign="(callsign) => selectedCallsign = callsign" />
	</Nav>
</template>

<script setup lang="ts">
import { provide, computed, ref, type Ref, onMounted, onUnmounted, watchEffect } from "vue";

import toml from "toml";

import Nav from "@/components/Nav.vue";
import FileTab from "@/views/subviews/FileTab.vue";
import Performance from "@/views/subviews/Performance.vue";
import Settings from "./subviews/Settings.vue";
import type { Configuration } from "@/models/configuration";
import SearchPalette from "../components/SearchPalette.vue";

const searchOpen = ref(false);
const configuration: Ref<Configuration | null> = ref(null);
provide("configuration", configuration);

const selectedCallsign = ref(localStorage.getItem("callsign") ?? "");
watchEffect(() => {
	if (!configuration?.value) return;
	// If selectedCallsign is invalid, set it to the first in the list
	if (!configuration.value.callsigns.map(cs => cs.callsign).includes(selectedCallsign.value)) {
		selectedCallsign.value = configuration.value.callsigns[0].callsign;
	}
	localStorage.setItem("callsign", selectedCallsign.value);
});

const currentView = ref("DailyOps");
function navigateTo(component: string) {
	currentView.value = component;
}

function handleKeys(e: KeyboardEvent) {
	if (e.ctrlKey && (e.key === " " || e.key === "k")) {
		e.preventDefault();
		searchOpen.value = true;
	}
}
onMounted(() => document.addEventListener("keydown", handleKeys));
onUnmounted(() => document.removeEventListener("keydown", handleKeys));

// Load configuration
try {
	let response = await fetch("/download/flightdirector.toml");
	configuration.value = toml.parse(await response.text());
}
catch (err) {
	alert("Error parsing configuration file\n" + err);
	window.location.reload();
}
</script>
