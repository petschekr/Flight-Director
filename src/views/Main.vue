<template>
	<Nav @navigate="navigateTo">
		<Permissions v-if="!hasPermissions" @select-folder="obtainPermissions" />
		<DailyOps v-if="hasPermissions && currentView === 'DailyOps'" />
		<Manuals v-if="hasPermissions && currentView === 'Manuals'" />
		<OpsRef v-if="hasPermissions && currentView === 'OpsRef'" />
		<Other v-if="hasPermissions && currentView === 'Other'" />
	</Nav>
</template>

<script setup lang="ts">
import { defineAsyncComponent, provide, computed, ref, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import toml from "toml";

import Nav from "@/components/Nav.vue";
import Permissions from "@/components/Permissions.vue";
import DailyOps from "@/views/subviews/DailyOps.vue";
import Manuals from "@/views/subviews/Manuals.vue";
import OpsRef from "@/views/subviews/OpsRef.vue";
import Other from "@/views/subviews/Other.vue";
import type { Configuration } from "@/models/configuration";

const router = useRouter();
const route = useRoute();
const hasPermissions = ref(false);
const rootDirectoryHandle: Ref<FileSystemDirectoryHandle | null> = ref(null);
const configuration: Ref<Configuration | null> = ref(null);
provide("configuration", configuration);
provide("rootDirectoryHandle", rootDirectoryHandle);

async function obtainPermissions() {
	try {
		rootDirectoryHandle.value = await window.showDirectoryPicker();
	}
	catch {
		hasPermissions.value = false;
		return;
	}
	hasPermissions.value = true;

	// Load configuration
	try {
		let configFileHandle = await rootDirectoryHandle.value.getFileHandle("flightdirector.toml");
		let configFile = await configFileHandle.getFile();
		configuration.value = toml.parse(await configFile.text());
	}
	catch (err) {
		alert("Error retrieving configuration file. Make sure you selected the top level of the 50th ATKS share drive\n" + err);
		window.location.reload();
		return;
	}

	// loadFiles(rootDirectoryHandle.value, stringToArray(route.params.path));
}

const currentView = ref("DailyOps");
function navigateTo(component: string) {
	currentView.value = component;
}

</script>
