import colors from './colors'

cc.Class({
    extends: cc.Component,

    properties: {
        number: cc.Label
    },

    start() {

    },
    setNumber: function (num) {
        if (num === 0) this.number.node.active = false;/*数字为零时隐藏*/
        this.number.string = num;
        if (num in colors) this.node.color = colors[num]/*设置当前节点的颜色*/
    }
});
