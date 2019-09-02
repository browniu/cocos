const GRID = [4, 4];/*网格形状*/
const NUMS = [2, 4];/*随机生成的数字*/
cc.Class({
    extends: cc.Component,

    properties: {//属性配置
        scoreLabel: cc.Label,
        score: 0,
        blockPrefab: cc.Prefab,
        blockGap: 20,
        grid: cc.Node,
        background: cc.Node,
        touchLength: 50,/*触摸响应长度，值越大，灵敏度越低*/
    },

    start() {/*生命周期*/
        this.drawBlocks(GRID[0], GRID[1]);
        this.init();
        this.addEventHandler()
    },

    drawBlock([x, y], num) {/*绘制单个方格*/
        const block = cc.instantiate(this.blockPrefab);/*克隆或者从预制中生成模块*/
        this.grid.addChild(block);/*挂载入已经挂载的对象中*/
        block.setPosition(cc.v2(x, y));
        block.width = block.height = this.blockSize;
        block.getComponent('block').setNumber(num);
        return block
    },

    drawBlocks(column, row) {/*绘制网格*/
        this.blockSize = (cc.winSize.width - this.blockGap * (column + 1)) / column;
        this.blocksPosition = [];
        for (let i = 0; i < row; i++) {
            this.blocksPosition.push([0, 0, 0, 0]);
            for (let j = 0; j < column; j++) {
                const x = this.blockGap + (this.blockGap + this.blockSize) * (j);
                const y = this.blockGap + (this.blockGap + this.blockSize) * (i);
                this.drawBlock([x, y], 0);
                this.blocksPosition[i][j] = cc.v2(x, y);/*存储位置*/
            }
        }
    },

    init() {/*归零*/
        this.updateScore(0);
        if (this.blocks) {/*内存回收*/
            for (let i = 0; i < this.blocks; i++) {
                for (let j = 0; j < this.blocks[i].length; j++) {
                    if (this.blocks[i][j]) this.blocks[i][j].destroy()
                }
            }
        }
        this.blocks = [];
        this.blocksData = [];
        for (let i = 0; i < GRID[0]; i++) {/*初始化数据*/
            this.blocks.push([null, null, null, null]);
            this.blocksData.push([0, 0, 0, 0])
        }
        /*开局模块*/
        this.addBlock();
        this.addBlock();
        this.addBlock();
    },

    updateScore(num) {/*更新分数*/
        this.score = num;
        this.scoreLabel.string = `Score:${num}`
    },

    getEmptyBlock: function () {/*获取空模块*/
        const emptys = [];
        for (let i = 0; i < this.blocks.length; i++) {
            for (let j = 0; j < this.blocks[i].length; j++) {
                const block = this.blocks[i][j];
                if (!block) emptys.push([i, j])
            }
        }
        return emptys
    },

    addBlock() {/*增加开局初始化模块*/
        const emptys = this.getEmptyBlock();/*查询空闲的方块*/
        if (!emptys.length) return false;/*为空直接返回*/
        const [i, j] = emptys[Math.floor(Math.random() * emptys.length)];/*随机挑选一个方块，返回他的序列号*/
        const position = this.blocksPosition[i][j];/*读取该方块的位置信息*/
        const num = NUMS[Math.floor(Math.random() * NUMS.length)];/*从初始数组中挑选一个数字*/
        this.blocks[i][j] = this.drawBlock([position.x, position.y], num);/*绘制并存储这个方块*/
        this.blocksData[i][j] = num;/*存储该坐标下方块的数据*/
    },

    addEventHandler() {
        const touchReceiver = cc.Canvas.instance.node;
        touchReceiver.on('touchstart', this.onTouchStart, this);
        touchReceiver.on('touchcancel', this.onTouchEnd, this);
        touchReceiver.on('touchend', this.onTouchEnd, this)
    },

    onTouchStart(e) {
        this.touchStartPoint = e.getLocation()
    },

    onTouchEnd(e) {
        this.touchEndPoint = e.getLocation();
        const vec = this.touchStartPoint.sub(this.touchEndPoint);
        if (vec.mag() < this.touchLength) return;
        const direction = this.vecDirection(vec);
        switch (direction) {
            case 'left':
                this.onLeft();
                break;
            case 'right':
                this.onRight();
        }
        cc.log(direction)
    },
    onLeft() {

        const move = (positionIndex) => {/*移动*/
            const [x, y] = positionIndex;
            if (y === 0 || !this.blocksData[x][y]) {/*到顶或者为空是结束迭代*/
                cc.log(1)
            } else if (!this.blocksData[x][y - 1]) {/*前一格为空*/
                // 移动
                const currentBlock = this.blocks[x][y];
                const newPosition = this.blocksPosition[x][y - 1];
                this.blocks[x][y - 1] = currentBlock;
                this.blocksData[x][y - 1] = this.blocksData[x][y];
                this.blocks[x][y] = null;
                this.blocksData[x][y] = 0;
                this.blockMove(currentBlock, newPosition, () => {
                    cc.log('auto');
                    move([x, y - 1]);
                });
            } else if (this.blocksData[x][y - 1] === this.blocksData[x][y]) {/*与前一格相同*/
                // 合并
                const currentBlock = this.blocks[x][y];
                const newPosition = this.blocksPosition[x][y - 1];
                this.blocksData[x][y - 1] *= 2;
                this.blocks[x][y - 1].getComponent('block').setNumber(this.blocksData[x][y - 1] * 2);
                // 清空被合并格子的数据并释放内存
                this.blocks[x][y] = null;
                this.blocksData[x][y] = 0;
                this.blockMove(currentBlock, newPosition, () => {
                    currentBlock.destroy()
                });
            } else cc.log(4)/*与前一格不同*/
        };

        const blocks = [];/*获取全部可操作方块*/
        for (let i = 0; i < GRID[0]; i++) {/*遍历查找方块*/
            for (let j = 0; j < GRID[1]; j++) {
                if (this.blocksData[i][j]) blocks.push({x: i, y: j})
            }
        }

        for (let i = 0; i < blocks.length; i++) {
            move([blocks[i].x, blocks[i].y], (num) => {
                cc.log('case:' + num)
            })
        }


    },
    onRight() {
    },
    /**
     * 移动格子
     * @param {cc.Node} block
     * @param {array} position
     * @param {function} callback
     * **/
    blockMove(block, position, callback) {
        const move = cc.moveTo(0.2, position).easing(cc.easeCubicActionOut());
        const call = callback ? cc.callFunc(callback) : () => undefined;
        block.runAction(cc.sequence(move, call));
    },

    vecDirection(vec) {/*向量差的方向*/
        let direction = Math.abs(vec.x) > Math.abs(vec.y) ? 'landscape' : 'vertical';/*先判断水平或者垂直方向*/
        if (direction === 'landscape') direction = vec.x > 0 ? 'left' : 'right';/*判断左右*/
        else direction = vec.y > 0 ? 'down' : 'up';/*判断上下*/
        return direction
    }

});
