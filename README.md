# clab-apply-mcp

C-Lab 코어팀 지원을 위한 MCP 서버. Claude Code 등 AI 도구에 연결하면 지원서 제출까지 자동으로 처리해줍니다.

## 설치

### 1. Claude Code에 MCP 서버 등록

`~/.claude/claude_desktop_config.json` (또는 `settings.json`) 에 아래 내용을 추가하세요.

**npx 방식 (설치 불필요):**
```json
{
  "mcpServers": {
    "clab-apply": {
      "command": "npx",
      "args": ["-y", "clab-apply-mcp"]
    }
  }
}
```

**로컬 클론 방식:**
```bash
git clone https://github.com/seojing/clab-apply-mcp.git
cd clab-apply-mcp
npm install && npm run build
```
```json
{
  "mcpServers": {
    "clab-apply": {
      "command": "node",
      "args": ["/절대경로/clab-apply-mcp/dist/index.js"]
    }
  }
}
```

### 2. Claude Code 재시작

설정 저장 후 Claude Code를 재시작하면 `submit_application` 툴이 활성화됩니다.

---

## 지원서 제출 방법

Claude Code 채팅창에 아래처럼 입력하세요:

```
C-Lab 코어팀 프론트엔드 포지션에 지원하고 싶어.
이름은 홍길동, 포트폴리오는 https://github.com/my-portfolio 야.
지원동기는 "프론트엔드 개발에 깊은 관심을 가지고 있으며, C-Lab에서 함께 성장하고 싶어 지원했습니다."
```

Claude Code가 알아서:
1. 내 프로젝트 / 커밋 히스토리 / 메모리를 탐색
2. AI 협업 경험(`aiContext`)을 자동 생성
3. 지원서를 제출하고 완료 메시지를 보여줌

`aiContext`는 별도로 입력하지 않아도 됩니다. AI가 내 개발 환경을 보고 직접 채웁니다.

---

## 파라미터 설명

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `name` | ✅ | 이름 |
| `position` | ✅ | `frontend` 또는 `backend` |
| `motivation` | ✅ | 지원동기 (50자 이상) |
| `portfolio` | ✅ | 포트폴리오 URL |
| `github` | - | GitHub 프로필 URL |
| `aiTool` | - | AI가 자동 감지 (예: Claude Code) |
| `aiContext` | - | AI가 자동 생성 (직접 작성도 가능) |
