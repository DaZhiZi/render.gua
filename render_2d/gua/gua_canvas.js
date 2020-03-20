class GuaCanvas extends GuaObject {
    constructor(selector) {
        super()
        this.setup(selector)
    }

    static mousePoint(e) {
        const x = e.clientX
        const y = e.clientY
        const p = GuaPoint.new(x, y)
        return p
    }

    setup(selector) {
        let self = this
        let c = e(selector)
        self.canvas = c
        self.context = c.getContext('2d')
        self.w = c.width
        self.h = c.height

        // pixels  point
        self.pixels = self.context.getImageData(0, 0, self.w, self.h)
        self.bytesPerPixel = 4

        // line
        self.figureType = null
        // 起点和终点
        self.startPoint = null
        self.endPoint = null
        // lines
        self.lines = []

        self.interval = null
        self.callbacks = self.createCallbacks()

        // color
        self.currentColor = GuaColor.black()
    }

    drawFigure(type) {
        // type: figure type
        log('type', type)
        this.figureType = type
        this.bindEvents()
    }

    setColor(type) {
        const colorMap = {
            red: GuaColor.red(),
            yellow: GuaColor.yellow(),
            green: GuaColor.green(),
        }
        this.currentColor = colorMap[type]
    }

    // line
    refresh() {
        const self = this
        const figure = this.figureType
        const drawLine = this.drawLine.bind(this)
        const drawRect = this._drawRect.bind(this)
        const drawFillRect = this._drawFillRect.bind(this)
        const render = this.render.bind(this)
        const clear = this.clear.bind(this)

        const drawFigureMap = {
            line: drawLine,
            rect: drawRect,
            fillrect: drawFillRect
        }

        this.interval = setInterval(function () {
            const sp = self.startPoint
            const ep = self.endPoint
            if (sp && ep) {
                clear(GuaColor.white())
                drawFigureMap[figure](sp, ep)
                // 每一帧都要将之前绘制过的图形绘制一遍
                self.lines.forEach((f) => {
                    drawFigureMap[f.type](f.sp, f.ep, f.color)

                })
                render()
            }
        }, 100)

    }

    createCallbacks() {
        const onMousedown = (e) => {
            this.startPoint = GuaCanvas.mousePoint(e)
            this.refresh()
        }

        const onMousemove = (e) => {
            this.endPoint = GuaCanvas.mousePoint(e)
        }

        const onMouseup = (e, figure) => {
            this.endPoint = GuaCanvas.mousePoint(e)
            this.lines.push({type: figure, sp: this.startPoint, ep: this.endPoint, color: this.currentColor})
            clearInterval(this.interval)
        }

        return {
            onMousedown,
            onMousemove,
            onMouseup,
        }
    }

    // line
    bindEvents() {
        const {onMousedown, onMousemove, onMouseup} = this.callbacks

        this.canvas.addEventListener('mousedown', onMousedown)

        this.canvas.addEventListener('mousemove', onMousemove)

        this.canvas.addEventListener('mouseup', e => onMouseup(e, this.figureType))
    }

    render() {
        // 渲染
        let {pixels, context} = this
        context.putImageData(pixels, 0, 0)
    }

    clear(color = GuaColor.white()) {
        // color GuaColor
        // 用 color 填充整个 canvas
        // 遍历每个像素点, 设置像素点的颜色
        let {w, h} = this
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                this._setPixel(x, y, color)
            }
        }
        this.render()
    }

    _setPixel(x, y, color) {
        // color: GuaColor
        // 设置像素点
        // 浮点转 int
        let int = Math.floor
        x = int(x)
        y = int(y)
        // 用坐标算像素下标
        let i = (y * this.w + x) * this.bytesPerPixel
        // 设置像素
        let p = this.pixels.data
        let {r, g, b, a} = color
        // 一个像素 4 字节, 分别表示 r g b a
        p[i] = r
        p[i + 1] = g
        p[i + 2] = b
        p[i + 3] = a
    }

    inCanvas(point) {
        let {w, h} = this
        let p = point
        let inX = p.x >= 0 && p.x <= w
        let inY = p.y >= 0 && p.y <= h
        return inX && inY
    }

    drawPoint(point, color = this.currentColor) {
        // point: GuaPoint
        let self = this
        let p = point
        if (self.inCanvas(point)) {
            self._setPixel(p.x, p.y, color)
        }
    }

    getPoints(point1, point2, color = this.currentColor) {
        let p1 = point1
        let p2 = point2
        // p1 p2 分别是起点和终点, GuaPoint 类型
        // color GuaColor
        // 使用 drawPoint 函数来画线

        // 根据 p1 p2 计算出所有需要绘制的点
        // (x1, y1) (x2, y2) 之间所有的点
        // ax + b = y
        const {x: x1, y: y1} = p1
        const {x: x2, y: y2} = p2

        const step = 0.01
        const points = [p1]

        if (x1 === x2) {
            for (let y = y1; y <= y2; y += step) {
                const p = GuaPoint.new(x1, y)
                points.push(p)
            }
        } else {
            // y = k * x + b
            // 斜率  k
            const slope = (y1 - y2) / (x1 - x2)
            // 常数  b
            const intercept = y1 - slope * x1
            for (let x = x1; x <= x2; x += step) {
                const y = slope * x + intercept
                const p = GuaPoint.new(x, y)
                points.push(p)
            }
        }
        points.push(p2)
        return points
    }

    drawLine(point1, point2, color = this.currentColor) {
        let points = this.getPoints(point1, point2, color)
        points.forEach((p) => {
            this.drawPoint(p, color)
        })
    }

    // _drawRect: p1: upperLeft, p2: downRight
    _drawRect(p1, p2, borderColor = this.currentColor, fillColor = null,) {
        const w = Math.abs(p1.x - p2.x)
        const h = Math.abs(p1.y - p2.y)
        const size = GuaSize.new(w, h)
        this.drawRect(p1, size, borderColor, fillColor)
    }

    drawRect(upperLeft, size, borderColor = this.currentColor, fillColor = null,) {
        // upperLeft: GuaPoint, 矩形左上角座标
        // size: GuaSize, 矩形尺寸
        // fillColor: GuaColor, 矩形的填充颜色, 默认为空, 表示不填充
        // borderColor: GuaColor, 矩形的的边框颜色, 默认伪黑色

        // 点
        const {x, y} = upperLeft
        const {w, h} = size
        const upperRight = GuaPoint.new(x + w, y)
        const downLeft = GuaPoint.new(x, y + h)
        const downRight = GuaPoint.new(x + w, y + h)

        // 线
        this.drawLine(upperLeft, upperRight, borderColor)
        this.drawLine(upperLeft, downLeft, borderColor)
        this.drawLine(downLeft, downRight, borderColor)
        this.drawLine(upperRight, downRight, borderColor)

        // 面
        if (fillColor !== null) {
            const p = GuaPoint.new(x + 1, y + 1)
            this.drawFillRect(p, size, fillColor)
        }
    }

    // _drawRect: p1: upperLeft, p2: downRight
    _drawFillRect(p1, p2, fillColor = this.currentColor) {
        const w = Math.abs(p1.x - p2.x)
        const h = Math.abs(p1.y - p2.y)
        const size = GuaSize.new(w, h)
        this.drawFillRect(p1, size, fillColor)
    }

    // fill rect 没有边框
    drawFillRect(upperLeft, size, fillColor = this.currentColor) {
        const {x, y} = upperLeft
        const {w, h} = size

        const step = 1
        for (let py = y; py < y + h - step; py += step) {
            // const px = px + step
            let px = x
            const start = GuaPoint.new(px, py)
            const end = GuaPoint.new(px + w - 2 * step, py)
            this.drawLine(start, end, fillColor)
        }
    }
}