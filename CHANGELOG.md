# Changelog

## 0.1.1

Every node now has an Inspector description. No pin, field or template changed.

## 0.1.0

First release: 7 pure nodes (category Color), all `colorutils/<Kind>@1`. A colour is a number 0xRRGGBB, the form Core's Set Tint takes.

- Build and read: Make Color, Get Channel, Hex To Color, Color To Hex.
- Change: Lerp Color, Brightness, Gray.

Channels are clamped to 0-255 and a colour outside 0-16777215 (or not a number) is clamped into range. Hex To Color accepts `#RRGGBB`, `RRGGBB` and `#RGB`; anything else is 0.
