<template>
	<div v-for="fileGroup in fileGroups" :key="fileGroup.groupName" class="">
		<div class="relative mt-2" v-if="fileGroups.length > 1">
			<div class="absolute inset-0 top-1 flex items-center" aria-hidden="true">
				<div class="w-full border-t border-gray-300" />
			</div>
			<div class="relative flex justify-start">
				<span class="bg-gray-100 pr-3 text-lg font-medium text-gray-900">{{fileGroup.groupName}}</span>
			</div>
		</div>
		<ul role="list" class="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
			<li v-for="file in fileGroup.files" :key="file.name" class="col-span-1 flex rounded-md shadow-sm transition-shadow hover:shadow-md h-24" :draggable="editMode ? 'true' : 'false'">
				<!-- External links need an <a> -->
				<a v-if="!editMode && isExternal(file)" :href="file.path" target="_blank" class="contents">
					<Card :file="file" />
				</a>
				<!-- Internal links can be handled with the Vue router -->
				<RouterLink v-if="!editMode && !isExternal(file)" :to="getPath(file.name)" class="contents">
					<Card :file="file" />
				</RouterLink>
				<!-- In edit mode, clicking opens the editing panel -->
				<a v-if="editMode" @click="openEditPanel(file, fileGroup.groupName, fileGroup.tabName)" class="contents">
					<Card :file="file" />
				</a>
			</li>
		</ul>
	</div>

	<EditCard :file="editPanelFile" :group-name="editPanelGroupName" :tab-name="editPanelTabName" @closed="editPanelFile = null" />
</template>

<script setup lang="ts">
import { inject, type Ref, ref } from "vue";
import { useRoute } from "vue-router";

import type { File } from "@/models/configuration";

import Card from "@/components/Card.vue";
import EditCard from "@/components/EditCard.vue";

defineProps<{
	fileGroups: {
		tabName: string;
		groupName: string;
		files: File[];
	}[];
}>();

const editMode = inject<Ref<boolean>>("editMode");
const editPanelFile: Ref<File | null> = ref(null);
const editPanelGroupName: Ref<string | null> = ref(null);
const editPanelTabName: Ref<string | null> = ref(null);

const route = useRoute();

function getPath(filePath: string): string {
	// Make a root path for browser and append to the current tab name
	return "/" + route.params.path[0] + "/" + encodeURIComponent(filePath);
}
function isExternal(file: File): boolean {
	return file.path.startsWith("http");
}
function openEditPanel(file: File, groupName: string, tabName: string) {
	editPanelFile.value = file;
	editPanelGroupName.value = groupName;
	editPanelTabName.value = tabName;
}
</script>
