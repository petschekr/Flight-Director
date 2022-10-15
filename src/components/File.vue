<template>
	<div class="bg-white sm:rounded-lg sm:shadow h-full flex flex-col">
		<div class="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 sm:rounded-t-lg">
			<div class="-ml-4 -mt-2 flex flex-nowrap items-center justify-between truncate">
				<div class="ml-4 mt-2 truncate">
					<div class="flex items-center">
						<RouterLink :to="getBackPath()" class="self-start mt-1 h-7 w-7 text-gray-400 transition-colors hover:text-gray-600 shrink-0">
							<ChevronLeftIcon />
						</RouterLink>
						<div class="ml-4 truncate">
							<h3 class="text-lg font-medium leading-6 text-gray-900 truncate">{{props.file?.commonName}}</h3>
							<p class="text-sm text-gray-500 truncate" :title="props.file?.path.join('/')">{{props.file?.file.name}}</p>
						</div>
					</div>
				</div>
				<div class="ml-4 mt-2">
					<div class="flex items-center">
						<p class="text-sm text-gray-500" title="Last modified">{{formatDate(props.file?.file.lastModified!)}}</p>
						<a :href="props.file?.blobURL" target="_blank"
							class="flex-shrink-0 relative inline-flex items-center rounded-full bg-white px-2 py-2 mx-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 transition-shadow hover:shadow">
							<ArrowTopRightOnSquareIcon class="h-6 w-6" />
						</a>
					</div>
				</div>
			</div>
		</div>
		<!-- Are you sure you want to preview this? Preview anyway -->
		<embed v-if="shouldPreview" :src="props.file?.blobURL ?? ''" :type="props.file?.file.type" class="w-full sm:rounded-b-lg flex-grow object-scale-down" />
		<div v-else class="flex flex-col flex-grow justify-center items-center shadow-inner">
			<p class="text-lg font-medium mb-2">We don't recognize this file type yet. It likely won't display correctly in your browser.</p>
			<code class="text-sm mb-4">{{props.file?.file.type || "Unknown file type"}}</code>
			<button @click="shouldPreview = true"
				class="inline-flex items-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
				Preview anyway
				<RocketLaunchIcon class="ml-2 -mr-1 h-5 w-5" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watchEffect, type Ref } from "vue";
import { useRoute } from "vue-router";
import { ChevronLeftIcon, ArrowTopRightOnSquareIcon, RocketLaunchIcon } from '@heroicons/vue/24/solid'
import dayjs from "dayjs";

import type { FileRender } from "@/models/file-explorer";

const props = defineProps<{
	file: FileRender | null;
}>();

const route = useRoute();

const shouldPreview: Ref<boolean> = ref(false);
const knownFileTypes = ["application/pdf", "text/plain", "text/xml", "image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/tiff"];
watchEffect(() => {
	shouldPreview.value = knownFileTypes.includes(props.file?.file.type ?? "");
});

function getBackPath(): string {
	let path = [...route.params.path];
	if (path.length > 1) {
		path.pop();
	}
	return "/" + path.map(encodeURIComponent).join("/");
}
function formatDate(d: Date | number, time: boolean = false): string {
	const date = dayjs(d);
	return date.format("DD MMM YY HH:mm[Z]");
}

</script>
