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
let AC_GAME_OBJECTS = [];  // 定义一个数组存放每一个对象

class AcGameObject {  // 游戏对象的基类
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // 记录是否执行过start函数
        this.timedelta = 0;  // 当前帧距离上一帧的时间间隔，单位：ms
    }

    start() {
    }

    update() {

    }

    on_destroy() {  // 在被销毁前执行一次
    }

    destroy() {
        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1); // 删除
                break;
            }
        }
    }

}

let last_timestamp;  // 记录上一帧的时间戳
let AC_GAME_ANIMATION = function(timestamp) {  // timestamp：时间戳

    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;  // 更新为上一帧的时间戳

    requestAnimationFrame(AC_GAME_ANIMATION);  // 递归调用该API
}

requestAnimationFrame(AC_GAME_ANIMATION);  // js的API
class GameMap extends AcGameObject {
    constructor(playground) {
        super();  // 调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);  // canvas：画布
        this.ctx = this.$canvas[0].getContext('2d');  // 把context存下来
        this.ctx.canvas.width = this.playground.width;  // 设置宽度和高度
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);  // 将canvas加入$playground中
    }

    start() {
    }
    
    update() {
        this.render();  // 每一帧都要渲染
        

    }

    render() {  // 渲染函数
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";  // 渲染成黑色
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);  // 画矩形

    }
}
class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;  // vx表示x方向上的速度，初始化为0
        this.vy = 0;  // vy表示y方向上的速度
        this.damage_x = 0;  // 玩家被攻击到后，受到冲击力的x,y,speed
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9;  // 玩家被攻击到后向后退的摩擦力

        this.cur_skill = null;  // 记录当前选择的技能
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {  // 敌人的ai随机移动功能
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }


    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;  // 直接return false截胡这个事件，表示不处理它
        });  // 关闭右键会弹出菜单界面
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (e.which === 3) {  // 左键:1；滚轮:2；右键:3
                outer.move_to(e.clientX, e.clientY);
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {  // 选中火球后左键释放火球
                    outer.shoot_fireball(e.clientX, e.clientY);  // 朝向鼠标点击处发射火球
                }

                outer.cur_ckill = null;  // 清空cur_skill
            }
        });

        $(window).keydown(function(e) {
            if (e.which === 81) {  // Q键
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {  // 发射火球
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;  // 设置火球半径
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;  // 设置火球速度
        let move_length = this.playground.height * 1;  // 设置火球射程
        let damage = this.playground.height * 0.01;  // 这里的伤害值为玩家的20%血量
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);  // 求出两点间的欧几里得距离
        let angle = Math.atan2(ty - this.y, tx - this.x);  // 求出两点直线与横坐标轴的夹角
        this.vx = Math.cos(angle);  // x方向上速度
        this.vy = Math.sin(angle);  // y方向上速度
    }

    is_attacked(angle, damage) {
        this.radius -= damage;  // 血量等于半径值
        if (this.radius < 10) {  // 当半径值小于10px，表示死亡
            this.destroy();
            return false;
        }

        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 50;  // 被攻击到的后退速度
        this.speed *= 0.8;  // 每次被攻击后的速度变化
    }

    update() {
        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;  // 一旦被伤害，失去角色控制权
            this.move_length = 0;
            // 朝着damage_speeed方向移动
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {  // 每一帧的x,y加上vx,vy，就能实现“动起来”
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {  // ai不能停下来，一旦停止就继续移动到另一个随机点
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);  // 真实移动距离
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();  // 填充颜色
    }
}
class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;  // 火球的射程
        this.damage = damage;  // 火球的伤害
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;


        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player != player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2, dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;  // 攻击到了，返回true
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        //this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);  // 创建地图
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        // 创建5个敌人
        for (let i = 0; i < 5; i ++ ) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "blue", this.height * 0.15, false));
        }

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
