# cocos 学习手册
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