import { NewDeliveryForm } from "@/components/NewDeliveryForm";
import { StorageAlert } from "@/components/StorageAlert";

export default function NewDelivery() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">New delivery</h1>
      <StorageAlert />
      <NewDeliveryForm />
    </div>
  );
}
