import { expect, test } from "bun:test";
import { alignWord, rubyHtml } from "../src/lib/chinese/ruby";
const py = (h: string, p: string) => alignWord(h, p).segs.map((s) => `${s.han}:${s.py}`).join(" ");
test("basic", () => {
  expect(py("你好", "ni3 hao3")).toBe("你:nǐ 好:hǎo");
  expect(py("毛毛虫", "mao2 mao2 chong2")).toBe("毛:máo 毛:máo 虫:chóng");
  expect(py("女儿", "nu:3 er2")).toBe("女:nǚ 儿:ér");
  expect(py("儿子", "er2 zi5")).toBe("儿:ér 子:zi");
  expect(py("东西", "dong1 xi5")).toBe("东:dōng 西:xi");
});
test("erhua", () => {
  expect(py("这儿", "zher4")).toBe("这:zhè 儿:r");
  expect(py("哪儿", "nar3")).toBe("哪:nǎ 儿:r");
  expect(py("一会儿", "yi1 huir4")).toBe("一:yī 会:huì 儿:r");
  expect(py("一点儿", "yi1 dian3r")).toBe("一:yī 点:diǎn 儿:r");
});
test("mismatch falls back to whole word", () => {
  const r = alignWord("你好吗", "ni3 hao3");
  expect(r.aligned).toBe(false); expect(r.segs.length).toBe(1);
});
test("non-han", () => { expect(py("3个", "ge4")).toBe("3: 个:gè"); });
test("html", () => { expect(rubyHtml([{ w: "这儿", p: "zher4" }])).toContain(">r<"); });
