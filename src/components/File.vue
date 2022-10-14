<template>
	<!-- <div class="h-full">
		<div class="flex flex-1 flex-col">
			<div>
				<h1>It's a file!</h1>
				<h2>{{props.file?.name}}</h2>
			</div>
			<embed :src="props.fileURL ?? ''" type="application/pdf" class="flex-grow" />
		</div>
	</div> -->
	<div class="bg-white sm:rounded-lg sm:shadow h-full flex flex-col">
		<div class="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 sm:rounded-t-lg">
			<div class="-ml-4 -mt-2 flex flex-nowrap items-center justify-between truncate">
				<div class="ml-4 mt-2 truncate">
					<div class="flex items-center">
						<RouterLink :to="getBackPath()" class="h-7 w-7 text-gray-400 transition-colors hover:text-gray-600 shrink-0">
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
		<embed :src="props.file?.blobURL ?? ''" type="application/pdf" class="w-full sm:rounded-b-lg flex-grow" />
	</div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ChevronLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/solid'
import dayjs from "dayjs";

import type { FileRender } from "@/models/file-explorer";

let props = defineProps<{
	file: FileRender | null;
}>();

const route = useRoute();

function getBackPath(): string {
	// Make a root path for browser and append to the current tab name
	return "/" + route.params.path[0];
}
function formatDate(d: Date | number, time: boolean = false): string {
	const date = dayjs(d);
	return date.format("DD MMM YY HH:mm[Z]");
}

</script>
