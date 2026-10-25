"""
审核引擎入口
===========================================
把各层串起来，对一条内容给出审核结论和处置建议。

对应项目计划书 4.2 的分级处置策略：
  high   明显违规 → 直接拦截，提示违规原因
  low    轻度违规 → 提醒用户修改后重试（演示版先不细分）
  unsure 无法确定 → 转人工复核（第 3 层 AI 语义兜底 + 人工，后续实现）
  pass   判定正常 → 直接放行

当前进度：
  [x] 第 1 层 归一化（normalize.py）
  [x] 第 2 层 规则引擎（rules.py）
  [ ] 第 3 层 AI 语义兜底（智谱 GLM，待对接）
"""

from normalize import normalize
from rules import match_words

# 风险等级
LEVEL_HIGH = "high"      # 明显违规
LEVEL_UNSURE = "unsure"  # 无法确定
LEVEL_PASS = "pass"      # 正常


def review(text: str) -> dict:
    """审核一条文本，返回结论字典

    返回示例：
        {"level": "high", "action": "block", "reason": "命中敏感词：笨蛋", ...}
    """
    normalized = normalize(text)      # 第 1 层：还原变体
    hits = match_words(normalized)    # 第 2 层：敏感词匹配

    if hits:
        return {
            "level": LEVEL_HIGH,
            "action": "block",
            "reason": f"命中敏感词：{'、'.join(hits)}",
            "hits": hits,
            "normalized": normalized,
        }

    # 第 3 层 AI 语义兜底还没接，先全部放行
    # TODO: 对接智谱 GLM 后，对规则层没把握的内容做深度语义判断
    return {
        "level": LEVEL_PASS,
        "action": "allow",
        "reason": "未发现违规",
        "hits": [],
        "normalized": normalized,
    }


if __name__ == "__main__":
    # 自己跑一下看看效果：在 backend 目录执行
    #   python moderation/engine.py
    demos = [
        "今天天气真好，适合去图书馆自习",   # 正常内容
        "你就是个笨蛋",                    # 直接命中词库
        "苯//蛋",                          # 插符号拆字，归一化后现形
        "bendan",                          # 拼音变体，替换后现形
        "傻🐶",                            # emoji 夹带，替换后现形
    ]
    for text in demos:
        result = review(text)
        print(f"原文：{text}")
        print(f"归一：{result['normalized']}")
        print(f"结论：{result['level']} → {result['action']}（{result['reason']}）")
        print("-" * 45)
