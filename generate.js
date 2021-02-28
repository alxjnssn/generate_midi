const fs = require('fs');
const Midi = require('jsmidgen');
const mkdirp = require('mkdirp');
const { Timer } = require('timer-node');

const resetDelay = () => {
    delay = 0;
}

const incrementDelay = () => {
    delay = delay + 64;
}

const generateNote = scale => {
    const randomNote = scales[scale][Math.floor(Math.random() * scales[scale].length)];
    return randomNote + octave;
}

const setNoteDelay = setDelay => {
    if (setDelay) {
        incrementDelay();
    } else {
        resetDelay();
    }
}

const setUsedTicks = () => {
    usedTicks = usedTicks + 64;
}

const resetUsedTicks = () => {
    usedTicks = 64;
}

const generateMidiPatternFile = (patternNumber, channel, scale) => {
    const trackMessage = [`Channel: 00${channel} New Track: Track00${patternNumber} `];
    const file = new Midi.File();
    const track = new Midi.Track();
    const steps = 8;
    const totalTicks = steps * 64

    file.addTrack(track);

    while (usedTicks <= totalTicks) {
        const noteOnOrOff = Boolean(Math.round(Math.random()));
    
        if (noteOnOrOff) {
            const note = generateNote(scale);
            track.addNote(0, note, 64, delay)
            setNoteDelay(false);
            trackMessage.push(`[ X ]`);
        } else {
            setNoteDelay(true);
            trackMessage.push(`[   ]`);
        }
    
        setUsedTicks();
    }
    console.log(trackMessage.join(''));

    fs.writeFileSync(`./midi_channel_patterns/midi_channel_00${channel}/${scale}_midi_pattern_00${patternNumber}.mid`, file.toBytes(), 'binary')
}

const init = () => {
    timer.start();
    for (i2 = 0; i2 < numberOfDirectories; i2++) {
        if (!fs.existsSync(`./midi_channel_patterns`)) {
            mkdirp(`./midi_channel_patterns`)
        }
    
        mkdirp(`./midi_channel_patterns/midi_channel_00${i2}`);
        
        for (i1 = 0; i1 < numberOfPatternFiles; i1++) {
            generateMidiPatternFile(i1, i2, scale);
            resetDelay();
            resetUsedTicks();
        }
    }
    timer.stop();

    console.log("");
    console.log("MIDI Pattern File Generation Complete");
    console.log("");
    console.log(`Channels: ${numberOfDirectories}`);
    console.log(`Patterns: ${numberOfPatternFiles}`);
    console.log(`Scale: ${scale.charAt(0).toUpperCase() + scale.slice(1)}`)
    console.log(`Octave: ${octave}`);
    console.log("");
    console.log(`${timer.format()} - with a ${buffer}ms buffer`);
    console.log("");
}

let buffer = 1;

const timer = new Timer('Task Duration');

const scales = {
    hirajoshi: ['d', 'e', 'f', 'a', 'a#'],
    lydian: ['c', 'd', 'e', 'f#', 'g#', 'a', 'b', 'c']   
}

let delay = 0;
let octave = '4';
let scale = 'hirajoshi'
let usedTicks = 64;
let numberOfPatternFiles = 1;
let numberOfDirectories = 1;

process.argv.forEach(function (val, index, array) {
    if (index === 2 && scales[val]) {
        scale = val;
    }

    if (index === 3) {
        octave = parseInt(val);
    }

    if (index === 4) {
        numberOfPatternFiles = parseInt(val);
    }

    if (index === 5) {
        numberOfDirectories = parseInt(val);
    }

    if (index === 6) {
        buffer = parseInt(val);
    }
});

init();