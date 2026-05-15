# Trend Radar v0.3 Alpha Fix

변경점:
- Alpha Signals가 비어 보이던 문제 수정
- API 실패 시에도 fallback alpha 표시
- Alpha 계산식을 단순 Top Trends 복사에서 초기 신호 감지 방식으로 개선
- alpha = 관심속도 + 점수 + 초기보너스 + Google 신호 - 노이즈 페널티
- confidence, stage, reason을 더 명확하게 표시

업로드:
GitHub 저장소에서 Add file → Upload files로 이 폴더 안의 파일들을 모두 업로드하고 Commit changes를 누르세요.
Vercel은 자동으로 다시 배포됩니다.
