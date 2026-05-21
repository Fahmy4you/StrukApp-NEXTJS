import PageLayoutSettings from "@/components/pages/PageLayoutSettings";
import { ReceiptElement } from "@/components/pages/PageStrukManualClient";
import { getLayoutById } from "@/models/Layout";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }> | { id: string }; 
}

const page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  console.log("ID Layout:", id);
  const layout = await getLayoutById(id);
  if (!layout) {
    notFound();
  }

  return (
    <PageLayoutSettings name={layout.name} config={layout.config as unknown as ReceiptElement[]} idLayout={layout.id} />
  );
};

export default page;