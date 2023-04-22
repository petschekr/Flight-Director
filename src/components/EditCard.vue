<template>
	<TransitionRoot as="template" :show="isOpen">
		<Dialog as="div" class="relative z-50" @close="close()">
			<div class="fixed inset-0" />

			<div class="fixed inset-0 overflow-hidden">
				<div class="absolute inset-0 overflow-hidden">
					<div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
						<TransitionChild as="template"
							enter="transform transition ease-in-out duration-500 sm:duration-500"
							enter-from="translate-x-full" enter-to="translate-x-0"
							leave="transform transition ease-in-out duration-500 sm:duration-500"
							leave-from="translate-x-0" leave-to="translate-x-full">
							<DialogPanel class="pointer-events-auto w-screen max-w-2xl">
								<form class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl" @submit.prevent>
									<div class="flex-1">
										<!-- Header -->
										<div class="bg-gray-50 px-4 py-6 sm:px-6">
											<div class="flex items-start justify-between space-x-3">
												<div class="space-y-1">
													<DialogTitle class="text-lg font-medium text-gray-900">Edit Card</DialogTitle>
													<p class="text-sm text-gray-500 font-mono">{{tabName}} > {{groupName}} > {{title}}</p>
												</div>
												<div class="flex h-7 items-center">
													<button type="button" @click="close()" class="text-gray-400 hover:text-gray-500">
														<XMarkIcon class="h-6 w-6" />
													</button>
												</div>
											</div>
										</div>

										<!-- Divider container -->
										<div class="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-name" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Title
													</label>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="card-name" v-model="title"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-description" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Description
													</label>
												</div>
												<div class="sm:col-span-2">
													<textarea id="card-description" rows="2" v-model="description"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-name" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Color
													</label>
												</div>
												<div class="sm:col-span-2">
													<Listbox as="div" v-model="selectedColor">
														<div class="relative mt-1">
															<ListboxButton
																class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm">
																<span class="flex items-center">
																	<span :class="['ml-2 h-6 w-6 flex-shrink-0 rounded-full', selectedColor]"></span>
																	<span class="ml-3 block leading-none !overflow-visible truncate font-mono">{{ selectedColor }}</span>
																</span>
																<span class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
																	<ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
																</span>
															</ListboxButton>

															<transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
																leave-to-class="opacity-0">
																<ListboxOptions
																	class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
																	<ListboxOption as="template" v-for="color in colors" :key="color" :value="color"
																		v-slot="{ active, selected }">
																		<li
																			:class="[active ? ['text-white', color] : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
																			<div class="flex items-center">
																				<span :class="['ml-2 h-8 w-8 flex-shrink-0 rounded-full border-white border-2', color]"></span>
																				<span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block leading-none !overflow-visible truncate font-mono']">
																					{{ color }}
																				</span>
																			</div>

																			<span v-if="selected"
																				:class="[active ? 'text-white' : 'text-sky-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
																				<CheckIcon class="h-5 w-5" />
																			</span>
																		</li>
																	</ListboxOption>
																</ListboxOptions>
															</transition>
														</div>
													</Listbox>
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-abbreviation" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Abbreviation
													</label>
													<p class="mt-1 text-sm text-gray-500">
														No more than 6 characters
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="card-abbreviation" v-model="abbreviation"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-type" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Document Type
													</label>
													<p class="mt-1 text-sm text-gray-500">
														When set to <code>SharePoint</code>, documents will automatically be pulled from SharePoint and cached in a local location
													</p>
													<p class="mt-1 text-sm text-gray-500">
														Setting to <code>Markdown</code> will display customizable rich text content
													</p>
												</div>
												<div class="sm:col-span-2">
													<select id="card-type" v-model="cardType"
														class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-500 sm:text-sm sm:leading-6">
														<option value="Local">Local</option>
														<option value="SharePoint">SharePoint</option>
														<option value="Markdown">Markdown</option>
													</select>
												</div>
											</div>

											<div v-if="cardType === 'SharePoint'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-url" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														URL link to document
													</label>
													<p class="mt-1 text-sm text-gray-500">
														This determines which SharePoint list will be searched
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="card-url" v-model="sharePointUrl"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div v-if="cardType === 'SharePoint'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-document-name" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Document name
													</label>
													<p class="mt-1 text-sm text-gray-500">
														A Regular Expression used to search for the document to pull.
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="card-document-name" v-model="sharePointSearch"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div v-if="cardType === 'SharePoint'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-cache-location" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Cache location
													</label>
													<p class="mt-1 text-sm text-gray-500">
														The local Share Drive path where the document will be downloaded to and cached
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>&lt;callsign&gt;</code>: Full user-selected callsign
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>&lt;callsign-path&gt;</code>: Path associated with selected callsign
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>&lt;short-callsign&gt;</code>: Short version of selected callsign (ex: <code>WY11</code>)
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>&lt;DD MMM YY&gt;</code>: Full date formatting support
													</p>
												</div>
												<div class="sm:col-span-2">
													<textarea id="card-path" rows="4" v-model="sharePointCachePath"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"></textarea>
													<br />
													<code class="[overflow-wrap:anywhere]">{{cachePathPreview}}</code>
												</div>
											</div>

											<div v-if="cardType === 'Local'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-path" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Link or path
													</label>
													<p class="mt-1 text-sm text-gray-500">
														Share Drive path to the file or folder this card links to. Paths must be children of the root folder. Web links are also supported.
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>&lt;callsign&gt;</code>: Full user-selected callsign
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>&lt;callsign-path&gt;</code>: Path associated with selected callsign
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>&lt;short-callsign&gt;</code>: Short version of selected callsign (ex: <code>WY11</code>)
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>&lt;DD MMM YY&gt;</code>: Full date formatting support
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>&lt;|.*\.pdf|&gt;</code>: Full Regular Expression support
													</p>
												</div>
												<div class="sm:col-span-2">
													<textarea id="card-path" rows="4" v-model="path"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"></textarea>
													<br />
													<code class="[overflow-wrap:anywhere]">{{pathPreview}}</code>
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-search-terms" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Search terms
													</label>
													<p class="mt-1 text-sm text-gray-500">
														Optional list of comma separated terms that can be used to search for this card
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="card-search-terms" v-model="searchTerms"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>
										</div>
									</div>

									<!-- Action buttons -->
									<div class="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6 flex space-x-3">
										<button type="button" @click="deleteCard"
											class="inline-flex justify-center rounded-md border border-transparent bg-red-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
											Delete
										</button>
										<div class="grow"></div>
										<button type="button" @click="close"
											class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
											Cancel
										</button>
										<button type="submit" @click="saveCard"
											class="inline-flex justify-center rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
											Save
										</button>
									</div>
								</form>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script setup lang="ts">
