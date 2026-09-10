import { Image } from "../ui.ts";

const size = $(() => props.size ?? 56);
const team = $(() => read(props.team));

<View
  style={$(() => ({
    web: {
      width: `${size.get()}px`,
      height: `${size.get()}px`,
      borderRadius: "18px",
      background: "#ffffff",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 0 0 2px ${team.get()?.color ?? "#f5c518"}`,
    },
  }))}
>
  <Image
    src={$(() => team.get()?.logo ?? "")}
    alt={$(() => team.get()?.name ?? "")}
    width={56}
    height={56}
    style={{
      web: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      },
    }}
  />
</View>
