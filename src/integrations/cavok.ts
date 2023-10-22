import type { AircraftData, CavokEvent } from "@/types/cavok";

export class CavokManager {
	private username: string;
	private token: string | null = null;
	private socket: WebSocket | null = null;
	private socketKeepAliveInterval: NodeJS.Timer | null = null;

	public connected: boolean = false;
	public aircraft: Map<string, AircraftData> = new Map();

	public selectedCallsign: string | null = null;

	private _emptyWeight: number | null = null;
	public get emptyWeight(): number {
		let savedEmptyWeight = parseInt(localStorage.getItem("aircraftEmptyWeight") ?? "");
		if (!isNaN(savedEmptyWeight) && this._emptyWeight === null) {
			this._emptyWeight = savedEmptyWeight;
		}
		return this._emptyWeight ?? 0;
	}
	public set emptyWeight(weight: number) {
		localStorage.setItem("aircraftEmptyWeight", weight.toString());
		this._emptyWeight = weight;
	}

	private _storesWeight: number | null = null;
	public get storesWeight(): number {
		let savedStoresWeight = parseInt(localStorage.getItem("aircraftStoresWeight") ?? "");
		if (!isNaN(savedStoresWeight) && this._storesWeight === null) {
			this._storesWeight = savedStoresWeight;
		}
		return this._storesWeight ?? 0;
	}
	public set storesWeight(weight: number) {
		localStorage.setItem("aircraftStoresWeight", weight.toString());
		this._storesWeight = weight;
	}

	private listeners: ((aircraft: Map<string, AircraftData>) => void)[] = [];

	constructor(private readonly CAVOK_DOMAIN: string, private readonly SQUADRON_CHANNEL: string) {
		this.username = `flightdirector-${Math.floor(Math.random() * 100000)}`;
	}

