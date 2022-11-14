<template>
	<Nav @navigate="navigateTo" @search="searchOpen = true">
		<FileTab v-if="currentSidebarTab?.component === 'FileList'" :tab-name="currentSidebarTab?.name ?? ''" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign">
			<h1 class="text-2xl font-semibold text-gray-900">{{currentSidebarTab?.name ?? ''}}</h1>
			<h2 class="text-sm font-medium text-gray-500">{{currentSidebarTab?.description ?? ''}}</h2>
		</FileTab>
		<FileTab v-if="currentSidebarTab?.component === 'AllFiles'" tab-name="All Files" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign" />

		<Performance v-if="currentSidebarTab?.component === 'Performance'" />

		<Settings v-if="currentSidebarTab?.component === 'Settings'" />

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
type SidebarTab = Configuration["sidebarTab"][0];

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

const currentSidebarTab: Ref<SidebarTab | null> = ref(null);
function navigateTo(sidebarItem: SidebarTab) {
	currentSidebarTab.value = sidebarItem;
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
