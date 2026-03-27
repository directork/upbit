# CU Content Automation

브리프(`briefs/sample-brief.json`)와 브랜드 규칙(`rules/brand-rules.md`)을 읽어 숏폼 콘텐츠 카피 패키지를 자동 생성합니다.

## 생성 결과
- `outputs/copy_pack.md`
- `outputs/copy_pack.csv`

포함 항목:
- 인스타 릴스 카피 10개
- 유튜브 쇼츠 제목 10개
- 썸네일 문구 5개
- 해시태그 2세트
- 내부 보고용 요약 1개

## 실행 방법
```bash
cd cu-content-automation
python3 scripts/generate_copy_pack.py
```

## 현재 반영 규칙
- 금칙어 필터 자동 적용
- 인스타 릴스: 첫 줄 25자 이내, 3줄 이내
- 유튜브 쇼츠 제목: 35자 이내
- 썸네일: 8~14자, 숫자/대비 구조 보정

## 입력 스키마 예시
`briefs/sample-brief.json`
- `project_name`
- `product`
- `target`
- `goal`
- `core_message`
- `must_include`
- `avoid`

## 예외 처리
- 입력 파일 누락
- JSON 파싱 실패
- 출력 저장 실패
- 기타 예기치 못한 오류
