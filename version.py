import re,time,sys
from datetime import datetime

# 从标准输入读取Git传来的内容
content = sys.stdin.read()

# 执行版本号替换
new_content = re.sub(
    r'(// @version\s+).*',
    lambda m: m.group(1) + datetime.now().strftime('%Y-%m-%d')+f'.{int(time.time()%86400)}',
    content
)

# 输出修改后的内容
print(new_content, end='')