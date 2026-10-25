"""
第 1 层：文本归一化预处理
===========================================
作用：把"花里胡哨"的违规变体还原成正常文本，再交给规则引擎匹配。
这是防御绕审的第一道关口。

对应项目计划书 4.3 第 1 层：
  编写正则规则与替换字典，实现谐音、拆字、拼音、emoji、特殊符号的
  标准化还原，将变体内容转化为标准文本。

当前是"能跑通的最小版本"，字典和规则后续按测试样本持续扩充。
"""

import re
import unicodedata

# ---------- emoji → 文字 的简易映射（示例，后续扩充） ----------
EMOJI_MAP = {
    "🐶": "狗",
    "🐷": "猪",
    "💩": "屎",
}

# ---------- 谐音 / 拼音 替换字典（示例，后续扩充） ----------
# 注意1：字典的 key 不要带空格和标点——去干扰字符发生在替换之前，
#        "苯 蛋" 会先被还原成 "苯蛋" 才能被匹配到。
# 注意2：这类字典是双刃剑，替换太激进会误伤正常内容，要边测试边调。
HOMOPHONE_MAP = {
    "苯蛋": "笨蛋",     # 谐音
    "bendan": "笨蛋",   # 拼音
    "shazi": "傻子",    # 拼音
}

# ---------- 干扰字符：空格、标点、各种符号（对抗"拆字""插符号"） ----------
# 说明：去掉它们是为了让 "苯//蛋" "苯 蛋" 这类变体还原成 "苯蛋"。
# 代价是英文单词间的空格也会被删——演示版先这样，真实方案会区别对待中英文。
NOISE_RE = re.compile(r"[\s\-_*#$%^&+=/\\|~`.,;:!?()[\]{}<>\"'@]+")


def to_halfwidth(text: str) -> str:
    """全角转半角：！→! 、Ａ→A、１→1（NFKC 一步搞定）"""
    return unicodedata.normalize("NFKC", text)


def replace_emoji(text: str) -> str:
    """把 emoji 替换成对应文字"""
    for emoji, word in EMOJI_MAP.items():
        text = text.replace(emoji, word)
    return text


def replace_homophone(text: str) -> str:
    """谐音 / 拼音替换"""
    text = text.lower()
    for src, dst in HOMOPHONE_MAP.items():
        text = text.replace(src, dst)
    return text


def remove_noise(text: str) -> str:
    """去掉干扰字符（空格、标点、符号）"""
    return NOISE_RE.sub("", text)


def normalize(text: str) -> str:
    """归一化总入口：按顺序走完所有还原步骤

    顺序有讲究：先去干扰字符，再做谐音替换——否则 "苯//蛋" 里的
    斜杠没去掉，"苯蛋" 就匹配不上字典。（第一版就把顺序写反了，翻车现场）
    """
    text = to_halfwidth(text)       # 1. 全角 → 半角
    text = replace_emoji(text)      # 2. emoji → 文字
    text = remove_noise(text)       # 3. 去干扰字符（先还原"苯//蛋"→"苯蛋"）
    text = replace_homophone(text)  # 4. 谐音 / 拼音替换（此时才能匹配上）
    return text


if __name__ == "__main__":
    # 单独测试本层：python moderation/normalize.py
    samples = ["苯//蛋", "笨🐷蛋", "ｂｅｎｄａｎ", "bendan!!", "今天天气真好"]
    for s in samples:
        print(f"{s!r} → {normalize(s)!r}")
