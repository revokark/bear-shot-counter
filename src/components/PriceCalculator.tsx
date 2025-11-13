import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PriceCalculator = () => {
  const [bears, setBears] = useState<number>(0);
  const [shots, setShots] = useState<number>(0);

  const BEAR_PRICE = 19;
  const SHOT_PRICE = 9;

  const totalPrice = bears * BEAR_PRICE + shots * SHOT_PRICE;

  const handleBearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBears(Math.max(0, value));
  };

  const handleShotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setShots(Math.max(0, value));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Price Calculator</h1>
        <p className="text-muted-foreground">Calculate your total order price</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 hover:border-primary transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="bears" className="text-lg font-semibold">
                  Bears 🐻
                </Label>
                <span className="text-sm text-muted-foreground">${BEAR_PRICE} each</span>
              </div>
              <Input
                id="bears"
                type="number"
                min="0"
                value={bears || ""}
                onChange={handleBearChange}
                placeholder="0"
                className="text-3xl h-16 text-center font-bold"
              />
              <div className="text-center text-sm text-muted-foreground">
                Subtotal: ${bears * BEAR_PRICE}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="shots" className="text-lg font-semibold">
                  Shots 🥃
                </Label>
                <span className="text-sm text-muted-foreground">${SHOT_PRICE} each</span>
              </div>
              <Input
                id="shots"
                type="number"
                min="0"
                value={shots || ""}
                onChange={handleShotChange}
                placeholder="0"
                className="text-3xl h-16 text-center font-bold"
              />
              <div className="text-center text-sm text-muted-foreground">
                Subtotal: ${shots * SHOT_PRICE}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-4 border-primary bg-gradient-to-br from-primary/5 to-accent/10">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-muted-foreground uppercase tracking-wider">
              Total Price
            </p>
            <p className="text-7xl font-bold text-primary animate-in fade-in zoom-in duration-300">
              ${totalPrice}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceCalculator;
