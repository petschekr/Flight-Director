<template>
	<TransitionRoot as="template" :show="sidebarOpen">
		<Dialog as="div" class="relative z-40 md:hidden" @close="sidebarOpen = false">
			<TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0"
				enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100"
				leave-to="opacity-0">
				<div class="fixed inset-0 bg-gray-600 bg-opacity-75" />
			</TransitionChild>

			<div class="fixed inset-0 z-40 flex">
				<TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
					enter-from="-translate-x-full" enter-to="translate-x-0"
					leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0"
					leave-to="-translate-x-full">
					<DialogPanel class="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 pt-5 pb-4">
						<TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0"
							enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100"
							leave-to="opacity-0">
							<div class="absolute top-0 right-0 -mr-12 pt-2">
								<button type="button"
									class="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
									@click="sidebarOpen = false">
									<span class="sr-only">Close sidebar</span>
									<XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
								</button>
							</div>
						</TransitionChild>
						<div class="flex flex-shrink-0 items-center px-4">
							<h1 class="text-2xl font-semibold text-white">Flight Director</h1>
						</div>
						<div class="mt-5 h-0 flex-1 overflow-y-auto">
							<nav class="space-y-1 px-2">
								<template v-for="item in navigation" :key="item.index">
									<RouterLink v-if="item.component !== 'Spacer'" :to="item.href ?? ''"
										:class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'group flex items-center px-2 py-2 text-base font-medium rounded-md']">
										<component :is="getIcon(item.icon)"
											:class="[item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300', 'mr-4 flex-shrink-0 h-6 w-6']"
											aria-hidden="true" />
										{{ item.name }}
									</RouterLink>
									<div v-else style="height: 2px" class="bg-gray-500 my-3"></div>
								</template>
							</nav>
						</div>
					</DialogPanel>
				</TransitionChild>
				<div class="w-14 flex-shrink-0" aria-hidden="true">
					<!-- Dummy element to force sidebar to shrink to fit close icon -->
				</div>
			</div>
		</Dialog>
	</TransitionRoot>

	<!-- Static sidebar for desktop -->
	<div class="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
		<!-- Sidebar component, swap this element with another sidebar if you like -->
		<div class="flex min-h-0 flex-1 flex-col bg-gray-800">
			<div class="flex h-14 flex-shrink-0 items-center bg-gray-900 px-4">
				<h1 class="text-2xl font-semibold text-white">Flight Director</h1>
			</div>

			<Menu as="div" class="relative inline-block px-3 text-left pt-2">
				<div>
					<MenuButton
						:class="[configuration?.unsaved ? 'bg-red-900 hover:bg-red-800' : 'bg-gray-700 hover:bg-gray-600', 'group w-full rounded-md px-3 py-2 text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500']">
						<span class="flex w-full items-center justify-between">
							<span class="flex min-w-0 items-center justify-between space-x-3">
								<!-- <img class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300" src="/download/50.jfif" /> -->
								<span class="flex min-w-0 flex-1 flex-col">
									<span class="truncate text-sm font-medium text-gray-100">{{configuration?.name ?? "Default Profile"}}</span>
								</span>
							</span>
							<ChevronUpDownIcon class="h-5 w-5 flex-shrink-0 text-gray-400" />
						</span>
					</MenuButton>
				</div>
				<transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95"
					enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
					leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
					<MenuItems
						class="absolute right-0 left-0 z-10 mx-3 mt-1 origin-top divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
						<div class="py-1">
							<MenuItem v-slot="{ active }">
							<a @click="$emit('loadProfile')"
								:class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']">
								<FolderOpenIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
								Open profile
							</a>
							</MenuItem>
						</div>
						<div class="py-1">
							<MenuItem v-slot="{ active }">
							<a @click="editMode = true"
								:class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']">
								<PencilSquareIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
								Edit layout
							</a>
							</MenuItem>
							<MenuItem v-slot="{ active }">
							<a @click="$emit('saveProfile')"
								:class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']">
								<ArrowDownTrayIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
								Save profile
								<!-- <small v-if="configuration?.unsaved">(Unsaved changes)</small> -->
							</a>
							</MenuItem>
						</div>
						<div class="py-1">
							<MenuItem v-slot="{ active }">
							<a @click="$emit('loadDefaultProfile')"
								:class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm cursor-pointer']">
								<SparklesIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
								Load default profile
							</a>
							</MenuItem>
						</div>
					</MenuItems>
				</transition>
			</Menu>

			<div class="flex flex-1 flex-col overflow-y-auto">
				<nav class="flex-1 space-y-1 px-2 py-2">
					<div v-for="item in navigation" :key="item.index">
						<RouterLink v-if="item.component !== 'Spacer'" :to="item.href ?? ''"
							:class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition']"
							:draggable="editMode ? 'true' : 'false'" @dragstart="dragStart($event, item.index)" @dragend="dragEnd"
							@dragover.prevent @dragenter="dragEnter" @dragleave="dragLeave" @drop="drop($event, item.index)">
							<component :is="getIcon(item.icon)"
								:class="[item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300', 'mr-3 flex-shrink-0 h-6 w-6']"
								aria-hidden="true" />
							{{ item.name }}
							<span class="flex-grow"></span>
							<PencilIcon v-if="editMode" @click="openEditTabPanel(item.index)" class="w-6 p-1 justify-self-end rounded transition-colors hover:bg-gray-500" />
						</RouterLink>
						<div v-else :style="`height: ${editMode ? 10 : 2}px`" @click="openEditTabPanel(item.index)" :class="[editMode ? 'cursor-pointer' : '', 'bg-gray-500 my-3 transition']"
							:draggable="editMode ? 'true' : 'false'" @dragstart="dragStart($event, item.index)" @dragend="dragEnd"
							@dragover.prevent @dragenter="dragEnter" @dragleave="dragLeave" @drop="drop($event, item.index)"
						></div>
					</div>
					<div v-if="editMode" @click="openEditTabPanel(null)" class="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center justify-center px-2 py-2 text-sm font-medium rounded-md transition border-dashed border-gray-700 border-2 cursor-pointer">
						<PlusCircleIcon class="w-6 mr-1" />
						New tab
					</div>
				</nav>
			</div>
		</div>
	</div>
	<div class="flex flex-col md:pl-64 h-full">
		<div class="sticky top-0 z-20 flex h-14 flex-shrink-0 bg-white shadow">
			<button type="button"
				class="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 md:hidden"
				@click="sidebarOpen = true">
				<span class="sr-only">Open sidebar</span>
				<Bars3BottomLeftIcon class="h-6 w-6" aria-hidden="true" />
			</button>
			<div class="flex flex-1 justify-between px-4">
				<div class="flex flex-1">
					<form class="flex w-full md:ml-0" action="#" method="GET">
						<label for="search-field" class="sr-only">Search</label>
						<div class="relative w-full text-gray-400 focus-within:text-gray-600">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center">
								<MagnifyingGlassIcon class="h-5 w-5" aria-hidden="true" />
							</div>
							<input id="search-field" ref="searchField"
								class="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-lg"
								placeholder="Search" type="search" name="search" />
							<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center">
								<kbd class="px-1 font-semibold">Ctrl+Space</kbd>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>

		<main class="flex-1 h-full">
			<div class="py-6 min-h-full">
				<div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
					<slot></slot>
				</div>
			</div>
		</main>

		<button v-if="editMode" @click="editMode = false" type="button"
			class="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 z-10">
			<BoltIcon class="-ml-1 mr-3 h-5 w-5" />
			Finish editing
		</button>
	</div>

	<EditTab :tab-index="editTabPanelTabIndex" :open="editTabPanelOpen" @closed="editTabPanelOpen = false" />
