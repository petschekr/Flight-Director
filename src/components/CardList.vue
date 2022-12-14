<template>
	<div v-for="fileGroup in fileGroups" :key="fileGroup.groupName" class="">
		<div class="relative mt-2">
			<div class="absolute inset-0 top-1 flex items-center" aria-hidden="true">
				<div class="w-full border-t border-gray-300" />
			</div>
			<div class="relative flex justify-start">
				<span v-if="!editMode" class="bg-gray-100 pr-3 text-lg font-medium text-gray-900">{{fileGroup.groupName}}</span>
				<input v-else type="text" :value="fileGroup.groupName" @keydown.enter="($event.target as HTMLInputElement).blur()" @blur="updateGroupName(fileGroup.groupName, $event)"
					class="rounded-md bg-gray-100 border-gray-300 shadow-sm font-medium text-gray-900 focus:border-sky-500 focus:ring-sky-500" />
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
			<!-- New card button appears in edit mode -->
			<li v-if="editMode" class="col-span-1 flex rounded-md h-24 mb-4">
				<a @click="openEditPanel(null, fileGroup.groupName, fileGroup.tabName)" class="contents">
					<div class="flex flex-1 items-center justify-center rounded-md border-4 border-dashed border-gray-300 hover:border-solid cursor-pointer transition-transform hover:scale-105">
						<SquaresPlusIcon class="h-12 w-12 text-gray-300" />
					</div>
				</a>
			</li>
		</ul>
	</div>

	<div v-if="editMode" class="relative mt-2">
		<div class="absolute inset-0 top-1 flex items-center" aria-hidden="true">
			<div class="w-full border-t border-gray-300" />
		</div>
		<div class="relative flex justify-start">
			<input type="text" placeholder="New group" @keydown.enter="($event.target as HTMLInputElement).blur()" @blur="addGroupName($event)"
					class="rounded-md bg-gray-100 border-gray-300 shadow-sm font-medium text-gray-900 focus:border-sky-500 focus:ring-sky-500" />
		</div>
	</div>

	<EditCard :file="editPanelFile" :group-name="editPanelGroupName" :tab-name="editPanelTabName" :open="editPanelOpen" @closed="editPanelOpen = false" />
</template>

<script setup lang="ts">
import { inject, type Ref, ref } from "vue";
import { useRoute } from "vue-router";

import type { File, Configuration } from "@/models/configuration";

import { SquaresPlusIcon } from "@heroicons/vue/24/outline";

import Card from "@/components/Card.vue";
import EditCard from "@/components/EditCard.vue";

const props = defineProps<{
	fileGroups: {
		tabName: string;
		groupName: string;
		files: File[];
	}[];
	tabName: string;
}>();

const configuration = inject<Ref<Configuration | null>>("configuration");

const editMode = inject<Ref<boolean>>("editMode");
const editPanelOpen: Ref<boolean> = ref(false);
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
function openEditPanel(file: File | null, groupName: string, tabName: string) {
	editPanelFile.value = file;
	editPanelGroupName.value = groupName;
	editPanelTabName.value = tabName;
	editPanelOpen.value = true;
}
function updateGroupName(oldGroupName: string, event: Event) {
	if (!configuration?.value) return;
	const inputElement = event.target as HTMLInputElement;
	let newGroupName = inputElement.value.trim();
	if (newGroupName === oldGroupName) return;
	if (!newGroupName) {
		if (!confirm("Are you sure you want to delete this group?")) return;
	}
	if (configuration.value.tabs[props.tabName][newGroupName]) {
		alert("A group with that name already exists!");
		inputElement.value = oldGroupName;
		return;
	}

	let newTabContents = {};
	for (let [groupName, group] of Object.entries(configuration.value.tabs[props.tabName])) {
		if (groupName !== oldGroupName) {
			// Copy as-is
			Object.assign(newTabContents, { [groupName]: group });
		}
		else {
			if (newGroupName) {
				// Rename and add
				Object.assign(newTabContents, { [newGroupName]: group });
			}
			// If newGroupName is blank, content is deleted
		}
	}
	configuration.value.tabs[props.tabName] = newTabContents;
}
function addGroupName(event: Event) {
	if (!configuration?.value) return;
	const inputElement = event.target as HTMLInputElement;
	let newGroupName = inputElement.value.trim();
	if (!newGroupName) {
		return;
	}
	if (configuration.value.tabs[props.tabName][newGroupName]) {
		alert("A group with that name already exists!");
		return;
	}
	Object.assign(configuration.value.tabs[props.tabName], { [newGroupName]: [] });
	inputElement.value = "";
}
</script>
