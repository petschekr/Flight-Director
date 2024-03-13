<template>
	<TransitionRoot as="template" :show="isOpen">
		<Dialog as="div" class="relative z-50">
			<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
				leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-gray-500 bg-opacity-70 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 overflow-hidden">
				<div class="absolute inset-0 overflow-hidden">
					<div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
						<TransitionChild as="template"
							enter="transform transition ease-in-out duration-500 sm:duration-500"
							enter-from="translate-x-full" enter-to="translate-x-0"
							leave="transform transition ease-in-out duration-500 sm:duration-500"
							leave-from="translate-x-0" leave-to="translate-x-full">
							<DialogPanel class="pointer-events-auto w-screen max-w-2xl">
								<form class="flex h-full flex-col bg-white shadow-xl" @submit.prevent>
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

									<div class="flex-1 h-full overflow-y-auto">
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
														Document type
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

													<button v-if="cardType === 'Markdown'" @click="editCard" type="button" class="mt-4 block w-full rounded-md bg-sky-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">Edit content</button>
												</div>
											</div>

											<div v-if="cardType === 'SharePoint'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-url" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														SharePoint site URL
													</label>
													<p class="mt-1 text-sm text-gray-500">
														Keep in mind this might be a subsite
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="url" id="card-url" v-model="sharePointBaseUrl"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div v-if="cardType === 'SharePoint'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-type" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Collection type
													</label>
													<p class="mt-1 text-sm text-gray-500">
														Most documents are in a SharePoint list but sometimes they can only be found in a specific folder
													</p>
												</div>
												<div class="sm:col-span-2">
													<select id="card-collection-type" v-model="sharePointCollectionType"
														class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-500 sm:text-sm sm:leading-6">
														<option value="List">List</option>
														<option value="Folder">Folder</option>
													</select>
												</div>
											</div>

											<div v-if="cardType === 'SharePoint'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-collection-name" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Collection name
													</label>
													<p class="mt-1 text-sm text-gray-500">
														The list name or folder path of the document
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="card-collection-name" v-model="sharePointCollectionName"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>


											<SwitchGroup v-if="cardType === 'SharePoint'" as="div" class="space-y-1 px-4 flex items-center justify-between sm:space-y-0 sm:px-6 sm:py-5">
												<span class="flex flex-grow flex-col">
													<SwitchLabel as="span" class="text-sm font-medium leading-6 text-gray-900" passive>Multiple results</SwitchLabel>
													<SwitchDescription as="span" class="text-sm text-gray-500">If enabled, will search for multiple matching documents and download them all</SwitchDescription>
												</span>
												<Switch v-model="sharePointMultiple" :class="[sharePointMultiple ? 'bg-sky-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2']">
													<span aria-hidden="true" :class="[sharePointMultiple ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
												</Switch>
											</SwitchGroup>

											<div v-if="cardType === 'SharePoint'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-cache-location" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Search expression
													</label>
													<p class="mt-1 text-sm text-gray-500">
														This expression will determine which document(s) are downloaded and returned
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>name</code>: Document's file name without extension
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>extension</code>: Document's file extension (e.g. <code>docx</code>)
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>includes("text", "search string")</code>: Determines if text contains search string
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>date("YYYY-MM-DD")</code>: Returns a formatted date string
													</p>
													<p class="mt-1 text-sm text-gray-500">
														<code>letterDate("YYYY-MM-DD")</code>: Returns two letter date used by CENTCOM SharePoint starting from the date specified
													</p>
												</div>
												<div class="sm:col-span-2">
													<textarea id="card-path" rows="4" v-model="sharePointSearchExpression"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"></textarea>
													<br />
													<code class="[overflow-wrap:anywhere] whitespace-pre-wrap">{{searchExpressionError}}</code>
												</div>
											</div>

											<div v-if="cardType === 'SharePoint'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-search-size" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Search size
													</label>
													<p class="mt-1 text-sm text-gray-500">
														The number of most recent files returned from the server to search through. Keep this as small as possible for better performance.
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="number" min="1" max="100" id="card-search-size" v-model="sharePointSearchSize"
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
													<button @click="selectWithFilePicker(ref(path))" type="button" class="mt-4 block w-full rounded-md bg-sky-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">Select File</button>
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
	Switch, SwitchDescription, SwitchGroup, SwitchLabel,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import { useRouter, useRoute } from "vue-router";

import type { Card, Configuration } from "@/types/configuration";
import { CONFIGURATION, OPEN_ALERT, OPEN_CONFIRM, PROCESS_PATH_REPLACEMENTS } from "@/types/keys";

import { compileExpression } from "filtrex";

const props = defineProps<{
	open: boolean;
	card: Card | null;
	groupName: string | null;
	tabName: string | null;
}>();
const emit = defineEmits<{
	(e: "closed"): void;
}>();

const router = useRouter();
const route = useRoute();

const configuration = inject(CONFIGURATION);
const openAlert = inject(OPEN_ALERT);
const openConfirm = inject(OPEN_CONFIRM);
const processPathReplacements = inject(PROCESS_PATH_REPLACEMENTS);
const defaultColor = "bg-sky-500";

