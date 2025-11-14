import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DisciplineReport {
  id: string;
  event_description: string;
  who_performed: string;
  reporter_name: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

interface Comment {
  id: string;
  comment_text: string;
  commenter_name: string;
  created_at: string;
}

const DisciplineReportsListDialog = () => {
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<DisciplineReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [commenterName, setCommenterName] = useState<{ [key: string]: string }>({});
  const [expandedReports, setExpandedReports] = useState<{ [key: string]: boolean }>({});

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data: reportsData, error } = await supabase
        .from("discipline_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load likes and comments counts for each report
      const reportsWithCounts = await Promise.all(
        (reportsData || []).map(async (report) => {
          const [{ count: likesCount }, { count: commentsCount }] = await Promise.all([
            supabase.from("discipline_report_likes").select("*", { count: "exact", head: true }).eq("report_id", report.id),
            supabase.from("discipline_report_comments").select("*", { count: "exact", head: true }).eq("report_id", report.id),
          ]);

          const userLikes = JSON.parse(localStorage.getItem("discipline_likes") || "{}");
          
          return {
            ...report,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            user_has_liked: userLikes[report.id] || false,
          };
        })
      );

      setReports(reportsWithCounts);
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

  const loadComments = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from("discipline_report_comments")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments((prev) => ({ ...prev, [reportId]: data || [] }));
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת התגובות",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (reportId: string) => {
    try {
      const userLikes = JSON.parse(localStorage.getItem("discipline_likes") || "{}");
      
      if (userLikes[reportId]) {
        toast({
          title: "כבר אהבת",
          description: "כבר נתת לייק לדיווח זה",
        });
        return;
      }

      const { error } = await supabase
        .from("discipline_report_likes")
        .insert({ report_id: reportId });

      if (error) throw error;

      userLikes[reportId] = true;
      localStorage.setItem("discipline_likes", JSON.stringify(userLikes));

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, likes_count: (report.likes_count || 0) + 1, user_has_liked: true }
            : report
        )
      );

      toast({
        title: "הצלחה",
        description: "לייק נוסף בהצלחה",
      });
    } catch (error) {
      console.error("Error adding like:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת הלייק",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (reportId: string) => {
    const commentText = newComment[reportId]?.trim();
    const name = commenterName[reportId]?.trim();

    if (!commentText || !name) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("discipline_report_comments")
        .insert({
          report_id: reportId,
          comment_text: commentText,
          commenter_name: name,
        });

      if (error) throw error;

      setNewComment((prev) => ({ ...prev, [reportId]: "" }));
      setCommenterName((prev) => ({ ...prev, [reportId]: "" }));
      
      await loadComments(reportId);
      
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, comments_count: (report.comments_count || 0) + 1 }
            : report
        )
      );

      toast({
        title: "הצלחה",
        description: "התגובה נוספה בהצלחה",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת התגובה",
        variant: "destructive",
      });
    }
  };

  const toggleComments = (reportId: string) => {
    const isExpanding = !expandedReports[reportId];
    setExpandedReports((prev) => ({ ...prev, [reportId]: isExpanding }));
    
    if (isExpanding && !comments[reportId]) {
      loadComments(reportId);
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
                    <div className="space-y-3 text-right" dir="rtl">
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

                      {/* Like and Comment buttons */}
                      <div className="flex gap-3 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(report.id)}
                          disabled={report.user_has_liked}
                          className="gap-2"
                        >
                          <Heart
                            className={`h-4 w-4 ${report.user_has_liked ? "fill-red-500 text-red-500" : ""}`}
                          />
                          <span>{report.likes_count || 0}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComments(report.id)}
                          className="gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{report.comments_count || 0}</span>
                        </Button>
                      </div>

                      {/* Comments section */}
                      <Collapsible open={expandedReports[report.id]}>
                        <CollapsibleContent>
                          <div className="space-y-3 pt-3 border-t">
                            {/* Add comment form */}
                            <div className="space-y-2">
                              <Input
                                placeholder="שם המגיב"
                                value={commenterName[report.id] || ""}
                                onChange={(e) =>
                                  setCommenterName((prev) => ({
                                    ...prev,
                                    [report.id]: e.target.value,
                                  }))
                                }
                                dir="rtl"
                              />
                              <Textarea
                                placeholder="הוסף תגובה..."
                                value={newComment[report.id] || ""}
                                onChange={(e) =>
                                  setNewComment((prev) => ({
                                    ...prev,
                                    [report.id]: e.target.value,
                                  }))
                                }
                                dir="rtl"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddComment(report.id)}
                              >
                                שלח תגובה
                              </Button>
                            </div>

                            {/* Display comments */}
                            {comments[report.id] && comments[report.id].length > 0 && (
                              <div className="space-y-2">
                                <div className="font-semibold text-sm">תגובות:</div>
                                {comments[report.id].map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="bg-muted p-2 rounded-md space-y-1"
                                  >
                                    <div className="text-xs text-muted-foreground">
                                      {comment.commenter_name} •{" "}
                                      {formatDate(comment.created_at)}
                                    </div>
                                    <div className="text-sm">{comment.comment_text}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
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
