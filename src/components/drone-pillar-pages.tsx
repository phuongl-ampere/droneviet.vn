import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDronePillar,
  getDronePillarItem,
  type DronePillar,
} from "@/lib/drone-pillars";

export function DronePillarHub({ slug }: { slug: string }) {
  const pillar = getDronePillar(slug);

  if (!pillar) {
    notFound();
  }

  return (
    <main className="bg-[#F5F7F4] text-[#10232A]">
      <section className="bg-[#10232A] py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.78fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7DE0D7]">
              {pillar.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">
              {pillar.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {pillar.description}
            </p>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden border border-white/15">
            <Image
              alt={pillar.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 36vw, 100vw"
              src={pillar.image}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-x-8 md:grid-cols-2">
          {pillar.items.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="group flex gap-5 border-t border-black/15 py-6 transition hover:border-[#006D66]"
            >
              <ChevronRight
                aria-hidden="true"
                className="mt-1 shrink-0 text-[#006D66]"
                size={18}
              />
              <div>
                <h2 className="text-xl font-semibold group-hover:text-[#006D66]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export function DronePillarDetail({
  pillarSlug,
  topicSlug,
}: {
  pillarSlug: string;
  topicSlug: string;
}) {
  const pillar = getDronePillar(pillarSlug);
  const topic = getDronePillarItem(pillarSlug, topicSlug);

  if (!pillar || !topic) {
    notFound();
  }

  return <PillarDetail pillar={pillar} title={topic.title} description={topic.description} />;
}

function PillarDetail({
  pillar,
  title,
  description,
}: {
  pillar: DronePillar;
  title: string;
  description: string;
}) {
  return (
    <main className="bg-[#F5F7F4] text-[#10232A]">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            className="text-sm font-semibold text-[#006D66] hover:text-[#10232A]"
            href={pillar.href}
          >
            {pillar.title}
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-[#007F75]">
            {pillar.eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            {description}
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-4xl gap-8 px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-lg leading-9 text-slate-700">
          Drone Việt tổ chức nội dung theo nhu cầu triển khai thực tế. Đội ngũ
          sẽ xác định mục tiêu, năng lực người học, không gian vận hành và
          thiết bị cần thiết trước khi đề xuất lộ trình phù hợp.
        </p>
        <Link
          className="inline-flex min-h-11 w-fit items-center gap-2 bg-[#10232A] px-4 text-sm font-semibold text-white hover:bg-[#006D66]"
          href="/bao-gia"
        >
          Nhận tư vấn triển khai
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </section>
    </main>
  );
}
