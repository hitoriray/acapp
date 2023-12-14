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
