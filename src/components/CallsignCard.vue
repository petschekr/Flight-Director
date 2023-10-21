<template>
	<div class="overflow-hidden bg-white shadow border sm:rounded-lg my-3 mx-6">
		<div class="px-4 py-4 sm:px-6 flex items-center">
			<div class="flex-grow">
				<h3 v-if="callsign.length > 0" class="text-lg font-medium leading-6 text-gray-900">{{callsign}} <span class="text-base font-mono">({{shortCallsign}})</span></h3>
				<p v-if="callsign.length > 0" class="mt-1 max-w-2xl text-sm text-gray-500">{{pathDisplay}}</p>
				<h3 v-else class="text-lg font-medium leading-6 text-gray-500 italic">New callsign</h3>
			</div>
			<div>
				<TrashIcon @click="$emit('delete', initialCallsign)" class="w-7 h-7 px-1 mr-1 self-center rounded-full text-gray-400 cursor-pointer transition-colors hover:bg-gray-200" />
			</div>
			<div>
				<ChevronUpIcon @click="$emit('move', initialCallsign, 'up')" class="w-7 h-7 px-1 ml-1 self-center rounded-full text-gray-400 cursor-pointer transition-colors hover:bg-gray-200" />
				<ChevronDownIcon @click="$emit('move', initialCallsign, 'down')" class="w-7 h-7 px-1 ml-1 self-center rounded-full text-gray-400 cursor-pointer transition-colors hover:bg-gray-200" />
			</div>
		</div>
		<div class="border-t border-gray-200 px-4 py-5 sm:p-0">
			<dl class="sm:divide-y sm:divide-gray-200">
				<div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
					<label for="callsign" class="text-sm font-medium text-gray-500 self-center">Callsign</label>
					<input type="text" id="callsign" v-model.trim="callsign"
						class="sm:col-span-2 sm:mt-0 rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
				</div>
				<div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
					<label for="callsign-path" class="text-sm font-medium text-gray-500 self-center">Path to content</label>
					<input type="text" id="callsign-path" v-model="path"
						class="sm:col-span-2 sm:mt-0 rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
				</div>
			</dl>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, type Ref, watch, computed, inject } from "vue";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { GENERATE_SHORT_CALLSIGN, PROCESS_PATH_REPLACEMENTS } from "@/types/keys";

const props = defineProps<{
	initialCallsign: string;
	initialPath: string;
}>();
defineEmits<{
	(e: "delete", callsign: string): void;
	(e: "move", callsign: string, direction: "up" | "down"): void;
}>();

const generateShortCallsign = inject(GENERATE_SHORT_CALLSIGN);
const processPathReplacements = inject(PROCESS_PATH_REPLACEMENTS);

const callsign = ref(props.initialCallsign);
watch(() => props.initialCallsign, () => callsign.value = props.initialCallsign);
const path = ref(props.initialPath);
watch(() => props.initialPath, () => path.value = props.initialPath);

defineExpose({
	callsign,
	path,
});

const shortCallsign = computed(() => {
	if (!generateShortCallsign) return "";
	return generateShortCallsign(callsign.value);
});
const pathDisplay = computed(() => {
	if (!processPathReplacements) return "";
	return processPathReplacements(path.value, callsign.value);
});

</script>
