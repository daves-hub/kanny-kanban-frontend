import { PAGE_TITLES, PAGE_DESCRIPTIONS } from "@/lib/metadata";

export default function DashboardHead() {
  return (
    <>
      <title>{PAGE_TITLES.dashboard}</title>
      <meta name="description" content={PAGE_DESCRIPTIONS.dashboard} />
    </>
  );
}
