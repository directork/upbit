#!/usr/bin/env python3
"""브리프(JSON) + 브랜드 규칙(MD) 기반 콘텐츠 카피 패키지 생성기."""

from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List


@dataclass
class BrandRules:
    forbidden_words: List[str]
    reels_first_line_max: int = 25
    reels_max_lines: int = 3
    shorts_title_max: int = 35
    thumbnail_min: int = 8
    thumbnail_max: int = 14


def load_json_brief(path: Path) -> Dict:
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"브리프 파일을 찾을 수 없습니다: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f"브리프 JSON 파싱 실패: {path} ({exc})") from exc


def parse_forbidden_words(markdown: str) -> List[str]:
    if "## 금칙어" not in markdown:
        return []

    section = markdown.split("## 금칙어", maxsplit=1)[1]
    section = section.split("## ", maxsplit=1)[0]
    return [line.removeprefix("-").strip() for line in section.splitlines() if line.strip().startswith("-")]


def parse_brand_rules(path: Path) -> BrandRules:
    try:
        content = path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"브랜드 규칙 파일을 찾을 수 없습니다: {path}") from exc

    rules = BrandRules(forbidden_words=parse_forbidden_words(content))

    reels_line = re.search(r"첫 줄\s*(\d+)자\s*이내", content)
    reels_lines = re.search(r"(\d+)줄\s*이내", content)
    shorts = re.search(r"제목\s*(\d+)자\s*이내", content)
    thumb_range = re.search(r"(\d+)\s*~\s*(\d+)자", content)

    if reels_line:
        rules.reels_first_line_max = int(reels_line.group(1))
    if reels_lines:
        rules.reels_max_lines = int(reels_lines.group(1))
    if shorts:
        rules.shorts_title_max = int(shorts.group(1))
    if thumb_range:
        rules.thumbnail_min = int(thumb_range.group(1))
        rules.thumbnail_max = int(thumb_range.group(2))

    return rules


def sanitize_forbidden_words(text: str, forbidden_words: List[str]) -> str:
    result = text
    for bad in forbidden_words:
        result = re.sub(re.escape(bad), "[검수필요]", result, flags=re.IGNORECASE)
    return result


def enforce_max_length(text: str, max_length: int) -> str:
    if len(text) <= max_length:
        return text
    return text[: max_length - 1].rstrip() + "…"


def ensure_must_include(text: str, must_include: List[str]) -> str:
    output = text
    for word in must_include:
        if word and word not in output:
            output = f"{output} {word}"
    return output


def enforce_reels_rules(text: str, rules: BrandRules) -> str:
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    lines = lines[: rules.reels_max_lines]

    if not lines:
        lines = ["CU 챗봇", "필요한 정보 빠르게", "지금 바로 시작"]

    lines[0] = enforce_max_length(lines[0], rules.reels_first_line_max)
    return "\n".join(lines)


def enforce_thumbnail_rules(text: str, rules: BrandRules) -> str:
    result = text
    if not re.search(r"\d", result) and "VS" not in result.upper() and "전후" not in result:
        result = f"{result} 3초"

    if len(result) > rules.thumbnail_max:
        result = enforce_max_length(result, rules.thumbnail_max)

    while len(result) < rules.thumbnail_min:
        result += "!"

    return result


def build_reels_copies(brief: Dict, rules: BrandRules) -> List[str]:
    product = brief.get("product", "CU 챗봇")
    core = brief.get("core_message", "빠르게 찾는 CU 도우미")
    must_include = brief.get("must_include", [])

    templates = [
        f"{product} 10초 시작\n{core}\n지금 매장에서 바로 써보기",
        f"오늘 필요한 건 {product}\n재고/행사 빠르게 확인\nCU에서 바로 실행",
        f"CU 고객 필수 루틴\n{product}로 질문 끝\n찾는 정보 바로 도착",
        f"찾고 묻고 끝내기\n{product} 한 번에 해결\n바쁜 시간 절약 완료",
        f"매장 정보 1번에\n{product}로 즉시 검색\n지금 챗봇 열어보기",
        f"질문하면 바로 답\n{product}로 빠른 안내\nCU 쇼핑이 쉬워진다",
        f"오늘도 헤매지 말기\n{product}로 경로 안내\n가까운 CU 찾기",
        f"행사 확인 3초 컷\n{product}로 즉시 확인\n놓치기 전에 체크",
        f"필요한 정보만 콕\n{product}로 빠른 탐색\n지금 바로 질문",
        f"CU픽 챗봇 활용법\n첫 질문은 메뉴 추천\n답변 속도 직접 체감",
    ]

    outputs: List[str] = []
    for raw in templates:
        text = ensure_must_include(raw, must_include)
        text = sanitize_forbidden_words(text, rules.forbidden_words)
        text = enforce_reels_rules(text, rules)
        outputs.append(text)
    return outputs


def build_shorts_titles(brief: Dict, rules: BrandRules) -> List[str]:
    product = brief.get("product", "CU 챗봇")

    templates = [
        f"{product}로 찾는 오늘의 CU 혜택",
        "3초 만에 매장 정보 찾는 방법",
        "CU 챗봇으로 행사 확인 끝내기",
        "헤매지 않는 CU 사용법, 챗봇편",
        "바쁜 날엔 CU 챗봇이 답이다",
        "CU 고객용 챗봇, 뭐가 달라졌나",
        "질문 한 번으로 끝내는 CU 정보",
        "처음 쓰는 CU 챗봇 가이드",
        "CU픽 챗봇으로 빠른 탐색 루틴",
        "CU 챗봇 사용 유도용 핵심 팁",
    ]

    return [sanitize_forbidden_words(enforce_max_length(t, rules.shorts_title_max), rules.forbidden_words) for t in templates]


