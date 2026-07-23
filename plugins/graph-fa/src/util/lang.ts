// Inlined verbatim from @quartz-community/utils/lang. The github: dependency
// ships without a prebuilt dist on fresh installs (CI), which broke the plugin
// build ("dist file missing"). classNames is trivial, so we vendor it here to
// keep graph-fa self-contained and CI-safe.
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}
