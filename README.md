# clab-apply-mcp

C-Lab 코어팀 지원을 위한 MCP 서버. Claude Code에 연결하면 지원서 제출까지 자동으로 처리해줍니다.

## 설치

### Smithery로 한 번에 설치

[https://smithery.ai/servers/tjwlsrb1021/Clab](https://smithery.ai/servers/tjwlsrb1021/Clab)

또는 CLI:

```bash
npx @smithery/cli install tjwlsrb1021/Clab --client claude
```

---

## 지원서 제출 방법

설치 후 Claude Code 채팅창에 아래처럼 입력하세요:

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
