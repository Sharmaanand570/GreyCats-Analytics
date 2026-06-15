import re

with open('c:/greycats/greycats-analytics/greycats-analytics-v1/scratch/v79_real_extract/dist/assets/LandingPage-Ct-R1CtO.js', 'r', encoding='utf-8') as f:
    code = f.read()
    matches = re.findall(r'title:\"(Analytics|Reports|SEO Tools|Scheduler|Broadcast)\",desc:\"([^\"]+)\"', code)
    for m in matches:
        print(f'{m[0]}: {m[1]}')
