export namespace DB {
	export interface Airport {
		id: string;
		icaoId: string;
		faaId: string;
		name: string;
		beacon: boolean;
		elevation: number;
		magVar: number;
	}
	export interface RunwayDirection {
		name: string;
		heading: {
			mag: number;
			true: number;
		};
		elevation: number;
		tdze: number | null;
		slope: number | null;
		displacedThreshold: number | null;
		displacedThresholdElevation: number | null;
		distances: {
			lda: number | null;
			tora: number | null;
			toda: number | null;
			asda: number | null;
		};
		position: {
			lat: number;
			long: number;
		};
	}
	export interface Runway {
		airportId: string;
		surface: string;
		length: number;
		width: number;
		closed: boolean;

		high: RunwayDirection;
		low: RunwayDirection;
	}
	export interface AirportComm {
		airportId: string;
		name: string;
		type: string;
		sector: string;
		freqs: string[];
		operatingHours: string;
	}
	export interface AirportCommRemark {
		airportId: string;
		type: string;
		remark: string;
	}
}

export namespace DAFIF {
	export interface Airport {
		ARPT_IDENT: string;
		BEACON: "Y" | "N";
		ELEV: string; // Leading zero padded
		ICAO: string;
		FAA_HOST_ID: string;
		MAG_VAR: string; // e.g. W007588 0123
		NAME: string;
	}
	export interface Runway {
		ARPT_IDENT: string;
		SURFACE: string; // See legend
		LENGTH: string;
		RWY_WIDTH: string; // Zero padded
		CLD_RWY: "C" | ""; // Closed status

		HIGH_IDENT: string;
		HIGH_HDG: string; // Float
		HE_ELEV: string; // Float
		HE_SLOPE: string; // Float
		HE_TDZE: string; // Float
		HE_DT: string; // Displaced threshold, float
		HE_DT_ELEV: string; // Float
		HELAND_DIS: string;
		HE_TORA: string;
		HE_TODA: string;
		HE_ASDA: string;
		HE_WGS_DLAT: string;
		HE_WGS_DLONG: string;
		HE_TRUE_HDG: string;

		LOW_IDENT: string;
		LOW_HDG: string; // Float
		LE_ELEV: string; // Float
		LE_SLOPE: string; // Float
		LE_TDZE: string; // Float
		LE_DT: string; // Displaced threshold, float
		LE_DT_ELEV: string; // Float
		LELAND_DIS: string;
		LE_TORA: string;
		LE_TODA: string;
		LE_ASDA: string;
		LE_WGS_DLAT: string;
		LE_WGS_DLONG: string;
		LE_TRUE_HDG: string;
	}
	export interface AirportComm {
		ARPT_IDENT: string;
		COMM_NAME: string;
		COMM_TYPE: string;
		SEC: string;
		FREQ_1: string;
		FREQ_2: string;
		FREQ_3: string;
		FREQ_4: string;
		FREQ_5: string;
		S_OPR_H: string;
	}
	export interface AiportCommRemark {
		ARPT_IDENT: string;
		COMM_TYPE: string;
		REMARK: string;
	}
}
