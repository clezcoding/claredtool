import { CheckMenuItem, Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";
import i18n from "../i18n";
import { checkForUpdates, getUpdateDialogState } from "./updater";
import { setThemePref } from "./desktop-store";
import { applyTheme, currentPref, type ThemePref } from "./theme";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function installThemeMenu(): Promise<void> {
  if (!isTauriRuntime()) return;

  try {
    const mk = (id: ThemePref, text: string) =>
      CheckMenuItem.new({
        id,
        text,
        checked: currentPref() === id,
        action: () => {
          applyTheme(id);
          void setThemePref(id);
          void syncChecks();
        },
      });

    const hell = await mk("light", "Hell");
    const dunkel = await mk("dark", "Dunkel");
    const system = await mk("system", "System");

    async function syncChecks() {
      await hell.setChecked(currentPref() === "light");
      await dunkel.setChecked(currentPref() === "dark");
      await system.setChecked(currentPref() === "system");
    }

    const darstellung = await Submenu.new({
      text: "Darstellung",
      items: [hell, dunkel, system],
    });

    const checkUpdates = await MenuItem.new({
      id: "check-updates",
      text: i18n.t("update.menuCheck"),
      action: () => {
        const updateState = getUpdateDialogState();
        if (updateState === "downloading" || updateState === "ready") return;
        void checkForUpdates(true);
      },
    });

    // macOS ignores top-level menu items — first Submenu lands in the app menu.
    const appSubmenu = await Submenu.new({
      text: "Clared",
      items: [darstellung, checkUpdates],
    });

    const menu = await Menu.new({ items: [appSubmenu] });
    await menu.setAsAppMenu();
  } catch (err) {
    console.warn("[theme-menu] Darstellung menu install failed:", err);
    // Non-Tauri / test / missing menu ACL — shell still runs without native menu.
  }
}
