#!/usr/bin/env python3
"""Konversi seed SQL web (supabase/seed/*.sql) -> JSON offline untuk aplikasi mobile.
Pemakaian: python3 scripts/sql_to_json.py <folder supabase/seed> <folder tujuan src/data/q>"""
import re, sys, json, os, glob

def parse_values(sql):
    m = re.search(r'insert into questions \(([^)]*)\) values', sql)
    cols = [c.strip() for c in m.group(1).split(',')]
    i, n, rows = m.end(), len(sql), []
    while i < n:
        while i < n and sql[i] in ' \n\r\t,': i += 1
        if i >= n or sql[i] == ';': break
        assert sql[i] == '(', sql[i:i+40]
        i += 1; vals = []
        while True:
            while sql[i] in ' \n\r\t': i += 1
            if sql[i] == "'":
                j = i + 1; buf = []
                while True:
                    k = sql.index("'", j)
                    buf.append(sql[j:k])
                    if k + 1 < n and sql[k+1] == "'": buf.append("'"); j = k + 2
                    else: i = k + 1; break
                s = ''.join(buf)
                if sql.startswith('::jsonb', i): i += 7; s = json.loads(s)
                vals.append(s)
            elif sql.startswith('null', i): vals.append(None); i += 4
            else:
                m2 = re.match(r'-?\d+', sql[i:]); vals.append(int(m2.group())); i += m2.end()
            while sql[i] in ' \n\r\t': i += 1
            if sql[i] == ',': i += 1; continue
            if sql[i] == ')': i += 1; break
            raise ValueError(sql[i:i+60])
        assert len(vals) == len(cols), (len(vals), len(cols))
        rows.append(dict(zip(cols, vals)))
    return rows

K = {'prompt':'p','prompt_en':'pe','code':'c','language':'l','options':'o','options_en':'oe','correct_index':'a','explanation':'x','explanation_en':'xe','hint':'h','hint_en':'he','hint2':'h2','hint2_en':'h2e','hint3':'h3','hint3_en':'h3e'}
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
by = {}
for f in sorted(glob.glob(os.path.join(src, '*.sql'))):
    for r in parse_values(open(f, encoding='utf-8').read()):
        by.setdefault(r['difficulty'], []).append({K[k]: v for k, v in r.items() if k in K and v is not None})
for d, rows in by.items():
    json.dump(rows, open(os.path.join(dst, d + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(d, len(rows))
