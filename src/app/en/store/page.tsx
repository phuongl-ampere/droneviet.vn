import StorePage, { type StorePageProps } from "@/app/cua-hang/page";

export default function EnglishStorePage({
  searchParams,
}: Pick<StorePageProps, "searchParams">) {
  return StorePage({ locale: "en", searchParams });
}
