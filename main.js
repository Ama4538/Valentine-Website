
// Music
const audio = new Audio('./assets/music.mp3');
audio.volume = 0.15;


const startIntro = () => {
    audio.play();
    const envolop = document.querySelector('.envelope');
    const intro = document.querySelector('.intro');
    envolop.dataset.active = false;
    intro.dataset.active = true;
}

const enterIntro = () => {
    const content = document.querySelector('.content');
    const intro = document.querySelector('.intro');
    content.dataset.active = true;
    intro.dataset.active = false;


    const carousel = document.querySelector('.carousel');
    const cards = document.querySelectorAll('.card');
    let currAngle = 0;

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            card.classList.toggle('is-flipped');
            e.stopPropagation();
        });
    });

    // 2. Mouse Drag Logic
    let isDragging = false;
    let startX;

    window.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.pageX;
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const x = e.pageX;
        const move = (x - startX) * 0.25;
        currAngle += move;
        carousel.style.transform = `rotateY(${currAngle}deg)`;
        startX = x;
    });

    window.addEventListener('mouseup', () => isDragging = false);
}


// Hyperplex mouse animation

let start = new Date().getTime();

const originPosition = { x: 0, y: 0 };

const last = {
    starTimestamp: start,
    starPosition: originPosition,
    mousePosition: originPosition
}

const config = {
    starAnimationDuration: 1500,
    minimumTimeBetweenStars: 250,
    minimumDistanceBetweenStars: 75,
    glowDuration: 75,
    maximumGlowPointSpacing: 5,
    colors: ["154 22 33", "200 99 99"],
    sizes: ["1.4rem", "1rem", "0.6rem"],
    animations: ["fall-1", "fall-2", "fall-3"]
}

let count = 0;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    selectRandom = items => items[rand(0, items.length - 1)];

const withUnit = (value, unit) => `${value}${unit}`,
    px = value => withUnit(value, "px"),
    ms = value => withUnit(value, "ms");

const calcDistance = (a, b) => {
    const diffX = b.x - a.x,
        diffY = b.y - a.y;
    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
}

const calcElapsedTime = (start, end) => end - start;

const appendElement = element => document.body.appendChild(element),
    removeElement = (element, delay) => setTimeout(() => document.body.removeChild(element), delay);

const createStar = position => {
    const star = document.createElement("div");
    const color = selectRandom(config.colors);
    const size = selectRandom(config.sizes);

    star.className = "star";

    star.innerHTML = `
        <svg viewBox="0 0 640 640" style="fill: rgb(${color}); display: block;">
            <path d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
        </svg>
    `;
    star.style.left = px(position.x);
    star.style.top = px(position.y);
    star.style.width = size;
    star.style.height = size;
    star.style.color = `rgb(${color})`;
    star.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.5)`;
    star.style.animationName = config.animations[count++ % 3];
    star.style.starAnimationDuration = ms(config.starAnimationDuration);
    appendElement(star);
    removeElement(star, config.starAnimationDuration);
}

const createGlowPoint = position => {
    const glow = document.createElement("div");
    glow.className = "glow-point";
    glow.style.left = px(position.x);
    glow.style.top = px(position.y);
    appendElement(glow)
    removeElement(glow, config.glowDuration);
}

const determinePointQuantity = distance => Math.max(
    Math.floor(distance / config.maximumGlowPointSpacing),
    1
);


const createGlow = (last, current) => {
    const distance = calcDistance(last, current),
        quantity = determinePointQuantity(distance);
    const dx = (current.x - last.x) / quantity,
        dy = (current.y - last.y) / quantity;
    Array.from(Array(quantity)).forEach((_, index) => {
        const x = last.x + dx * index,
            y = last.y + dy * index;
        createGlowPoint({ x, y });
    });
}

const updateLastStar = position => {
    last.starTimestamp = new Date().getTime();
    last.starPosition = position;
}

const updateLastMousePosition = position => last.mousePosition = position;
const adjustLastMousePosition = position => {
    if (last.mousePosition.x === 0 && last.mousePosition.y === 0) {
        last.mousePosition = position;
    }
};

const handleOnMove = e => {
    const mousePosition = { x: e.clientX, y: e.clientY }
    adjustLastMousePosition(mousePosition);
    const now = new Date().getTime(),
        hasMovedFarEnough = calcDistance(last.starPosition, mousePosition) >= config.minimumDistanceBetweenStars,
        hasBeenLongEnough = calcElapsedTime(last.starTimestamp, now) > config.minimumTimeBetweenStars;
    if (hasMovedFarEnough || hasBeenLongEnough) {
        createStar(mousePosition);

        updateLastStar(mousePosition);
    }
    createGlow(last.mousePosition, mousePosition);
    updateLastMousePosition(mousePosition);
}

window.onmousemove = e => handleOnMove(e);
window.ontouchmove = e => handleOnMove(e.touches[0]);
document.body.onmouseleave = () => updateLastMousePosition(originPosition);

