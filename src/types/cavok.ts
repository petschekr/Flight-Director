export interface AircraftData {
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
		indicatedAirSpeed: number;
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

export interface CavokEvent {
	eventName: string;
	target?: {
		id: string;
		validTime: number;
		components: AircraftData;
	}[];
}
