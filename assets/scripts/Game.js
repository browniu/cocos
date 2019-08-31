cc.Class({
    extends: cc.Component,

    properties: {
        // 调用预制星星
        starPrefab: {
            default: null,
            type: cc.Prefab
        },
        //  星星的消失时间
        maxStarDuration: 5,
        minStarDuration: 3,
        // 挂载地面节点
        ground: {
            default: null,
            type: cc.Node
        },
        // 挂载主角节点
        player: {
            default: null,
            type: cc.Node
        },
        // 挂载得分的组件引用
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        scoreAudio: {/*挂载得分音效*/
            default: null,
            type: cc.AudioClip
        }
    },

    onLoad: function () {
        this.timer = 0; /*初始化计时器*/
        this.starDuration = 0;
        // 获取地面的Y坐标
        this.groundY = this.ground.height / 2;
        // 生成一个新的星星
        this.spawnNewStar();
        // 初始化记分
        this.score = 0
    },
    update: function (dt) {
        if (this.timer > this.starDuration) {/*超时没有重置计时器则判断失败*/
            this.gameOver();
            return
        }
        this.timer += dt;/*每帧更新计时器 */
    },
    gainScore: function () { /*得分逻辑*/
        this.score += 1;
        this.scoreDisplay.string = `Score: ${this.score}`;/*更新显示*/
        cc.audioEngine.playEffect(this.scoreAudio, false)/*播放音效*/
    },
    // 生成新的星星
    spawnNewStar: function () {
        // 使用预制模版生成节点
        const newStar = cc.instantiate(this.starPrefab);
        this.node.addChild(newStar);
        newStar.setPosition(this.getNewStarPosition());
        //在星星组件上暂存 Game对象的引用
        newStar.getComponent('Star').game = this;
        // 重置计时器
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },
    // 获取一个新的随机位置
    getNewStarPosition: function () {
        const randY = this.groundY + (Math.random() - 0.5) * this.player.getComponent('Player').jumpHeight - 50;
        const maxX = this.node.width / 2;
        const randX = (Math.random() - 0.5) * 2 * maxX;
        return cc.v2(randX, randY)
    },
    // 失败逻辑
    gameOver: function () {
        cc.log('game over');
        this.score = 0;
        this.scoreDisplay.string = `Score: 0`;/*更新显示*/
    }
});
