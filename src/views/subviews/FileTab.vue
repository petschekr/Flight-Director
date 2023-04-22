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
		<EditCallsigns :open="editCallsignsPanelOpen" @closed="editCallsignsPanelOpen = false" />

		<TransitionRoot as="template" :show="loadingModalOpen">
			<Dialog as="div" class="relative z-20">
				<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
					<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
				</TransitionChild>

				<div class="fixed inset-0 z-10 overflow-y-auto">
					<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
						<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
							<DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
								<div>
									<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full">
										<!-- <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg> -->
										<CloudArrowDownIcon class="animate-pulse h-12 w-12 text-sky-500" />
									</div>
									<div class="mt-2 text-center">
										<DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900">Loading...</DialogTitle>
										<div class="mt-2 text-left">
											<p class="text-sm text-gray-500">This might take a while when opening any SharePoint file for the first time. It'll be faster next time!</p>
											<p class="text-sm text-gray-500 mt-2">Make sure there isn't an unanswered PIN prompt!</p>
											<p class="text-sm text-gray-900 font-semibold text-center mt-2">{{ loadingState }}</p>
										</div>
									</div>
								</div>
								<div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
									<button class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" @click="navigateToRoot">Cancel</button>
									<button :disabled="!cachedCopyAvailable" class="inline-flex w-full justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:col-start-2 disabled:opacity-25" @click="useCachedCopy">Use Cached Copy</button>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</TransitionRoot>
	</div>
</template>

