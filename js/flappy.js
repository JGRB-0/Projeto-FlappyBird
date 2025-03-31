function novoElemento(tagName, className) {
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function barreira(reverse = false) {
    this.element = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.element.appendChild(reverse ? corpo : borda)
    this.element.appendChild(reverse ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// const barreira = new barreira(true)
// barreira.setAltura(400)
// const flappy = document.querySelector('[wm-flappy]')
// flappy.appendChild(barreira.element)

function parDeBarreiras(height, gap, positionX) {
    this.element = novoElemento('div', 'par-de-barreiras')

    this.upper = new barreira(true)
    this.lower = new barreira(false)

    this.element.appendChild(this.upper.element)
    this.element.appendChild(this.lower.element)

    this.sortGap = () => {
        const upperHeight = Math.random() * (height - gap)
        const lowerHeight = (height - gap - upperHeight)

        this.upper.setAltura(upperHeight)
        this.lower.setAltura(lowerHeight)
    }

    this.getX =  () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getLarge = () => this.element.clientWidth

    this.sortGap()
    this.setX(positionX)
}

// const b = new parDeBarreiras(700, 200, 100)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaco),
        new parDeBarreiras(altura, abertura, largura + espaco * 2),
        new parDeBarreiras(altura, abertura, largura + espaco * 3),
    ]

    const deslocamento = 3

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //Quando o elemento sair da área do jogo
            if (par.getX() < -par.getLarge()) {
                // par.setX(par.getX() + espaco * this.pares.length) 

                const ultimaBarreira = this.pares.reduce((max, atual) => 
                    atual.getX() > max.getX() ? atual : max
                )
                par.setX(ultimaBarreira.getX() + espaco)
                par.sortGap()
            }

            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouMeio) notificarPonto()
        })
    }
}

function Passaro(alturaDoJogo) {
    let voando = false

    this.element = novoElemento('img', 'passaro')
    this.element.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])

    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = event => voando = true
    window.onkeyup = event => voando = false
    window.ontouchstart = event => voando = true
    window.ontouchend = event => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaDoJogo - this.element.clientHeight - 10     

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else{
            this.setY(novoY)
        }
    }

    this.setY(alturaDoJogo / 2)
}

function Progresso() {
    this.element = novoElemento('span', 'progresso')

    this.atualizarPontos = pontos => {
        this,this.element.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function EstaoSobrepostos(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top 
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false

    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.upper.element
            const inferior = parDeBarreiras.lower.element
            colidiu = EstaoSobrepostos(passaro.element, superior) || 
                EstaoSobrepostos(passaro.element, inferior)
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso
    const barreiras = new Barreiras(altura, largura, 200, 400,  () => {
        progresso.atualizarPontos(++pontos)
    })

    const passaro = new Passaro(altura)
    areaDoJogo.appendChild(progresso.element)
    areaDoJogo.appendChild(passaro.element)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.element))

    this.start = () => {
        //loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()

   