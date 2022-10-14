<template>
	<div>
		<div>
			<h1 class="text-2xl font-semibold text-gray-900">Operational Reference</h1>
			<!-- <h2 class="text-sm font-medium text-gray-500">Make sure callsign and take-off date are correct</h2> -->
		</div>
		<CardList :files="files" />
	</div>
</template>

<script setup lang="ts">
import { inject, ref, watch, computed, type Ref } from "vue"
import type { Configuration } from "@/models/configuration";

import CardList from "@/components/CardList.vue";

const configuration = inject<Ref<Configuration | null>>("configuration");

const files = computed(() => {
	if (!configuration || !configuration.value) return [];
	return configuration.value["Operational Reference"].files;
});

</script>
