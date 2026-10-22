import sys, os
import os
_here=os.path.dirname(os.path.abspath(__file__))
src=os.path.join(_here,"src")+os.sep
_x=os.path.join(_here,"vendor","xlsx.mini.min.js")
if not os.path.exists(_x):
    _x=os.path.join(_here,"package","dist","xlsx.mini.min.js")
xlsx=open(_x,encoding="utf-8").read()

STUB = ("<script>\n/* Student edition: no model answers ship in this file. */\n"
        "var FACILITATOR = false;\nvar MODEL_ANSWERS = {};\nvar WORKED_EXAMPLE = null;\n</script>\n")

def build(facilitator):
    out=[]
    head=open(src+"01_head.html",encoding="utf-8").read()
    body=open(src+"02_body.html",encoding="utf-8").read()
    if facilitator:
        head=head.replace("<title>AI Eval Framework</title>","<title>AI Eval Framework (Facilitator)</title>")
        body=body.replace('AI Evaluation Framework <span class="ver"','AI Evaluation Framework <span class="ver"')
    out.append(head); out.append(body)
    out.append("<script>\n/* SheetJS (xlsx 0.18.5 mini), inlined so the app runs fully offline */\n")
    out.append(xlsx); out.append("\n</script>\n")
    out.append(open(src+"03_spec.js",encoding="utf-8").read())
    out.append(open(src+"03b_v2spec.js",encoding="utf-8").read())
    out.append(open(src+"10_answers.js",encoding="utf-8").read() if facilitator else STUB)
    out.append(open(src+"11_mindmap.js",encoding="utf-8").read())
    for f in ["04_core.js","04b_req.js","05_views.js","05b_reqviews.js","06_canvas.js"]:
        out.append(open(src+f,encoding="utf-8").read())
    if facilitator:
        # the facilitator guide, the role cards and the model answers are all
        # facilitator material and are simply absent from the student build
        for f in ["08_guide.js","09_guide_ui.js"]:
            out.append(open(src+f,encoding="utf-8").read())
    out.append(open(src+"07_export.js",encoding="utf-8").read())
    html="\n".join(out)
    name="AI_Evaluation_Framework_FACILITATOR.html" if facilitator else "AI_Evaluation_Framework.html"
    open(os.path.join(_here,name),"w",encoding="utf-8").write(html)
    print("built", name, len(html)//1024, "KB")
    return name, html

for fac in (False, True):
    build(fac)

# safety check: the student build must contain none of the answer text
stu=open(os.path.join(_here,"AI_Evaluation_Framework.html"),encoding="utf-8").read()
probes=["Two of the passes were fails","recorded pass sitting over a computed fail",
        "WORKED_EXAMPLE = {","var TAB_GUIDE","var STEP_GUIDE","var ROLE_CARDS","gdRolesHTML",
        "ML-IMPACT calibration error: 0.12","Iceberg-depth intervention classification, pilot phase",
        "ROLE-RAI Responsible AI and Model Governance Lead. Person to be named",
        "controlled pilot with seven conditions"]
leaks=[p for p in probes if p in stu]
print("student build leak check:", "CLEAN" if not leaks else ("LEAKED: "+str(leaks)))
print("student build MODEL_ANSWERS size:", stu.count("MODEL_ANSWERS = {};"))
