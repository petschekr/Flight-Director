<template>
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
		<div v-if="editMode" class="flex-shrink-0 pr-2">
			<button type="button"
				class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white bg-transparent text-gray-400">
				<span class="sr-only">Open options</span>
				<Bars3Icon class="h-5 w-5" aria-hidden="true" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, type Ref } from "vue";
import { ArrowTopRightOnSquareIcon, Bars3Icon } from '@heroicons/vue/20/solid'

import type { File } from "@/models/configuration";

defineProps<{
	file: File
}>();

const editMode = inject<Ref<boolean>>("editMode");

function isExternal(file: File): boolean {
	return file.path.startsWith("http");
}
</script>
