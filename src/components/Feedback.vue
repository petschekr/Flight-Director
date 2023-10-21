<template>
	<TransitionRoot as="template" :show="isOpen">
		<Dialog as="div" class="relative z-50" @close="close()">
			<div class="fixed inset-0" />

			<div class="fixed inset-0 overflow-hidden">
				<div class="absolute inset-0 overflow-hidden">
					<div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
						<TransitionChild as="template"
							enter="transform transition ease-in-out duration-500 sm:duration-500"
							enter-from="translate-x-full" enter-to="translate-x-0"
							leave="transform transition ease-in-out duration-500 sm:duration-500"
							leave-from="translate-x-0" leave-to="translate-x-full">
							<DialogPanel class="pointer-events-auto w-screen max-w-md">
								<form class="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl" @submit.prevent="feedbackSubmit">
									<div class="h-0 flex-1 overflow-y-auto">
										<div class="bg-sky-700 py-6 px-4 sm:px-6">
											<div class="flex items-center justify-between">
												<DialogTitle class="text-lg font-medium text-white">Submit Feedback</DialogTitle>
												<div class="ml-3 flex h-7 items-center">
													<button type="button"
														class="rounded-md bg-sky-700 text-sky-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
														@click="close()">
														<XMarkIcon class="h-6 w-6" aria-hidden="true" />
													</button>
												</div>
											</div>
											<div class="mt-1">
												<p class="text-sm text-sky-200">See a problem or want to suggest new content or a new feature?</p>
											</div>
										</div>
										<div class="flex flex-1 flex-col justify-between">
											<div class="divide-y divide-gray-200 px-4 sm:px-6">
												<div class="space-y-4 pt-6 pb-5">
													<div>
														<label for="title" class="block text-sm font-medium text-gray-900">Title</label>
														<div class="mt-1">
															<input type="text" id="title" v-model.lazy.trim="title"
																class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
														</div>
														<p class="mt-2 text-sm text-gray-500" id="email-description">Give this feedback a quick summary</p>
													</div>
													<div>
														<label for="description"
															class="block text-sm font-medium text-gray-900">Description</label>
														<div class="mt-1">
															<textarea id="description" name="description" rows="5" v-model.lazy.trim="description"
																class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
														</div>
														<p class="mt-2 text-sm text-gray-500" id="email-description">Provide details needed to replicate the issue or where to find the content you're suggesting</p>
													</div>
													<fieldset>
														<legend class="text-sm font-medium text-gray-900">Feedback Type</legend>
														<div class="mt-2 space-y-5">
															<div>
																<div class="relative flex items-start">
																	<div class="absolute flex h-5 items-center">
																		<input id="content-addition" type="radio" name="feedback-type" value="Content addition" v-model="feedbackType"
																			class="h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500" />
																	</div>
																	<div class="pl-7 text-sm">
																		<label for="content-addition" class="font-medium text-gray-900">Content addition</label>
																		<p class="text-gray-500">A suggestion for new content</p>
																	</div>
																</div>
															</div>
															<div>
																<div class="relative flex items-start">
																	<div class="absolute flex h-5 items-center">
																		<input id="content-update" type="radio" name="feedback-type" value="Content update" v-model="feedbackType"
																			class="h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500" />
																	</div>
																	<div class="pl-7 text-sm">
																		<label for="content-update" class="font-medium text-gray-900">Content update</label>
																		<p class="text-gray-500">A link to existing content is broken or would fit better in a different place</p>
																	</div>
																</div>
															</div>
															<div>
																<div class="relative flex items-start">
																	<div class="absolute flex h-5 items-center">
																		<input id="feature-suggestion" type="radio" name="feedback-type" value="Feature suggestion" v-model="feedbackType"
																			class="h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500" />
																	</div>
																	<div class="pl-7 text-sm">
																		<label for="feature-suggestion" class="font-medium text-gray-900">Feature suggestion</label>
																		<p class="text-gray-500">You've got an idea for a really cool feature that you'd like to see implemented</p>
																	</div>
																</div>
															</div>
															<div class="relative flex items-start">
																<div class="absolute flex h-5 items-center">
																	<input id="bugfix" type="radio" name="feedback-type" value="Bugfix" v-model="feedbackType"
																		class="h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500" />
																</div>
																<div class="pl-7 text-sm">
																	<label for="bugfix" class="font-medium text-gray-900">Bugfix</label>
																	<p class="text-gray-500">Functionality is broken or doesn't work as expected</p>
																</div>
															</div>
														</div>
													</fieldset>
												</div>
											</div>
										</div>
									</div>
									<div class="flex flex-shrink-0 justify-end px-4 py-4">
										<button type="button"
											class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
											@click="close()">Cancel</button>
										<button type="submit"
											class="ml-4 inline-flex justify-center rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">Submit</button>
									</div>
								</form>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>

	<!-- Global notification live region, render this permanently at the end of the document -->
	<div aria-live="assertive" class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50">
		<div class="flex w-full flex-col items-center space-y-4 sm:items-end">
			<!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
			<transition enter-active-class="transform ease-out duration-300 transition"
				enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
				enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
				leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
				leave-to-class="opacity-0">
				<div v-if="notificationOpen"
					class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
					<div class="p-4">
						<div class="flex items-start">
							<div class="flex-shrink-0">
								<CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />
							</div>
							<div class="ml-3 w-0 flex-1 pt-0.5">
								<p class="text-sm font-medium text-gray-900">Feedback submitted!</p>
								<p class="mt-1 text-sm text-gray-500">Thank you for helping to improve Flight Director.</p>
							</div>
							<div class="ml-4 flex flex-shrink-0">
								<button type="button" @click="notificationOpen = false"
									class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
									<span class="sr-only">Close</span>
									<XMarkIconSmall class="h-5 w-5" aria-hidden="true" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</transition>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, type Ref, watch, inject } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { XMarkIcon as XMarkIconSmall } from '@heroicons/vue/20/solid'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'

