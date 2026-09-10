createRenderer({
  root: () => import("./root.tsx").then((m) => m.GlobalRoot),
  mount: "#app",
  mode: "auto",
  debug: false,
  globalGuard: false,
  extensions: [
    InTheme({ format: GlobalTheme }),
    InRoute(),
    InMotion(),
  ],
});
