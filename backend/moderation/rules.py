"""
第 2 层：本地规则引擎（敏感词匹配）
===========================================
对应项目计划书 4.3 第 2 层：
  基于 Aho-Corasick 自动机算法实现高效多模式敏感词匹配，
  毫秒级拦截明确违规内容，支持敏感词分类管理。

当前版本：用 Python 自带的 in 判断跑通流程（词库几百条以内完全够用）。
后续升级：pip install pyahocorasick，一次扫描匹配所有词，
          对外接口不变，上层无感知。
"""

from pathlib import Path

WORDS_FILE = Path(__file__).with_name("words.txt")


def load_words(path: Path = WORDS_FILE) -> list:
    """从 words.txt 加载敏感词，每行一个，# 开头为注释"""
    words = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            words.append(line)
    return words


# 模块加载时读一次词库（演示版做法；真实项目可加缓存和热更新）
SENSITIVE_WORDS = load_words()


def match_words(text: str) -> list:
    """返回文本中命中的敏感词列表"""
    return [w for w in SENSITIVE_WORDS if w in text]


if __name__ == "__main__":
    # 单独测试本层：python moderation/rules.py
    print(f"词库共 {len(SENSITIVE_WORDS)} 个词：{SENSITIVE_WORDS}")
    print(match_words("你是个笨蛋和傻子"))
