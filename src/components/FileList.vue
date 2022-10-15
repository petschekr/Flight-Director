<template>
	<div class="bg-white sm:rounded-lg sm:shadow flex flex-col mb-4">
		<div class="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 sm:rounded-t-lg">
			<div class="-ml-4 -mt-2 flex flex-nowrap items-center justify-between truncate">
				<div class="ml-4 mt-2 truncate">
					<div class="flex items-center">
						<RouterLink :to="props.directory?.backLink ?? getBackPath()" class="self-start mt-1 h-7 w-7 text-gray-400 transition-colors hover:text-gray-600 shrink-0">
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

		<div v-if="items.length === 0" class="flex justify-center items-center my-8">
			<svg class="animate-spin -ml-1 mr-3 h-10 w-10 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none"
				viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
				</path>
			</svg>
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
import type { FileDisplay, DirectoryDisplay, DirectoryRender } from "@/models/file-explorer";

import { ChevronLeftIcon } from '@heroicons/vue/24/solid'
import { ChevronRightIcon } from '@heroicons/vue/20/solid';
import { DocumentTextIcon, FolderIcon, CalendarIcon, RectangleStackIcon } from '@heroicons/vue/24/outline';

import dayjs from "dayjs";

const props = defineProps<{
	directory: DirectoryRender | null;
}>();

const route = useRoute();
function getBackPath(): string {
	// Make a root path for browser and append to the current tab name
	return "/" + route.params.path[0];
}
function stringToArray(input: string[] | string): string[] {
	if (Array.isArray(input)) return [...input];
	if (input === "") return [];
	return [input];
}

const path = computed(() => {
	let path = stringToArray(route.params.path);
	let root = path.shift(); // Remove tab locator
	return path.map((pathItem, index) => ({
		name: pathItem,
		href: `/${root}/${path.slice(0, index + 1).join("/")}`,
		index
	}));
});

const items: Ref<(FileDisplay | DirectoryDisplay)[]> = ref([]);

// Update list items when the current directory changes
watchEffect(async () => {
	if (!props.directory) return;

	items.value = []; // Clear the list so we can regenerate it
	let newItems: (FileDisplay | DirectoryDisplay)[] = []; // Wait to finish loading before presenting
	for await (const item of props.directory.directory.values()) {
		if (item.kind === "directory") {
			let subitems = 0;
			for await (const subitem of item.values()) {
				subitems++;
			}
			newItems.push({
				kind: "directory",
				id: item.name,
				name: item.name,
				href: `/${stringToArray(route.params.path).join("/")}/${item.name}`,
				subitems,
			});
		}
		else {
			const file = await item.getFile();
			newItems.push({
				kind: "file",
				id: item.name,
				name: item.name,
				href: `/${stringToArray(route.params.path).join("/")}/${item.name}`,
				lastModified: new Date(file.lastModified),
				size: file.size,
				type: file.type,
			});
		}
	}
	// Sort item list alphabetically by directory then by file
	newItems.sort((a, b) => {
		if (a.kind === "directory" && b.kind === "file") {
			return -1;
		}
		if (a.kind === "file" && b.kind === "directory") {
			return 1;
		}
		return a.name.localeCompare(b.name);
	});
	items.value = newItems;
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
