import { PAGE_TITLES, PAGE_DESCRIPTIONS } from "@/lib/metadata";

export default function ProjectDetailHead() {
  return (
    <>
      <title>{PAGE_TITLES.projects}</title>
      <meta name="description" content={PAGE_DESCRIPTIONS.projects} />
    </>
  );
}
