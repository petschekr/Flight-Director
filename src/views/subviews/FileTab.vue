<template>
	<div class="h-full">
		<div v-if="renderType === RenderType.Overview"
			class="flex flex-1 items-center flex-wrap justify-start sm:flex-nowrap sm:justify-between">
			<div class="mr-2">
				<slot />
			</div>
			<div class="flex flex-1 justify-start mt-2 sm:justify-end sm:mt-0">
				<div class="w-full sm:w-40">
					<label for="callsign" class="block text-sm font-medium text-gray-700">Callsign:</label>
					<select id="callsign" :value="selectedCallsign" @change="callsignChange"
						class="mt-1 block w-full rounded-md font-bold border-gray-300 py-2 pl-3 pr-10 text-base focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm">
						<option v-for="callsign in callsigns" :key="callsign">{{callsign}}</option>
					</select>
				</div>
				<div class="ml-5 w-full sm:w-40">
					<label for="takeoff-date" class="block text-sm font-medium text-gray-700">Take-off Date:</label>
					<div class="mt-1">
						<input type="date" id="takeoff-date" v-model="selectedDate"
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
					</div>
				</div>
			</div>
		</div>
		<CardList :file-groups="fileGroups" v-if="renderType === RenderType.Overview" />
		<File :file="fileRendered" v-if="renderType === RenderType.File" />
		<FileList :directory="directoryRendered" v-if="renderType === RenderType.Directory" />
		<Alert :title="alert.title" :message="alert.message" :open="alert.open" @closed="alert.open = false" />
	</div>
</template>

<script setup lang="ts">
import { provide, inject, ref, watch, computed, type Ref, watchPostEffect } from "vue";
import { useRouter, useRoute } from "vue-router";

import type { File as ConfigFileEntry, Configuration } from "@/models/configuration";
import type { FileRender, DirectoryRender, FileFromAPI, DirectoryFromAPI } from "@/models/file-explorer";

import CardList from "@/components/CardList.vue";
import File from "@/components/File.vue";
import FileList from "@/components/FileList.vue";
import Alert from "@/components/Alert.vue";

import dayjs from "dayjs";

const props = defineProps<{
	tabName: keyof Configuration["tabs"] | "All Files";
	selectedCallsign: string;
}>();
const emit = defineEmits<{
	(e: "setCallsign", callsign: string): void;
}>();

const configuration = inject<Ref<Configuration | null>>("configuration");

const alert: Ref<{
	open: boolean;
	title?: string;
	message?: string;
	okText?: string;
}> = ref({ open: false });
function openAlert(title: string, message: string, okText = "OK"): Promise<void> {
	return new Promise((resolve, reject) => {
		alert.value = { title, message, okText, open: true };
		watch(alert.value, () => {
			if (!alert.value.open) {
				resolve();
			}
		});
	});
}

const selectedDate = ref(localStorage.getItem("selectedDate") ?? new Date().toISOString().split("T")[0]); // Returns today's date
watch(selectedDate, () => {
	localStorage.setItem("selectedDate", selectedDate.value);
});
const callsigns = computed(() => {
	if (!configuration || !configuration.value) return [];
	return configuration.value.callsigns.map(cs => cs.callsign);
});
function callsignChange(event: Event) {
	let target = event.target as HTMLSelectElement;
	emit("setCallsign", target.value);
}

function processPathReplacements(path: string): string {
	const date = dayjs(selectedDate.value);
	path = path.replace(/<callsign-path>/gi, (configuration?.value?.callsigns ?? []).find(cs => cs.callsign === props.selectedCallsign)?.path ?? ""); // Can contain replacements itself so must go first
	path = path.replace(/<callsign>/gi, props.selectedCallsign);

	let shortCallsign = props.selectedCallsign;
	let callsignComponents = props.selectedCallsign.match(/^([a-zA-Z]+)(\d+)$/);
	if (callsignComponents) {
		shortCallsign = (callsignComponents[1][0] + callsignComponents[1][callsignComponents[1].length - 1]).toUpperCase() + callsignComponents[2]; // Grabs first + last letter + numbers of callsign
	}
	path = path.replace(/<short-callsign>/gi, shortCallsign);

	path = path.replace(/<(.*?)>/gi, (_, format) => {
		return date.format(format);
	});
	return path;
}
provide("processPathReplacements", processPathReplacements);
function mapPathIdentifiers(file: ConfigFileEntry): ConfigFileEntry {
	return {
		...file,
		rawPath: file.path,
		path: processPathReplacements(file.path),
	};
}

