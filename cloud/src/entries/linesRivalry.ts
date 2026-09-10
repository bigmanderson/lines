import { defineEntry } from "@inspatial/cloud";

export const linesRivalry = defineEntry("linesRivalry", {
  label: "LINES rivalry",
  titleField: "key",
  systemGlobal: true,
  defaultListFields: ["key", "winsA", "winsB"],
  description: "Season series between two players, keyed lowId:highId.",
  fields: [
    { key: "key", type: "DataField", required: true, unique: true },
    { key: "playerA", type: "DataField", required: true },
    { key: "playerB", type: "DataField", required: true },
    { key: "winsA", type: "IntField", defaultValue: 0 },
    { key: "winsB", type: "IntField", defaultValue: 0 },
    { key: "ties", type: "IntField", defaultValue: 0 },
    { key: "weeks", type: "IntField", defaultValue: 0 },
  ],
});
