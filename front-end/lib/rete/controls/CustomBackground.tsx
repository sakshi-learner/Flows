import { AreaPlugin } from "rete-area-plugin";

export function addCustomBackground(area: InstanceType<typeof AreaPlugin>) {
  const background = document.createElement("div");
  background.classList.add("background");
  background.classList.add("fill-area");
  area.area.content.add(background);
}