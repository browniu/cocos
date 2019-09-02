cc.Class({
    extends: cc.Component,

    properties: {
        pickRadius: 100,
    },
    update: function () {
        if (this.getPlayDistance() < this.pickRadius) { /*每帧判断和主角的距离是否小于可收集的范围*/
            this.onPicked();
        }
        // 根据计时器更新星星的状态
        const opacityRatio = 1 - this.game.timer / this.game.starDuration;
        const minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity))
    },
    getPlayDistance: function () {
        // 根据player 节点的位置判断距离
        const playerPos = this.game.player.getPosition();
        // 计算距离
        return this.node.position.sub(playerPos).mag()
    },
    onPicked: function () {
        this.game.spawnNewStar();/*当星星被收集时，调用Game脚本中的接口，生成一个新的星星*/
        this.game.gainScore();　/*调用得分*/
        this.node.destroy()/*然后销毁当前的星星节点*/
    }
});
