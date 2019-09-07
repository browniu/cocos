const GRID = [5, 6];/*网格形状*/
const NUMS = [2, 4];/*随机生成的数字*/
cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: cc.Label,
        score: 0,
        blockPrefab: cc.Prefab,
        blockGap: 20,
        grid: cc.Node,
        background: cc.Node,
        touchLength: 50,/*触摸响应长度，值越大，灵敏度越低*/
    },

    start() {
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
        this.onAnyDirection(direction)
    },

    onAnyDirection(direction) {

        let isMoved = false;
        let canMoveBlocks = [];

        if (direction === 'left') {
            for (let i = 0; i < GRID[0]; i++) { /*操作所有方格*/
                for (let j = 0; j < GRID[1]; j++) {
                    if (this.blocksData[i][j]) canMoveBlocks.push([i, j]);
                }
            }
        }
        if (direction === 'right') {
            for (let i = 0; i < GRID[0]; i++) { /*操作所有方格*/
                for (let j = GRID[1] - 1; j >= 0; j--) {
                    if (this.blocksData[i][j]) canMoveBlocks.push([i, j]);
                }
            }
        }
        if (direction === 'up') {
            for (let i = GRID[0] - 1; i >= 0; i--) { /*操作所有方格*/
                for (let j = 0; j < GRID[1]; j++) {
                    if (this.blocksData[i][j]) canMoveBlocks.push([i, j]);
                }
            }
        }
        if (direction === 'down') {
            for (let i = 0; i < GRID[0]; i++) { /*操作所有方格*/
                for (let j = 0; j < GRID[1]; j++) {
                    if (this.blocksData[i][j]) canMoveBlocks.push([i, j]);
                }
            }
        }

        const active = (positionIndex, callback) => { /*激活*/
            const [x, y] = positionIndex;/*当前坐标*/
            let x1, y1, range;/*获取临近目标点的坐标*/
            if (direction === 'left') {
                [x1, y1] = [x, y - 1];
                range = y === 0
            }
            if (direction === 'right') {
                [x1, y1] = [x, y + 1];
                range = y === GRID[0] - 1
            }
            if (direction === 'up') {
                [x1, y1] = [x + 1, y];
                range = x === GRID[1] - 1
            }
            if (direction === 'down') {
                [x1, y1] = [x - 1, y];
                range = x === 0
            }
            /*到顶*/
            if (range) return;
            /*临近目标格为空*/
            if (!this.blocksData[x1][y1]) {
                const currentBlock = this.blocks[x][y];
                const newPosition = this.blocksPosition[x1][y1];
                this.blocks[x1][y1] = currentBlock;
                this.blocksData[x1][y1] = this.blocksData[x][y];
                this.blocks[x][y] = null;
                this.blocksData[x][y] = 0;
                isMoved = true;
                this.blockMove(currentBlock, newPosition, () => {
                    active([x1, y1], callback);
                });
            }
            /*临近目标格同值*/
            if (this.blocksData[x1][y1] === this.blocksData[x][y]) {
                // 合并
                const currentBlock = this.blocks[x][y];
                const newPosition = this.blocksPosition[x1][y1];
                this.blocksData[x1][y1] *= 2;
                this.blocks[x1][y1].getComponent('block').setNumber(this.blocksData[x1][y1] * 2);
                // 清空被合并格子的数据并释放内存
                this.blocks[x][y] = null;
                this.blocksData[x][y] = 0;
                isMoved = true;
                this.blockMove(currentBlock, newPosition, () => {
                    currentBlock.destroy();
                });
            }

            callback && callback()
        };

        canMoveBlocks.forEach((block, i) => {
            active(block, () => {
                if (i === (canMoveBlocks.length - 1) && isMoved) {
                    canMoveBlocks = [];
                    this.addBlock();
                }
            })
        })
    },

    blockMove(block, position, callback) {
        const move = cc.moveTo(0.2, position).easing(cc.easeCubicActionOut());
        const call = callback ? cc.callFunc(callback) : () => undefined;
        block.runAction(cc.sequence(move, call));
    },

    getNextBlockIndexAndRange(vec, direction) {
        const [i, j] = vec;
        let nextBlockIndex = [];
        let blockRange = false;
        let i2, j2;
        switch (direction) { /*确定目标方格的位置*/
            case 'left':
                j2 = j - 1;
                nextBlockIndex = [i, j2];
                blockRange = j === 0;
                break;
            case 'right':
                j2 = j + 1;
                nextBlockIndex = [i, j2];
                blockRange = j2 === GRID[0] - 1;
                break;
            case 'up':
                i2 = i + 1;
                nextBlockIndex = [i2, j];
                blockRange = i2 === GRID[1] - 1;
                break;
            case 'down':
                i2 = i - 1;
                nextBlockIndex = [i2, j];
                blockRange = i === 0;
        }
        return {nextBlockIndex, blockRange}
    },

    vecDirection(vec) {/*向量差的方向*/
        let direction = Math.abs(vec.x) > Math.abs(vec.y) ? 'landscape' : 'vertical';/*先判断水平或者垂直方向*/
        if (direction === 'landscape') direction = vec.x > 0 ? 'left' : 'right';/*判断左右*/
        else direction = vec.y > 0 ? 'down' : 'up';/*判断上下*/
        return direction
    }

});