const isOpen = ref(false);
watch(() => props.open, () => {
	isOpen.value = props.open;
	if (props.open && props.card === null) {
		loadCardValues();
	}
});
watch(() => props.card, loadCardValues);
function loadCardValues() {
	title.value = props.card?.name ?? "";
	description.value = props.card?.description ?? "";
	abbreviation.value = props.card?.abbreviation ?? "";
	cardType.value = props.card?.type ?? "Local";
	path.value = props.card?.rawPath ?? props.card?.path ?? "";
	sharePointBaseUrl.value = props.card?.sharePoint?.baseUrl ?? "";
	sharePointCollectionType.value = props.card?.sharePoint?.collection.type ?? "List";
	sharePointCollectionName.value = props.card?.sharePoint?.collection.name ?? "";
	sharePointMultiple.value = props.card?.sharePoint?.multiple ?? false;
	sharePointSearchExpression.value = props.card?.sharePoint?.searchExpression ?? "";
	sharePointSearchSize.value = props.card?.sharePoint?.searchSize ?? 6;
	sharePointCachePath.value = props.card?.sharePoint?.cachePath ?? "";
	markdownTemplate.value = props.card?.markdown?.template ?? "";
	searchTerms.value = props.card?.searchTerms ?? "";
	selectedColor.value = colors[colors.findIndex(color => props.card?.color === color)] ?? defaultColor;
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
const selectedColor = ref(defaultColor); // Updated by props.card watcher
const abbreviation = ref("");
const cardType: Ref<Card["type"]> = ref("Local");
const path = ref("");
const sharePointBaseUrl = ref("");
const sharePointCollectionType: Ref<Required<Card>["sharePoint"]["collection"]["type"]> = ref("List");
const sharePointCollectionName = ref("");
const sharePointMultiple = ref(false);
const sharePointSearchExpression = ref("");
const sharePointSearchSize = ref(6);
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

const searchExpressionError = computed(() => {
	try {
		// We're just trying to see if the expression is valid
		// Therefore all data and functions are simply stubbed out
		let matcher = compileExpression(sharePointSearchExpression.value, { extraFunctions: {
			includes: (text: string, searchString: string) => "",
			date: (format: string) => "",
			letterDate: (startDateString: string) => "",
		}});
		let result = matcher({name: "", extension: ""});
		if (result.message) {
			return result.message;
		}
	}
	catch (err) {
		return (err as SyntaxError).message;
	}
	return "";
});

async function selectWithFilePicker(ref: Ref<string>) {
	let pickResponse = await fetch("/api/pick");
	let pickInfo: {
		success: boolean; // Whether the pick operation was executed or canceled
		valid?: boolean; // Whether the user picked a file under the root folder
		fileName?: string;
	} = await pickResponse.json();
	if (pickInfo.success && pickInfo.valid) {
		ref.value = pickInfo.fileName ?? "";
	}
}
async function editCard() {
	await saveCard();
	if (isOpen.value) return; // Return if saveCard() rejected for some reason
	// Edit view is shown by opening the card, so navigate to it
	// Make a root path for browser and append to the current tab name
	router.push("/" + route.params.path[0] + "/" + encodeURIComponent(title.value));
}
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
		if (!sharePointBaseUrl.value) {
			await openAlert("Base URL required", "Please provide the URL of the SharePoint site");
			return;
		}
		if (!sharePointCollectionName.value) {
			await openAlert("Collection name required", "Please provide the list name or folder name that contains the SharePoint document(s)");
			return;
		}
		if (!sharePointSearchExpression.value) {
			await openAlert("Search expression required", "Please provide a search expression that defines what documents are selected and returned");
			return;
		}
		if (!sharePointCachePath.value) {
			await openAlert("Cache location required", "Please provide a local share drive path where the SharePoint document(s) will be downloaded to and cached");
			return;
		}
		if (sharePointSearchSize.value < 1) {
			sharePointSearchSize.value = 1;
		}
	}
	// Check if there's already a card in this group with this name
	let existingFileWithName = configuration.value.tabs[props.tabName][props.groupName].find(file => file.name === title.value);
	if (existingFileWithName && props.card?.name !== title.value) {
		await openAlert("Invalid title", "A card with that title already exists in this group. Please choose a different title.");
		return;
	}

	const fileContents: Card = {
		name: title.value,
		description: description.value,
		color: selectedColor.value,
		abbreviation: abbreviation.value,
		type: cardType.value,
		path: path.value,
		sharePoint: {
			baseUrl: sharePointBaseUrl.value,
			collection: {
				type: sharePointCollectionType.value,
				name: sharePointCollectionName.value,
			},
			multiple: sharePointMultiple.value,
			searchExpression: sharePointSearchExpression.value,
			searchSize: sharePointSearchSize.value,
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

	let fileIndex = configuration.value.tabs[props.tabName][props.groupName].findIndex(file => file.name === props.card?.name);
	if (!props.card || fileIndex === -1) {
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

	let fileIndex = configuration.value.tabs[props.tabName][props.groupName].findIndex(file => file.name === props.card?.name);
	if (fileIndex === -1) return; // Not found

	configuration.value.tabs[props.tabName][props.groupName].splice(fileIndex, 1);
	configuration.value.unsaved = true;
	close();
}

</script>
