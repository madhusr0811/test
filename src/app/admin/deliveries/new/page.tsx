import { StubPage } from "@/components/StubPage";

export default function NewDelivery() {
  return (
    <StubPage
      title="New delivery"
      stage="Stages 2–3"
      planned={[
        "Client name, event, title, message, delivery and expiry dates (7 / 15 / 30 days or custom)",
        "Optional password, preview and download toggles, cover image",
        "Resumable chunked upload of MP4, MOV, MKV, AVI, JPG, PNG, PDF and ZIP files to the SSD",
        "Secure private link generation",
      ]}
    />
  );
}
