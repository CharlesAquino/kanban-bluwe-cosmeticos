import { StandardPage } from "@/components/standard-page";

export default function BPMLayout({ children }: { children: React.ReactNode }) {
  return (
    <StandardPage>{children}</StandardPage>
  );
}
