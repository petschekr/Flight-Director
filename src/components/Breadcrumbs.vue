<template>
	<nav class="flex" aria-label="Breadcrumb">
		<ol role="list" class="flex space-x-2 rounded-md bg-white px-6 shadow">
			<li class="flex">
				<div class="flex items-center">
					<RouterLink to="/" class="text-gray-400 hover:text-gray-500">
						<HomeIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
						<span class="sr-only">Home</span>
					</RouterLink>
				</div>
			</li>
			<li v-for="pathItem in path" :key="pathItem.name" class="flex">
				<div class="flex items-center">
					<svg class="h-full w-6 flex-shrink-0 text-gray-200" viewBox="0 0 24 44" preserveAspectRatio="none"
						fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
					</svg>
					<RouterLink :to="pathItem.href" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{{ pathItem.name }}</RouterLink>
				</div>
			</li>
		</ol>
	</nav>
</template>

<script setup lang="ts">
import type { PathItem } from "@/models/file-explorer";

import { HomeIcon } from "@heroicons/vue/20/solid";

defineProps<{
	path: PathItem[],
}>();
</script>
