<template>
	<Nav @navigate="navigateTo" @search="searchOpen = true" @load-default-profile="loadDefaultConfiguration" @save-profile="saveConfiguration" @load-profile="openConfiguration">
		<FileTab v-if="currentSidebarTab?.component === 'FileList'" :tab-name="currentSidebarTab?.name ?? ''" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign">
			<h1 class="text-2xl font-semibold text-gray-900">{{currentSidebarTab?.name ?? ''}}</h1>
			<h2 class="text-sm font-medium text-gray-500">{{currentSidebarTab?.description ?? ''}}</h2>
		</FileTab>
		<FileTab v-if="currentSidebarTab?.component === 'AllFiles'" tab-name="All Files" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign" />

		<Performance v-if="currentSidebarTab?.component === 'Performance'" />

		<Settings v-if="currentSidebarTab?.component === 'Settings'" />

		<SearchPalette :open="searchOpen" @closed="searchOpen = false" @set-callsign="(callsign) => selectedCallsign = callsign" />
		<Feedback :open="feedbackOpen" @closed="feedbackOpen = false" />

		<button title="Submit Feedback" @click="feedbackOpen = true"
			class="transition-all fixed bottom-6 right-6 inline-flex items-center rounded-full opacity-60 hover:opacity-100 border border-transparent bg-white p-3 text-gray-800 drop-shadow-md hover:drop-shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
			<ChatBubbleOvalLeftEllipsisIcon class="h-6 w-6" />
		</button>
	</Nav>

	<Alert :type="alert.type" :title="alert.title" :message="alert.message" :open="alert.open" @closed="alertClosed" />
</template>

<script setup lang="ts">
import { provide, computed, ref, type Ref, onMounted, onUnmounted, watchEffect, watch } from "vue";
import { useRouter } from "vue-router";

import toml from "toml";

import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/outline'

import Nav from "@/components/Nav.vue";
import FileTab from "@/views/subviews/FileTab.vue";
import Performance from "@/views/subviews/Performance.vue";
import Settings from "./subviews/Settings.vue";
import type { Configuration } from "@/models/configuration";
import SearchPalette from "../components/SearchPalette.vue";
import Feedback from "../components/Feedback.vue";
import Alert from "@/components/Alert.vue";
type SidebarTab = Configuration["sidebarTab"][0];

const router = useRouter();

const searchOpen = ref(false);
const feedbackOpen = ref(false);

const configuration: Ref<Configuration | null> = ref(null);
provide("configuration", configuration);

const editMode: Ref<boolean> = ref(false);
provide("editMode", editMode);

const alert: Ref<{
	type: "alert" | "confirm";
	title?: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;

	open: boolean;
	value?: boolean;
}> = ref({ type: "alert" as const, open: false });
function alertClosed(value: boolean) {
	alert.value.open = false;
	alert.value.value = value;
}
function openAlert(title: string, message: string, cancelText = "OK"): Promise<void> {
	return new Promise((resolve, reject) => {
		// The setTimeout() prevents dialog from dismissing without being seen if triggered by an enter key event
		setTimeout(() => {
			alert.value = { type: "alert", title, message, cancelText, open: true };
			watch(alert.value, () => {
				if (!alert.value.open) {
					resolve();
				}
			});
		}, 0);
	});
}
provide("openAlert", openAlert);
function openConfirm(title: string, message: string, confirmText = "OK", cancelText = "Cancel"): Promise<boolean> {
	return new Promise((resolve, reject) => {
		// The setTimeout() prevents dialog from dismissing without being seen if triggered by an enter key event
		setTimeout(() => {
			alert.value = { type: "confirm", title, message, confirmText, cancelText, open: true };
			watch(alert.value, () => {
				if (!alert.value.open) {
					resolve(!!alert.value.value);
				}
			});
		}, 0);
	});
}
provide("openConfirm", openConfirm);

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

async function loadConfiguration(configContents: string, shouldCache = true) {
	// Warn if current configuration is not saved before overwriting it
	if (configuration.value?.unsaved) {
		if (!await openConfirm("Overwrite current profile?", "Your current profile has unsaved changes. Are you sure you want to overwrite these by loading a different profile?")) {
			return;
		}
	}
	try {
		if (configContents.trimStart().charAt(0) === '{') {
			// Assume JSON
			configuration.value = JSON.parse(configContents);
		}
		else {
			// Assume TOML
			configuration.value = toml.parse(configContents);
		}

		if (shouldCache) {
			// Save for fast reload on page refresh
			localStorage.setItem("configuration", JSON.stringify(configuration.value));
		}
		else {
			localStorage.removeItem("configuration");
		}

		// If loaded profile does not have current path, load root
		// This happens when loading a profile that does not have the current selected tab
		if (!configuration.value?.sidebarTab.find(tab => tab.href && router.currentRoute.value.path.indexOf(tab.href) === 0)) {
			router.push("/");
		}
	}
	catch (err) {
		openAlert("Couldn't load configuration", "There was an error parsing/loading the configuration file: " + err);
		localStorage.removeItem("configuration");
		window.location.reload();
	}

}
async function openConfiguration() {
	const [fileHandle] = await window.showOpenFilePicker({
		multiple: false,
		types: [{
			description: "Flight Director Profile",
			accept: { "application/json": [".json"] },
		}],
	});
	const file = await fileHandle.getFile();
	const configContents = await file.text();
	await loadConfiguration(configContents);
}
async function loadDefaultConfiguration() {
	// Default configuration location is set in the PowerShell server
	let response = await fetch("/config");
	let configContents = await response.text();
	await loadConfiguration(configContents, false); // Don't cache the default configuration so the most recent version is always loaded
}
async function firstPageLoadConfiguration() {
	let previousConfiguration = localStorage.getItem("configuration");
	if (previousConfiguration) {
		await loadConfiguration(previousConfiguration);
	}
	else {
		await loadDefaultConfiguration();
	}
}
await firstPageLoadConfiguration();

async function saveConfiguration() {
	if (!configuration.value) return;

	let profileName = prompt("Profile name:", configuration.value.name)?.trim();
	if (!profileName) return; // User canceled
	configuration.value.name = profileName;

	const fileHandle = await window.showSaveFilePicker({
		suggestedName: configuration.value.name,
		types: [{
			description: "Flight Director Profile",
			accept: { "application/json": [".json"] },
		}],
	});
	const stream = await fileHandle.createWritable();

	configuration.value.unsaved = undefined;
	await stream.write(JSON.stringify(configuration.value, null, "\t"));
	await stream.close();
}

window.addEventListener("beforeunload", e => {
	if (configuration.value?.unsaved) {
		e.preventDefault();
		e.returnValue = "The current profile has unsaved changes"
	}
}, { "capture": true });
</script>
