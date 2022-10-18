<template>
	<div class="bg-white sm:rounded-lg sm:shadow flex flex-col mb-4">
		<div class="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 sm:rounded-t-lg">
			<div class="-ml-4 -mt-2 flex flex-nowrap items-center justify-between truncate">
				<div class="ml-4 mt-2 truncate">
					<div class="flex items-center">
						<RouterLink :to="getBackPath()" class="self-start mt-1 h-7 w-7 text-gray-400 transition-colors hover:text-gray-600 shrink-0">
							<ChevronLeftIcon />
						</RouterLink>
						<div class="ml-4 truncate">
							<nav class="flex" aria-label="Breadcrumb">
								<ol role="list" class="flex flex-wrap items-center space-x-1">
									<li v-for="pathItem in path" :key="pathItem.name">
										<div class="flex items-center">
											<svg v-if="pathItem.index !== 0" class="mr-1 h-5 w-5 flex-shrink-0 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
												viewBox="0 0 20 20" aria-hidden="true">
												<path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
											</svg>
											<RouterLink :to="pathItem.href" class="text-lg font-medium truncate text-gray-800 transition-colors hover:text-sky-700">{{ pathItem.name }}</RouterLink>
										</div>
									</li>
								</ol>
							</nav>
							<button @click="openExternally" class="text-sm text-gray-500 whitespace-normal transition-color hover:text-sky-700 block">
								{{props.directory?.location.path.join('/')}}
							</button>
						</div>
					</div>
				</div>
				<div class="ml-4 mt-2">
					<div class="flex items-center">
						<RectangleStackIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
						<p class="text-sm text-gray-500">{{items.length}} item{{items.length !== 1 ? 's' : ''}}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Loading spinny -->
		<div v-if="items.length === 0 && !emptyDirectory" class="flex justify-center items-center my-8">
			<svg class="animate-spin -ml-1 mr-3 h-10 w-10 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none"
				viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
				</path>
			</svg>
		</div>
		<div v-if="emptyDirectory" class="flex flex-col justify-center items-center my-8">
			<p class="italic mb-4">Empty directory</p>
			<RouterLink :to="getBackPath()"
				class="inline-flex items-center rounded-md border border-transparent bg-sky-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
				Back
				<ArrowUturnUpIcon class="ml-2 -mr-0.5 h-4 w-4" aria-hidden="true" />
			</RouterLink>
		</div>
		<div class="overflow-hidden bg-white sm:rounded-md">
			<ul role="list" class="divide-y divide-gray-200">
				<li v-for="item in items" :key="item.id">
					<RouterLink :to="item.href" class="block hover:bg-gray-50">
						<div class="flex items-center px-4 py-4 sm:px-6">
							<div class="mr-5 flex-shrink-0">
								<FolderIcon v-if="item.kind === 'directory'" class="h-5 w-5 text-gray-500" aria-hidden="true" />
								<DocumentTextIcon v-else class="h-5 w-5 text-gray-500" aria-hidden="true" />
							</div>
							<div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
								<div class="truncate">
									<div class="flex text-sm">
										<p v-if="item.kind === 'directory'" class="truncate font-bold text-sky-700">{{ item.name }}</p>
										<p v-else class="truncate  text-sky-700">{{ item.name }}</p>
										<!-- <p class="ml-1 flex-shrink-0 font-normal text-gray-500">in {{ item.type }}</p> -->
									</div>
								</div>
							</div>
							<div class="ml-5 flex-shrink-0 inline-flex">
								<div v-if="item.kind === 'directory'" class="flex items-center text-sm text-gray-500 truncate">
									<RectangleStackIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
									<p>{{item.subitems}} item{{item.subitems !== 1 ? 's' : ''}}</p>
								</div>
								<div v-else class="flex items-center text-sm text-gray-500 truncate">
									<CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
									<p :title="formatDate(item.lastModified, true)">{{formatDate(item.lastModified)}}</p>
								</div>
							</div>
							<div class="ml-5 flex-shrink-0">
								<ChevronRightIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
							</div>
						</div>
					</RouterLink>
				</li>
			</ul>
		</div>
	</div>

