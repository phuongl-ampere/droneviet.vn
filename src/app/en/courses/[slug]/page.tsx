import CourseDetailPage, {
  type CourseDetailPageProps,
} from "@/app/khoa-hoc/[slug]/page";

export default function EnglishCourseDetailPage({
  params,
}: Pick<CourseDetailPageProps, "params">) {
  return <CourseDetailPage locale="en" params={params} />;
}
