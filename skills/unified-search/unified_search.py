#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Unified Search Engine - 统一搜索引擎
SQLite记忆 + BM25 + TurboQuant + Neo4j图谱
RRF融合排序 + 去重 + 时效 + 上下文预算控制
"""
import sys, io, os, json, time, hashlib, math, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import urllib.request, urllib.error

WORKSPACE = r"C:\Users\filnf\.openclaw\workspace"
MEMORY_DB = r"C:\Users\filnf\.openclaw\memory\default.sqlite"

QDRANT_URL = "http://localhost:6333"
TQ_8BIT = os.path.join(WORKSPACE, r"skills\data\turboquant\openclaw_memory_8bit.tq")
TQ_ID_MAP = os.path.join(WORKSPACE, r"skills\data\turboquant\qdrant_id_map.json")
TQ_PAYLOADS = os.path.join(WORKSPACE, r"skills\data\turboquant\qdrant_payloads.json")
BM25_INDEX = os.path.join(WORKSPACE, r".index\bm25\bm25_index.json")
BM25_META = os.path.join(WORKSPACE, r".index\bm25\metadata.json")
NEO4J_USER = "neo4j"
NEO4J_PASS = "knowledge-graph-2026"
NEO4J_HTTP = "http://localhost:7474/db/neo4j/tx"

RRF_K = 60
DEFAULT_TOP_K = 10
DEFAULT_BUDGET = 4000

# === 缓存层 ===
_bm25_meta_cache = None
_bm25_path_cache = None
_tq_index_cache = None
_tq_id_map_cache = None
_tq_payloads_cache = None


def _load_bm25_meta():
    """加载 BM25 metadata（带缓存）"""
    global _bm25_meta_cache, _bm25_path_cache
    if _bm25_meta_cache is None and os.path.exists(BM25_META):
        with open(BM25_META, 'r', encoding='utf-8') as f:
            _bm25_meta_cache = json.load(f)
        # 构建 doc_id -> path 映射
        _bm25_path_cache = {}
        for doc_id, meta in _bm25_meta_cache.get('doc_metadata', {}).items():
            _bm25_path_cache[doc_id] = meta.get('path', '')
    return _bm25_meta_cache, _bm25_path_cache


def _load_tq_caches():
    """加载 TurboQuant 索引和映射（带缓存）"""
    global _tq_index_cache, _tq_id_map_cache, _tq_payloads_cache
    if _tq_index_cache is None:
        from turboquant import TurboQuantIndex
        _tq_index_cache = TurboQuantIndex.load(TQ_8BIT)
    if _tq_id_map_cache is None and os.path.exists(TQ_ID_MAP):
        with open(TQ_ID_MAP, 'r', encoding='utf-8') as f:
            _tq_id_map_cache = {int(kk): v for kk, v in json.load(f).items()}
    if _tq_payloads_cache is None and os.path.exists(TQ_PAYLOADS):
        with open(TQ_PAYLOADS, 'r', encoding='utf-8') as f:
            _tq_payloads_cache = json.load(f)
    return _tq_index_cache, _tq_id_map_cache or {}, _tq_payloads_cache or []


def _get_bm25_doc_text(doc_id, meta_cache):
    """从 BM25 metadata 获取文档文本"""
    if meta_cache:
        docs = meta_cache.get('doc_texts', {})
        return docs.get(doc_id, '')
    return ''


def _resolve_bm25_path(doc_id, path_cache):
    """解析 BM25 doc_id 到文件路径"""
    return path_cache.get(doc_id, doc_id) if path_cache else doc_id


def embed_query(text):
    try:
        body = {"model": "nomic-embed-text", "prompt": text}
        url = "http://127.0.0.1:11434/api/embeddings"
        req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                     headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read()).get('embedding')
    except Exception as e:
        sys.stderr.write("Embed error: %s\n" % e)
        return None


def sqlite_search_vector(query, query_vec, top_k=10):
    try:
        import sqlite3, json, numpy as np
        conn = sqlite3.connect(MEMORY_DB)
        cursor = conn.cursor()
        cursor.execute("SELECT id, path, source, start_line, end_line, text, embedding, updated_at FROM chunks WHERE embedding IS NOT NULL")
        rows = cursor.fetchall()
        conn.close()
        q_vec = np.array(query_vec, dtype=np.float32)
        scored = []
        for r in rows:
            try:
                emb_raw = r[6]
                if emb_raw is None:
                    continue
                # Embeddings stored as JSON text arrays, not binary blobs
                if isinstance(emb_raw, str):
                    emb = np.array(json.loads(emb_raw), dtype=np.float32)
                elif isinstance(emb_raw, bytes):
                    emb = np.frombuffer(emb_raw, dtype=np.float32)
                else:
                    continue
                if len(emb) != len(q_vec):
                    continue
                sim = float(np.dot(q_vec, emb) / (np.linalg.norm(q_vec) * np.linalg.norm(emb) + 1e-8))
                scored.append({
                    "engine": "sqlite_vector", "id": r[0], "path": r[1], "source": r[2],
                    "start_line": r[3], "end_line": r[4], "text": r[5],
                    "score": float(sim), "updated_at": r[7]
                })
            except:
                continue
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]
    except Exception as e:
        sys.stderr.write("SQLite vector error: %s\n" % e)
        return []


def sqlite_search_fts(query, top_k=10):
    try:
        import sqlite3
        conn = sqlite3.connect(MEMORY_DB)
        cursor = conn.cursor()
        safe_query = query.replace('"', '""')
        # Try exact phrase match first
        cursor.execute(
            "SELECT c.id, c.path, c.source, c.start_line, c.end_line, c.text, rank "
            "FROM chunks_fts JOIN chunks c ON chunks_fts.rowid = c.rowid "
            "WHERE chunks_fts MATCH ? ORDER BY rank LIMIT ?",
            ('"' + safe_query + '"', top_k * 2))
        results = []
        for r in cursor.fetchall():
            results.append({
                "engine": "sqlite_fts", "id": r[0], "path": r[1], "source": r[2],
                "start_line": r[3], "end_line": r[4], "text": r[5],
                "score": max(0, 1.0 / (1.0 + abs(r[6]) if r[6] else 1)),
                "updated_at": ""
            })
        # Fallback: Chinese char-level AND match
        if not results:
            chars = [c for c in query if '\u4e00' <= c <= '\u9fff']
            if len(chars) >= 2:
                and_query = ' AND '.join(chars)
                cursor.execute(
                    "SELECT c.id, c.path, c.source, c.start_line, c.end_line, c.text, rank "
                    "FROM chunks_fts JOIN chunks c ON chunks_fts.rowid = c.rowid "
                    "WHERE chunks_fts MATCH ? ORDER BY rank LIMIT ?",
                    (and_query, top_k * 2))
                for r in cursor.fetchall():
                    results.append({
                        "engine": "sqlite_fts", "id": r[0], "path": r[1], "source": r[2],
                        "start_line": r[3], "end_line": r[4], "text": r[5],
                        "score": max(0, 1.0 / (1.0 + abs(r[6]) if r[6] else 1)),
                        "updated_at": ""
                    })
        conn.close()
        return results
    except Exception as e:
        sys.stderr.write("SQLite FTS error: %s\n" % e)
        return []


def bm25_search(query, top_k=10):
    try:
        with open(BM25_INDEX, 'r', encoding='utf-8') as f:
            index = json.load(f)
        meta_cache, path_cache = _load_bm25_meta()
        tokens = re.findall(r'[\u4e00-\u9fff]+|[a-zA-Z0-9]+', query)
        # BM25 index was built with jieba (word-level tokens, avg 2.43 chars).
        # No single-char tokens exist in the index.
        # Use 2-gram expansion for Chinese tokens to match word-level index.
        expanded = []
        for t in tokens:
            if len(t) > 1 and all('\u4e00' <= c <= '\u9fff' for c in t):
                # 2-gram: "统一搜索引擎" -> ["统一", "一搜", "搜索", "索引", "引擎"]
                for i in range(len(t) - 1):
                    expanded.append(t[i:i+2])
            else:
                expanded.append(t)
        if not expanded:
            return []
        doc_scores = {}
        for token in expanded:
            if token in index:
                for doc_id, tf in index[token].items():
                    doc_scores[doc_id] = doc_scores.get(doc_id, 0) + tf
        if not doc_scores:
            return []
        sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)
        results = []
        for doc_id, score in sorted_docs[:top_k]:
            text = _get_bm25_doc_text(doc_id, meta_cache)
            path = _resolve_bm25_path(doc_id, path_cache)
            results.append({
                "engine": "bm25", "id": doc_id, "path": path, "source": "bm25_index",
                "score": score, "text": text, "start_line": 0, "end_line": 0, "updated_at": ""
            })
        return results
    except Exception as e:
        sys.stderr.write("BM25 error: %s\n" % e)
        return []


def tq_search(query_vec, top_k=10):
    try:
        import numpy as np
        idx, id_map, payloads_list = _load_tq_caches()
        q = np.array(query_vec, dtype=np.float32).reshape(1, -1)
        dists, ids = idx.search(q, top_k * 2)
        results = []
        for tid, sc in zip(ids[0], dists[0]):
            qid = id_map.get(tid, str(tid))
            payload = payloads_list[tid] if tid < len(payloads_list) else {}
            text = payload.get("text", "")
            path = payload.get("relative_path", payload.get("path", ""))
            # 回填：从源文件读取文本
            if not text and path:
                full_path = os.path.join(WORKSPACE, path.replace("\\", os.sep))
                if os.path.exists(full_path):
                    try:
                        with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
                            text = f.read(2000)  # 限制 2000 字符
                    except:
                        pass
            results.append({
                "engine": "turboquant", "id": qid,
                "path": path, "source": payload.get("source", ""),
                "score": float(sc), "text": text,
                "start_line": payload.get("start_line", 0),
                "end_line": payload.get("end_line", 0),
                "updated_at": payload.get("updated_at", "")
            })
        return results[:top_k]
    except Exception as e:
        sys.stderr.write("TQ error: %s\n" % e)
        return []


def neo4j_search(query, top_k=10):
    try:
        import base64
        cypher = ("MATCH (n) WHERE n.name CONTAINS $query OR toString(n.description) CONTAINS $query "
                  "RETURN labels(n)[0] AS type, n.name AS name, coalesce(n.description,'') AS description, "
                  "id(n) AS node_id ORDER BY size(n.name) ASC LIMIT $limit")
        body = {"statements": [{"statement": cypher,
                                "parameters": {"query": query, "limit": top_k}}]}
        auth = "%s:%s" % (NEO4J_USER, NEO4J_PASS)
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + base64.b64encode(auth.encode()).decode()
        }
        req = urllib.request.Request(NEO4J_HTTP, data=json.dumps(body).encode(), headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            results_data = data.get("results", [{}])[0].get("data", [])
        results = []
        for item in results_data:
            row = item.get("row", [])
            if len(row) >= 4:
                desc = row[2] if len(row) > 2 else ""
                results.append({
                    "engine": "neo4j", "id": str(row[3]), "path": "",
                    "source": "knowledge_graph", "type": row[0], "name": row[1],
                    "description": desc, "score": 1.0,
                    "text": "%s: %s" % (row[1], desc) if desc else row[1],
                    "start_line": 0, "end_line": 0, "updated_at": ""
                })
        return results
    except Exception as e:
        sys.stderr.write("Neo4j error: %s\n" % e)
        return []


def route_query(query):
    is_memory = any(w in query for w in ["上次", "最近", "之前", "说过", "记得", "memory"])
    is_keyword = len(query.strip()) <= 6 and not any(c.isalpha() for c in query)
    is_graph = any(w in query for w in ["关系", "是什么", "定义", "概念", "关联"])
    if is_memory:
        return ["sqlite"]
    elif is_keyword:
        return ["bm25", "sqlite"]
    elif is_graph:
        return ["neo4j", "sqlite"]
    # 默认: 双引擎核心 (SQLite + BM25)
    return ["sqlite", "bm25"]


def extract_doc_date(path):
    """从路径提取文档日期，如 memory/2026-04-16.md -> 2026-04-16"""
    if not path:
        return None
    m = re.search(r'(\d{4}-\d{2}-\d{2})', path)
    return m.group(1) if m else None


def apply_time_decay(results, half_life_days=30.0):
    """时效加权：近期文档得分加成。指数衰减，半衰期默认 30 天。"""
    import time as _time
    now = _time.time()
    for r in results:
        date_str = extract_doc_date(r.get("path", ""))
        if date_str:
            try:
                doc_ts = time.mktime(time.strptime(date_str, "%Y-%m-%d"))
                age_days = (now - doc_ts) / 86400.0
                # 指数衰减: multiplier = 2^(-age/half_life)
                decay = 2.0 ** (-age_days / half_life_days)
                r["time_multiplier"] = decay
                r["age_days"] = round(age_days, 1)
            except:
                r["time_multiplier"] = 1.0
                r["age_days"] = None
        else:
            r["time_multiplier"] = 1.0
            r["age_days"] = None


def rrf_fuse(all_results, k=RRF_K):
    engine_groups = {}
    for r in all_results:
        eng = r.get("engine", "unknown")
        engine_groups.setdefault(eng, []).append(r)
    rrf_scores = {}
    for eng, results in engine_groups.items():
        for rank, r in enumerate(results):
            rid = r.get("id", "")
            rrf_scores[rid] = rrf_scores.get(rid, 0) + 1.0 / (k + rank + 1)
    id_to_result = {}
    for r in all_results:
        rid = r.get("id", "")
        if rid not in id_to_result:
            id_to_result[rid] = r.copy()
            id_to_result[rid]["rrf_score"] = 0
            id_to_result[rid]["engines"] = []
        id_to_result[rid]["engines"].append(r.get("engine", ""))
        if r.get("score", 0) > id_to_result[rid].get("score", 0):
            id_to_result[rid]["score"] = r.get("score", 0)
        if r.get("text") and not id_to_result[rid].get("text"):
            id_to_result[rid]["text"] = r.get("text", "")
    for rid, score in rrf_scores.items():
        if rid in id_to_result:
            id_to_result[rid]["rrf_score"] = score
    # 应用时效加权
    apply_time_decay(id_to_result.values())
    for r in id_to_result.values():
        tm = r.get("time_multiplier", 1.0)
        r["rrf_score"] *= tm
    return sorted(id_to_result.values(), key=lambda x: x.get("rrf_score", 0), reverse=True)


def deduplicate(results):
    seen_paths = {}
    seen_hashes = {}
    deduped = []
    for r in results:
        path = r.get("path", "")
        text = r.get("text", "")
        if path and path in seen_paths:
            if r.get("score", 0) > seen_paths[path].get("score", 0):
                old = seen_paths[path]
                deduped = [x for x in deduped if x is not old]
                seen_paths[path] = r
                deduped.append(r)
            continue
        if text:
            h = hashlib.md5(text[:200].encode()).hexdigest()
            if h in seen_hashes:
                continue
            seen_hashes[h] = True
        if path:
            seen_paths[path] = r
        deduped.append(r)
    return deduped


def estimate_tokens(text):
    if not text:
        return 0
    cn = len(re.findall(r'[\u4e00-\u9fff]', text))
    en = len(text) - cn
    return int(cn / 1.5 + en / 4)


def apply_budget(results, budget=DEFAULT_BUDGET):
    output = []
    used_tokens = 0
    for r in results:
        text = r.get("text", "")
        token_count = estimate_tokens(text)
        if used_tokens + token_count > budget:
            remaining = budget - used_tokens
            if remaining > 100:
                truncated = text[:remaining * 2]
                output.append({
                    "id": r.get("id"), "path": r.get("path"),
                    "score": r.get("score"), "rrf_score": r.get("rrf_score"),
                    "text": truncated + "...[truncated]",
                    "truncated": True, "engines": r.get("engines", [])
                })
            else:
                output.append({
                    "id": r.get("id"), "path": r.get("path"),
                    "score": r.get("score"), "rrf_score": r.get("rrf_score"),
                    "text": "", "reference_only": True,
                    "engines": r.get("engines", [])
                })
            break
        output.append({
            "id": r.get("id"), "path": r.get("path"), "source": r.get("source"),
            "score": r.get("score"), "rrf_score": r.get("rrf_score"),
            "text": text, "start_line": r.get("start_line", 0),
            "end_line": r.get("end_line", 0), "engines": r.get("engines", []),
            "time_multiplier": r.get("time_multiplier", 1.0),
            "age_days": r.get("age_days")
        })
        used_tokens += token_count
    return output, used_tokens


def unified_search(query, top_k=DEFAULT_TOP_K, mode="auto", budget=DEFAULT_BUDGET):
    t_start = time.time()
    engines = route_query(query)
    if mode != "auto":
        mode_map = {
            "memory": ["sqlite"], "keyword": ["bm25"],
            "vector": ["turboquant"], "graph": ["neo4j"],
            "full": ["sqlite", "bm25", "turboquant", "neo4j"]
        }
        engines = mode_map.get(mode, engines)

    query_vec = None
    if "sqlite" in engines or "turboquant" in engines:
        query_vec = embed_query(query)

    all_results = []
    engine_times = {}

    if "sqlite" in engines and query_vec:
        t0 = time.time()
        r = sqlite_search_vector(query, query_vec, top_k * 2)
        fts_r = sqlite_search_fts(query, top_k)
        seen = set(x["id"] for x in r)
        for fr in fts_r:
            if fr["id"] not in seen:
                r.append(fr)
                seen.add(fr["id"])
        all_results.extend(r)
        engine_times["sqlite"] = round((time.time() - t0) * 1000, 1)

    if "bm25" in engines:
        t0 = time.time()
        all_results.extend(bm25_search(query, top_k))
        engine_times["bm25"] = round((time.time() - t0) * 1000, 1)

    if "turboquant" in engines and query_vec:
        t0 = time.time()
        all_results.extend(tq_search(query_vec, top_k))
        engine_times["turboquant"] = round((time.time() - t0) * 1000, 1)

    if "neo4j" in engines:
        t0 = time.time()
        all_results.extend(neo4j_search(query, top_k))
        engine_times["neo4j"] = round((time.time() - t0) * 1000, 1)

    deduped = deduplicate(all_results)
    fused = rrf_fuse(deduped)
    budgeted, used_tokens = apply_budget(fused[:top_k * 2], budget)
    total_time = round((time.time() - t_start) * 1000, 1)

    return {
        "query": query, "engines_used": engines, "engine_times_ms": engine_times,
        "total_results": len(deduped), "returned_results": len(budgeted),
        "total_time_ms": total_time, "used_tokens": used_tokens,
        "budget": budget, "results": budgeted
    }


def main():
    import argparse
    parser = argparse.ArgumentParser(description="统一搜索引擎")
    parser.add_argument("query", help="搜索关键词")
    parser.add_argument("--top", type=int, default=DEFAULT_TOP_K, help="返回结果数")
    parser.add_argument("--mode", default="auto",
                       choices=["auto", "memory", "keyword", "vector", "graph", "full"])
    parser.add_argument("--budget", type=int, default=DEFAULT_BUDGET, help="Token预算")
    parser.add_argument("--verbose", action="store_true", help="显示调试信息")
    args = parser.parse_args()

    result = unified_search(args.query, args.top, args.mode, args.budget)

    if args.verbose:
        sys.stderr.write("Engines: %s\n" % result["engines_used"])
        sys.stderr.write("Times: %s\n" % result["engine_times_ms"])
        sys.stderr.write("Total: %d results, %d returned, %dms, %d tokens\n" % (
            result["total_results"], result["returned_results"],
            result["total_time_ms"], result["used_tokens"]))
        sys.stderr.write("---\n")

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
