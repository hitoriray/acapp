from django.db import models  # 导入所需要用到的包
from django.contrib.auth.models import User

# player.py 用来存储player这个数据表的信息


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # 当我们删掉user时，与其关联的Player会一起被删掉
    photo = models.URLField(max_length=256, blank=True)  # 头像

    def __str__(self):  # 控制其在表中显示的字符串
        return str(self.user)  # 直接返回用户名即可