</template>

<script setup lang="ts">
import { ref, computed, watchEffect, type Ref } from "vue";
import { useRoute } from "vue-router";
import type { FileDisplay, DirectoryDisplay, DirectoryRender, FileFromAPI, DirectoryFromAPI } from "@/models/file-explorer";

import { ChevronLeftIcon } from '@heroicons/vue/24/solid'
import { ChevronRightIcon, ArrowUturnUpIcon } from '@heroicons/vue/20/solid';
import { DocumentTextIcon, FolderIcon, CalendarIcon, RectangleStackIcon } from '@heroicons/vue/24/outline';

import dayjs from "dayjs";

const props = defineProps<{
	directory: DirectoryRender | null;
}>();

const route = useRoute();
function getBackPath(): string {
	let path = [...route.params.path];
	if (path.length > 1) {
		path.pop();
	}
	return "/" + path.map(encodeURIComponent).join("/");
}
function stringToArray(input: string[] | string): string[] {
	if (Array.isArray(input)) return [...input];
	if (input === "") return [];
	return [input];
}
async function openExternally() {
	if (!props.directory) return;
	return fetch("/open/" + props.directory.location.path.join("/"));
}

const path = computed(() => {
	if (!props.directory) return [];

	let pathItems = [];
	let path = stringToArray(route.params.path);
	let root = path.shift(); // Remove tab locator
	if (props.directory.location.fromRoot) {
		pathItems.push({
			name: "All Files",
			href: "/" + root,
			index: 0,
		});
	}
	for (let [index, pathItem] of path.entries()) {
		pathItems.push({
			name: pathItem,
			href: "/" + root + "/" + path.slice(0, index + 1).map(encodeURIComponent).join("/"),
			index: props.directory.location.fromRoot ? index + 1 : index,
		});
	}
	return pathItems;
});

const items: Ref<(FileDisplay | DirectoryDisplay)[]> = ref([]);
const emptyDirectory: Ref<boolean> = ref(false);

// Update list items when the current directory changes
watchEffect(async () => {
	if (!props.directory) return;

	items.value = []; // Clear the list so we can regenerate it
	emptyDirectory.value = false;
	let newItems: (FileDisplay | DirectoryDisplay)[] = []; // Wait to finish loading before presenting
	for (const item of props.directory.directory.values()) {
		console.log(item);
		if (item.kind === "directory") {
			let subitems = 0;
			let subitemInfoResponse = await fetch("/api/" + props.directory.location.path.join("/"));
			if (subitemInfoResponse.status === 200) {
				let itemInfo: FileFromAPI | (DirectoryFromAPI | FileFromAPI)[] = await subitemInfoResponse.json();
				subitems = Array.isArray(itemInfo) ? itemInfo.length : 0;
			}
			newItems.push({
				kind: "directory",
				id: item.name,
				name: item.name,
				href: `/${stringToArray(route.params.path).map(encodeURIComponent).join("/")}/${encodeURIComponent(item.name)}`,
				subitems,
			});
		}
		else {
			newItems.push({
				kind: "file",
				id: item.name,
				name: item.name,
				href: `/${stringToArray(route.params.path).map(encodeURIComponent).join("/")}/${encodeURIComponent(item.name)}`,
				lastModified: new Date(item.lastModified),
				size: item.size,
				type: item.type,
			});
		}
	}
	// Sort item list alphabetically by directory then by file
	const collator = new Intl.Collator([], { numeric: true }); // Sorts things numerically like Windows does by default
	newItems.sort((a, b) => {
		if (a.kind === "directory" && b.kind === "file") {
			return -1;
		}
		if (a.kind === "file" && b.kind === "directory") {
			return 1;
		}
		return collator.compare(a.name, b.name);
	});
	items.value = newItems;
	emptyDirectory.value = newItems.length === 0;
});

function formatDate(d: Date, time: boolean = false): string {
	const date = dayjs(d);
	if (!time) {
		return date.format("DD MMM YY");
	}
	else {
		return date.format("DD MMM YY @ HH:mm[Z]");
	}
}
</script>
