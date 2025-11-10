import { PAGE_TITLES, PAGE_DESCRIPTIONS } from "@/lib/metadata";

export default function SettingsHead() {
  return (
    <>
      <title>{PAGE_TITLES.settings}</title>
      <meta name="description" content={PAGE_DESCRIPTIONS.settings} />
    </>
  );
}
