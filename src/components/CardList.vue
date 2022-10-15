<template>
	<ul role="list" class="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
		<component
			:is="isExternal(file) ? 'a' : 'RouterLink'"
			tag="li"
			v-for="file in files"
			:key="file.name"
			:to="getPath(file.path)"
			:href="file.path"
			:target="isExternal(file) ? '_blank' : ''"
			class="col-span-1 flex rounded-md shadow-sm transition-shadow hover:shadow-md h-24"
		>
			<div
				:class="[file.color, 'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md']">
				{{ file.abbreviation }}</div>
			<div
				class="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
				<div class="flex-1 truncate px-4 py-2 text-sm">
					<p class="text-lg font-medium text-gray-900 truncate hover:text-gray-600">
						{{ file.name }}
						<ArrowTopRightOnSquareIcon v-if="isExternal(file)" class="inline w-4 h-4 mb-0.5" />
					</p>
					<p class="text-gray-500 line-clamp-2 whitespace-normal">{{ file.description }}</p>
				</div>
				<!-- <div class="flex-shrink-0 pr-2">
					<button type="button"
						class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
						<span class="sr-only">Open options</span>
						<EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
					</button>
				</div> -->
			</div>
		</component>
	</ul>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/20/solid'

import type { File } from "@/models/configuration";

defineProps<{
	files: File[]
}>();

const route = useRoute();

function getPath(filePath: string): string {
	// Make a root path for browser and append to the current tab name
	return "/" + route.params.path[0] + "/" + filePath;
}
function isExternal(file: File): boolean {
	return file.path.startsWith("http");
}
</script>
