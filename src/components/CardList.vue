<template>
	<ul role="list" class="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
		<li v-for="file in files" :key="file.name" class="col-span-1 flex rounded-md shadow-sm transition-shadow hover:shadow-md h-24">
			<a v-if="isExternal(file)" :href="file.path" target="_blank" class="contents">
				<Card :file="file" />
			</a>
			<RouterLink v-if="!isExternal(file)" :to="getPath(file.path)" class="contents">
				<Card :file="file" />
			</RouterLink>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import type { File } from "@/models/configuration";

import Card from "./Card.vue";

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
