import ClientGlobalProvider from "@/components/client-global-provider";
import GlobalStatusBanner from "@/components/global-status-banner";
import { StandardPage } from "@/components/standard-page";

export default function CEPLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientGlobalProvider>
      <GlobalStatusBanner />
      <StandardPage>{children}</StandardPage>
    </ClientGlobalProvider>
  );
}
