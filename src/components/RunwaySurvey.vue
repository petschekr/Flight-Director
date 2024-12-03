<template>
	<TransitionRoot as="template" :show="isOpen">
		<Dialog as="div" class="relative z-50" @close="close()">
			<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
				leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 overflow-hidden">
				<div class="absolute inset-0 overflow-hidden">
					<div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
						<TransitionChild as="template"
							enter="transform transition ease-in-out duration-500 sm:duration-700"
							enter-from="translate-x-full" enter-to="translate-x-0"
							leave="transform transition ease-in-out duration-500 sm:duration-700"
							leave-from="translate-x-0" leave-to="translate-x-full">
							<DialogPanel class="pointer-events-auto w-screen max-w-5xl">
								<div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
									<div class="px-4 sm:px-6">
										<div class="flex items-start justify-between">
											<DialogTitle class="text-base font-semibold text-gray-900">ATLC Runway Survey</DialogTitle>
											<div class="ml-3 flex h-7 items-center">
												<button type="button"
													class="rounded-md bg-white text-gray-400 hover:gray-200 focus:outline-none focus:ring-2 focus:ring-white"
													@click="close()">
													<XMarkIcon class="h-6 w-6" aria-hidden="true" />
												</button>
											</div>
										</div>
									</div>
									<div class="relative mt-6 flex-1 px-4 sm:px-6">
										<!-- Your content -->
									</div>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
	open: boolean;
}>();
const emit = defineEmits<{
	(e: "closed"): void;
}>();

const isOpen = ref(false);
watch(() => props.open, () => isOpen.value = props.open);
function close() {
	isOpen.value = false;
	emit("closed");
}
</script>
