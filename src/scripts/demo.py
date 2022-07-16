import json
obj = input()
obj = json.loads(obj)

obj['Demo'] = "I am modified"

print(json.dumps(obj))
