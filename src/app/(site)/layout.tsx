import { Container } from "@/components/site/general/layouts/container";
import { Navbar } from "@/components/site/general/navbars/navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <Navbar />
      {children}
    </Container>
  );
}