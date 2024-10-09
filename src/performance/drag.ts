// Prop drag for 4-blade MQ-9
export const propDragFeathered = 30;
export const propDragUnfeathered = 340;

export interface DragItem {
	name: string;
	multiple: boolean;
	drag: number;
}

export const dragItems: DragItem[] = [
	{
		"name": "Landing gear extended",
		"multiple": false,
		"drag": 239,
	},
	{
		"name": "External fuel tank",
		"multiple": true,
		"drag": 17,
	},
	{
		"name": "Empty pylon and BRU-15/71",
		"multiple": true,
		"drag": 7,
	},
	{
		"name": "Empty M299 rack",
		"multiple": true,
		"drag": 4,
	},
	{
		"name": "Empty M310 rack with saddle kit",
		"multiple": true,
		"drag": 16,
	},
	{
		"name": "Empty M310 rack without saddle kit",
		"multiple": true,
		"drag": 13,
	},
	{
		"name": "GBU-12/38/49/51/54",
		"multiple": true,
		"drag": 2,
	},
	{
		"name": "GBU-48",
		"multiple": true,
		"drag": 10,
	},
	{
		"name": "Hellfire missile",
		"multiple": true,
		"drag": 5,
	},
	{
		"name": "DDBA cooling air scoop",
		"multiple": false,
		"drag": 3,
	},
	{
		"name": "Blasphemy pod",
		"multiple": false,
		"drag": 21,
	},
];
