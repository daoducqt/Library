import BookDetailsPage from "@/component/details";

interface DetailPageProps {
  params: {
    slug: string;
  };
}

export default function DetailPage({ params }: DetailPageProps) {
  const { slug } = params;

  return (
    <div>
      <BookDetailsPage slug={slug} />
    </div>
  );
}