</template>

<script setup lang="ts">
	import { ref, type Ref, watch, computed, onMounted, inject, defineAsyncComponent } from "vue";
	import { useRoute, useRouter } from "vue-router";

	import {
		Menu,
		MenuButton,
		MenuItem,
		MenuItems,
		Dialog,
		DialogPanel,
		TransitionChild,
		TransitionRoot,
	} from '@headlessui/vue';
	import { XMarkIcon, Bars3BottomLeftIcon, PencilIcon, PlusCircleIcon } from '@heroicons/vue/24/outline';
	import {
		ChevronUpDownIcon,
		MagnifyingGlassIcon,
		FolderOpenIcon,
		PencilSquareIcon,
		ArrowDownTrayIcon,
		SparklesIcon,
		BoltIcon,
	} from '@heroicons/vue/20/solid';

	import type { Configuration, IconName, Sidebar } from "@/types/configuration";
	import { CONFIGURATION, EDIT_MODE } from "@/types/keys";

	import EditTab from "@/components/EditTab.vue";

	const emit = defineEmits<{
		(e: "navigate", sidebarTab: Sidebar.Tab): void;
		(e: "search"): void;
		(e: "loadProfile"): void;
		(e: "loadDefaultProfile"): void;
		(e: "saveProfile"): void;
	}>();

	const router = useRouter();
	const route = useRoute();

	const sidebarOpen = ref(false);
	const selectedIndex = ref(0);

	const configuration = inject(CONFIGURATION);
	const editMode = inject(EDIT_MODE);

	const editTabPanelOpen = ref(false);
	const editTabPanelTabIndex: Ref<number | null> = ref(0);
	function openEditTabPanel(tabIndex: number | null) {
		if (!editMode?.value) return;
		editTabPanelTabIndex.value = tabIndex;
		editTabPanelOpen.value = true;
	}

	function getIcon(icon?: IconName) {
		return defineAsyncComponent(() => import(`../../node_modules/@heroicons/vue/24/outline/${icon}.js`));
	}

	const navigation = computed(() => {
		if (!configuration?.value?.sidebarTab) return [];
		return configuration.value.sidebarTab.map((item, index) => {
			return {
				...item,
				index,
				current: index === selectedIndex.value,
			};
		})
	});

	function updateSelectedTab() {
		if (!configuration?.value?.sidebarTab) return;

		let newIndex = configuration.value.sidebarTab.findIndex(navItem => navItem.component !== "Spacer" && navItem.href.substring(1) === route.params.path[0]);
		if (newIndex === undefined) return;
		if (newIndex === -1 || !route.params.path) {
			newIndex = 0;
			router.push((configuration.value.sidebarTab[newIndex] as Sidebar.Tab).href ?? "/");
		}
		selectedIndex.value = newIndex;
		sidebarOpen.value = false;
		emit("navigate", configuration.value.sidebarTab[newIndex] as Sidebar.Tab);
	}
	updateSelectedTab();
	watch(() => route.params, updateSelectedTab);

	const searchField: Ref<HTMLInputElement | null> = ref(null);
	onMounted(() => {
		if (!searchField.value) return;
		// Don't allow typing in the search field
		// Instead, remove focus and emit a search event to open the search palette instead
		searchField.value.addEventListener("focus", () => {
			searchField.value?.blur();
			emit("search");
		});
	});

	let currentDragItem: HTMLElement | null = null;
	const dragSourceActiveStyles = ["opacity-50"];
	const dragTargetActiveStyles = ["opacity-80", "scale-90"];

	function dragStart(e: DragEvent, tabIndex: number) {
		let target = e.currentTarget as HTMLElement;
		if (!e.dataTransfer) return;
		let entry = configuration?.value?.sidebarTab[tabIndex];
		let entryName = (!entry || entry?.component === "Spacer") ? "" : entry.name;

		currentDragItem = target;

		target.classList.add(...dragSourceActiveStyles);

		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", entryName);
		e.dataTransfer.setData("flightdirector/tab", "");
		e.dataTransfer.setData("tabIndex", tabIndex.toString());
	}
	function dragEnd(e: DragEvent) {
		let target = e.currentTarget as HTMLElement;

		currentDragItem = null;

		target.classList.remove(...dragSourceActiveStyles);
	}
	function dragEnter(e: DragEvent) {
		let target = e.currentTarget as HTMLElement;
		if (target === currentDragItem) return; // Don't react to being dragged over self
		if (!e.dataTransfer?.types.includes("flightdirector/tab") && !e.dataTransfer?.types.includes("flightdirector/card")) return;

		target.classList.add(...dragTargetActiveStyles);
	}
	function dragLeave(e: DragEvent) {
		let target = e.currentTarget as HTMLElement;
		if (target === currentDragItem) return; // Don't react to being dragged over self
		if (!e.dataTransfer?.types.includes("flightdirector/tab") && !e.dataTransfer?.types.includes("flightdirector/card")) return;

		target.classList.remove(...dragTargetActiveStyles);
	}
	function drop(e: DragEvent, targetTabIndex: number) {
		let target = e.currentTarget as HTMLElement;
		if (target === currentDragItem) return; // Don't react to being dropped on self
		if (!configuration?.value) return;

		if (e.dataTransfer?.types.includes("flightdirector/tab")) {
			// Tab was dropped on another tab to rearrange them
			target.classList.remove(...dragTargetActiveStyles);

			const sourceTabIndex = parseInt(e.dataTransfer.getData("tabIndex"));

			let tab = configuration.value.sidebarTab[sourceTabIndex]; // Grab the dragged tab out of the array
			configuration.value.sidebarTab.splice(sourceTabIndex, 1); // Delete from the source array
			configuration.value.sidebarTab.splice(targetTabIndex, 0, tab); // Add to the target array in the target's position, pushing everything else backwards

			updateSelectedTab();

			// TODO: Reorder tab contents object to match

			configuration.value.unsaved = true;
		}
		else if (e.dataTransfer?.types.includes("flightdirector/card")) {
			// Card was dropped on a tab so move it to that tab
			target.classList.remove(...dragTargetActiveStyles);

			const oldTabName = e.dataTransfer.getData("tabName");
			const newTab = configuration.value.sidebarTab[targetTabIndex];
			const newTabName = newTab.component !== "Spacer" ? newTab.name : "";
			if (oldTabName === newTabName || !oldTabName || !newTabName) return;
			if (configuration.value.sidebarTab[targetTabIndex].component !== "FileList") {
				// Card was dropped on a tab that is not a FileList
				return;
			}

			const sourceGroupName = e.dataTransfer.getData("groupName");
			const sourceTitle = e.dataTransfer.getData("title");

			let sourceIndex = configuration.value.tabs[oldTabName][sourceGroupName].findIndex(file => file.name === sourceTitle);
			if (sourceIndex === -1) {
				console.error("Dragged card doesn't exist in configuration(?)");
				return;
			}

			let file = configuration.value.tabs[oldTabName][sourceGroupName][sourceIndex]; // Grab the dragged file out of the array
			configuration.value.tabs[oldTabName][sourceGroupName].splice(sourceIndex, 1); // Delete from the source array

			let newTabFileGroups = Object.keys(configuration.value.tabs[newTabName]);
			configuration.value.tabs[newTabName][newTabFileGroups[newTabFileGroups.length - 1]].push(file); // Add to the last file group

			configuration.value.unsaved = true;
		}
	}
</script>