import type { Configuration } from "@/types/configuration";
import { CONFIGURATION, OPEN_ALERT } from '@/types/keys'

const props = defineProps<{
	open: boolean;
}>();
const emit = defineEmits<{
	(e: "closed"): void;
}>();

const configuration = inject(CONFIGURATION);
const openAlert = inject(OPEN_ALERT);

const isOpen = ref(false);
watch(() => props.open, () => isOpen.value = props.open);
function close() {
	isOpen.value = false;
	emit("closed");
}

const notificationOpen = ref(false);

const title = ref("");
const description = ref("");
const feedbackType = ref("");

async function feedbackSubmit() {
	if (!openAlert) return;

	if (!configuration?.value?.feedbackLocation) {
		await openAlert("Missing feedback save location", "No location is configured for where to save feedback");
		return;
	}
	if (!title.value) {
		await openAlert("Title required", "Please provide a title for your feedback");
		return;
	}
	if (!description.value) {
		await openAlert("Description required", "Please provide a thorough description of the feedback that you're suggesting");
		return;
	}
	if (!feedbackType.value) {
		await openAlert("Feedback type required", "Please select the feedback category that best describes what you're submitting");
		return;
	}

	let pathSafeTitle = title.value.replace(/[<>:"\/\\\|\?\*]/g, "-");
	await fetch(`/api/save/${configuration?.value?.feedbackLocation}/${encodeURIComponent(feedbackType.value)}/${Date.now()} - ${encodeURIComponent(pathSafeTitle)}.txt`, {
		method: "POST",
		headers: { "Content-Type": "text/plain" },
		body: `${title.value} - ${feedbackType.value}\r\n\r\n${description.value}`
	});

	notificationOpen.value = true;
	setTimeout(() => notificationOpen.value = false, 5000);
	close();

	// Clear form
	title.value = "";
	description.value = "";
	feedbackType.value = "";
}
</script>
