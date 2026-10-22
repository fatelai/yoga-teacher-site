"""產生「小編後台展示版」單一 HTML 檔：tools/demo/dist/admin-demo.html

把 content/site/site.json、src/styles/global.css 和 public/uploads 的圖片
內嵌進 admin-demo.template.html，方便發佈成一個分享連結。

用法：python tools/demo/build_demo.py
"""
import base64
import json
import mimetypes
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent


def embed_images(node):
    if isinstance(node, dict):
        return {k: embed_images(v) for k, v in node.items()}
    if isinstance(node, list):
        return [embed_images(v) for v in node]
    if isinstance(node, str) and node.startswith("/uploads/"):
        path = ROOT / "public" / node.lstrip("/")
        mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
        return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"
    return node


def main() -> None:
    data = embed_images(json.loads((ROOT / "content/site/site.json").read_text(encoding="utf-8")))
    css = (ROOT / "src/styles/global.css").read_text(encoding="utf-8")
    html = (HERE / "admin-demo.template.html").read_text(encoding="utf-8")
    # 避免 </script> 出現在內嵌字串裡
    dump = lambda o: json.dumps(o, ensure_ascii=False).replace("</", "<\\/")
    html = html.replace("__DATA__", dump(data), 1).replace("__SITE_CSS__", dump(css), 1)

    out = HERE / "dist" / "admin-demo.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"OK {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
