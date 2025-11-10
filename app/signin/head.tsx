import { PAGE_TITLES, PAGE_DESCRIPTIONS } from "@/lib/metadata";

export default function SigninHead() {
  return (
    <>
      <title>{PAGE_TITLES.signin}</title>
      <meta name="description" content={PAGE_DESCRIPTIONS.signin} />
    </>
  );
}
