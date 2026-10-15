import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "site_background_image";

interface BackgroundImageButtonProps {
  onImageChange: (dataUrl: string | null) => void;
}

const BackgroundImageButton = ({ onImageChange }: BackgroundImageButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "קובץ לא תקין",
        description: "אנא בחר קובץ תמונה",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem(STORAGE_KEY, dataUrl);
        onImageChange(dataUrl);
        toast({ title: "התמונה נשמרה", description: "תמונת הרקע עודכנה בהצלחה" });
      } catch {
        toast({
          title: "שגיאה",
          description: "התמונה גדולה מדי, נסה תמונה קטנה יותר",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
        <ImagePlus className="h-4 w-4 ml-2" />
        תמונת רקע
      </Button>
    </>
  );
};

export default BackgroundImageButton;
