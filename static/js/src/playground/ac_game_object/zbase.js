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
