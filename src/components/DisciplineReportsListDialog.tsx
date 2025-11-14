import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface DisciplineReport {
  id: string;
  event_description: string;
  who_performed: string;
  reporter_name: string;
  created_at: string;
}

const DisciplineReportsListDialog = () => {
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<DisciplineReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("discipline_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת הדיווחים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadReports();
    }
  }, [open]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">צפה בדיווחים</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-right">דיווחי משמעת</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">טוען...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">אין דיווחים</div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-right" dir="rtl">
                      <div className="text-xs text-muted-foreground">
                        {formatDate(report.created_at)}
                      </div>
                      <div>
                        <span className="font-semibold">שם המדווח: </span>
                        {report.reporter_name}
                      </div>
                      <div>
                        <span className="font-semibold">מבצע העבירה: </span>
                        {report.who_performed}
                      </div>
                      <div>
                        <span className="font-semibold">תיאור: </span>
                        {report.event_description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DisciplineReportsListDialog;
