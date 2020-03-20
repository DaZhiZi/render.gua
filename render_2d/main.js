const testAxe0 = function() {
    let canvas = GuaCanvas.new('#id-canvas')
    // 这是一个测试函数, 给你看原理的, 只是看看
    canvas.draw()

    canvas.clear(GuaColor.white())
    // 画一条线
    let p0 = GuaPoint.new(200, 150)
    let p1 = GuaPoint.new(0, 0)
    let p2 = GuaPoint.new(400, 0)
    let p3 = GuaPoint.new(400, 300)
    let p4 = GuaPoint.new(0, 300)

    let p5 = GuaPoint.new(200, 0)
    let p6 = GuaPoint.new(400, 150)
    let p7 = GuaPoint.new(200, 300)
    let p8 = GuaPoint.new(0, 150)

    canvas.drawPoint(p1, GuaColor.black())

    // line
    canvas.drawLine(p0, p1, GuaColor.black())
    canvas.drawLine(p0, p2, GuaColor.black())
    canvas.drawLine(p0, p3, GuaColor.black())
    canvas.drawLine(p0, p4, GuaColor.black())

    canvas.drawLine(p0, p5, GuaColor.black())
    canvas.drawLine(p0, p6, GuaColor.black())
    canvas.drawLine(p0, p7, GuaColor.black())
    canvas.drawLine(p0, p8, GuaColor.black())



    // rect
    const size = GuaSize.new(200, 100)
    canvas.drawRect(p3, size, GuaColor.yellow(), GuaColor.black())

    // fillrect
    const s = GuaSize.new(50, 50)
    canvas.drawFillRect(p4, s, GuaColor.green(), GuaColor.black())


    // 渲染出来, 不调用这个函数就不会显示结果
    canvas.render()
}

const testAxe1 = function() {
    let canvas = GuaCanvas.new('#id-canvas')
    const bindEvents = function() {
        const btns = document.querySelectorAll('.figure-btn')
        for(let i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', (e) => {
                canvas.drawFigure(e.target.value)
            })
        }

        const colorBtn = document.querySelectorAll('.color-btn')
        for(let i = 0; i < colorBtn.length; i++) {
            colorBtn[i].addEventListener('click', (e) => {
                canvas.setColor(e.target.value)
            })
        }

    }

    bindEvents()
}
const __main = function() {
    // testAxe0()
    testAxe1()
}

__main()