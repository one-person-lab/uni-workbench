#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
App Store 竞品探针 —— 零依赖，只用标准库 + 系统 python3。

四个子命令：
  search  <关键词>      全量搜索并按评数排序（先做这一步，别漏掉体量最大的对手）
  meta    <id> [id...]  元数据：评分 / 评数 / 上架日期 / 版本 / 分类 / 大小
  price   <id>          内购清单：抓页面后**先剥标签再取值**否则会混入推荐位价格
  reviews <id>          评论：SSR 页面，一次约 10 条，翻页参数无效

用法：
  python3 probe.py search "地球online"
  python3 probe.py search "habit tracker" --country us --limit 20
  python3 probe.py meta 6755080871 6789109191
  python3 probe.py price 6755080871
  python3 probe.py reviews 6755080871 --stars 3

坑记录在 SKILL.md，改本脚本前先读。
"""

import argparse
import html
import json
import re
import sys
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Safari/605.1.15")

# 弃用系统代理：本机 HTTP_PROXY 会干扰，直连更稳
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))
OPENER.addheaders = [("User-Agent", UA)]


def fetch(url, timeout=30):
    with OPENER.open(url, timeout=timeout) as r:
        raw = r.read()
    for enc in ("utf-8", "gbk", "latin-1"):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="ignore")


def get_json(url):
    return json.loads(fetch(url))


# ── search ────────────────────────────────────────────────

def cmd_search(args):
    q = urllib.parse.quote(args.keyword)
    url = (f"https://itunes.apple.com/search?term={q}&country={args.country}"
           f"&entity=software&limit={args.limit}")
    data = get_json(url)
    rows = data.get("results", [])
    rows.sort(key=lambda a: -(a.get("userRatingCount") or 0))
    print(f"命中 {data.get('resultCount')} 条，按评数降序：\n")
    print(f"{'评分':<6}{'评数':<9}{'上架':<13}{'分类':<16}{'名称'}")
    print("-" * 92)
    for a in rows:
        rating = a.get("averageUserRating")
        rating = f"{rating:.2f}" if rating else "-"
        genre = ",".join(a.get("genres", [])[:2])[:14]
        print(f"{rating:<6}{str(a.get('userRatingCount') or 0):<9}"
              f"{(a.get('releaseDate') or '')[:10]:<13}{genre:<16}{a.get('trackName','')[:40]}")
        print(f"{'':<28}id={a.get('trackId')}  {a.get('artistName','')}")


# ── meta ──────────────────────────────────────────────────

def cmd_meta(args):
    for aid in args.ids:
        url = f"https://itunes.apple.com/lookup?id={aid}&country={args.country}"
        res = get_json(url).get("results") or []
        if not res:
            print(f"[{aid}] 无结果（检查 id 与 country）")
            continue
        a = res[0]
        size = round(int(a.get("fileSizeBytes", 0)) / 1048576, 1)
        print(f"\n=== {a.get('trackName')}  (id={aid}) ===")
        print(f"  开发者      {a.get('artistName')}")
        print(f"  评分/评数   {a.get('averageUserRating')} / {a.get('userRatingCount')}")
        print(f"  上架/更新   {(a.get('releaseDate') or '')[:10]}"
              f" / {(a.get('currentVersionReleaseDate') or '')[:10]}")
        print(f"  版本/大小   {a.get('version')} / {size} MB")
        print(f"  分类        {a.get('genres')}")
        print(f"  最低系统    {a.get('minimumOsVersion')}   分级 {a.get('contentAdvisoryRating')}")
        price = a.get("formattedPrice")
        print(f"  下载价格    {price}")
        if args.desc:
            desc = re.sub(r"\n{2,}", "\n", a.get("description") or "")
            print(f"\n  --- 功能描述（前 {args.desc} 字）---")
            print(desc[:args.desc])


# ── price ─────────────────────────────────────────────────

def cmd_price(args):
    h = fetch(f"https://apps.apple.com/{args.country}/app/id{args.id}")
    text = html.unescape(re.sub(r"<[^>]+>", "\n", h))

    # 方式一：JSON 里的 [名称,价格] 配对（最准，能拿到名称）
    pairs, seen = [], set()
    for m in re.finditer(r'\["([A-Za-z一-鿿][^"]{2,40}?)","(¥[\d.,]+)"\]', h):
        name, price = m.group(1), m.group(2)
        if (name, price) in seen:
            continue
        seen.add((name, price))
        pairs.append((name, price))

    print(f"=== 内购清单（id={args.id}）===")
    if pairs:
        for name, price in pairs:
            print(f"  {price:>10}   {name}")
    else:
        # 方式二：退化到剥标签后的裸价格（需人工核对归属）
        print("  ⚠️ 未匹配到 JSON 配对，以下为剥标签后的裸价格，需人工核对：")
        for p in sorted(set(re.findall(r"¥\s?[\d.,]+", text))):
            print(f"  {p:>10}")

    n = len(pairs)
    if n > 4:
        print(f"\n  ⚠️ 该应用有 {n} 个内购档位。档位越多，用户越难决策——"
              f"对比评分时常能看到负相关，别盲目学。")


# ── reviews ───────────────────────────────────────────────

def cmd_reviews(args):
    h = fetch(f"https://apps.apple.com/{args.country}/app/id{args.id}?see-all=reviews")
    blocks = re.split(r'(?=<div class="review\b)', h)
    got = 0
    print(f"=== 评论（id={args.id}，SSR 仅第一页约 10 条）===\n")
    for b in blocks[1:]:
        rt = re.search(r'aria-label="([^"]*?星[^"]*?)"', b)
        tx = re.search(
            r'data-testid="truncate-text"[^>]*>(?:<!-- HTML_TAG_START -->)?(.{0,600}?)'
            r'(?:<!-- HTML_TAG_END -->)?</p>', b, re.S)
        dt = re.search(r'datetime="([\d-]{10})', b)
        if not tx:
            continue
        stars = rt.group(1) if rt else "?"
        try:
            num = int(re.search(r"(\d)", stars).group(1))
        except (AttributeError, ValueError):
            num = 0
        if args.stars and num > args.stars:
            continue
        body = html.unescape(re.sub(r"<[^>]+>", "", tx.group(1))).strip()
        print(f"[{stars}] {dt.group(1) if dt else '?'}  {body[:300]}\n")
        got += 1
    if not got:
        print(f"  无匹配评论（--stars {args.stars} 过滤过严，或页面结构已改版）。")
    print("提示：需要更多评论得上浏览器；page=N / sortOrder= 翻页参数均无效。")


def main():
    p = argparse.ArgumentParser(description="App Store 竞品探针")
    p.add_argument("--country", default="cn", help="storefront，默认 cn")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("search", help="全量搜索并按评数排序")
    s.add_argument("keyword")
    s.add_argument("--limit", type=int, default=50)
    s.set_defaults(func=cmd_search)

    m = sub.add_parser("meta", help="元数据")
    m.add_argument("ids", nargs="+")
    m.add_argument("--desc", type=int, default=0,
                   help="附带输出功能描述的前 N 字符，如 --desc 1200（看竞品怎么做时很有用）")
    m.set_defaults(func=cmd_meta)

    pr = sub.add_parser("price", help="内购清单")
    pr.add_argument("id")
    pr.set_defaults(func=cmd_price)

    rv = sub.add_parser("reviews", help="评论")
    rv.add_argument("id")
    rv.add_argument("--stars", type=int, default=0,
                    help="只看 ≤ N 星的评论，如 --stars 3 只看 3 星及以下")
    rv.set_defaults(func=cmd_reviews)

    args = p.parse_args()
    try:
        args.func(args)
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as exc:  # 网络/结构变化，给出可操作提示而非 traceback
        print(f"失败：{type(exc).__name__}: {exc}", file=sys.stderr)
        print("常见原因：网络被代理拦截 / App Store 页面结构改版（改正则前先 curl 看一眼原 HTML）",
              file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
