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
					<select id="callsign" v-model="selectedCallsign"
						class="mt-1 block w-full rounded-md font-bold border-gray-300 py-2 pl-3 pr-10 text-base focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm">
						<option v-for="callsign in callsigns" :key="callsign.id">{{callsign.callsign}}</option>
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
		<CardList :files="files" v-if="renderType === RenderType.Overview" />
		<File :file="fileRendered" v-if="renderType === RenderType.File" />
		<FileList :directory="directoryRendered" v-if="renderType === RenderType.Directory" />
	</div>
</template>

<script setup lang="ts">
import { inject, ref, watch, computed, type Ref, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";

import type { File as ConfigFileEntry, Configuration } from "@/models/configuration";
import type { FileRender, DirectoryRender } from "@/models/file-explorer";

import CardList from "@/components/CardList.vue";
import File from "@/components/File.vue";
import FileList from "@/components/FileList.vue";

import dayjs from "dayjs";

const props = defineProps<{
	tabName: keyof Configuration;
}>();

const configuration = inject<Ref<Configuration | null>>("configuration");
const rootDirectoryHandle = inject<Ref<FileSystemDirectoryHandle | null>>("rootDirectoryHandle");

const selectedCallsign: Ref<string> = ref(localStorage.getItem("callsign") ?? "");
watchEffect(() => {
	if (configuration?.value) {
		if (configuration?.value?.["Daily Ops"].callsigns.indexOf(selectedCallsign.value) === -1) {
			selectedCallsign.value = configuration?.value?.["Daily Ops"].callsigns[0];
		}
	}
});
watch(selectedCallsign, () => {
	localStorage.setItem("callsign", selectedCallsign.value || "");
});
const selectedDate = ref(new Date().toISOString().split("T")[0]); // Returns today's date
const callsigns = computed(() => {
	if (!configuration || !configuration.value) return [];
	return configuration.value["Daily Ops"].callsigns.map((callsign, index) => ({ id: index, callsign }));
});

function mapPathIdentifiers(file: ConfigFileEntry): ConfigFileEntry {
	const date = dayjs(selectedDate.value);
	let path = file.path;
	path = path.replace(/<callsign>/gi, selectedCallsign.value);
	path = path.replace(/<(.*?)>/gi, (_, format) => {
		return date.format(format);
	});
	return {
		...file,
		path,
	};
}
const files = computed(() => {
	if (!configuration || !configuration.value) return [];
	return configuration.value[props.tabName]?.files.map(mapPathIdentifiers) ?? [];
});

enum RenderType {
	Overview, // Grid with file links
	File,
	Directory,
}
const renderType: Ref<RenderType> = ref(RenderType.Overview);

const fileRendered: Ref<FileRender| null> = ref(null);
function setFileRendered(newFileRendered: FileRender) {
	// Unload the old object URL before creating a new one to prevent memory leaks
	if (fileRendered.value) {
		URL.revokeObjectURL(fileRendered.value.blobURL);
	}
	fileRendered.value = newFileRendered;
}
const directoryRendered: Ref<DirectoryRender | null> = ref(null);

const router = useRouter();
const route = useRoute();
watchEffect(async () => {
	if (!configuration?.value || !rootDirectoryHandle?.value) {
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
			let fileEntry = configuration.value[props.tabName].files
				.map(mapPathIdentifiers)
				.find(file => file.name === entryName);
			if (!fileEntry) {
				alert(`Couldn't find file/directory in configuration file: ${entryName}`);
				router.push("/" + route.params.path[0]); // Navigate to root of the tab
				return;
			}
			filePath = fileEntry.path.split("/");
		}
	}
	filePath = filePath.concat(routePath); // If routePath still has items on it, they're subitems of the looked-up filePath

	let rootHandle: FileSystemDirectoryHandle = rootDirectoryHandle.value;
	let foundHandle: FileSystemDirectoryHandle | FileSystemFileHandle | null = rootHandle;

	let currentFilePath = [...filePath];
	while (currentFilePath.length > 0) {
		foundHandle = null;
		let currentPathItem = currentFilePath.shift();
		for await (const handle of rootHandle.values()) {
			if (handle.name === currentPathItem) {
				foundHandle = handle;
				break;
			}
		}
		if (!foundHandle) {
			// Specified file or folder not found
			alert(`Couldn't find specified file/directory: ${filePath.join("/")}`);
			router.push("/" + route.params.path[0]); // Navigate to root of the tab
			return;
		}
		if (foundHandle.kind === "directory") {
			rootHandle = foundHandle;
		}
	}

	if (foundHandle?.kind === "directory") {
		directoryRendered.value = {
			directory: foundHandle,
			location: {
				path: filePath,
				fromRoot: props.tabName === "All Files",
			},
		};

		renderType.value = RenderType.Directory;
	}
	else if (foundHandle?.kind === "file") {
		let file = await foundHandle.getFile();
		// Find common name for this file from configuration's name for it
		let commonName = file.name;
		if (configuration?.value && props.tabName !== "All Files") {
			commonName = configuration.value[props.tabName].files
				.map(mapPathIdentifiers)
				.find(file => file.path === filePath.join("/"))?.name
				?? file.name;
		}

		let newFileRendered: FileRender = {
			file,
			path: filePath,
			commonName,
			blobURL: URL.createObjectURL(file),
		};
		setFileRendered(newFileRendered);

		renderType.value = RenderType.File;
	}
});
</script>