import React from "react";
import type { Supplier, Listing } from "../types";
import suppliersJson from "../mocks/suppliers.json";
import listingsJson from "../mocks/listings.json";
import SupplierCard from "../widgets/SupplierCard";
import { SupplierProfileSheet } from "../widgets/SupplierProfileSheet";

const suppliers = suppliersJson as unknown as Supplier[];
const listingsAll = listingsJson as unknown as Listing[];

export default function Manufacturers() {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<Supplier | null>(null);

  const openProfile = (s: Supplier) => { setActive(s); setOpen(true); };
  const openListings = (s: Supplier) => { setActive(s); setOpen(true); };

  return (
    <div className="min-h-screen bg-page-dark">
      <div className="container-safe py-4">
        <div className="flex items-center justify-between mb-3">
          <h1>Производители</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map(s => (
            <SupplierCard
              key={s.id}
              supplier={s}
              listings={listingsAll}
              onOpenProfile={openProfile}
              onOpenListings={openListings}
            />
          ))}
        </div>
      </div>

      <SupplierProfileSheet
        open={open}
        onClose={()=>setOpen(false)}
        supplier={active}
        allListings={listingsAll}
        onOpenListings={(s)=>{}}
      />
    </div>
  );
}
