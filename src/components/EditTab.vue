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
													<DialogTitle class="text-lg font-medium text-gray-900">Edit Tab</DialogTitle>
													<p class="text-sm text-gray-500 font-mono">{{tabIndex ? configuration?.sidebarTab[tabIndex]?.name : ''}}</p>
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
													<label for="tab-component" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Component
													</label>
												</div>
												<div class="sm:col-span-2">
													<select id="tab-component" v-model="component"
														class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm">
														<option value="FileList">Card List</option>
														<option value="AllFiles">All Files</option>
														<option value="Performance">Performance calculator</option>
														<option value="Settings">Settings</option>
														<option value="Spacer">Spacer</option>
													</select>
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="tab-icon" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Icon
													</label>
													<p class="mt-1 text-sm text-gray-500">
														See <a href="https://heroicons.com/" target="_blank">Heroicons</a> for available icons
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="tab-icon" v-model="icon"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="tab-title" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Title
													</label>
													<p class="mt-1 text-sm text-gray-500">
														How the tab will appear in the sidebar
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="tab-title" v-model="title" @keyup="updateHref"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="tab-href" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														URL
													</label>
													<p class="mt-1 text-sm text-gray-500">
														The relative URL that this tab will be hosted under
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="tab-href" v-model="href"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="tab-description" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Description
													</label>
													<p class="mt-1 text-sm text-gray-500">
														The description displayed by Card Lists when selected
													</p>
												</div>
												<div class="sm:col-span-2">
													<textarea id="tab-description" rows="2" v-model="description"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>
										</div>
									</div>

									<!-- Action buttons -->
									<div class="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6 flex space-x-3">
										<button type="button" @click="deleteTab"
											class="inline-flex justify-center rounded-md border border-transparent bg-red-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
											Delete
										</button>
										<div class="grow"></div>
										<button type="button" @click="close"
											class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
											Cancel
										</button>
										<button type="submit" @click="saveTab"
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
import { useRouter } from "vue-router";
import {
	Dialog, DialogPanel, DialogTitle,
	TransitionChild, TransitionRoot,
	Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

import type { Configuration, IconName, Component } from "@/models/configuration";

const props = defineProps<{
	open: boolean;
	tabIndex: number | null;
}>();
const emit = defineEmits<{
	(e: "closed"): void;
}>();

const router = useRouter();

const configuration = inject<Ref<Configuration | null>>("configuration");
const openAlert = inject<(title: string, message: string, okText?: string) => Promise<void>>("openAlert");
const openConfirm = inject<(title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>>("openConfirm");

const isOpen = ref(false);

const component: Ref<Component> = ref("FileList");
const icon: Ref<IconName> = ref("Bars3BottomLeftIcon");
const title = ref("");
const href = ref("");
const description = ref("");

function loadValues() {
	if (props.tabIndex !== null) {
		let tabConfig = configuration?.value?.sidebarTab[props.tabIndex];
		if (!tabConfig) return;

		component.value = tabConfig.component ?? "Spacer";
		icon.value = tabConfig.icon ?? "Bars3BottomLeftIcon";
		title.value = tabConfig.name ?? "";
		href.value = tabConfig.href ?? "";
		description.value = tabConfig.description ?? "";
	}
	else {
		component.value = "FileList";
		icon.value = "Bars3BottomLeftIcon";
		title.value = "";
		href.value = "";
		description.value = "";
	}
}

watch(() => props.open, () => isOpen.value = props.open);
watch(() => props.tabIndex, loadValues);
loadValues();

function updateHref() {
	href.value = "/" + title.value.toLowerCase().replace(/(\/| )/gi, "-");
}
function close() {
	isOpen.value = false;
	emit("closed");
}

async function saveTab() {
	if (!configuration?.value || !openAlert) return;

	if (!icon.value && component.value !== "Spacer") {
		await openAlert("Icon required", "Please provide a icon for the tab");
		return;
	}
	if (!title.value && component.value !== "Spacer") {
		await openAlert("Title required", "Please provide a title for the tab");
		return;
	}
	if (!href.value && component.value !== "Spacer") {
		await openAlert("URL required", "Please provide a relative URL for the tab");
		return;
	}
	if (!description.value && component.value === "FileList") {
		await openAlert("Description required", "Please provide a brief description for this card list tab");
		return;
	}
	// Check if there is already a tab with this name or href
	let existingNameIndex = configuration.value.sidebarTab.findIndex(tab => tab.name === title.value);
	if (component.value !== "Spacer" && existingNameIndex !== -1 && existingNameIndex !== props.tabIndex) {
		await openAlert("Invalid title", "A tab with that title already exists. Please choose a different title.");
		return;
	}
	let existingHrefIndex = configuration.value.sidebarTab.findIndex(tab => tab.href === href.value);
	if (component.value !== "Spacer" && existingHrefIndex !== -1 && existingHrefIndex !== props.tabIndex) {
		await openAlert("Invalid URL", "A tab with that URL already exists. Please choose a different URL.");
		return;
	}

	if (props.tabIndex !== null && configuration.value.sidebarTab[props.tabIndex]) {
		// Edit existing tab
		// Use Object.assign to rename the property key while preserving the order
		let newTabs = {};
		for (let [tabName, tabContents] of Object.entries(configuration.value.tabs)) {
			if (configuration.value.sidebarTab[props.tabIndex].name === tabName && title.value) {
				// Rename key to the new title
				Object.assign(newTabs, { [title.value]: tabContents });
			}
			else {
				// Keep as-is
				Object.assign(newTabs, { [tabName]: tabContents });
			}
		}
		configuration.value.tabs = newTabs;

		configuration.value.sidebarTab[props.tabIndex].component = component.value;
		if (icon.value) {
			configuration.value.sidebarTab[props.tabIndex].icon = icon.value;
		}
		if (title.value) {
			configuration.value.sidebarTab[props.tabIndex].name = title.value;
		}
		if (href.value) {
			configuration.value.sidebarTab[props.tabIndex].href = href.value;
		}
		if (description.value) {
			configuration.value.sidebarTab[props.tabIndex].description = description.value;
		}
	}
	else {
		// Add new tab
		if (title.value) {
			configuration.value.tabs[title.value] = {};
		}
		let newTab: any = { component: component.value }; // TODO fix type annotation
		if (icon.value) {
			newTab.icon = icon.value;
		}
		if (title.value) {
			newTab.name = title.value;
		}
		if (href.value) {
			newTab.href = href.value;
		}
		if (description.value) {
			newTab.description = description.value;
		}
		configuration.value.sidebarTab.push(newTab);
	}

	configuration.value.unsaved = true;
	close();
}
async function deleteTab() {
	if (!configuration?.value || !openConfirm) return;
	if (!props.tabIndex) return;

	if (!await openConfirm("Delete tab?", "Are you sure you want to delete this tab?")) return;

	if (configuration.value.sidebarTab[props.tabIndex]?.name) {
		delete configuration.value.tabs[configuration.value.sidebarTab[props.tabIndex].name!];
	}
	configuration.value.sidebarTab.splice(props.tabIndex, 1);
	router.replace("/");

	configuration.value.unsaved = true;
	close();
}

</script>
