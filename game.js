/**
 * 贪吃蛇游戏 - Snake Game
 * 使用 HTML5 Canvas 实现
 */

// 游戏配置常量
const GAME_CONFIG = {
    canvasSize: 400,
    gridSize: 20,
    initialSpeed: 150,
    colors: {
        background: '#1a1a2e',
        snakeHead: '#4ecca3',
        snakeBody: '#45b393',
        food: '#e74c3c',
        grid: '#2d2d44'
    }
};

// 游戏状态
let canvas, ctx;
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop = null;

// DOM 元素
let scoreElement, overlayElement, overlayTitle, overlayMessage;
let startBtn, pauseBtn, restartBtn;

/**
 * 游戏初始化
 */
function initGame() {
    // 获取 DOM 元素
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    scoreElement = document.getElementById('score');
    overlayElement = document.getElementById('gameOverlay');
    overlayTitle = document.getElementById('overlayTitle');
    overlayMessage = document.getElementById('overlayMessage');
    startBtn = document.getElementById('startBtn');
    pauseBtn = document.getElementById('pauseBtn');
    restartBtn = document.getElementById('restartBtn');
    
    // 设置画布尺寸
    canvas.width = GAME_CONFIG.canvasSize;
    canvas.height = GAME_CONFIG.canvasSize;
    
    // 绑定事件监听器
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // 初始化画布显示
    drawInitialCanvas();
    console.log('贪吃蛇游戏已初始化');
}

/**
 * 绘制初始画布
 */
function drawInitialCanvas() {
    // 清空画布
    ctx.fillStyle = GAME_CONFIG.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
}

/**
 * 绘制网格
 */
function drawGrid() {
    ctx.strokeStyle = GAME_CONFIG.colors.grid;
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GAME_CONFIG.canvasSize; i += GAME_CONFIG.gridSize) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_CONFIG.canvasSize);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_CONFIG.canvasSize, i);
        ctx.stroke();
    }
}

/**
 * 开始游戏
 */
function startGame() {
    // 重置游戏状态
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameRunning = true;
    gamePaused = false;
    
    // 更新分数显示
    scoreElement.textContent = score;
    
    // 生成第一个食物
    generateFood();
    
    // 隐藏覆盖层
    overlayElement.classList.add('hidden');
    
    // 启用按钮
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    
    // 开始游戏循环
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameUpdate, GAME_CONFIG.initialSpeed);
    
    console.log('游戏开始');
}

/**
 * 游戏主循环
 */
function gameUpdate() {
    if (!gameRunning || gamePaused) return;
    
    // 更新方向
    direction = { ...nextDirection };
    
    // 计算蛇头新位置
    const head = { 
        x: snake[0].x + direction.x, 
        y: snake[0].y + direction.y 
    };
    
    // 检查碰撞（墙壁或自身）
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 添加新蛇头
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 生成新食物
        generateFood();
    } else {
        // 没吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 绘制游戏画面
    drawGame();
}

/**
 * 绘制游戏画面
 */
function drawGame() {
    // 清空画布
    ctx.fillStyle = GAME_CONFIG.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? GAME_CONFIG.colors.snakeHead : GAME_CONFIG.colors.snakeBody;
        ctx.fillRect(
            segment.x * GAME_CONFIG.gridSize + 1,
            segment.y * GAME_CONFIG.gridSize + 1,
            GAME_CONFIG.gridSize - 2,
            GAME_CONFIG.gridSize - 2
        );
    });
    
    // 绘制食物
    ctx.fillStyle = GAME_CONFIG.colors.food;
    ctx.fillRect(
        food.x * GAME_CONFIG.gridSize + 1,
        food.y * GAME_CONFIG.gridSize + 1,
        GAME_CONFIG.gridSize - 2,
        GAME_CONFIG.gridSize - 2
    );
}

/**
 * 生成食物
 */
function generateFood() {
    const gridCount = GAME_CONFIG.canvasSize / GAME_CONFIG.gridSize;
    
    do {
        food.x = Math.floor(Math.random() * gridCount);
        food.y = Math.floor(Math.random() * gridCount);
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

/**
 * 检查碰撞
 */
function checkCollision(head) {
    const gridCount = GAME_CONFIG.canvasSize / GAME_CONFIG.gridSize;
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
        return true;
    }
    
    // 检查自身碰撞
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

/**
 * 键盘按键处理
 */
function handleKeyPress(event) {
    const key = event.key;
    
    // 防止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
    }
    
    if (!gameRunning) return;
    
    switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
        case ' ':
        case 'Space':
            togglePause();
            break;
    }
}

/**
 * 暂停/继续游戏
 */
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? '继续' : '暂停';
    
    if (gamePaused) {
        overlayTitle.textContent = '游戏暂停';
        overlayMessage.textContent = `当前分数: ${score}`;
        startBtn.textContent = '继续游戏';
        overlayElement.classList.remove('hidden');
    } else {
        overlayElement.classList.add('hidden');
        startBtn.textContent = '开始游戏';
    }
}

/**
 * 游戏结束
 */
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    // 显示游戏结束信息
    overlayTitle.textContent = '游戏结束';
    overlayMessage.textContent = `最终分数: ${score}`;
    startBtn.textContent = '重新开始';
    overlayElement.classList.remove('hidden');
    
    // 禁用暂停按钮
    pauseBtn.disabled = true;
    
    console.log('游戏结束，分数:', score);
}

/**
 * 重新开始游戏
 */
function restartGame() {
    // 停止当前游戏
    if (gameLoop) clearInterval(gameLoop);
    
    // 重新开始
    startGame();
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);

// 导出函数用于测试
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGame,
        drawInitialCanvas,
        drawGame,
        generateFood,
        checkCollision,
        GAME_CONFIG
    };
}
