export async function ensureSyncSchedule({ orm }: { orm: any }) {
  try {
    const adminOrm = orm.withUser?.(orm.systemGobalUser) ?? orm;
    const existing = await adminOrm.findEntry("scheduledTask", [{
      field: "apiAction",
      op: "=",
      value: "lines:syncWeek",
    }]);
    if (existing) {
      if (existing.$status === "failed") {
        existing.$status = "idle";
        existing.$enabled = true;
        await existing.save();
      }
      return;
    }
    const task = adminOrm.getNewEntry("scheduledTask");
    task.update({
      scheduleType: "recurring",
      enabled: true,
      frequency: "day",
      apiGroup: "lines",
      apiAction: "lines:syncWeek",
      taskData: {},
    });
    await task.save();
  } catch (error) {
    console.warn("ensureSyncSchedule skipped:", error);
  }
}