def build_thumbnail_texts(rules: BrandRules) -> List[str]:
    candidates = [
        "3초 답변 CU챗봇",
        "질문VS검색, 승자는",
        "CU챗봇 1분가이드",
        "혜택확인 3단계",
        "전후비교: 챗봇",
    ]

    outputs: List[str] = []
    for text in candidates:
        outputs.append(sanitize_forbidden_words(enforce_thumbnail_rules(text, rules), rules.forbidden_words))
    return outputs


def build_hashtag_sets() -> List[List[str]]:
    return [
        ["#CU", "#CU챗봇", "#CU픽챗봇", "#편의점챗봇", "#CU고객", "#챗봇추천", "#빠른검색", "#매장정보"],
        ["#CU이벤트", "#CU혜택", "#챗봇활용", "#질문하면답", "#쇼츠기획", "#릴스카피", "#콘텐츠자동화", "#마케팅카피"],
    ]


def build_internal_summary(brief: Dict) -> str:
    target = brief.get("target", "타깃 미정")
    message = brief.get("core_message", "메시지 미정")
    goal = brief.get("goal", "목표 미정")
    cta_direction = "챗봇 첫 질문 유도(혜택/매장/행사 확인)"

    return (
        f"타깃: {target}\n"
        f"핵심 메시지: {message}\n"
        f"목표: {goal}\n"
        f"CTA 방향: {cta_direction}"
    )


def markdown_numbered_multiline(index: int, text: str) -> List[str]:
    lines = text.split("\n")
    if len(lines) == 1:
        return [f"{index}. {lines[0]}"]

    output = [f"{index}. {lines[0]}"]
    output.extend([f"   {line}" for line in lines[1:]])
    return output


def build_markdown_output(reels: List[str], shorts: List[str], thumbs: List[str], hashtag_sets: List[List[str]], summary: str) -> str:
    lines: List[str] = ["# 콘텐츠 카피 패키지", ""]
    lines.append("## 1) 인스타 릴스 카피 (10개)")
    for i, reel in enumerate(reels, start=1):
        lines.extend(markdown_numbered_multiline(i, reel))
    lines.append("")

    lines.append("## 2) 유튜브 쇼츠 제목 (10개)")
    lines.extend([f"{i}. {title}" for i, title in enumerate(shorts, start=1)])
    lines.append("")

    lines.append("## 3) 썸네일 문구 (5개)")
    lines.extend([f"{i}. {thumb}" for i, thumb in enumerate(thumbs, start=1)])
    lines.append("")

    lines.append("## 4) 해시태그 2세트")
    for i, tag_set in enumerate(hashtag_sets, start=1):
        lines.append(f"세트 {i}: {' '.join(tag_set)}")
    lines.append("")

    lines.append("## 5) 내부 보고용 요약")
    lines.append(summary)
    return "\n".join(lines) + "\n"


def build_csv_rows(reels: List[str], shorts: List[str], thumbs: List[str], hashtag_sets: List[List[str]], summary: str) -> List[List[str]]:
    rows: List[List[str]] = [["category", "index", "content"]]
    rows.extend([["instagram_reels_copy", str(i), t.replace("\n", " | ")] for i, t in enumerate(reels, start=1)])
    rows.extend([["youtube_shorts_title", str(i), t] for i, t in enumerate(shorts, start=1)])
    rows.extend([["thumbnail_text", str(i), t] for i, t in enumerate(thumbs, start=1)])
    rows.extend([["hashtag_set", str(i), " ".join(tags)] for i, tags in enumerate(hashtag_sets, start=1)])
    rows.append(["internal_summary", "1", summary.replace("\n", " | ")])
    return rows


def write_outputs(md_path: Path, csv_path: Path, md_content: str, csv_rows: List[List[str]]) -> None:
    md_path.parent.mkdir(parents=True, exist_ok=True)
    csv_path.parent.mkdir(parents=True, exist_ok=True)

    md_path.write_text(md_content, encoding="utf-8")
    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(csv_rows)


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    brief_path = project_root / "briefs" / "sample-brief.json"
    rules_path = project_root / "rules" / "brand-rules.md"
    md_output_path = project_root / "outputs" / "copy_pack.md"
    csv_output_path = project_root / "outputs" / "copy_pack.csv"

    try:
        brief = load_json_brief(brief_path)
        rules = parse_brand_rules(rules_path)

        reels = build_reels_copies(brief, rules)
        shorts = build_shorts_titles(brief, rules)
        thumbs = build_thumbnail_texts(rules)
        hashtag_sets = build_hashtag_sets()
        summary = build_internal_summary(brief)

        md_content = build_markdown_output(reels, shorts, thumbs, hashtag_sets, summary)
        csv_rows = build_csv_rows(reels, shorts, thumbs, hashtag_sets, summary)
        write_outputs(md_output_path, csv_output_path, md_content, csv_rows)

        print("카피 패키지 생성 완료")
        print(f"- Markdown: {md_output_path}")
        print(f"- CSV: {csv_output_path}")
    except (FileNotFoundError, ValueError) as exc:
        print(f"입력 오류: {exc}")
        raise SystemExit(1) from exc
    except OSError as exc:
        print(f"파일 저장 오류: {exc}")
        raise SystemExit(1) from exc
    except Exception as exc:
        print(f"알 수 없는 오류가 발생했습니다: {exc}")
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