// Files for grid list overview
const fileGroups = computed(() => {
	if (!configuration || !configuration.value || props.tabName === "All Files" || !configuration.value.tabs[props.tabName]) return [];

	return Object.entries(configuration.value.tabs[props.tabName]).map(entry => {
		return {
			tabName: props.tabName.toString(),
			groupName: entry[0],
			files: entry[1].map(mapPathIdentifiers),
		};
	});
});

enum RenderType {
	Overview, // Grid with file links
	File,
	Directory,
}
const renderType: Ref<RenderType> = ref(RenderType.Overview);

const fileRendered: Ref<FileRender| null> = ref(null);
const directoryRendered: Ref<DirectoryRender | null> = ref(null);

const router = useRouter();
const route = useRoute();
watchPostEffect(async () => {
	if (!configuration?.value) {
		renderType.value = RenderType.Overview;
		return;
	}

	function stringToArray(input: string[] | string): string[] {
		if (Array.isArray(input)) return [...input];
		if (input === "") return [];
		return [input];
	}
	let routePath = stringToArray(route.params.path);
	routePath.shift(); // Remove first part of path that refers to selected sidebar tab

	let filePath: string[] = [];
	if (props.tabName !== "All Files") {
		// Need to look up entry to find beginning of real path
		let entryName = routePath.shift();
		if (!entryName) {
			renderType.value = RenderType.Overview;
			return;
		}
		else {
			let fileEntry = Object.values(configuration.value.tabs[props.tabName])
				.flat()
				.map(mapPathIdentifiers)
				.find(file => file.name === entryName);
			if (!fileEntry) {
				await openAlert(
					"Entry not found in configuration",
					`Couldn't find entry in the configuration: ${entryName}`
				);
				router.push("/" + route.params.path[0]); // Navigate to root of the tab
				return;
			}
			filePath = fileEntry.path.split("/");
		}
	}
	filePath = filePath.concat(routePath); // If routePath still has items on it, they're subitems of the looked-up filePath

	let itemInfoResponse = await fetch("/api/" + filePath.join("/"));
	if (itemInfoResponse.status === 200) {
		let itemInfo: FileFromAPI | (DirectoryFromAPI | FileFromAPI)[] = await itemInfoResponse.json();
		if (Array.isArray(itemInfo)) {
			// Directory
			directoryRendered.value = {
				directory: itemInfo,
				location: {
					path: filePath,
					fromRoot: props.tabName === "All Files",
				},
			};

			renderType.value = RenderType.Directory;
		}
		else {
			// Find common name for this file from configuration's name for it
			let commonName = itemInfo.name;
			if (configuration?.value && props.tabName !== "All Files") {
				commonName = Object.values(configuration.value.tabs[props.tabName])
					.flat()
					.map(mapPathIdentifiers)
					.find(file => file.path.toLowerCase() === filePath.join("/").toLowerCase())?.name
					?? itemInfo.name;
			}

			fileRendered.value = {
				file: itemInfo,
				path: filePath,
				commonName,
			};

			renderType.value = RenderType.File;
		}
	}
	else {
		// Specified file or folder not found
		await openAlert(
			"File or directory not found",
			`Couldn't find file or directory as specified in the configuration: ${filePath.join("/")}. Going to the folder that might contain it.`
		);

		// Recurse upwards until we find a folder that exists
		while (filePath.length > 0) {
			filePath.pop();
			let itemInfoResponse = await fetch("/api/" + filePath.join("/"));
			if (itemInfoResponse.status === 200) {
				router.push("/files/" + filePath.join("/"));
				return;
			}
		}
		router.push("/" + route.params.path[0]); // Navigate to root of the tab
	}
});
</script>
