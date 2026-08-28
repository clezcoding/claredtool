/** @param {string} primary @param {string} windowsArch */
export function buildUpdaterEndpoints(primary, windowsArch) {
  const fallback = primary.replace("arch={{arch}}", `arch=${windowsArch}`);
  return fallback === primary ? [primary] : [primary, fallback];
}
