# ColorUtils

An Inkwell node pack with 7 colour nodes (Make Color, Get Channel, Lerp Color, Brightness, Gray, Hex To Color, Color To Hex), all pure, in the category Color. Pack id `colorutils`; nodes are `colorutils/<Kind>@1`. See `CHANGELOG.md` for the list.

```
manifest.json        pack id, version, compatible tool range
nodes/<Kind>.json    one node definition per file
templates/<Kind>.as2 the AS2 each node generates (one expression)
test/                node --test: templates agree with their pins, and every node has known-answer cases
```

Commands (Inkwell-Core-Pack and Inkwell-Spec checked out next to this folder; run `yarn build` in Inkwell-Spec once): `yarn install`, `yarn validate`, `yarn test`.

Add it in the editor with Assets > Node packs > Add Pack and `Inkwell-UI/Inkwell-ColorUtils-Pack`. Release: bump `version` in `manifest.json`, add a `CHANGELOG.md` entry, push the tag `v<version>`.

Behaviour worth knowing:

- A colour is a Number 0xRRGGBB (the form Set Tint takes). There is no alpha; use Set Alpha.
- Make Color rounds and clamps each channel to 0-255. A colour that is not a number, or outside 0-16777215, is clamped into range.
- Lerp Color blends each channel and clamps `t` to 0..1. Brightness takes -1 (black) to 1 (white); 0 changes nothing. Gray uses the Rec. 601 weights.
- Hex To Color takes `#RRGGBB`, `RRGGBB` or `#RGB`; invalid text gives 0 (black). Color To Hex gives `#RRGGBB`, upper-case unless the `uppercase` field is off.
