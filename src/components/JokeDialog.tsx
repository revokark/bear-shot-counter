import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";

const JokeDialog = () => {
  const [open, setOpen] = useState(false);
  const [joke, setJoke] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateJoke = async () => {
    setIsLoading(true);
    setJoke("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-joke", {
        body: {},
      });
      if (error) throw error;
      if (!data?.joke) throw new Error("no joke returned");
      setJoke(data.joke);
    } catch (error) {
      console.error("Error generating joke:", error);
      const message =
        (error as { context?: { error?: string; message?: string } })?.context?.error ??
        (error as { context?: { error?: string; message?: string } })?.context?.message ??
        (error instanceof Error && error.message ? error.message : null);
      toast({
        title: "שגיאה",
        description: message || "הבדיחה לא הגיעה, נסו שוב",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      generateJoke();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">בדיחה לסוף השבוע 🎤</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">בדיחה לסוף השבוע בבר האמנים</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">מחלץ בדיחה...</p>
            </div>
          ) : (
            <p
              dir="rtl"
              className="text-lg leading-relaxed text-foreground text-center whitespace-pre-line py-4"
            >
              {joke}
            </p>
          )}
          <div className="flex justify-center">
            <Button onClick={generateJoke} disabled={isLoading} variant="outline">
              <RefreshCw className="h-4 w-4" />
              עוד אחת
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JokeDialog;
