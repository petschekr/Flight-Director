<template>
	<div v-for="fileGroup in fileGroups" :key="fileGroup.name" class="">
		<div class="relative mt-2" v-if="fileGroups.length > 1">
			<div class="absolute inset-0 top-1 flex items-center" aria-hidden="true">
				<div class="w-full border-t border-gray-300" />
			</div>
			<div class="relative flex justify-start">
				<span class="bg-gray-100 pr-3 text-lg font-medium text-gray-900">{{fileGroup.name}}</span>
			</div>
		</div>
		<ul role="list" class="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
			<li v-for="file in fileGroup.files" :key="file.name" class="col-span-1 flex rounded-md shadow-sm transition-shadow hover:shadow-md h-24">
				<a v-if="isExternal(file)" :href="file.path" target="_blank" class="contents">
					<Card :file="file" />
				</a>
				<RouterLink v-if="!isExternal(file)" :to="getPath(file.name)" class="contents">
					<Card :file="file" />
				</RouterLink>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import type { File } from "@/models/configuration";

import Card from "./Card.vue";

defineProps<{
	fileGroups: {
		name: string;
		files: File[];
	}[];
}>();

const route = useRoute();

function getPath(filePath: string): string {
	// Make a root path for browser and append to the current tab name
	return "/" + route.params.path[0] + "/" + encodeURIComponent(filePath);
}
function isExternal(file: File): boolean {
	return file.path.startsWith("http");
}
</script>
