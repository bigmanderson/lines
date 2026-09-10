import { defineEntry } from "@inspatial/cloud";

export const linesMatch = defineEntry("linesMatch", {
  label: "LINES match",
  titleField: "code",
  statusField: "status",
  systemGlobal: true,
  defaultListFields: ["code", "status", "weekLabel"],
  description: "A head-to-head week. Invite code is the join key.",
  fields: [
    { key: "code", type: "DataField", required: true, unique: true },
    {
      key: "status",
      type: "ChoicesField",
      required: true,
      defaultValue: "open",
      choices: [
        { key: "open", label: "Open", color: "warning" },
        { key: "waiting", label: "Waiting on the book", color: "info" },
        { key: "revealed", label: "Revealed", color: "success" },
      ],
    },
    { key: "hostId", type: "DataField", required: true },
    { key: "season", type: "IntField", required: true },
    { key: "week", type: "IntField", required: true },
    { key: "weekLabel", type: "DataField", required: true },
    { key: "snapshot", type: "JSONField", required: true },
  ],
});
