const input = `
KIAS 74 72 83 77 83 83
KTAS 133 129 149 138 149 149
FUEL FLOW 134 123 165 148 181 181
`;

let lines = input.trim().split("\n").map(line => line.trim().replace("FUEL FLOW", "FuelFlow"));
let kias = lines[0].split(" ");
let ktas = lines[1].split(" ");
let ff = lines[2].split(" ");
kias.shift();
ktas.shift();
ff.shift();

const weights = [5000, 6000, 7000, 8000, 9000, 10_000, 10_500, 11_700];
const output = {};

for (let [index, weight] of weights.entries()) {
    output[weight.toString()] = {
        max: {
            kias: parseInt(kias[index * 2 + 0]),
            ktas: parseInt(ktas[index * 2 + 0]),
            ff: parseInt(ff[index * 2 + 0]),
        },
        min: {
            kias: parseInt(kias[index * 2 + 1]),
            ktas: parseInt(ktas[index * 2 + 1]),
            ff: parseInt(ff[index * 2 + 1]),
        }
    };
}
console.log(output);