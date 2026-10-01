import QuotePage, { type QuotePageProps } from "@/app/bao-gia/page";

export default function EnglishQuotePage({
  searchParams,
}: Pick<QuotePageProps, "searchParams">) {
  return QuotePage({ locale: "en", searchParams });
}
