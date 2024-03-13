<template>
	<Nav @navigate="navigateTo" @search="searchOpen = true" @load-default-profile="loadDefaultConfiguration" @save-profile="saveConfiguration" @load-profile="openConfiguration">
		<FileTab v-if="currentSidebarTab?.component === 'FileList'" :tab-name="currentSidebarTab?.name ?? ''" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign">
			<h1 class="text-2xl font-semibold text-gray-900">{{currentSidebarTab?.name ?? ''}}</h1>
			<h2 class="text-sm font-medium text-gray-500">{{currentSidebarTab?.description ?? ''}}</h2>
		</FileTab>
		<FileTab v-if="currentSidebarTab?.component === 'AllFiles'" tab-name="All Files" :selected-callsign="selectedCallsign" @set-callsign="(callsign) => selectedCallsign = callsign" />

		<Performance v-if="currentSidebarTab?.component === 'Performance'" />

		<ATLC v-if="currentSidebarTab?.component === 'ATLC'" :dafifLocation="currentSidebarTab.dafifLocation" />

		<Cavok v-if="currentSidebarTab?.component === 'Cavok'" :cavokDomain="currentSidebarTab.cavokDomain" :cavokChannel="currentSidebarTab.cavokChannel" />

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
import { provide, ref, type Ref, reactive, onMounted, onUnmounted, watchEffect, watch } from "vue";
import { useRouter } from "vue-router";
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/outline'

import type { Configuration, Sidebar } from "@/types/configuration";

import FileTab from "@/views/subviews/FileTab.vue";
import Performance from "@/views/subviews/Performance.vue";
import ATLC from "@/views/subviews/ATLC.vue";
import Cavok from "@/views/subviews/Cavok.vue";
import Settings from "@/views/subviews/Settings.vue";

import Nav from "@/components/Nav.vue";
import SearchPalette from "@/components/SearchPalette.vue";
import Feedback from "@/components/Feedback.vue";
import Alert from "@/components/Alert.vue";

import { CavokManager } from "@/integrations/cavok";

import { CAVOK_MANAGER, CONFIGURATION, EDIT_MODE, OPEN_ALERT, OPEN_CONFIRM } from "@/types/keys";

const router = useRouter();

const searchOpen = ref(false);
const feedbackOpen = ref(false);

const configuration: Ref<Configuration | null> = ref(null);
provide(CONFIGURATION, configuration);

const editMode: Ref<boolean> = ref(false);
provide(EDIT_MODE, editMode);

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
provide(OPEN_ALERT, openAlert);
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
provide(OPEN_CONFIRM, openConfirm);

const cavokManager = reactive(new CavokManager()); // TODO: source from a configuration file
provide(CAVOK_MANAGER, cavokManager);

const selectedCallsign = ref(localStorage.getItem("callsign") ?? "");
watchEffect(() => {
	if (!configuration?.value) return;
	if (configuration.value.callsigns.length === 0) return;
	// If selectedCallsign is invalid, set it to the first in the list
	if (!configuration.value.callsigns.map(cs => cs.callsign).includes(selectedCallsign.value)) {
		selectedCallsign.value = configuration.value.callsigns[0].callsign;
	}
	localStorage.setItem("callsign", selectedCallsign.value);
});

const currentSidebarTab: Ref<Sidebar.Tab | null> = ref(null);
function navigateTo(sidebarItem: Sidebar.Tab) {
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
			throw new Error("Non-JSON formatted configuration profiles no longer supported");
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
		if (!configuration.value?.sidebarTab.find(tab => tab.component !== "Spacer" && router.currentRoute.value.path.indexOf(tab.href) === 0)) {
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
	let response = await fetch("/api/config");
	if (response.status === 200) {
		let configContents = await response.text();
		await loadConfiguration(configContents, false); // Don't cache the default configuration so the most recent version is always loaded
	}
	else if (response.status === 404) {
		// No default profile set in the PowerShell server
		let emptyConfiguration: Configuration = {
			"name": "No default profile found",
			"feedbackLocation": "",
			"callsigns": [],
			"sidebarTab": [
				{
					"component": "FileList",
					"name": "Getting Started",
					"description": "How to set up and use Flight Director",
					"href": "/getting-started",
					"icon": "HomeIcon"
				},
				{
					"component": "Settings",
					"name": "Settings",
					"href": "/settings",
					"icon": "Cog6ToothIcon"
				}
			],
			"tabs": {
				"Getting Started": {
					"Step-by-step": [
						{
							"name": "Server Configuration",
							"description": "How to set up Flight Director's PowerShell server",
							"color": "bg-blue-700",
							"abbreviation": "1.",
							"type": "Markdown",
							"markdown": {
								"template": "Flight Director is split into two major components: the web user interface that runs in your browser and the PowerShell server that interfaces with Windows on your behalf to interact with the filesystem and make web requests.\n\nMost of Flight Director's configuration can be done through the web user interface, but there are still a few key settings that must be set before you can get started.\n\n1. Right click `Flight Director Server.ps1` and click `Edit`.\n2. There are four settings you can tweak here. These are likely set-and-forget. See the comments within the file for an explanation of what they do.\n    1. Root directory location\n    2. Default profile location\n    3. Program file location\n    4. Port number that the server listens on\n3. Once you've made your tweaks, save the `.ps1` file.\n4. Test your changes by right clicking on the `.ps1` file and selecting `Run with PowerShell`\n5. The Flight Director server should start and the Flight Director GUI will open in your default browser.\n6. If the server fails to start, go back and double check your changes. The location settings should be strings with exactly one leading quote (`\"`) and exactly one ending quote."
							}
						},
						{
							"name": "Editing Profiles",
							"description": "How to edit profiles containing Flight Director's content",
							"color": "bg-emerald-600",
							"abbreviation": "2.",
							"type": "Markdown",
							"markdown": {
								"template": ""
							}
						},
						{
							"name": "Cavok Integration",
							"description": "Integrate Cavok for live aircraft data",
							"color": "bg-orange-400",
							"abbreviation": "3.",
							"type": "Markdown",
							"markdown": {
								"template": ""
							}
						}
					]
				}
			}
		};
		await loadConfiguration(JSON.stringify(emptyConfiguration), false); // Don't cache the empty configuration
	}
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
	if (localStorage.getItem("configuration")) {
		// Update localStorage configuration if the current configuration was already loaded from there
		localStorage.setItem("configuration", JSON.stringify(configuration.value));
	}
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
