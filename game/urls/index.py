from django.urls import path, include
from game.views.index import index  # 导入指定目录下的index函数，也就是总函数

urlpatterns = [
    path("", index, name="index"),
    path("menu/", include("game.urls.menu.index")),
    path("playground/", include("game.urls.playground.index")),
    path("settings/", include("game.urls.settings")),
]
