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
        this.spent_time = 0;  // 记录进入游戏时生成玩家的保护期

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
            const rect = outer.ctx.canvas.getBoundingClientRect();  // 获取相对坐标
            if (e.which === 3) {  // 左键:1；滚轮:2；右键:3
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);  // 移动到鼠标真正点击的坐标上
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball" && outer.radius >= 10) {  // 玩家如果存活，那么选中火球后左键释放火球
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);  // 朝向鼠标点击处发射火球
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
        for (let i = 0; i < 15 + Math.random() * 10; i ++ ) {  // 一旦被击中就产生粒子效果
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;  // 血量等于半径值
        if (this.radius < 10) {  // 当半径值小于10px，表示死亡
            this.destroy();
            return false;
        }

        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 50;  // 被攻击到的后退速度
        this.speed *= 1.1;  // 每次被攻击后的速度变化（变慢）
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) {  // 保证新手保护期过后才开始攻击玩家，并且每5秒攻击一次
            let player = this.playground.players[0];  // 每次朝玩家发射火球
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;  // 预判玩家0.3秒后的位置发射火球
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

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

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ ){
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}
