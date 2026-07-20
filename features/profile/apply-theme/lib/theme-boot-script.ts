/**
 * @file features/profile/apply-theme/lib/theme-boot-script.ts
 * Inline blocking script that paints theme from localStorage before React.
 *
 * Kept as a plain string so it can run in `<head>` synchronously.
 * Sets `html` class + CSS vars only (body may not exist yet). Body background
 * image is applied by `ProfileThemeApplier` after mount.
 */

import { THEME_PREFERENCES_STORAGE_KEY } from "@/features/profile/apply-theme/lib/theme-storage";

/**
 * Self-contained boot script. Key is interpolated from the shared constant.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{
var KEY=${JSON.stringify(THEME_PREFERENCES_STORAGE_KEY)};
var raw=localStorage.getItem(KEY);
if(!raw)return;
var p=JSON.parse(raw);
if(!p||(p.themeMode!=="light"&&p.themeMode!=="dark"&&p.themeMode!=="custom"))return;
var base=p.themeMode==="custom"?(p.textContrastMode==="light"?"light":"dark"):p.themeMode;
var root=document.documentElement;
root.classList.remove("light","dark");
root.classList.add(base);
var hasAccent=!!p.accentColor;
var isCustom=p.themeMode==="custom";
root.classList.toggle("theme-custom",isCustom||hasAccent);
var vars=["--custom-bg","--custom-drawer-bg","--custom-accent","--custom-accent-fg","--custom-fg"];
for(var i=0;i<vars.length;i++)root.style.removeProperty(vars[i]);
if(hasAccent){
root.style.setProperty("--custom-accent",p.accentColor);
if(p.accentForeground)root.style.setProperty("--custom-accent-fg",p.accentForeground);
}
if(!isCustom)return;
if(p.backgroundColor)root.style.setProperty("--custom-bg",p.backgroundColor);
if(p.drawerBackgroundColor){
var drawer=p.drawerBackgroundColor;
var op=p.drawerBackgroundOpacity;
if(typeof op==="number"&&op<1){
var pct=Math.round(Math.min(1,Math.max(0,op))*100);
drawer="color-mix(in srgb, "+p.drawerBackgroundColor+" "+pct+"%, transparent)";
}
root.style.setProperty("--custom-drawer-bg",drawer);
}
}catch(e){}})();`;
