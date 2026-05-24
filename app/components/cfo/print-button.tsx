"use client";

import { Printer } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md transition-all flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      Imprimir PDF / Balance
    </Button>
  );
}
