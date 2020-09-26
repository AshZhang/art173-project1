const CHEST_URL = "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600798655/art%20173/proj1image/chest_lwyure.png";
const COMPRESS_CHANGE = 0.05;
const NOISE_VOLUME_CHANGE = 0.05;
const MAX_NOISE_VOLUME = 0.1;


const DISTORT_LEVEL = 5000;
const DISTORT_LEVEL_CHANGE = 0.25;
const MIN_OPACITY = 0.35;
const OPACITY_CHANGE = 0.2;
const MIN_MEM_VOLUME = 0.025;
const MEM_VOLUME_DECAY = 1/3;

const noise = new Howl({ src: "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795651/art%20173/proj1sound/noise_zmj80z.wav", loop: true, preload: true });
const ambience = new Howl({ src: "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600842259/art%20173/proj1sound/ambience_hc8qmb.m4a", loop: true, preload: true });
const distortion = Howler.ctx.createWaveShaper();
distortion.connect(Howler.ctx.destination);
Howler.masterGain.connect(distortion);
const container = document.body.querySelector(".container");
const imageSources = [
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600799345/art%20173/proj1image/0_j2lzar.jpg",
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600798674/art%20173/proj1image/1_w4kvfu.jpg",
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600841939/art%20173/proj1image/2_xjsk52.jpg",
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600798675/art%20173/proj1image/3_jq14iv.jpg",
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600798665/art%20173/proj1image/4_f19epc.jpg",
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600798664/art%20173/proj1image/5_otd9qu.jpg",
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600798681/art%20173/proj1image/6_nqplc4.jpg",
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600798663/art%20173/proj1image/7_mby6bp.jpg",
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600798656/art%20173/proj1image/8_ixk9ay.jpg",
    "https://res.cloudinary.com/dw3ipuew9/image/upload/v1600798648/art%20173/proj1image/9_yxhpld.jpg"
];
const soundSources = [
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795633/art%20173/proj1sound/0_o2i3nd.mp3",
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795645/art%20173/proj1sound/1_dhaejv.mp3",
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795645/art%20173/proj1sound/2_eogxil.mp3",
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795641/art%20173/proj1sound/3_ccyno8.mp3",
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795624/art%20173/proj1sound/4_ouqswr.mp3",
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795661/art%20173/proj1sound/5_uyvper.mp3",
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600798096/art%20173/proj1sound/6_xxvoue.m4a",
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795628/art%20173/proj1sound/7_li08dm.mp3",
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795653/art%20173/proj1sound/8_n6dtxj.mp3",
    "https://res.cloudinary.com/dw3ipuew9/video/upload/v1600795625/art%20173/proj1sound/9_bcggvy.mp3"
];
const imageElems = [];
const NUM_ELEMS = imageSources.length;
let curMem = undefined;

async function initializeBlobs() {
    await imageElems.forEach(async (memory) => {
        await fetch(memory.memorySrc).then(res => res.blob()).then(blob => memory.blob = blob);
        memory.memorySrc = URL.createObjectURL(memory.blob);
    });
}

async function initializeElems() {
    for (let i = 0; i < NUM_ELEMS; i++) {
        const newElem = document.createElement("div");
        newElem.classList.add("item");
        const imgElem = document.createElement("img");
        imgElem.classList.add("chest");
        imgElem.src = CHEST_URL;
        imgElem.addEventListener("click", () => { openMemory(i) });
        newElem.appendChild(imgElem);
        container.appendChild(newElem);
        const memSound = new Howl({ src: soundSources[i], loop: true, preload: true });
        imageElems.push({
            memorySrc: imageSources[i],
            elem: imgElem,
            blob: undefined,
            active: false,
            sound: memSound,
            noiseVolume: 0,
            compressLevel: 0.1,
            opacity: 1,
            distortLevel: 0
        });
    }
    await initializeBlobs();
    ambience.play();
    console.log(imageElems);
}

function stopMemory(memory) {
    memory.active = false;
    memory.sound.stop();
    memory.sound.volume(Math.max(MIN_MEM_VOLUME, memory.sound.volume() * MEM_VOLUME_DECAY));
    noise.stop();

    distortion.curve = makeDistortionCurve(0);
    Howler.volume(1);

    ambience.play();
    compressImg(memory);
    memory.compressLevel = Math.max(0, memory.compressLevel - COMPRESS_CHANGE);
    memory.noiseVolume = Math.min(MAX_NOISE_VOLUME, memory.noiseVolume + NOISE_VOLUME_CHANGE);
    memory.distortLevel = Math.min(1, memory.distortLevel + DISTORT_LEVEL_CHANGE);
    memory.opacity = Math.max(MIN_OPACITY, memory.opacity - OPACITY_CHANGE);
    memory.elem.src = CHEST_URL;
    memory.elem.style.setProperty("opacity", memory.opacity);
}

function openMemory(i) {
    let memory = imageElems[i];
    if (!memory.active) {
        if (curMem) {
            stopMemory(curMem);
        }
        curMem = memory;
        noise.volume(memory.noiseVolume);
        memory.elem.src = memory.memorySrc;
        memory.elem.style.setProperty("opacity", 1);
        ambience.stop();
        if (memory.noiseVolume != 0) { Howler.volume(0.05); }
        distortion.curve = makeDistortionCurve(memory.distortLevel * DISTORT_LEVEL);

        memory.sound.play();
        noise.play();
        memory.active = true;
    } else {
        stopMemory(memory);
    }
}

function compressImg(memory) {
    new Compressor(memory.blob, {
        quality: memory.compressLevel,
        success(result) {
            memory.memorySrc = URL.createObjectURL(result);
            memory.blob = result;
        },
        error(err) {
            console.log(err.message);
        },
    });
}

// https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
    for (; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
};

initializeElems();
