# Cocos 学习手册
learn cocos creater

## 触摸输入
### 载入
```JavaScript
onload:function () {
  var touchReceiver = cc.Canvas.instance.node;
  touchReceiver.on('touchstart', this.onTouchStart, this);
  touchReceiver.on('touchend', this.onTouchEnd, this);
}
```
### 卸载
```JavaScript
onDestroy () {
    var touchReceiver = cc.Canvas.instance.node;
    touchReceiver.off('touchstart', this.onTouchStart, this);
    touchReceiver.off('touchend', this.onTouchEnd, this);
},
```
### 绑定事件
```JavaScript
onTouchStart (event) {
    var touchLoc = event.getLocation();
    if (touchLoc.x >= cc.winSize.width/2) {
        cc.log('right')
    } else {
        cc.log('left')
    }
},
onTouchEnd (event) {
cc.log('null')
},
```

## 形变动画
```JavaScript
// 形变定义
var squash = cc.scaleTo(this.squashDuration, 1, 0.6);
var stretch = cc.scaleTo(this.squashDuration, 1, 1.2);
var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);
// 调用
cc.repeatForever(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback));
```
## 空间穿梭
```JavaScript
if ( this.node.x > this.node.parent.width/2) {
    this.node.x = -this.node.parent.width/2;
    this.xSpeed = 0;
} else if (this.node.x < -this.node.parent.width/2) {
    this.node.x = this.node.parent.width/2;
    this.xSpeed = 0;
}
```