<script setup lang="ts">
import { provide, inject, ref, watch, computed, type Ref, watchPostEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { CloudArrowDownIcon } from "@heroicons/vue/24/solid";

import type { File as ConfigFileEntry, Configuration } from "@/models/configuration";
import type { FileRender, DirectoryRender, FileFromAPI, DirectoryFromAPI } from "@/models/file-explorer";

import CardList from "@/components/CardList.vue";
import File from "@/components/File.vue";
import FileList from "@/components/FileList.vue";
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
const openAlert = inject<(title: string, message: string, okText?: string) => Promise<void>>("openAlert");
const editMode = inject<Ref<boolean>>("editMode");
const editCallsignsPanelOpen = ref(false);
const loadingModalOpen = ref(false);
const loadingState = ref("");
const cachedCopyAvailable = ref(false);

function navigateToRoot() {
	loadingModalOpen.value = false;
	router.push("/" + route.params.path[0]); // Navigate to root of the tab
}

let useCachedCopy = () => {};

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

	// Date replacement (matches anything surrounded by <> brackets without | before and after)
	path = path.replace(/<(.*?)>/gi, (_, format) => format[0] !== "|" && format[format.length - 1] !== "|" ? date.format(format) : `<${format}>`);

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
		path: file.path ? processPathReplacements(file.path) : undefined,
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
	if (!configuration?.value || !openAlert) {
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
	let fileEntry: ConfigFileEntry | undefined = undefined;
	if (props.tabName !== "All Files") {
		// Need to look up entry to find beginning of real path
		let entryName = routePath.shift();
		if (!entryName) {
			renderType.value = RenderType.Overview;
			return;
		}
		else {
			fileEntry = Object.values(configuration.value.tabs[props.tabName])
				.flat()
				.map(mapPathIdentifiers)
				.find(file => file.name === entryName);
			if (!fileEntry) {
				await openAlert(
					"Entry not found in configuration",
					`Couldn't find entry in the configuration: ${entryName}`
				);
				navigateToRoot();
				return;
			}
		}
	}

	if (!fileEntry?.type || fileEntry.type === "Local") {
		if (fileEntry?.path) {
			filePath = fileEntry.path.split("/");
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
						navigateToRoot();
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
						.find(file => file.path?.toLowerCase() === definitePath.join("/").toLowerCase())?.name
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
			navigateToRoot();
		}
	}
	else if (fileEntry.type === "SharePoint" && fileEntry.sharePoint) {
		loadingModalOpen.value = true;
		cachedCopyAvailable.value = false;

		let cachePath = processPathReplacements(fileEntry.sharePoint.cachePath);
		let cachedFileInfoRequest = await fetch("/api/" + cachePath)
		cachedCopyAvailable.value = cachedFileInfoRequest.status === 200; // Only if the file exists

		let abortController = new AbortController();

		// Set function to be called by "Use Cached Copy" button
		useCachedCopy = async () => {
			if (!loadingModalOpen.value) return;
			abortController.abort();

			let cachedFileInfo: FileFromAPI = await cachedFileInfoRequest.json();

			// Open from cache location
			fileRendered.value = {
				file: cachedFileInfo,
				path: cachePath.split("/"),
				commonName: cachedFileInfo.name,
			};

			loadingModalOpen.value = false;
			renderType.value = RenderType.File;
		};

		let matcher = new RegExp("");
		try {
			matcher = new RegExp(fileEntry.sharePoint.search);
		}
		catch (err) {
			await openAlert(
				"Invalid regular expression",
				`The SharePoint file RegEx for this card contains an invalid regular expression /${fileEntry.sharePoint.search}/: ${(err as SyntaxError).message}`
			);
			navigateToRoot();
			return;
		}

		let url = new URL(fileEntry.sharePoint.url);
		let urlPath = url.pathname.split("/");
		urlPath.pop(); // Remove file name at end
		let listName = decodeURIComponent(urlPath.pop() ?? "");
		let sharepointSite = url.hostname + urlPath.join("/");

		interface SharePointListItem {
			File: {
				Name: string;
				ServerRelativeUrl: string;
				TimeLastModified: string;
			}
		}

		let retryCount = 0;
		async function getSharePointData(): Promise<SharePointListItem[]> {
			loadingState.value = "Getting data from SharePoint...";
			let request = await fetch(
				`/sharepoint/${sharepointSite}/_api/web/lists/getbytitle('${encodeURIComponent(listName)}')/items?$expand=File&$select=File&orderby=Modified%20desc&$top=6`,
				{ signal: abortController.signal },
			);
			try {
				let files: SharePointListItem[] = (await request.json()).d.results;
				return files;
			}
			catch {
				loadingState.value = "Logging in to SharePoint...";
				await fetch(
					`/sharepoint/login`,
					{ signal: abortController.signal },
				);
				if (++retryCount >= 3) {
					return [];
				}
				return getSharePointData();
			}
		}

		let mostRecentMatch = (await getSharePointData()).filter(file => file.File.Name.match(matcher)).pop(); // Files are already sorted by modified time in request
		if (!mostRecentMatch) {
			await openAlert(
				"SharePoint document not found",
				`Could not find a document in the SharePoint item list that matches the regular expression /${fileEntry.sharePoint.search}/`
			);
			navigateToRoot();
			return;
		}

		// Download file to cache location
		let fileNeedsUpdate = false;

		let itemInfoResponse = await fetch("/api/" + cachePath);
		if (itemInfoResponse.status === 200) {
			let itemInfo: FileFromAPI = await itemInfoResponse.json();

			let localLastModified = new Date(itemInfo.lastModified);
			let remoteLastModified = new Date(mostRecentMatch.File.TimeLastModified);
			if (localLastModified.valueOf() < remoteLastModified.valueOf()) {
				// Local copy is too old
				fileNeedsUpdate = true;
			}
		}
		else {
			// Local copy doesn't exist
			fileNeedsUpdate = true;
		}

		if (fileNeedsUpdate) {
			loadingState.value = "Downloading file from SharePoint...";
			await fetch(
				`/sharepoint/download/${url.hostname}${mostRecentMatch.File.ServerRelativeUrl}?location=${encodeURIComponent(cachePath)}`,
				{ signal: abortController.signal },
			);
		}

		itemInfoResponse = await fetch("/api/" + cachePath);
		let itemInfo: FileFromAPI = await itemInfoResponse.json();

		// Open from cache location
		fileRendered.value = {
			file: itemInfo,
			path: cachePath.split("/"),
			commonName: mostRecentMatch.File.Name,
		};

		// Don't show file if the loading process was canceled
		if (loadingModalOpen.value) {
			loadingModalOpen.value = false;
			renderType.value = RenderType.File;
		}
	}
});
</script>
