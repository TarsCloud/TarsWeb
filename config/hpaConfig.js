// matchType 0精确匹配 1.正则匹配
const indicators = [
    {
        "matchType": "exact",
        "match": "cpu",
        "type": "Resource",
        "target": [{"type": "AverageUtilization", "suffix": ""}],
    },
    {
        "matchType": "exact",
        "match": "memory",
        "type": "Resource",
        "target": [{"type": "AverageValue", "suffix": "m"}],
    },
    {
        "matchType": "regex",
        "match": "^ts_",
        "type": "Object",
        "target": [{"type": "AverageValue", "suffix": "m"}],
    }
]

module.exports = indicators;
