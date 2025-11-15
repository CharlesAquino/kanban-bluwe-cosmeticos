import { StandardPage } from "@/components/standard-page";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StandardPage>{children}</StandardPage>
  );
}
