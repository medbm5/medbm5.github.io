// Tiny synthesized "pop" on hover, like the site that inspired this one.
// Browsers only allow audio after the first click or key press, so it stays quiet until then.
let audio;
function pop(pitch = 1) {
    try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        if (audio.state !== 'running') return;
        const now = audio.currentTime;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(140 * pitch, now + 0.09);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain).connect(audio.destination);
        osc.start(now);
        osc.stop(now + 0.11);
    } catch (e) { /* no audio, no problem */ }
}
['pointerdown', 'keydown'].forEach((type) =>
    window.addEventListener(type, () => {
        try {
            audio = audio || new (window.AudioContext || window.webkitAudioContext)();
            if (audio.state === 'suspended') audio.resume();
        } catch (e) {}
    }, { once: true })
);
document.querySelectorAll('[data-pop]').forEach((el) =>
    el.addEventListener('mouseenter', () => pop(0.8 + Math.random() * 0.6))
);

// Mobile nav
const burger = document.querySelector('.burger');
const mobileNav = document.getElementById('mobile-nav');
function setNav(open) {
    mobileNav.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
}
burger.addEventListener('click', () => setNav(true));
mobileNav.addEventListener('click', (e) => {
    if (e.target.closest('a, .mobile-close')) setNav(false);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

// Poke the head
const head = document.querySelector('.head');
const speech = document.querySelector('.speech');
const ouches = ['Ouch!', 'Hey!', 'Rude.', 'Stop that.', 'Merci!', 'Bug found?', 'Hired?', 'Again?!'];
let speechTimer;
head.addEventListener('click', () => {
    head.classList.remove('ouch');
    void head.offsetWidth;
    head.classList.add('ouch');
    speech.textContent = ouches[Math.floor(Math.random() * ouches.length)];
    speech.classList.add('show');
    pop(0.5 + Math.random() * 0.5);
    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => speech.classList.remove('show'), 1200);
});

// Screenshot carousels (one per project that has a .shots figure)
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.shots').forEach((fig) => {
    const shots = JSON.parse(fig.querySelector('.shot-data').textContent);
    const img = fig.querySelector('.shot-img');
    const caption = fig.querySelector('.shot-caption');
    const count = fig.querySelector('.shot-count');
    let i = 0;
    let busy = false;

    shots.forEach((s) => { const pre = new Image(); pre.src = s.src; });

    function render() {
        img.src = shots[i].src;
        img.alt = shots[i].alt;
        caption.textContent = shots[i].caption;
        count.textContent = `${i + 1} / ${shots.length}`;
    }
    function go(dir) {
        if (busy) return;
        i = (i + dir + shots.length) % shots.length;
        pop(dir > 0 ? 1.2 : 0.9);
        if (reducedMotion) return render();
        busy = true;
        img.classList.add('out');
        setTimeout(() => {
            img.classList.remove('out');
            img.classList.add('in-start');
            render();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                img.classList.remove('in-start');
                busy = false;
            }));
        }, 200);
    }

    fig.querySelector('.shot-prev').addEventListener('click', () => go(-1));
    fig.querySelector('.shot-next').addEventListener('click', () => go(1));
    fig.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });
    render();
});

document.getElementById('year').textContent = new Date().getFullYear();
