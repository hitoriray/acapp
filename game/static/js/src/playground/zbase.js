class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<div>
游戏界面
</div>
`);

        this.hide();  // 先关闭playground界面
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

    }

    show() {  // 打开playground界面
        this.$playground.show();
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}
