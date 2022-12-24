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
						<option v-if="editMode">Edit callsigns...</option>
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
		<CardList :file-groups="fileGroups" :tabName="tabName as string" v-if="renderType === RenderType.Overview" />
		<File :file="fileRendered" v-if="renderType === RenderType.File" />
		<FileList :directory="directoryRendered" v-if="renderType === RenderType.Directory" />
		<Alert :title="alert.title" :message="alert.message" :open="alert.open" @closed="alert.open = false" />
		<EditCallsigns :open="editCallsignsPanelOpen" @closed="editCallsignsPanelOpen = false" />
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
import EditCallsigns from "@/components/EditCallsigns.vue";

import dayjs from "dayjs";

const props = defineProps<{
	tabName: keyof Configuration["tabs"] | "All Files";
	selectedCallsign: string;
}>();
const emit = defineEmits<{
	(e: "setCallsign", callsign: string): void;
}>();

const configuration = inject<Ref<Configuration | null>>("configuration");
const editMode = inject<Ref<boolean>>("editMode");
const editCallsignsPanelOpen = ref(false);

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
	if (target.value === "Edit callsigns...") {
		target.value = configuration?.value?.callsigns[0]?.callsign ?? "";
		editCallsignsPanelOpen.value = true;
	}
	else {
		emit("setCallsign", target.value);
	}
}

function generateShortCallsign(callsign: string): string {
	let shortCallsign = callsign;
	let callsignComponents = callsign.match(/^([a-zA-Z]+)(\d+)$/);
	if (callsignComponents) {
		shortCallsign = (callsignComponents[1][0] + callsignComponents[1][callsignComponents[1].length - 1]).toUpperCase() + callsignComponents[2]; // Grabs first + last letter + numbers of callsign
	}
	return shortCallsign;
}
provide("generateShortCallsign", generateShortCallsign);
function processPathReplacements(path: string, callsign: string = props.selectedCallsign): string {
	const date = dayjs(selectedDate.value);
	path = path.replace(/<callsign-path>/gi, (configuration?.value?.callsigns ?? []).find(cs => cs.callsign === callsign)?.path ?? ""); // Can contain replacements itself so must go first
	path = path.replace(/<callsign>/gi, callsign);
	path = path.replace(/<short-callsign>/gi, generateShortCallsign(callsign));

	// Date replacement (matches anything surrounded by <> brackets without slashes before and after)
	path = path.replace(/<[^|](.*?)[^|]>/gi, (_, format) => date.format(format));

	// Replace Windows-style path slashes with normal slashes (but not inside <> brackets)
	// \-style slashes are used in RegExes
	path = path.replace(/(\\|<.*?>)/g, substring => substring === "\\" ? "/" : substring);
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

	const regexPathReplacement = /<\|(.*?)\|>/;
	let firstRegexPath = filePath.findIndex(path => path.match(regexPathReplacement) !== null);
	let definitePath: string[] = filePath; // Definite path that does not contain regexes
	let indefinitePath: string[] = []; // Part of path that does contain regexes
	if (firstRegexPath !== -1) {
		definitePath = filePath.slice(0, firstRegexPath);
		indefinitePath = filePath.slice(firstRegexPath);
	}

	let itemInfoResponse = await fetch("/api/" + definitePath.join("/"));
	if (itemInfoResponse.status === 200) {
		let itemInfo: FileFromAPI | (DirectoryFromAPI | FileFromAPI)[] = await itemInfoResponse.json();

		while (indefinitePath.length > 0 && Array.isArray(itemInfo)) {
			let indefinitePathComponent = indefinitePath.shift()!; // Undefined check is part of loop condition
			let matcher: RegExp;
			// TODO Limitation: right now, each indefinite path component is evaluated as either 100% regex or 100% not
			if (indefinitePathComponent.match(regexPathReplacement) !== null) {
				// Path component contains a regex
				let matcherText = indefinitePathComponent.replace(new RegExp(regexPathReplacement, "g"), (_, expression) => expression);
				try {
					matcher = new RegExp(matcherText);
				}
				catch (err) {
					await openAlert(
						"Invalid regular expression",
						`The path for this card contains an invalid regular expression for the path component ${matcherText}: ${(err as SyntaxError).message}`
					);
					router.push("/" + route.params.path[0]); // Navigate to root of the tab
					return;
				}
			}
			else {
				// Use literal path component
				indefinitePathComponent = indefinitePathComponent.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&"); // Escape Regex characters
				matcher = new RegExp("^" + indefinitePathComponent + "$"); // Wrap in start/end match symbols
			}

			let unfilteredItemInfo = itemInfo;
			itemInfo = itemInfo.filter(item => item.name.match(matcher) !== null);
			if (itemInfo.length === 0) {
				await openAlert(
					"File or directory not found",
					`Couldn't find file or directory with RegEx as specified in the configuration: ${filePath.join("/")}. Going to the folder that might contain it.`
				);
				itemInfo = unfilteredItemInfo;
				continue;
			}

			async function loadItem(item: FileFromAPI | DirectoryFromAPI) {
				definitePath.push(item.name);
				if (item.kind === "file") {
					// Show as single file instead of a list of files
					itemInfo = item;
				}
				else {
					// Load directory's contents
					itemInfoResponse = await fetch("/api/" + definitePath.join("/"));
					itemInfo = await itemInfoResponse.json();
				}
			}

			if (indefinitePath.length === 0 && itemInfo.length === 1) {
				// This is the final path item and there is only one RegEx match
				await loadItem(itemInfo[0]);
			}
			else if (indefinitePath.length > 0) {
				// More indefinite path items remaining
				if (indefinitePath[0].match(regexPathReplacement) === null && indefinitePath[0].match(matcher) !== null) {
					// If the next non-regex indefinite path item matches the current matcher, this may be a subitem of the match list
					let matchedItem = itemInfo.find(item => item.name === indefinitePath[0]);
					if (matchedItem) {
						indefinitePath.shift();
						await loadItem(matchedItem);
					}
				}
				else {
					// If not, go down a level and see if we can find it there
					// Only folders can have something within them so filter on that
					itemInfo = itemInfo.filter(item => item.kind === "directory");
					if (itemInfo.length === 0) {
						await openAlert(
							"Directory not found",
							`Couldn't find directory (only files) with RegEx as specified in the configuration: ${filePath.join("/")}. Going to the last matching folder.`
						);
						itemInfo = unfilteredItemInfo;
						break;
					}
					if (itemInfo.length > 1) {
						await openAlert(
							"Multiple matches",
							`The RegEx path ${matcher} returned multiple matches. Please update the card path to be more specific. Using the first result.`
						);
					}
					definitePath.push(itemInfo[0].name);
					itemInfoResponse = await fetch("/api/" + definitePath.join("/"));
					itemInfo = await itemInfoResponse.json();
				}
			}
		}

		if (Array.isArray(itemInfo)) {
			// Directory
			directoryRendered.value = {
				directory: itemInfo,
				location: {
					path: definitePath,
					fromRoot: props.tabName === "All Files",
				},
			};

			renderType.value = RenderType.Directory;
		}
		else {
			// Find common name for this file from configuration's name for it
			let commonName = itemInfo.name;
			if (configuration?.value && props.tabName !== "All Files") {
				// TODO doesn't work for single files specified via RegEx
				commonName = Object.values(configuration.value.tabs[props.tabName])
					.flat()
					.map(mapPathIdentifiers)
					.find(file => file.path.toLowerCase() === definitePath.join("/").toLowerCase())?.name
					?? itemInfo.name;
			}

			fileRendered.value = {
				file: itemInfo,
				path: definitePath,
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
