const LOCAL_ADMIN_EMAIL = "admin@user.com";
const LOCAL_ADMIN_PASSWORD = "password";

export async function ensureLocalAdmin({ orm }: { orm: any }) {
  try {
    const adminOrm = orm.withUser?.(orm.systemGobalUser) ?? orm;
    let user = await adminOrm.findEntry("user", [{
      field: "email",
      op: "=",
      value: LOCAL_ADMIN_EMAIL,
    }]);
    if (!user) {
      user = adminOrm.getNewEntry("user");
      user.update({
        firstName: "LINES",
        lastName: "Host",
        email: LOCAL_ADMIN_EMAIL,
      });
      user.$adminPortalAccess = true;
      user.$enabled = true;
      user.$systemAdmin = true;
      user.$verified = true;
      await user.save();
    }
    user.$verified = true;
    user.$enabled = true;
    user.$adminPortalAccess = true;
    await user.save();
    await user.runAction("setPassword", { password: LOCAL_ADMIN_PASSWORD });
  } catch (error) {
    console.warn("ensureLocalAdmin skipped:", error);
  }
}
