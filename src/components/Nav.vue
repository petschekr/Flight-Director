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
									<RouterLink v-if="item.name" :to="item.href ?? ''"
										:class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'group flex items-center px-2 py-2 text-base font-medium rounded-md']">
										<component :is="item.icon"
											:class="[item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300', 'mr-4 flex-shrink-0 h-6 w-6']"
											aria-hidden="true" />
										{{ item.name }}
									</RouterLink>
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
			<div class="flex h-16 flex-shrink-0 items-center bg-gray-900 px-4">
				<h1 class="text-2xl font-semibold text-white">Flight Director</h1>
			</div>
			<div class="flex flex-1 flex-col overflow-y-auto">
				<nav class="flex-1 space-y-1 px-2 py-4">
					<div v-for="item in navigation" :key="item.index">
						<RouterLink v-if="item.name" :to="item.href ?? ''"
							:class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'group flex items-center px-2 py-2 text-sm font-medium rounded-md']">
							<component :is="item.icon"
								:class="[item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300', 'mr-3 flex-shrink-0 h-6 w-6']"
								aria-hidden="true" />
							{{ item.name }}
						</RouterLink>
						<div v-else style="height: 2px" class="bg-gray-500 my-3"></div>
					</div>
				</nav>
			</div>
		</div>
	</div>
	<div class="flex flex-col md:pl-64 h-full">
		<div class="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
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
			<div class="py-6 h-full">
				<div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 h-full">
					<slot></slot>
				</div>
			</div>
		</main>
	</div>
</template>

<script setup lang="ts">
	import { ref, type Ref, watch, computed, onMounted } from "vue";
	import { useRoute, useRouter } from "vue-router";

	import {
		Dialog,
		DialogPanel,
		TransitionChild,
		TransitionRoot,
	} from '@headlessui/vue';
	import {
		Bars3BottomLeftIcon,
		XMarkIcon,
		ClockIcon,
		DocumentTextIcon,
		CursorArrowRaysIcon,
		BriefcaseIcon,
		ArchiveBoxIcon,
		BoltIcon,
		Cog6ToothIcon,
	} from '@heroicons/vue/24/outline';
	import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid';

	const emit = defineEmits<{
		(e: "navigate", component: string): void;
		(e: "search"): void;
	}>();

	const router = useRouter();
	const route = useRoute();

	const sidebarOpen = ref(false);
	const selectedIndex = ref(0);

	const navigationItems = [
		// { name: 'Quick Reference', href: '#', icon: BoltIcon, current: false },
		{ name: "Daily Ops", href: "/daily", icon: ClockIcon, component: "DailyOps" },
		{ name: "Manuals", href: "/manuals", icon: DocumentTextIcon, component: "Manuals" },
		{ name: "Operational Reference", href: "/opsref", icon: CursorArrowRaysIcon, component: "OpsRef" },
		{ name: "Other", href: "/other", icon: BriefcaseIcon, component: "Other" },
		null,
		{ name: 'All Files', href: "/files", icon: ArchiveBoxIcon, component: "AllFiles" },
		{ name: 'Settings', href: "/settings", icon: Cog6ToothIcon, component: "Settings" },
	];

	const navigation = computed(() => {
		return navigationItems.map((item, index) => {
			return {
				...item,
				index,
				current: index === selectedIndex.value,
			};
		})
	});

	function updateSelectedTab() {
		let newIndex = navigationItems.findIndex(navItem => navItem?.href.substring(1) === route.params.path[0]);
		if (newIndex === -1 || !route.params.path) {
			newIndex = 0;
			router.push(navigationItems[newIndex]!.href);
		}
		selectedIndex.value = newIndex;
		sidebarOpen.value = false;
		emit("navigate", navigationItems[newIndex]!.component);
	}
	updateSelectedTab();
	watch(() => route.params, updateSelectedTab);

	const searchField: Ref<HTMLInputElement | null> = ref(null);
	onMounted(() => {
		if (!searchField.value) return;
		searchField.value.addEventListener("focus", () => {
			searchField.value?.blur();
			emit("search");
		});
	});
</script>
