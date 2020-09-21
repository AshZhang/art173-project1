const CHEST_URL = "./images/chest.png";
const COMPRESS_LEVEL = 0;
const container = document.body.querySelector(".container");
const imageSources = [
    "./images/test.JPG",
    "./images/test2.jpg"
];
const soundSources = [
    "./sounds/sound1.mp3",
    "./sounds/sound2.mp3"
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
            compressLevel: 0.1
        });
    }
    await initializeBlobs();
    console.log(imageElems);
}

function openMemory(i) {
    let memory = imageElems[i];
    if(!memory.active){
        memory.elem.src = memory.memorySrc;
        memory.sound.play();
    } else {
        compressImg(memory);
        memory.compressLevel = Math.max(0, memory.compressLevel - 0.05);
        memory.elem.src = CHEST_URL;
        memory.sound.stop();
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
