import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function TenantPicker({
  tenants,
  selectedTenantId
}: {
  tenants: Array<{ id: string; siteName: string }>;
  selectedTenantId?: string;
}) {
  return (
    <form className="flex items-center gap-2">
      <Select defaultValue={selectedTenantId} name="tenantId">
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.siteName}
          </option>
        ))}
      </Select>
      <Button size="sm" type="submit" variant="outline">
        Chon
      </Button>
    </form>
  );
}
