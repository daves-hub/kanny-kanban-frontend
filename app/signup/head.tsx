import { PAGE_TITLES, PAGE_DESCRIPTIONS } from "@/lib/metadata";

export default function SignupHead() {
  return (
    <>
      <title>{PAGE_TITLES.signup}</title>
      <meta name="description" content={PAGE_DESCRIPTIONS.signup} />
    </>
  );
}
