import { writeText } from "@tauri-apps/plugin-clipboard-manager";

export async function copyText(value: string): Promise<boolean> {
  try {
    await writeText(value);
    return true;
  } catch {
    return false;
  }
}
