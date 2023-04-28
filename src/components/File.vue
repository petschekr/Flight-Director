<template>
	<div class="bg-white rounded-lg sm:shadow h-[calc(100vh-7rem)] flex flex-col">
		<div class="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 rounded-t-lg">
			<div class="-ml-4 -mt-2 flex flex-nowrap items-center justify-between truncate">
				<div class="ml-4 mt-2 truncate">
					<div class="flex items-center">
						<RouterLink :to="getBackPath()" class="self-start mt-1 h-7 w-7 text-gray-400 transition-colors hover:text-gray-600 shrink-0">
							<ChevronLeftIcon />
						</RouterLink>
						<div class="ml-4 truncate">
							<h3 class="text-lg font-medium leading-6 text-gray-900 truncate">{{props.file?.commonName}}</h3>
							<RouterLink :to="'/files/' + props.file?.path.slice(0, -1).join('/')" :title="props.file?.file.name"
								class="text-sm text-gray-500 whitespace-normal transition-color hover:text-sky-700 ">
								{{props.file?.path.join('/')}}
							</RouterLink>
						</div>
					</div>
				</div>
				<div class="ml-4 mt-2">
					<div class="flex items-center">
						<p class="text-sm text-gray-500" title="Last modified">{{formatDate(props.file?.file.lastModified!)}}</p>
						<button title="Open natively" @click="openExternally"
							class="flex-shrink-0 relative inline-flex items-center rounded-full bg-white px-2 py-2 mx-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 transition-shadow hover:shadow">
							<ArrowTopRightOnSquareIcon class="h-6 w-6" />
						</button>
					</div>
				</div>
			</div>
		</div>
		<embed v-if="shouldPreview" :src="'/api/download/' + (props.file?.path.join('/') ?? '') + '?page=0'" class="w-full sm:rounded-b-lg flex-grow object-scale-down" />
		<div v-else class="flex flex-col flex-grow justify-center items-center shadow-inner">
			<RocketLaunchIconOutline class="h-10 w-10" />
			<p class="text-lg font-medium my-4">Opening in your default app...</p>
			<button @click="openExternally"
				class="inline-flex items-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
				Open again
				<ArrowTopRightOnSquareIcon class="ml-2 -mr-1 h-5 w-5" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, type Ref, inject, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ChevronLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/solid'
import { RocketLaunchIcon as RocketLaunchIconOutline } from "@heroicons/vue/24/outline";
import dayjs from "dayjs";

import type { Configuration } from "@/models/configuration";
import type { FileRender } from "@/models/file-explorer";

const props = defineProps<{
	file: FileRender | null;
}>();

const configuration = inject<Ref<Configuration | null>>("configuration");

const router = useRouter();
const route = useRoute();

async function openExternally() {
	if (!props.file) return;
	fetch("/api/open/" + props.file.path.join("/"));
}

const shouldPreview: Ref<boolean> = ref(false);
const nativeFileExtensions = [".pdf", ".txt", ".xml", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".tiff", ".tif"];

onMounted(() => {
	// File is being viewed, determine if we should open it externally
	if (!configuration?.value || !props.file) return;

	if (localStorage.getItem("previewEnabled") === "false") {
		// Previewing disabled
		openExternally();
		router.back();
	}
	else {
		shouldPreview.value = nativeFileExtensions.some(ext => props.file?.file.name.toLowerCase().endsWith(ext.toLowerCase()));
		if (!shouldPreview.value) {
			openExternally();
		}
	}
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
