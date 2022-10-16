<template>
	<Nav @navigate="navigateTo" @search="searchOpen = true">
		<Permissions v-if="!hasPermissions" @select-folder="obtainPermissions" />

		<FileTab tab-name="Daily Ops" :selected-callsign="selectedCallsign" v-if="hasPermissions && currentView === 'DailyOps'">
			<h1 class="text-2xl font-semibold text-gray-900">Daily Ops</h1>
			<h2 class="text-sm font-medium text-gray-500">Make sure callsign and take-off date are correct</h2>
		</FileTab>
		<FileTab tab-name="Manuals" :selected-callsign="selectedCallsign" v-if="hasPermissions && currentView === 'Manuals'">
			<h1 class="text-2xl font-semibold text-gray-900">Manuals</h1>
			<h2 class="text-sm font-medium text-gray-500">Technical Orders for the MQ-9A</h2>
		</FileTab>
		<FileTab tab-name="Operational Reference" :selected-callsign="selectedCallsign" v-if="hasPermissions && currentView === 'OpsRef'">
			<h1 class="text-2xl font-semibold text-gray-900">Operational Reference</h1>
			<h2 class="text-sm font-medium text-gray-500">Resources to keep handy for all flying operations</h2>
		</FileTab>
		<FileTab tab-name="Other" :selected-callsign="selectedCallsign" v-if="hasPermissions && currentView === 'Other'">
			<h1 class="text-2xl font-semibold text-gray-900">Other Resources</h1>
			<h2 class="text-sm font-medium text-gray-500">Non-critical documents and references</h2>
		</FileTab>
		<FileTab tab-name="All Files" :selected-callsign="selectedCallsign" v-if="hasPermissions && currentView === 'AllFiles'" />

		<SearchPalette :open="searchOpen" @closed="searchOpen = false" @set-callsign="(callsign) => selectedCallsign = callsign" />
	</Nav>
</template>

<script setup lang="ts">
import { provide, computed, ref, type Ref, onMounted, onUnmounted } from "vue";

import toml from "toml";

import Nav from "@/components/Nav.vue";
import Permissions from "@/components/Permissions.vue";
import FileTab from "@/views/subviews/FileTab.vue";
import type { Configuration } from "@/models/configuration";
import SearchPalette from "../components/SearchPalette.vue";

const searchOpen = ref(false);
const selectedCallsign = ref(localStorage.getItem("callsign") ?? "");
const hasPermissions = ref(false);
const rootDirectoryHandle: Ref<FileSystemDirectoryHandle | null> = ref(null);
const configuration: Ref<Configuration | null> = ref(null);
provide("configuration", configuration);
provide("rootDirectoryHandle", rootDirectoryHandle);

async function obtainPermissions() {
	try {
		rootDirectoryHandle.value = await window.showDirectoryPicker();
	}
	catch {
		hasPermissions.value = false;
		return;
	}
	hasPermissions.value = true;

	// Load configuration
	try {
		let configFileHandle = await rootDirectoryHandle.value.getFileHandle("flightdirector.toml");
		let configFile = await configFileHandle.getFile();
		configuration.value = toml.parse(await configFile.text());
	}
	catch (err) {
		alert("Error retrieving configuration file. Make sure you selected the top level of the 50th ATKS share drive\n" + err);
		window.location.reload();
		return;
	}
}

const currentView = ref("DailyOps");
function navigateTo(component: string) {
	currentView.value = component;
}

function handleKeys(e: KeyboardEvent) {
	if (e.ctrlKey && e.key === "k") {
		e.preventDefault();
		searchOpen.value = true;
	}
}
onMounted(() => document.addEventListener("keydown", handleKeys));
onUnmounted(() => document.removeEventListener("keydown", handleKeys));
</script>
