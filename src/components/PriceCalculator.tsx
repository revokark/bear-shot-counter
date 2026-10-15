import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import DisciplineReportDialog from "@/components/DisciplineReportDialog";
import DisciplineReportsListDialog from "@/components/DisciplineReportsListDialog";
import BackgroundImageButton from "@/components/BackgroundImageButton";

const BG_STORAGE_KEY = "site_background_image";

const PriceCalculator = () => {
  const [beers, setBeers] = useState<number>(0);
  const [shots, setShots] = useState<number>(0);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(BG_STORAGE_KEY);
    if (saved) setBackgroundImage(saved);
  }, []);

  const BEER_PRICE = 12;
  const SHOT_PRICE = 10;

  const totalPrice = beers * BEER_PRICE + shots * SHOT_PRICE;

  const incrementBeers = () => setBeers(beers + 1);
  const decrementBeers = () => setBeers(Math.max(0, beers - 1));
  
  const incrementShots = () => setShots(shots + 1);
  const decrementShots = () => setShots(Math.max(0, shots - 1));
  

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
      <div className="flex flex-wrap justify-center items-center gap-3">
        <JokeDialog />
        <DisciplineReportDialog />
        <DisciplineReportsListDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 hover:border-primary transition-colors">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="beers" className="text-base font-semibold">
                  Beers 🍺
                </Label>
                <span className="text-xs text-muted-foreground">₪{BEER_PRICE}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={decrementBeers}
                  size="sm"
                  variant="outline"
                  className="h-12 w-12"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="text-4xl font-bold text-foreground min-w-[80px] text-center">
                  {beers}
                </div>
                <Button
                  onClick={incrementBeers}
                  size="sm"
                  variant="outline"
                  className="h-12 w-12"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Subtotal: ₪{beers * BEER_PRICE}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-colors">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="shots" className="text-base font-semibold">
                  Shots 🥃
                </Label>
                <span className="text-xs text-muted-foreground">₪{SHOT_PRICE}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={decrementShots}
                  size="sm"
                  variant="outline"
                  className="h-12 w-12"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="text-4xl font-bold text-foreground min-w-[80px] text-center">
                  {shots}
                </div>
                <Button
                  onClick={incrementShots}
                  size="sm"
                  variant="outline"
                  className="h-12 w-12"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Subtotal: ₪{shots * SHOT_PRICE}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-4 border-primary bg-gradient-to-br from-primary/5 to-accent/10">
        <CardContent className="pt-4 pb-4">
          <div className="text-center space-y-1">
            <p className="text-base font-medium text-muted-foreground uppercase tracking-wider">
              Total Price
            </p>
            <p className="text-5xl font-bold text-primary animate-in fade-in zoom-in duration-300">
              ₪{totalPrice}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceCalculator;