import { ref, type Ref, computed, watch, inject } from "vue";
import {
	Dialog, DialogPanel, DialogTitle,
	TransitionChild, TransitionRoot,
	Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

import type { File, Configuration } from "@/models/configuration";

const props = defineProps<{
	open: boolean;
	file: File | null;
	groupName: string | null;
	tabName: string | null;
}>();
const emit = defineEmits<{
	(e: "closed"): void;
}>();

const configuration = inject<Ref<Configuration | null>>("configuration");
const openAlert = inject<(title: string, message: string, okText?: string) => Promise<void>>("openAlert");
const openConfirm = inject<(title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>>("openConfirm");
const processPathReplacements = inject<(file: string) => string>("processPathReplacements");
const defaultColor = "bg-sky-500";

const isOpen = ref(false);
watch(() => props.open, () => {
	isOpen.value = props.open;
	if (props.open && props.file === null) {
		loadCardValues();
	}
});
watch(() => props.file, loadCardValues);
function loadCardValues() {
	title.value = props.file?.name ?? "";
	description.value = props.file?.description ?? "";
	abbreviation.value = props.file?.abbreviation ?? "";
	cardType.value = props.file?.type ?? "Local";
	path.value = props.file?.rawPath ?? props.file?.path ?? "";
	sharePointUrl.value = props.file?.sharePoint?.url ?? "";
	sharePointSearch.value = props.file?.sharePoint?.search ?? "";
	sharePointCachePath.value = props.file?.sharePoint?.cachePath ?? "";
	markdownTemplate.value = props.file?.markdown?.template ?? "";
	searchTerms.value = props.file?.searchTerms ?? "";
	selectedColor.value = colors[colors.findIndex(color => props.file?.color === color)] ?? defaultColor;
}
function close() {
	isOpen.value = false;
	emit("closed");
}

const colorBases = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose", "slate", "gray", "zinc", "neutral", "stone"];
const colors: string[] = colorBases.reduce((prev, color, index) => {
	const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
	return prev.concat(shades.map(shade => `bg-${color}-${shade}`));
}, [] as string[]);

const title = ref("");
const description = ref("");
const selectedColor = ref(defaultColor); // Updated by props.file watcher
const abbreviation = ref("");
const cardType: Ref<File["type"]> = ref("Local");
const path = ref("");
const sharePointUrl = ref("");
const sharePointSearch = ref("");
const sharePointCachePath = ref("");
const markdownTemplate = ref("");
const searchTerms = ref("");

const pathPreview = computed(() => {
	if (!processPathReplacements) return "";
	return processPathReplacements(path.value);
});
const cachePathPreview = computed(() => {
	if (!processPathReplacements) return "";
	return processPathReplacements(sharePointCachePath.value);
});

async function saveCard() {
	if (!configuration?.value || !openAlert) return;
	if (!props.groupName || !props.tabName) return;

	if (!title.value) {
		await openAlert("Title required", "Please provide a title for the card");
		return;
	}
	if (!description.value) {
		await openAlert("Description required", "Please provide a brief description of the card's contents");
		return;
	}
	if (!abbreviation.value) {
		await openAlert("Abbreviation required", "Please provide a short abbrevation to help quickly identify the card");
		return;
	}
	if (cardType.value === "Local") {
		if (!path.value) {
			await openAlert("Path or link required", "Please provide a path or external web link that this card will link to");
			return;
		}
	}
	else if (cardType.value === "SharePoint") {
		if (!sharePointUrl.value) {
			await openAlert("URL required", "Please provide a URL of a document that is in the same SharePoint list as what will be linked");
			return;
		}
		if (!sharePointSearch.value) {
			await openAlert("Document name", "Please provide a RegEx that defines what document is being looked for in the SharePoint list");
			return;
		}
		if (!sharePointCachePath.value) {
			await openAlert("Cache location required", "Please provide a local share drive path where the SharePoint document will be downloaded to and cached");
			return;
		}
	}
	// Check if there's already a card in this group with this name
	let existingFileWithName = configuration.value.tabs[props.tabName][props.groupName].find(file => file.name === title.value);
	if (existingFileWithName && props.file?.name !== title.value) {
		await openAlert("Invalid title", "A card with that title already exists in this group. Please choose a different title.");
		return;
	}

	const fileContents: File = {
		name: title.value,
		description: description.value,
		color: selectedColor.value,
		abbreviation: abbreviation.value,
		type: cardType.value,
		path: path.value,
		sharePoint: {
			url: sharePointUrl.value,
			search: sharePointSearch.value,
			cachePath: sharePointCachePath.value,
		},
		markdown: {
			template: markdownTemplate.value,
		},
		searchTerms: searchTerms.value.length === 0 ? undefined : searchTerms.value,
	};
	if (cardType.value !== "Local") {
		delete fileContents.path;
	}
	if (cardType.value !== "SharePoint") {
		delete fileContents.sharePoint;
	}
	if (cardType.value !== "Markdown") {
		delete fileContents.markdown;
	}

	let fileIndex = configuration.value.tabs[props.tabName][props.groupName].findIndex(file => file.name === props.file?.name);
	if (!props.file || fileIndex === -1) {
		// Create a new file
		configuration.value.tabs[props.tabName][props.groupName].push(fileContents);
	}
	else {
		// Update existing file
		configuration.value.tabs[props.tabName][props.groupName][fileIndex] = fileContents;
	}
	configuration.value.unsaved = true;
	close();
}
async function deleteCard() {
	if (!configuration?.value || !openConfirm) return;
	if (!props.groupName || !props.tabName) return;

	if (!await openConfirm("Delete card?", "Are you sure you want to delete this card?")) return;

	let fileIndex = configuration.value.tabs[props.tabName][props.groupName].findIndex(file => file.name === props.file?.name);
	if (fileIndex === -1) return; // Not found

	configuration.value.tabs[props.tabName][props.groupName].splice(fileIndex, 1);
	configuration.value.unsaved = true;
	close();
}

</script>
