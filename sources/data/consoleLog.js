import * as THREE from 'three/webgpu'

const text = `
████████   ███████  ██    ██    ██       ████████ ████████ 
██     ██ ██     ██ ███   ██    ██       ██       ██       
██     ██ ██     ██ ████  ██    ██       ██       ██       
██     ██ ██     ██ ██ ██ ██    ██       ██████   ██████   
██     ██ ██     ██ ██  ████    ██       ██       ██       
██     ██ ██     ██ ██   ███    ██       ██       ██       
████████   ███████  ██    ██    ████████ ████████ ████████

╔═ Intro ═══════════════╗
║ Thank you for visiting my life story, you sneaky developer!
║ This world is built on Bruno Simon's folio-2025 (MIT). Here's the full stack breakdown.
╚═══════════════════════╝

╔═ Socials ═══════════════╗
║ GitHub         ⇒ https://github.com/Cheetos-DYL
║ Source of world⇒ https://github.com/brunosimon/folio-2025
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ You can access the debug mode by adding #debug at the end of the URL and reloading.
║ Press [V] to toggle the free camera.
╚═══════════════════════╝

╔═ Three.js ════════════╗
║ Three.js is the library I’m using to render this 3D world (release: ${THREE.REVISION})
║ https://threejs.org/
║ It was created by mr.doob (https://x.com/mrdoob, https://github.com/mrdoob),
║ followed by hundreds of awesome developers,
║ one of which being Sunag (https://x.com/sea3dformat, https://github.com/sunag) who added TSL,
║ enabling the use of both WebGL and WebGPU, making this portfolio possible.
╚═══════════════════════╝

╔═ Three.js Journey ════╗
║ If you want to learn Three.js, I got you covered with this huge course.
║ https://threejs-journey.com/
║ It contains everything you need to start building awesome stuff with Three.js (and much more).
╚═══════════════════════╝

╔═ Devlogs ═════════════╗
║ Bruno has been making devlogs since the very start of this portfolio
║ and you can find them all on his Youtube channel.
║ https://www.youtube.com/@BrunoSimon
╚═══════════════════════╝

╔═ Source code ═════════╗
║ The code is available on GitHub under MIT license. Even the Blender files are there, so have fun!
║ https://github.com/brunosimon/folio-2025
║ For security reasons, I’m not sharing the server code, but the portfolio works without it.
╚═══════════════════════╝

╔═ Musics ══════════════╗
║ The music you hear was made especially for this portfolio by the awesome Kounine (Linktree).
║ https://linktr.ee/Kounine
║ They are now under CC0 license, meaning you can do whatever you want with them!
║ Download them here.
║ https://github.com/brunosimon/folio-2025/tree/main/static/sounds/musics
╚═══════════════════════╝

╔═ Some more links ═════╗
║ Rapier (Physics library)  ⇒ https://rapier.rs/
║ Howler.js (Audio library) ⇒ https://howlerjs.com/
║ Amatic SC (Fonts)         ⇒ https://fonts.google.com/specimen/Amatic+SC
║ Nunito (Fonts).           ⇒ https://fonts.google.com/specimen/Nunito?query=Nunito
╚═══════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]