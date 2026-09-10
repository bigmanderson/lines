import { defineEntry } from "@inspatial/cloud";

export const nflWeek = defineEntry("nflWeek", {
  label: "NFL week",
  titleField: "label",
  statusField: "status",
  systemGlobal: true,
  defaultListFields: ["label", "status", "linesRevealAt"],
  description: "One NFL week of fixtures. Vegas lines stay on this row until reveal.",
  fields: [
    { key: "season", type: "IntField", required: true },
    { key: "week", type: "IntField", required: true },
    { key: "label", type: "DataField", required: true },
    {
      key: "status",
      type: "ChoicesField",
      required: true,
      defaultValue: "open",
      choices: [
        { key: "open", label: "Open", color: "warning" },
        { key: "revealed", label: "Lines out", color: "success" },
      ],
    },
    { key: "opensAt", type: "DataField", required: true },
    { key: "linesRevealAt", type: "DataField", required: true },
    { key: "linesFrozenAt", type: "DataField" },
    { key: "fixtures", type: "JSONField", required: true },
  ],
});
