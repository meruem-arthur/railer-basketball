import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import NetworkBar from "@/components/layout/network-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <NetworkBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
