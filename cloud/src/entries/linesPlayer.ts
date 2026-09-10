import { defineEntry } from "@inspatial/cloud";

export const linesPlayer = defineEntry("linesPlayer", {
  label: "LINES player",
  titleField: "handle",
  systemGlobal: true,
  defaultListFields: ["handle", "wins", "losses"],
  description: "A LINES handle. PIN claims the same seat on another device.",
  fields: [
    { key: "handle", type: "DataField", required: true, unique: true },
    { key: "playerId", type: "DataField", required: true, unique: true },
    { key: "pin", type: "DataField", required: true },
    { key: "wins", type: "IntField", defaultValue: 0 },
    { key: "losses", type: "IntField", defaultValue: 0 },
    { key: "ties", type: "IntField", defaultValue: 0 },
    { key: "notifyAt", type: "DataField" },
  ],
});
