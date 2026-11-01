// Checks every template against its node definition, then evaluates each rendered expression in JS (the expressions are
// valid in both JS and AS2) against known answers. Uses the Core Pack's test renderer: inputs become IN_<pin>.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPack, checkTemplate, render, fixtureFields } from "@inkwell-ui/core-pack/scripts/lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { manifest, nodes } = loadPack(root);
const byKind = Object.fromEntries(nodes.map((n) => [n.def.kind, n]));

test("every template agrees with its pins and fields", () => {
  for (const n of nodes) assert.deepEqual(checkTemplate(n.def, n.text, manifest.id), [], n.id);
});

test("every node is pure, category Color, one 'value' output", () => {
  assert.equal(nodes.length, 7);
  for (const n of nodes) {
    assert.equal(n.def.pure, true, n.id);
    assert.equal(n.def.category, "Color", n.id);
    assert.deepEqual(n.def.outputs.map((o) => o.name), ["value"], n.id);
  }
});

const run = (kind, inputs, fields = {}) => {
  const { def, text } = byKind[kind];
  const expr = render(def, text, { ...fixtureFields(def), ...fields }).split("\n")[1];
  const names = def.inputs.map((p) => p.name);
  return new Function(...names.map((n) => "IN_" + n), `return ${expr};`)(...names.map((n) => inputs[n] ?? def.inputs.find((p) => p.name === n).default));
};

const AMBER = 0xffaa00;
const cases = [
  ["MakeColor", { r: 255, g: 170, b: 0 }, {}, AMBER],
  ["MakeColor", { r: 300, g: -5, b: NaN }, {}, 0xff0000],
  ["MakeColor", { r: 1.6, g: 0, b: 0 }, {}, 0x020000],
  ["GetChannel", { color: AMBER }, { channel: "r" }, 255],
  ["GetChannel", { color: AMBER }, { channel: "g" }, 170],
  ["GetChannel", { color: AMBER }, { channel: "b" }, 0],
  ["GetChannel", { color: -5 }, { channel: "r" }, 0],
  ["GetChannel", { color: 1e9 }, { channel: "b" }, 255],
  ["LerpColor", { a: 0, b: 0xffffff, t: 0.5 }, {}, 0x808080],
  ["LerpColor", { a: 0x102030, b: 0xffffff, t: 0 }, {}, 0x102030],
  ["LerpColor", { a: 0, b: 0xffffff, t: 2 }, {}, 0xffffff],
  ["LerpColor", { a: 0x102030, b: 0xffffff, t: -1 }, {}, 0x102030],
  ["Brightness", { color: 0x808080, amount: 1 }, {}, 0xffffff],
  ["Brightness", { color: 0x808080, amount: -1 }, {}, 0],
  ["Brightness", { color: 0x808080, amount: 0.5 }, {}, 0xc0c0c0],
  ["Brightness", { color: 0x808080, amount: 0 }, {}, 0x808080],
  ["Brightness", { color: 0x808080, amount: 9 }, {}, 0xffffff],
  ["Gray", { color: 0xff0000 }, {}, 76 * 0x010101],
  ["Gray", { color: 0xffffff }, {}, 0xffffff],
  ["Gray", { color: 0 }, {}, 0],
  ["HexToColor", { hex: "#FFAA00" }, {}, AMBER],
  ["HexToColor", { hex: "ffaa00" }, {}, AMBER],
  ["HexToColor", { hex: "#fa0" }, {}, AMBER],
  ["HexToColor", { hex: "#12" }, {}, 0],
  ["HexToColor", { hex: "#GGGGGG" }, {}, 0],
  ["HexToColor", { hex: "" }, {}, 0],
  ["ColorToHex", { color: AMBER }, {}, "#FFAA00"],
  ["ColorToHex", { color: AMBER }, { uppercase: false }, "#ffaa00"],
  ["ColorToHex", { color: 255 }, {}, "#0000FF"],
  ["ColorToHex", { color: -1 }, {}, "#000000"],
  ["ColorToHex", { color: 1e12 }, {}, "#FFFFFF"],
];

for (const [kind, inputs, fields, want] of cases) {
  test(`${kind} ${JSON.stringify(inputs)} ${JSON.stringify(fields)}`, () => assert.deepEqual(run(kind, inputs, fields), want));
}

test("Hex To Color and Color To Hex round-trip", () => {
  for (const c of [0, 1, AMBER, 0x123456, 0xffffff]) assert.equal(run("HexToColor", { hex: run("ColorToHex", { color: c }) }), c);
});
