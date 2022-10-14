<template>
	<div v-if="items.length === 0" class="flex justify-center items-center">
		<svg class="animate-spin -ml-1 mr-3 h-10 w-10 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none"
			viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
			</path>
		</svg>
	</div>
	<div class="overflow-hidden bg-white shadow sm:rounded-md">
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
								<p>{{item.subitems}} items</p>
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
</template>

<script setup lang="ts">
import type { FileDisplay, DirectoryDisplay } from "@/models/file-explorer";

import { ChevronRightIcon } from '@heroicons/vue/20/solid';
import { DocumentTextIcon, FolderIcon, CalendarIcon, RectangleStackIcon } from '@heroicons/vue/24/outline';

import dayjs from "dayjs";

defineProps<{
	items: (FileDisplay | DirectoryDisplay)[],
}>();

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
