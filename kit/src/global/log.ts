export const GlobalLog: LogProps = await createLog({
  name: "LINES",
  subject: "App",
}).catch(() => console as unknown as LogProps);

export const log = GlobalLog;
