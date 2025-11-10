import { PAGE_TITLES, PAGE_DESCRIPTIONS } from "@/lib/metadata";

type BoardHeadProps = {
  params: { id: string };
};

export default function BoardHead(_props: BoardHeadProps) {
  return (
    <>
      <title>{PAGE_TITLES.board()}</title>
      <meta name="description" content={PAGE_DESCRIPTIONS.board()} />
    </>
  );
}