	public async disconnect() {
		this.connected = false;
		this.socket?.close();

		await fetch(`https://${this.CAVOK_DOMAIN}/auth/session/end`, {
			method: "POST",
			body: null,
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
		this.token = null;
	}

	public async connect() {
		let sessionCheckRequest = await fetch(`https://${this.CAVOK_DOMAIN}/auth/session/check/${this.username}`);
		let sessionCheckResponse: { result: string } = await sessionCheckRequest.json();
		if (sessionCheckResponse.result !== "AVAILABLE") {
			throw new Error(`Tried to claim username "${this.username}" but it was unavailable`);
		}

		let sessionStartRequest = await fetch(`https://${this.CAVOK_DOMAIN}/auth/session/start/${this.username}`, {
			headers: {
				clientID: this.username
			}
		});
		let sessionStartResponse: { token?: string } = await sessionStartRequest.json();
		this.token = sessionStartResponse.token ?? null;
		if (!this.token) {
			throw new Error("No token returned when starting session");
		}

		let channelListRequest = await fetch(`https://${this.CAVOK_DOMAIN}/channellauncher`, {
			headers: {
				Authorization: `Bearer ${this.token}`
			}
		});
		let channelListResponse: { name: string; id: string; }[] = await channelListRequest.json();
		let squadronChannelID = channelListResponse.find(channel => channel.name === this.SQUADRON_CHANNEL)?.id;
		if (!squadronChannelID) {
			throw new Error(`Could not find squadron channel named "${this.SQUADRON_CHANNEL}" to join`);
		}

		let channelJoinRequest = await fetch(`https://${this.CAVOK_DOMAIN}/channellauncher/join/${squadronChannelID}`, {
			method: "POST",
			body: null,
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});
		if (channelJoinRequest.status !== 200) {
			throw new Error(`Channel join request returned unexpected status code ${channelJoinRequest.status}`);
		}

		this.socket = new WebSocket(`wss://${this.CAVOK_DOMAIN}/events?token=${encodeURIComponent(this.token)}`);
		this.socket.addEventListener("open", () => {
			// Keep the server connection alive by sending a blank message every so often
			this.socketKeepAliveInterval = setInterval(() => {
				this.socket?.send("");
			}, 10000);
			this.connected = true;
		});
		this.socket.addEventListener("close", () => {
			if (this.socketKeepAliveInterval !== null) {
				clearInterval(this.socketKeepAliveInterval);
			}
			this.selectedCallsign = null;
			this.aircraft = new Map();

			if (this.connected) {
				// If we were previously connected, attempt reconnection
				// disconnect() sets this.connected = false to prevent reconnection
				// Note: reconnection errors will be ignored
				this.connect();
			}

			this.connected = false;
		});
		this.socket.addEventListener("message", this.processMessage.bind(this));
	}

	private processMessage(message: MessageEvent<string>) {
		let data: CavokEvent = JSON.parse(message.data);

		if (data.eventName === "BatchTrackEvent" && data.target) {
			let allAircraft = data.target.filter(target => target.components?.ESDComponent !== undefined);
			if (allAircraft.length === 0) return;

			allAircraft
				.filter(aircraft => {
					let sources = aircraft.components.SourcesComponent.sources;
					return sources.includes("KLV"); // KLV for real flights, ESD for the MJAT
				})
				.forEach(ourAircraft => {
					if (!ourAircraft.components.CallsignComponent?.callsign) return;
					this.aircraft.set(ourAircraft.components.CallsignComponent.callsign, ourAircraft.components);
				});
			// Notify listeners
			this.listeners.forEach(listener => listener(this.aircraft));
		}
	}

	public addChangeListener(listener: (aircraft: Map<string, AircraftData>) => void) {
		this.listeners.push(listener);
	}

	public async mockCavokConnection() {
		this.connected = true;

		setInterval(() => {
			function getAircraftData(callsign: string, color: { red: number; green: number; blue: number }): AircraftData {
				return {
					SensorPointOfInterest: {
						sensorRelativeAzimuth: 0,
						sensorRelativeDepression: 0,
						sensorRelativeRollAngle: 0,
						sensorElevationAngle: 0,
						sensorPointingAzimuth: 0,
						slantRange: 0,
						sensorRollAngle: 0,
						sensorNameString: 0,
						targetLatitude: 0,
						targetLongitude: 0,
						targetElevation: 0,
						targetWidth: 0,
						upperRightLatitude: 0,
						upperRightLongitude: 0,
						lowerRightLatitude: 0,
						lowerRightLongitude: 0,
						upperLeftLatitude: 0,
						upperLeftLongitude: 0,
						lowerLeftLatitude: 0,
						lowerLeftLongitude: 0,
						hasValidCorners: true,
						inPositionMode: false,
					},
					SourcesComponent: {
						sources: ["KLV"],
					},
					PositionComponent: {
						position: {
							positionType: "Geodetic3D",
							coordinates: [0, 0],
							altitude: 5484.239,
						},
					},
					GCSComponent: {
						gcsId: "abcd",
						name: "5050",
						callsign: null,
						color: {
							red: color.red,
							green: color.green,
							blue: color.blue,
							alpha: 0,
						},
						sourceFeed: "KLV",
					},
					VelocityComponent: {
						speed: 69,
						course: 4.196,
						verticalSpeed: null,
					},
					CallsignComponent: {
						callsign,
					},
					ESDComponent: {
						indicatedAirSpeed: 50,
						temperature: 0,
						classification: null,
						icing: "NO",
						missionNumber: "19",
						staticPressure: 0,
						densityAltitude: Math.random() * 6000,
						sensorTrueAltitude: 0,
						horizontalFieldOfView: 0,
						verticalFieldOfView: 0,
						platformTailNumberString: "AF0000",
						groundRange: 0,
						laserPRF: 1111,
						sensorFieldOfViewName: 1,
						magneticHeading: 4.194,
						verticalHeightAboveTarget: Math.random() * 6000,
						fuelRemaining: Math.random() * 3000, // in pounds
						sensorPointingAzimuth: 0,
						sensorElevationAngle: 0,
						slantRange: 0,
						trueAirspeed: 69,
					},
					AttitudeComponent: {
						roll: 0,
						pitch: 0,
						yaw: 0,
					},
					WeatherComponent: {
						windSpeed: 9.4117,
						windDirection: 4.835,
					},
					ClassificationComponent: {
						category: "AIR",
						identity: "FRIEND",
						platform: 20,
						specificType: 0,
						flightId: null,
					},
				};
			}

			let aircraft1 = getAircraftData("5050 / TEST", { red: 255, green: 40, blue: 20 });
			let aircraft2 = getAircraftData("5051 / TEST", { red: 20, green: 40, blue: 255 });
			let wrapper = {
				eventName: "BatchTrackEvent",
				target: [
					{ components: aircraft1 },
					{ components: aircraft2 },
				],
			};
			this.processMessage({ data: JSON.stringify(wrapper) } as MessageEvent<string>);
		}, 2000);
	}
}
