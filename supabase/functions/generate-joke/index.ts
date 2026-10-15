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
  "ענה רק בבדיחה עצמה, בלי הקדמות ובלי הסברים. " +
  "היה מקורי ופתאומי בכל פעם - אל תחזור על בדיחות שכבר שמעת.";

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
  const prompt = `כתוב בדיחה קצרה בעברית לסוף השבוע בבר של האמנים. ${angle}. מזרע יצירתיות: ${seed}`;

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
    const message =
      error instanceof Error && error.message ? error.message : "הבקשה ל-AI נכשלה. נסו שוב.";
    const status =
      typeof (error as { statusCode?: number }).statusCode === "number"
        ? (error as { statusCode?: number }).statusCode!
        : 500;
    const safeStatus = status === 429 || status === 5xxIsAllowed(status) ? status : 500;
    return Response.json({ error: message }, { status: safeStatus, headers: corsHeaders });
  }
});

function 5xxIsAllowed(status: number) {
  return status >= 500 && status <= 599;
}
