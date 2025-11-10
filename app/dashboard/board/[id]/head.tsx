import { PAGE_TITLES, PAGE_DESCRIPTIONS } from "@/lib/metadata";

export default function BoardHead() {
  return (
    <>
      <title>{PAGE_TITLES.board()}</title>
      <meta name="description" content={PAGE_DESCRIPTIONS.board()} />
    </>
  );
}
