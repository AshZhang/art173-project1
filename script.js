const CHEST_URL = "./images/chest.png";
const COMPRESS_CHANGE = 0.05;
const NOISE_VOLUME_CHANGE = 0.25;
const noise = new Howl({src: "./sounds/noise.wav", loop: true});
const container = document.body.querySelector(".container");
const imageSources = [
    "./images/test.JPG",
    "./images/test2.jpg"
];
const soundSources = [
    "./sounds/sound1.mp3",
    "./sounds/sound1.mp3"
];
const imageElems = [];
const NUM_ELEMS = imageSources.length;

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
        const memSound = new Howl({src: soundSources[i], loop: true});
        imageElems.push({
            memorySrc: imageSources[i],
            elem: imgElem,
            blob: undefined,
            active: false,
            sound: memSound,
            noiseVolume: 0,
            compressLevel: 0.1
        });
    }
    await initializeBlobs();
    console.log(imageElems);
}

function openMemory(i) {
    let memory = imageElems[i];
    if(!memory.active){
        noise.volume(memory.noiseVolume);
        memory.elem.src = memory.memorySrc;
        memory.sound.play();
        noise.play();
    } else {
        compressImg(memory);
        memory.compressLevel = Math.max(0, memory.compressLevel - COMPRESS_CHANGE);
        memory.noiseVolume = Math.min(1, memory.noiseVolume + NOISE_VOLUME_CHANGE);
        memory.elem.src = CHEST_URL;
        memory.sound.stop();
        noise.stop();
    }
    memory.active = !memory.active;
}

function compressImg(memory) {
    let compressor = new Compressor(memory.blob, {
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

initializeElems();
