<template>
	<div class="text-center">
		<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
			aria-hidden="true">
			<path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
		</svg>
		<h3 class="mt-2 text-xl font-medium text-gray-900">Permissions Needed</h3>
		<p class="mt-1  text-gray-500">Select the root folder of the <strong>50th ATKS</strong> share drive (<code>Z:\</code>) to get started.</p>
		<div class="mt-6">
			<button type="button" @click="$emit('selectFolder')"
				class="inline-flex items-center rounded-md border border-transparent bg-sky-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
				Select Folder
				<ArrowTopRightOnSquareIcon class="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/20/solid'

defineEmits<{
	(e: "selectFolder"): void
}>()
</script>
