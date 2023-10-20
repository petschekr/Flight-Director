<template>
	<div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
		<!-- Connect to cavok, Dropdown with cockpit callsign -->
		<button @click="connect" :disabled="connecting"
			class="self-end inline-flex rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition ease-in-out duration-150 disabled:cursor-not-allowed disabled:opacity-70">
			<svg v-if="connecting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			<template v-if="!connecting">
				Connect to Cavok
			</template>
			<template v-else>
				Connecting...
			</template>
		</button>

		<p class="mt-2 whitespace-pre" v-for="aircraft in aircraftDetails">
			Callsign: <strong>{{ aircraft.callsign }}</strong>
			Airsped: {{ aircraft.airspeed }} KIAS
			Altitude: {{ aircraft.altitude }} ft
			Fuel Remaining: {{ aircraft.fuelRemaining }} lbs
			DA: {{ aircraft.densityAltitude }} ft
			HAT: {{ aircraft.hat }} ft
		</p>
	</div>

	<div class="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
		<div class="md:grid md:grid-cols-4 md:gap-6">
			<div class="md:col-span-1">
				<h3 class="text-lg font-medium leading-6 text-gray-900">Aircraft Information</h3>
				<p class="mt-1 text-sm text-gray-500">
					Garbage in, garbage out.
					<br />
					Set an average fuel flow to automatically update the aircaft weight.
				</p>
			</div>
			<div class="mt-5 space-y-6 md:col-span-3 md:mt-0">
				<div class="grid grid-cols-4 gap-6">
					<div class="col-span-3 sm:col-span-1">
						<label for="weight" class="block text-sm font-medium text-gray-700">Aircraft Weight</label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input type="number" id="weight" min="5000" max="11700" step="100"
								class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm z-10" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">lbs</span>
						</div>
						<p class="mt-2 text-sm text-gray-500">Use Total AV Weight on VIT 99</p>
					</div>
					<div class="col-span-3 sm:col-span-1">
						<label for="density-altitude" class="block text-sm font-medium text-gray-700">Density Altitude</label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input type="number" id="density-altitude" min="5000" max="45000" step="500"
								class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm z-10" />
							<span
								class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">ft</span>
						</div>
						<p class="mt-2 text-sm text-gray-500">Pressure altitude corrected for temperature</p>
					</div>
					<div class="col-span-3 sm:col-span-1">
						<label for="fuel-flow" class="block text-sm font-medium text-gray-700">Fuel Flow</label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input type="number" id="fuel-flow" min="0" max="300" step="10"
								class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm z-10" />
							<span
								class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">lbs/hour</span>
						</div>
						<p class="mt-2 text-sm text-gray-500">Used to automatically update weight. Set to 0 to disable.</p>
					</div>
					<div class="col-span-3 sm:col-span-1">
						<label for="height-above-terrain" class="block text-sm font-medium text-gray-700">Height Above Terrain</label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input type="number" id="height-above-terrain" min="5000" max="45000" step="1000"
								class="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm z-10" />
							<span
								class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 z-0">ft</span>
						</div>
						<p class="mt-2 text-sm text-gray-500">Affects glide distance</p>
					</div>
				</div>
			</div>

			<div class="md:col-span-1">
				<h3 class="text-lg font-medium leading-6 text-gray-900">Drag Index</h3>
				<p class="mt-1 text-sm text-gray-500">Check your aircraft's configuration to set these correctly. 4-blade prop drag is assumed and automatically added for best glide calculation.</p>
			</div>
			<div class="mt-5 space-y-6 md:col-span-3 md:mt-0">
				<fieldset class="border-t border-b border-gray-200">
					<div class="divide-y divide-gray-200">
						<!-- <div v-for="dragItem in dragItems" :key="dragItem.index" class="relative flex items-start py-4">
							<div class="min-w-0 flex-1 text-sm">
								<label :for="dragItem.name.replace(/ /g, '')" class="font-medium text-gray-700">{{dragItem.name}}</label>
							</div>
							<div class="ml-3 flex h-5 items-center">
								<input v-if="dragItem.multiple" :id="dragItem.name.replace(/ /g, '')" @input="e => updateDragItemSelections(e, dragItem.index)" :value="dragItemSelections[dragItem.index] ?? 0"
									type="number" min="0" class="w-16 rounded border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
								<input v-else :id="dragItem.name.replace(/ /g, '')" @input="e => updateDragItemSelections(e, dragItem.index)" :checked="dragItemSelections[dragItem.index] ? true : false"
									type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
							</div>
						</div> -->
					</div>
				</fieldset>
				<p class="text-center font-semibold">Drag Index: 0</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, inject } from "vue";

const openAlert = inject<(title: string, message: string, okText?: string) => Promise<void>>("openAlert");

const connecting = ref(false);

const aircraftDetails = ref<{
	callsign: string;
	airspeed: number | string;
	altitude: number | string;
	fuelRemaining: number | string;
	densityAltitude: number | string;
	hat: number | string;
}[]>([]);

function metersPerSecondToKnots(mps: number): number {
	return mps * 1.944012;
}
function metersToFeet(meters: number): number {
	return meters * 3.28084;
}

