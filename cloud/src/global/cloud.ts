import * as Cloud from "@inspatial/cloud";
import { linesExtension } from "../linesExtension.ts";

const start =
  (Cloud as { defineCloud?: typeof Cloud.createInCloud }).defineCloud ??
  Cloud.createInCloud;

start("lines", [linesExtension]);
