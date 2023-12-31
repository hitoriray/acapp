class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            设置
        </div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        // 将三个选项的按钮搞出来
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode'); // 注意前面要加.
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            //console.log("clock single mode");
            outer.hide();
            outer.root.playground.show();
        });

        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });

        this.$settings.click(function(){;
        });
    }

    show() {  // 显示menu界面
        this.$menu.show(); // 调用jquery里的api
    }

    hide() { // 关闭menu界面
        this.$menu.hide();
    }
}
