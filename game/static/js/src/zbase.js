export class AcGame {  // 在前面加上export关键字，用于web.html中导入该类
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        //this.menu = new AcGameMenu(this);  // 先注释掉菜单界面方便调试游戏界面
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {
    }
}
