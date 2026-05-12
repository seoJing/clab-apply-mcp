import { google } from "googleapis";
import { IncomingMessage, ServerResponse } from "http";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const SPREADSHEET_ID = "1nU0LXYIha6jsXNlkHFedm7b323VJM7X8fzBBg1ehiRE";
const SHEET_NAME = "시트1";

function buildSheets() {
  const credentials: object = process.env.GOOGLE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT)
    : require(join(__dirname, "../credentials/service-account.json"));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function ensureHeader(sheets: ReturnType<typeof google.sheets>) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${SHEET_NAME}'!A1:H1`,
  });
  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["제출일시", "이름", "포지션", "지원동기", "포트폴리오", "GitHub", "AI 도구", "AI 컨텍스트"]],
      },
    });
  }
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const { name, position, motivation, portfolio, github, aiTool, aiContext } = req.body ?? {};

  if (!name || !position || !motivation || !portfolio) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "필수 필드가 누락됐습니다." }));
    return;
  }

  const sheets = buildSheets();
  await ensureHeader(sheets);

  const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const positionLabel = position === "frontend" ? "프론트엔드" : "백엔드";

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${SHEET_NAME}'!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[timestamp, name, positionLabel, motivation, portfolio, github ?? "", aiTool ?? "미감지", aiContext ?? ""]],
    },
  });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true }));
}
