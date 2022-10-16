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
						<a :href="props.file?.blobURL" target="_blank" :download="shouldPreview ? null : props.file?.file.name"
							class="flex-shrink-0 relative inline-flex items-center rounded-full bg-white px-2 py-2 mx-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0 transition-shadow hover:shadow">
							<ArrowTopRightOnSquareIcon class="h-6 w-6" />
						</a>
					</div>
				</div>
			</div>
		</div>
		<embed v-if="shouldPreview" :src="props.file?.blobURL ?? ''" :type="props.file?.file.type" class="w-full sm:rounded-b-lg flex-grow object-scale-down" />
		<div v-else-if="msOfficeURL === null" class="flex flex-col flex-grow justify-center items-center shadow-inner">
			<ExclamationTriangleIcon class="h-10 w-10 mb-4" />
			<p class="text-lg font-medium mb-2">We don't recognize this file type yet. It likely won't display correctly in your browser.</p>
			<code class="text-sm mb-4">{{props.file?.file.type || "Unknown file type"}}</code>
			<button @click="shouldPreview = true"
				class="inline-flex items-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
				Preview anyway
				<RocketLaunchIcon class="ml-2 -mr-1 h-5 w-5" />
			</button>
		</div>
		<div v-else class="flex flex-col flex-grow justify-center items-center shadow-inner">
			<RocketLaunchIconOutline class="h-10 w-10" />
			<p class="text-lg font-medium my-4">Opening in {{msOfficeProduct}}...</p>
			<a :href="msOfficeURL"
				class="inline-flex items-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
				Open again
				<ArrowTopRightOnSquareIcon class="ml-2 -mr-1 h-5 w-5" />
			</a>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watchEffect, type Ref, inject, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ChevronLeftIcon, ArrowTopRightOnSquareIcon, RocketLaunchIcon } from '@heroicons/vue/24/solid'
import { RocketLaunchIcon as RocketLaunchIconOutline, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import dayjs from "dayjs";

import type { Configuration } from "@/models/configuration";
import type { FileRender } from "@/models/file-explorer";

const props = defineProps<{
	file: FileRender | null;
}>();

const configuration = inject<Ref<Configuration | null>>("configuration");

const route = useRoute();

const shouldPreview: Ref<boolean> = ref(false);
const nativeFileTypes = ["application/pdf", "text/plain", "text/xml", "image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/tiff"];
const msOfficeURL: Ref<string | null> = ref(null);
const msOfficeProduct: Ref<string> = ref("");
watchEffect(() => {
	shouldPreview.value = nativeFileTypes.includes(props.file?.file.type ?? "");
});
onMounted(() => {
	// File is being viewed, determine if we should open it externally
	if (!configuration?.value || !props.file) return;

	// https://learn.microsoft.com/en-us/office/client-developer/office-uri-schemes
	let handler: string | null = null;
	if ([".docx", ".doc", ".docm", ".dotx", ".dotm", ".docb"].some(ext => props.file?.file.name.endsWith(ext))) {
		handler = "ms-word";
		msOfficeProduct.value = "Microsoft Word";
	}
	else if ([".xls", ".xlt", ".xlm", ".xlsx", ".xlsm", ".xltx", ".xltm", ".xlsb", ".xlw"].some(ext => props.file?.file.name.endsWith(ext))) {
		handler = "ms-excel";
		msOfficeProduct.value = "Microsoft Excel";
	}
	else if ([".ppt", ".pot", ".pps", ".pptx", ".pptm", ".potx", ".potm", ".ppsx", ".ppsm"].some(ext => props.file?.file.name.endsWith(ext))) {
		handler = "ms-powerpoint";
		msOfficeProduct.value = "Microsoft PowerPoint";
	}
	if (handler) {
		msOfficeURL.value = `${handler}:${configuration.value.root}/${props.file.path.map(encodeURIComponent).join("/")}`;
		window.location.assign(msOfficeURL.value);
	}
	else {
		msOfficeURL.value = null;
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
