export const hasPermission = (key) => {
  const storedUser = localStorage.getItem("authUser");
  if (!storedUser) return false;

  try {
    const parsed = JSON.parse(storedUser);
    const role = parsed?.payload?.data?.role?.toLowerCase()?.trim();

    // ✅ Allow everything for admin users
    if (role === "admin") return true;

    const permissionsString = parsed?.payload?.data?.permissions;

    // Check if permissions exist
    if (!permissionsString) return false;

    // Parse permissions (expected to be a JSON string)
    const permissions = JSON.parse(permissionsString);

    // Debug logs
    console.log("User Role →", role);
    console.log("Parsed Permissions Object →", permissions);

    return permissions[key] === true;
  } catch (err) {
    console.error("Permission Parsing Error:", err);
    return false;
  }
};
