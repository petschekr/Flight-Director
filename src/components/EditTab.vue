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
														<option value="Performance">Enroute performance calculator</option>
														<option value="ATLC">ATLC performance calculator</option>
														<option value="Cavok">Cavok integration</option>
														<option value="Settings">Settings</option>
														<option value="Spacer">Spacer</option>
													</select>
												</div>
											</div>

											<div v-if="component !== 'Spacer'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
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

											<div v-if="component !== 'Spacer'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
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

											<div v-if="component !== 'Spacer'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
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

											<div v-if="component === 'FileList'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
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

											<div v-if="component === 'Cavok'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="tab-cavok-domain" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Cavok Domain
													</label>
													<p class="mt-1 text-sm text-gray-500">
														The domain name of the Cavok server
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="tab-cavok-domain" v-model="cavokDomain"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>
											<div v-if="component === 'Cavok'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="tab-cavok-channel" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Cavok Channel
													</label>
													<p class="mt-1 text-sm text-gray-500">
														The default Cavok channel to join
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="tab-cavok-channel" v-model="cavokChannel"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div v-if="component === 'ATLC'" class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="tab-dafif-location" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														DAFIF Location
													</label>
													<p class="mt-1 text-sm text-gray-500">
														The location on the share drive with an unzipped copy of the latest DAFIF available from NGA
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="tab-dafif-location" v-model="dafifLocation"
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
import { ref, computed, watch, inject } from "vue";
import { useRouter } from "vue-router";
import {
	Dialog, DialogPanel, DialogTitle,
	TransitionChild, TransitionRoot,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

import type { IconName, Sidebar } from "@/types/configuration";
import { CONFIGURATION, OPEN_ALERT, OPEN_CONFIRM } from "@/types/keys";

const props = defineProps<{
	open: boolean;
	tabIndex: number | null;
}>();
const emit = defineEmits<{
	(e: "closed"): void;
}>();

const router = useRouter();

const configuration = inject(CONFIGURATION);
const openAlert = inject(OPEN_ALERT);
const openConfirm = inject(OPEN_CONFIRM);

const isOpen = ref(false);

type SidebarEntryComponent = Pick<Sidebar.Entry, "component">["component"];
const component = ref<SidebarEntryComponent>("FileList");

const DEFAULT_ICON: IconName = "Bars3BottomLeftIcon";
const icon = ref<IconName | undefined>(undefined);
const title = ref<string | undefined>(undefined);
const href = ref<string | undefined>(undefined);
const description = ref<string | undefined>(undefined);
const cavokDomain = ref<string | undefined>(undefined);
const cavokChannel = ref<string | undefined>(undefined);
const dafifLocation = ref<string | undefined>(undefined);

function loadValues() {
	if (props.tabIndex !== null) {
		// Editing existing tab
		let tabConfig = configuration?.value?.sidebarTab[props.tabIndex];
		if (!tabConfig) return;

		component.value = tabConfig.component ?? "Spacer";
		if (tabConfig.component !== "Spacer") {
			icon.value = tabConfig.icon ?? DEFAULT_ICON;
			title.value = tabConfig.name;
			href.value = tabConfig.href;
		}
		if (tabConfig.component === "FileList") {
			description.value = tabConfig.description;
		}
		if (tabConfig.component === "Cavok") {
			cavokDomain.value = tabConfig.cavokDomain;
			cavokChannel.value = tabConfig.cavokChannel;
		}
		if (tabConfig.component === "ATLC") {
			dafifLocation.value = tabConfig.dafifLocation;
		}
	}
	else {
		// Adding a new tab
		component.value = "FileList";
		icon.value = DEFAULT_ICON;
		title.value = "";
		href.value = "";
		description.value = "";
		cavokDomain.value = "vlsb-cav-01.acc.accroot.ds.af.smil.mil";
		cavokChannel.value = "50th ATKS";
		dafifLocation.value = "";
	}
}

watch(() => props.open, () => isOpen.value = props.open);
watch(() => props.tabIndex, loadValues);
loadValues();

function updateHref() {
	href.value = "/" + title.value?.toLowerCase().replace(/(\/| )/gi, "-");
}
function close() {
	isOpen.value = false;
	emit("closed");
}

async function saveTab() {
	if (!configuration?.value || !openAlert) return;

	if (component.value !== "Spacer") {
		if (!icon.value) {
			await openAlert("Icon required", "Please provide a icon for the tab");
			return;
		}
		if (!title.value) {
			await openAlert("Title required", "Please provide a title for the tab");
			return;
		}
		if (!href.value) {
			await openAlert("URL required", "Please provide a relative URL for the tab");
			return;
		}
	}
	if (component.value === "FileList") {
		if (!description.value) {
			await openAlert("Description required", "Please provide a brief description for this card list tab");
			return;
		}
	}
	if (component.value === "Cavok") {
		if (!cavokDomain.value) {
			await openAlert("Cavok domain required", "Please provide the domain name of the Cavok server");
			return;
		}
		if (!cavokChannel.value) {
			await openAlert("Cavok channel required", "Please the default Cavok channel to join");
			return;
		}
	}
	if (component.value === "ATLC") {
		if (!dafifLocation.value) {
			await openAlert("DAFIF location required", "Please provide the location of the latest unzipped DAFIF data file available from NGA");
			return;
		}
	}
	// Check if there is already a tab with this name or href
	let existingNameIndex = configuration.value.sidebarTab.findIndex(tab => tab.component !== "Spacer" && tab.name === title.value);
	if (existingNameIndex !== -1 && existingNameIndex !== props.tabIndex) {
		await openAlert("Invalid title", "A tab with that title already exists. Please choose a different title.");
		return;
	}
	let existingHrefIndex = configuration.value.sidebarTab.findIndex(tab => tab.component !== "Spacer" && tab.href === href.value);
	if (existingHrefIndex !== -1 && existingHrefIndex !== props.tabIndex) {
		await openAlert("Invalid URL", "A tab with that URL already exists. Please choose a different URL.");
		return;
	}

	if (props.tabIndex !== null && configuration.value.sidebarTab[props.tabIndex]) {
		// Edit existing tab
		configuration.value.sidebarTab[props.tabIndex].component = component.value;

		if (configuration.value.sidebarTab[props.tabIndex].component !== "Spacer") {
			// Use Object.assign to rename the property key while preserving the order
			let newTabs = {};
			for (let [tabName, tabContents] of Object.entries(configuration.value.tabs)) {
				if ((configuration.value.sidebarTab[props.tabIndex] as Sidebar.Tab).name === tabName && title.value) {
					// Rename key to the new title
					Object.assign(newTabs, { [title.value]: tabContents });
				}
				else {
					// Keep as-is
					Object.assign(newTabs, { [tabName]: tabContents });
				}
			}
			configuration.value.tabs = newTabs;

			if (icon.value) {
				(configuration.value.sidebarTab[props.tabIndex] as Sidebar.Tab).icon = icon.value;
			}
			if (title.value) {
				(configuration.value.sidebarTab[props.tabIndex] as Sidebar.Tab).name = title.value;
			}
			if (href.value) {
				(configuration.value.sidebarTab[props.tabIndex] as Sidebar.Tab).href = href.value;
			}
			if (component.value === "FileList" && description.value) {
				(configuration.value.sidebarTab[props.tabIndex] as Sidebar.FileList).description = description.value;
			}
			if (component.value === "Cavok" && cavokDomain.value) {
				(configuration.value.sidebarTab[props.tabIndex] as Sidebar.Cavok).cavokDomain = cavokDomain.value;
			}
			if (component.value === "Cavok" && cavokChannel.value) {
				(configuration.value.sidebarTab[props.tabIndex] as Sidebar.Cavok).cavokChannel = cavokChannel.value;
			}
			if (component.value === "ATLC" && dafifLocation.value) {
				(configuration.value.sidebarTab[props.tabIndex] as Sidebar.ATLC).dafifLocation = dafifLocation.value;
			}
		}
	}
	else {
		// Add new tab
		if (title.value) {
			configuration.value.tabs[title.value] = {};
		}

		let newTab: Partial<Sidebar.Entry> = { component: component.value };
		if (component.value !== "Spacer") {
			newTab = {
				component: component.value,
				icon: icon.value ?? DEFAULT_ICON,
				name: title.value ?? "",
				href: href.value ?? "",
			};
		}
		if (newTab.component === "FileList") {
			newTab = {
				...newTab,
				description: description.value ?? "",
			};
		}
		if (newTab.component === "Cavok") {
			newTab = {
				...newTab,
				cavokDomain: cavokDomain.value,
				cavokChannel: cavokChannel.value,
			};
		}
		if (newTab.component === "ATLC") {
			newTab = {
				...newTab,
				dafifLocation: dafifLocation.value,
			};
		}
		configuration.value.sidebarTab.push(newTab as Required<Sidebar.Entry>);
	}

	configuration.value.unsaved = true;
	close();
}
async function deleteTab() {
	if (!configuration?.value || !openConfirm) return;
	if (!props.tabIndex) return;

	if (!await openConfirm("Delete tab?", "Are you sure you want to delete this tab?")) return;

	let tab = configuration.value.sidebarTab[props.tabIndex];
	if (tab?.component !== "Spacer" && tab?.name) {
		delete configuration.value.tabs[tab.name];
	}
	configuration.value.sidebarTab.splice(props.tabIndex, 1);
	router.replace("/");

	configuration.value.unsaved = true;
	close();
}

</script>
