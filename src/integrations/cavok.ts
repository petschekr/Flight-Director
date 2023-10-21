import type { AircraftData, CavokEvent } from "@/types/cavok";

export class CavokManager {
	private username: string;
	private token: string | null = null;
	private socket: WebSocket | null = null;
	private socketKeepAliveInterval: NodeJS.Timer | null = null;

	public connected: boolean = false;
	public aircraft: Map<string, AircraftData> = new Map();

	public selectedCallsign: string | null = null;
	public emptyWeight: number = 0;
	public storesWeight: number = 0;

	private listeners: ((aircraft: Map<string, AircraftData>) => void)[] = [];

	constructor(private readonly CAVOK_DOMAIN: string, private readonly SQUADRON_CHANNEL: string) {
		this.username = `flightdirector-${Math.floor(Math.random() * 100000)}`;
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
}