async function connect() {
	if (!openAlert) return;
	connecting.value = true;

	const CAVOK_DOMAIN = "vlsb-cav-01.acc.accroot.ds.af.smil.mil";
	const SQUADRON_CHANNEL = "50th ATKS";

	const username = `flightdirector-${Math.floor(Math.random() * 100000)}`;

	let sessionCheckRequest = await fetch(`https://${CAVOK_DOMAIN}/auth/session/check/${username}`);
	let sessionCheckResponse: { result: string } = await sessionCheckRequest.json();
	if (sessionCheckResponse.result !== "AVAILABLE") {
		await openAlert("Connection failure", `Tried to claim username "${username}" but it was unavailable`);
		connecting.value = false;
		return;
	}

	let sessionStartRequest = await fetch(`https://${CAVOK_DOMAIN}/auth/session/start/${username}`, { headers: { clientID: username } });
	let sessionStartResponse: { token?: string } = await sessionStartRequest.json();
	const token = sessionStartResponse.token;
	if (!token) {
		await openAlert("Connection failure", "No token returned when starting session");
		connecting.value = false;
		return;
	}

	let channelListRequest = await fetch(`https://${CAVOK_DOMAIN}/channellauncher`, { headers: { Authorization: `Bearer ${token}` } });
	let channelListResponse: { name: string; id: string; }[] = await channelListRequest.json();
	let squadronChannelID = channelListResponse.find(channel => channel.name === SQUADRON_CHANNEL)?.id;
	if (!squadronChannelID) {
		await openAlert("Connection failure", `Could not find squadron channel named "${SQUADRON_CHANNEL}" to join`);
		connecting.value = false;
		return;
	}

	let channelJoinRequest = await fetch(`https://${CAVOK_DOMAIN}/channellauncher/join/${squadronChannelID}`, {
		method: "POST",
		body: null,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (channelJoinRequest.status !== 200) {
		await openAlert("Connection failure", `Channel join request returned unexpected status code ${channelJoinRequest.status}`);
		connecting.value = false;
		return;
	}

	const socket = new WebSocket(`wss://${CAVOK_DOMAIN}/events?token=${encodeURIComponent(token)}`);
	let socketKeepAliveInterval: NodeJS.Timer | null = null;
	socket.addEventListener("open", () => {
		// Keep the server connection alive by sending a blank message every so often
		socketKeepAliveInterval = setInterval(() => {
			socket.send("");
		}, 10000);
	});
	socket.addEventListener("close", () => {
		if (socketKeepAliveInterval !== null) {
			clearInterval(socketKeepAliveInterval);
		}
	});
	socket.addEventListener("message", message => {
		interface CavokEvent {
			eventName: string;
			target?: {
				id: string;
				validTime: number;
				components: {
					SensorPointOfInterest: {
						sensorRelativeAzimuth: number;
						sensorRelativeDepression: number;
						sensorRelativeRollAngle: number;
						sensorElevationAngle: number;
						sensorPointingAzimuth: number;
						slantRange: number;
						sensorRollAngle: number;
						sensorNameString: number;
						targetLatitude: number;
						targetLongitude: number;
						targetElevation: number;
						targetWidth: number;
						upperRightLatitude: number;
						upperRightLongitude: number;
						lowerRightLatitude: number;
						lowerRightLongitude: number;
						upperLeftLatitude: number;
						upperLeftLongitude: number;
						lowerLeftLatitude: number;
						lowerLeftLongitude: number;
						hasValidCorners: boolean;
						inPositionMode: boolean;
					};
					SourcesComponent: {
						sources: string[];
					};
					PositionComponent: {
						position: {
							positionType: string;
							coordinates: [number, number];
							altitude: number;
						};
					};
					GCSComponent: {
						gcsId: string;
						name: string;
						callsign: string | null;
						color: {
							red: number;
							green: number;
							blue: number;
							alpha: number;
						};
						sourceFeed: string;
					};
					VelocityComponent: {
						speed: number;
						course: number;
						verticalSpeed: number | null;
					};
					CallsignComponent: {
						callsign: string;
					};
					ESDComponent: {
						indicatedAirspeed: number;
						temperature: number;
						classification: null;
						icing: "NO" | "YES";
						missionNumber: string;
						staticPressure: number;
						densityAltitude: number;
						sensorTrueAltitude: number;
						horizontalFieldOfView: number;
						verticalFieldOfView: number;
						platformTailNumberString: string;
						groundRange: string;
						laserPRF: string;
						sensorFieldOfViewName: number;
						magneticHeading: number;
						verticalHeightAboveTarget: number;
						fuelRemaining: number; // in pounds
						sensorPointingAzimuth: number;
						sensorElevationAngle: number;
						slantRange: number;
						trueAirspeed: number;
					};
					AttitudeComponent: {
						roll: number;
						pitch: number;
						yaw: number;
					};
					WeatherComponent: {
						windSpeed: number;
						windDirection: number;
					};
					ClassificationComponent: {
						category: string;
						identity: string;
						platform: number;
						specificType: number;
						flightId: null;
					};
				}
			}[];
		}

		let data: CavokEvent = JSON.parse(message.data);

		if (data.eventName === "BatchTrackEvent" && data.target) {
			let allAircraft = data.target.filter(target => target.components?.ESDComponent !== undefined);
			if (allAircraft.length === 0) return;

			let ourAircraft = allAircraft.filter(aircraft => {
				let sources = aircraft.components.SourcesComponent.sources;
				return sources.includes("KLV") || sources.includes("ESD"); // KLV for real flights, ESD for the MJAT
			});
			aircraftDetails.value = ourAircraft.map(aircraft => ({
				callsign: aircraft.components.CallsignComponent.callsign,
				airspeed: metersPerSecondToKnots(aircraft.components.ESDComponent.indicatedAirspeed).toFixed(1),
				altitude: Math.round(metersToFeet(aircraft.components.PositionComponent.position.altitude)),
				fuelRemaining: Math.round(aircraft.components.ESDComponent.fuelRemaining),
				densityAltitude: Math.round(metersToFeet(aircraft.components.ESDComponent.densityAltitude)),
				hat: Math.round(metersToFeet(aircraft.components.ESDComponent.verticalHeightAboveTarget)),
			}));
		}
	});
}

</script>
