import ClientGlobalProvider from "@/components/client-global-provider";
import { StandardPage } from "@/components/standard-page";
import GlobalStatusBanner from "@/components/global-status-banner";

export default function HourlyControlLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientGlobalProvider>
      <GlobalStatusBanner />
      <StandardPage>{children}</StandardPage>
    </ClientGlobalProvider>
  );
}
