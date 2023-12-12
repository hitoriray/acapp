from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center">术士之战</h1>'
    line4 = '<a href="/play/">进入游戏界面</a>'
    line3 = '<hr>'
    line2 = '<img src="https://img.3dmgame.com/uploads/allimg/170406/363_170406132853_2.png">'
    return HttpResponse(line1 + line4 + line3 + line2)


def play(request):
    line1 = '<h1 style="text-align: center">游戏界面</h1>'
    line3 = '<a href="/">返回主界面</a>'
    line2 = '<img src="https://syimg.3dmgame.com/uploadimg/img/2017/1026/1508980192918294.png">'
    return HttpResponse(line1 + line3 + line2)
