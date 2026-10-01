"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/Spinner";

interface OrderSummaryProps {
  total: number;
  placing: boolean;
  onPlaceOrder: () => void;
}

export function OrderSummary({ total, placing, onPlaceOrder }: OrderSummaryProps) {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium">Total</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ${Number(total).toFixed(2)}
          </span>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
          onClick={onPlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <span className="flex items-center gap-2">
              <Spinner className="w-4 h-4" />
              Placing order...
            </span>
          ) : (
            "Place Order"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
