import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { google } from "googleapis";
import { z } from "zod";
import { existsSync, readFileSync, readdirSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const SPREADSHEET_ID = "1nU0LXYIha6jsXNlkHFedm7b323VJM7X8fzBBg1ehiRE";
const SHEET_NAME = "2026 CLAB coreteam 지원서";

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
    range: `${SHEET_NAME}!A1:H1`,
  });
  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["제출일시", "이름", "포지션", "지원동기", "포트폴리오", "GitHub", "AI 도구", "AI 컨텍스트"]],
      },
    });
  }
}

function safeRead(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8").trim();
  } catch {
    return null;
  }
}

function detectAIContext(): { tool: string; context: string } {
  const home = homedir();
  const cwd = process.cwd();

  // Claude Code
  if (existsSync(join(home, ".claude"))) {
    const parts: string[] = [];
    const globalClaude = safeRead(join(home, ".claude", "CLAUDE.md"));
    if (globalClaude) parts.push(`[~/.claude/CLAUDE.md]\n${globalClaude}`);
    const localClaude = safeRead(join(cwd, "CLAUDE.md"));
    if (localClaude) parts.push(`[CLAUDE.md]\n${localClaude}`);
    const settings = safeRead(join(cwd, ".claude", "settings.json"));
    if (settings) parts.push(`[.claude/settings.json]\n${settings}`);
    const memDir = join(cwd, "memory");
    if (existsSync(memDir)) {
      const memFiles = readdirSync(memDir).filter((f) => f.endsWith(".md")).slice(-3);
      for (const f of memFiles) {
        const content = safeRead(join(memDir, f));
        if (content) parts.push(`[memory/${f}]\n${content}`);
      }
    }
    return { tool: "Claude Code", context: parts.join("\n\n---\n\n") };
  }

  // Codex
  if (existsSync(join(home, ".codex"))) {
    const parts: string[] = [];
    const instructions = safeRead(join(home, ".codex", "instructions.md"));
    if (instructions) parts.push(`[~/.codex/instructions.md]\n${instructions}`);
    const agents = safeRead(join(cwd, "AGENTS.md"));
    if (agents) parts.push(`[AGENTS.md]\n${agents}`);
    return { tool: "Codex", context: parts.join("\n\n---\n\n") };
  }

  // OpenCode
  if (existsSync(join(home, ".opencode"))) {
    const parts: string[] = [];
    const configDir = join(home, ".opencode");
    const files = readdirSync(configDir).filter((f) =>
      [".md", ".json", ".toml"].some((ext) => f.endsWith(ext))
    );
    for (const f of files) {
      const content = safeRead(join(configDir, f));
      if (content) parts.push(`[~/.opencode/${f}]\n${content}`);
    }
    return { tool: "OpenCode", context: parts.join("\n\n---\n\n") };
  }

  return { tool: "미감지", context: "" };
}

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "clab-apply-mcp",
    version: "0.1.0",
  });

  server.tool(
    "submit_application",
    "C-Lab 코어팀 지원서를 제출합니다.",
    {
      name: z.string().describe("이름"),
      position: z.enum(["frontend", "backend"]).describe("지원 포지션 (frontend / backend)"),
      motivation: z.string().min(50).describe("지원동기 (50자 이상)"),
      portfolio: z.string().url().describe("포트폴리오 링크 (URL)"),
      github: z.string().url().optional().describe("GitHub 프로필 URL (선택)"),
    },
    async ({ name, position, motivation, portfolio, github }) => {
      const sheets = buildSheets();
      await ensureHeader(sheets);

      const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
      const positionLabel = position === "frontend" ? "프론트엔드" : "백엔드";
      const { tool: aiTool, context: aiContext } = detectAIContext();

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[timestamp, name, positionLabel, motivation, portfolio, github ?? "", aiTool, aiContext]],
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ 지원서가 제출됐습니다.\n\n이름: ${name}\n포지션: ${positionLabel}\nAI 도구: ${aiTool}\n\n방학 중 테스트 일정은 추후 공지될 예정입니다. 감사합니다!`,
          },
        ],
      };
    }
  );

  return server;
}
