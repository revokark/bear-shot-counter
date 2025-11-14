import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DisciplineReportDialog = () => {
  const [open, setOpen] = useState(false);
  const [eventDescription, setEventDescription] = useState("");
  const [whoPerformed, setWhoPerformed] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!eventDescription.trim() || !whoPerformed.trim() || !reporterName.trim()) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("discipline_reports").insert({
        event_description: eventDescription,
        who_performed: whoPerformed,
        reporter_name: reporterName,
      });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "הדיווח נשלח בהצלחה",
      });

      // Reset form and close dialog
      setEventDescription("");
      setWhoPerformed("");
      setReporterName("");
      setOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת הדיווח",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">דווח אירוע משמעת</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">דיווח אירוע משמעת</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reporter-name" className="text-right block">
              שם המדווח *
            </Label>
            <Input
              id="reporter-name"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="text-right"
              dir="rtl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="who-performed" className="text-right block">
              שם מבצע העבירה *
            </Label>
            <Input
              id="who-performed"
              value={whoPerformed}
              onChange={(e) => setWhoPerformed(e.target.value)}
              className="text-right"
              dir="rtl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description" className="text-right block">
              תיאור העברה *
            </Label>
            <Textarea
              id="event-description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="resize-none text-right"
              dir="rtl"
              required
            />
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "שולח..." : "דווח"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisciplineReportDialog;
