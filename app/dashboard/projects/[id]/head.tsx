import { PAGE_TITLES, PAGE_DESCRIPTIONS } from "@/lib/metadata";

type ProjectHeadProps = {
  params: { id: string };
};

export default function ProjectDetailHead(_props: ProjectHeadProps) {
  return (
    <>
      <title>{PAGE_TITLES.projects}</title>
      <meta name="description" content={PAGE_DESCRIPTIONS.projects} />
    </>
  );
}
