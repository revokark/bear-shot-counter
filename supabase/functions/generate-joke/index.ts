import { createResponsesCall } from "../_shared/responses.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "x-lovable-aig-run-id",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev";
const MODEL = "openai/gpt-6-astra";

const SYSTEM_INSTRUCTIONS =
  "אתה קומיקאי שמופיע בבר של אמנים בסוף השבוע. " +
  "כתוב בדיחה קצרה בעברית (2-3 משפטים לכל היותר) שמתאימה לאווירת האירוע: " +
  "בר, אמנים, לילה טוב. הבדיחה חייבת להיות קלילה, מצחיקה ומתאימה לכל הקהל. " +
  "בנה בדיחה עם מבנה קומי ברור: במשפט הראשון הצג מצב פשוט ומוכר ובנה ציפייה; " +
  "במשפט האחרון שבור את הציפייה בפאנץ׳ חד, מפתיע ומובן מיד. " +
  "הפאנץ׳ חייב לנבוע מההקמה ולשנות את המשמעות שלה, לא להיות סתם משפט מוזר או תיאור משעשע. " +
  "העדף פער בין השפה הגבוהה של האמנות למציאות היומיומית של הבר, היפוך תפקידים או פירוש מילולי מפתיע. " +
  "כתוב עברית טבעית שמתאימה לספר בקול; הימנע ממשחקי מילים מאולצים, קלישאות ותרגומים מאנגלית. " +
  "לפני התשובה בדוק בשקט: מה הקהל מצפה שיקרה, ומה בפאנץ׳ הופך את הציפייה? " +
  "אם אין תשובה ברורה או שהסיום רק חמוד, שכתב לפני שאתה עונה. " +
  "שים את הפאנץ׳ בשורה האחרונה וסיים מיד אחריו — בלי להסביר למה זה מצחיק. " +
  "ענה רק בבדיחה עצמה, בלי כותרות, תוויות של הקמה או פאנץ׳, הקדמות והסברים. " +
  "היה מקורי בכל פעם וגוון את הסיטואציה ואת המנגנון הקומי — אל תחזור על אותה תבנית.";

const RANDOM_ANGLES = [
  "זווית: הפוך בדיחה על ברמנים וציור",
  "זווית: בדיחה על משורר שמזמין שתייה",
  "זווית: בדיחה על קריאה לבמה",
  "זווית: בדיחה על חשבון בסוף הערב",
  "זווית: בדיחה על אמן שהזמין משקה בהשראת יצירה",
  "זווית: בדיחה על קהל ומוזיקה חיה",
  "זווית: בדיחה על מלצר וצייר מתחרים",
  "זווית: בדיחה על פתאום הרעב באמצע ההופעה",
  "זווית: בדיחה על טיפים ותודות",
  "זווית: בדיחה על אורח ששוכח איפה החנה את הכיסא שלו",
];

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return Response.json(
      { error: "AI is not configured for this project yet." },
      { status: 500, headers: corsHeaders },
    );
  }

  const angle = RANDOM_ANGLES[Math.floor(Math.random() * RANDOM_ANGLES.length)];
  const seed = Math.random().toString(36).slice(2, 10);
  const prompt = `כתוב בדיחה קצרה בעברית לסוף השבוע בבר של האמנים, עם הקמה שמייצרת ציפייה ופאנץ׳ חד ששובר אותה. ${angle}. מזרע יצירתיות: ${seed}`;

  try {
    const { result } = createResponsesCall(
      request,
      { baseURL: GATEWAY_URL, apiKey, model: MODEL },
      [{ role: "user", content: prompt }],
      SYSTEM_INSTRUCTIONS,
    );
    const joke = (await result.text).trim();
    if (!joke) {
      return Response.json(
        { error: "ה-AI לא החזיר בדיחה. נסו שוב." },
        { status: 502, headers: corsHeaders },
      );
    }
    return Response.json({ joke }, { headers: corsHeaders });
  } catch (error) {
    const upstreamStatus = (error as { statusCode?: number }).statusCode;
    const message =
      error instanceof Error && error.message ? error.message : "הבקשה ל-AI נכשלה. נסו שוב.";
    const isRetryable =
      (typeof upstreamStatus === "number" && upstreamStatus >= 500 && upstreamStatus <= 599) ||
      upstreamStatus === 429;
    return Response.json(
      { error: message },
      { status: isRetryable ? upstreamStatus : 500, headers: corsHeaders },
    );
  }
});
