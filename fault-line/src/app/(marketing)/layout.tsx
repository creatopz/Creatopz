import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
