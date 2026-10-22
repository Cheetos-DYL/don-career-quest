import * as THREE from 'three'
import { parseStopYears, yearAt, stopDistance, roadLength as roadLen } from './years.js'

// ── Content ────────────────────────────────────────────────────────────────
const REPO = 'Cheetos-DYL/don-career-quest'
const CACHE_KEY = 'don-life-content-v2'
const TOKEN_KEY = 'don-life-gh-token'

let content = null
let publishedSha = null

const $ = id => document.getElementById(id)

async function loadContent() {
    let local = null
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (raw) local = JSON.parse(raw)
    } catch {}
    if (local) content = local
    try {
        const res = await fetch('./content.json', { cache: 'no-store' })
        if (res.ok) {
            const remote = await res.json()
            if (remote && Array.isArray(remote.stops) && remote.stops.length) {
                // Local edits win until published or restored; the remote only seeds clean installs.
                const localDirty = local && JSON.stringify(local) !== JSON.stringify(remote)
                if (!localDirty) {
                    content = remote
                    localStorage.setItem(CACHE_KEY, JSON.stringify(remote))
                }
            }
        }
    } catch {}
    if (!content) content = { version: 2, intro: { title: 'My road so far.', text: '' }, stops: [] }
}

await loadContent()

// ── Scene ──────────────────────────────────────────────────────────────────
const canvas = $('world')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const SKY = 0x9cc4d2
const scene = new THREE.Scene()
scene.background = new THREE.Color(SKY)
scene.fog = new THREE.Fog(SKY, 140, 720)

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1200)
const hemi = new THREE.HemisphereLight(0xdfeaf2, 0x3a5a45, 1.05)
scene.add(hemi)
const sun = new THREE.DirectionalLight(0xfff2d8, 1.5)
sun.position.set(-60, 120, 40)
sun.castShadow = true
sun.shadow.mapSize.set(1024, 1024)
sun.shadow.camera.left = -140; sun.shadow.camera.right = 140
sun.shadow.camera.top = 140; sun.shadow.camera.bottom = -140
scene.add(sun)

const roadLength = () => roadLen(content.stops.length)

const box = (w, h, d, color, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }))
    m.position.set(x, y, z)
    m.castShadow = m.receiveShadow = true
    scene.add(m)
    return m
}

// Ground + road
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 8000), new THREE.MeshLambertMaterial({ color: 0x315b3b }))
ground.rotation.x = -Math.PI / 2
ground.position.z = -roadLength() / 2
ground.receiveShadow = true
scene.add(ground)

const road = new THREE.Mesh(new THREE.PlaneGeometry(22, roadLength()), new THREE.MeshLambertMaterial({ color: 0x353d44 }))
road.rotation.x = -Math.PI / 2
road.position.set(0, 0.01, -roadLength() / 2)
road.receiveShadow = true
scene.add(road)

for (const side of [-1, 1]) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.18, roadLength()), new THREE.MeshBasicMaterial({ color: 0xf2f0dc }))
    line.rotation.x = -Math.PI / 2
    line.position.set(side * 10.5, 0.02, -roadLength() / 2)
    scene.add(line)
}

// Lane dashes (one instanced draw call)
const dashGeo = new THREE.PlaneGeometry(0.16, 5)
const dashMat = new THREE.MeshBasicMaterial({ color: 0xf2f0dc })
const dashCount = Math.ceil(roadLength() / 30) * 2
const dashMesh = new THREE.InstancedMesh(dashGeo, dashMat, dashCount)
{
    const d = new THREE.Object3D()
    let i = 0
    for (let z = 0; z > -roadLength(); z -= 30) {
        for (const x of [-3.67, 3.67]) {
            d.position.set(x, 0.02, z)
            d.rotation.set(-Math.PI / 2, 0, 0)
            d.updateMatrix()
            dashMesh.setMatrixAt(i++, d.matrix)
        }
    }
    dashMesh.count = i
    scene.add(dashMesh)
}

// Trees + posts (InstancedMesh: one draw call each)
const treeCount = 220
const treeTrunk = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 3, 1), new THREE.MeshLambertMaterial({ color: 0x624a32 }), treeCount)
const treeLeaf = new THREE.InstancedMesh(new THREE.ConeGeometry(4.2, 9, 6), new THREE.MeshLambertMaterial({ color: 0x356c46 }), treeCount)
const post = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 1.6, 0.5), new THREE.MeshLambertMaterial({ color: 0xd4d5c3 }), 120)
const dummy = new THREE.Object3D()
let seed = 1
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
for (let i = 0; i < treeCount; i++) {
    const side = i % 2 ? 1 : -1
    const x = side * (17 + rand() * 40)
    const z = -rand() * roadLength()
    const s = 0.8 + rand() * 0.9
    dummy.position.set(x, 1.5 * s, z); dummy.scale.setScalar(s); dummy.updateMatrix()
    treeTrunk.setMatrixAt(i, dummy.matrix)
    dummy.position.set(x, (3 + 4.5) * s, z); dummy.updateMatrix()
    treeLeaf.setMatrixAt(i, dummy.matrix)
}
for (let i = 0; i < 120; i++) {
    dummy.position.set((i % 2 ? 1 : -1) * 12.4, 0.8, -(i * (roadLength() / 120)))
    dummy.scale.setScalar(1); dummy.updateMatrix()
    post.setMatrixAt(i, dummy.matrix)
}
treeTrunk.castShadow = treeLeaf.castShadow = true
scene.add(treeTrunk, treeLeaf, post)

// Speed streaks
const streakMat = new THREE.MeshBasicMaterial({ color: 0xeaf8f3, transparent: true, opacity: 0 })
const streaks = []
for (let i = 0; i < 26; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 3), streakMat)
    s.position.set((i % 2 ? 1 : -1) * (13.5 + (i % 3) * 2.2), 1.6 + (i % 4) * 0.7, -i * 24)
    s.userData.o = i * 24
    scene.add(s); streaks.push(s)
}

// Car (low-poly boxes)
const car = new THREE.Group()
const carBody = (w, h, d, color, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }))
    m.position.set(x, y, z); m.castShadow = true; car.add(m); return m
}
carBody(2.5, 0.65, 4.25, 0xc7f27a, 0, 0.48, 0)
carBody(2.3, 0.28, 1.65, 0xc7f27a, 0, 0.81, -1.2)
carBody(1.75, 0.78, 1.85, 0x173b49, 0, 1.22, -0.08)
carBody(1.82, 0.16, 1.95, 0xb4c1bc, 0, 1.65, -0.08)
carBody(2.7, 0.22, 0.32, 0xb4c1bc, 0, 0.28, 2.05)
const wheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.42, 14)
const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111719 })
for (const sx of [-1, 1]) for (const sz of [-1.35, 1.35]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat)
    w.rotation.z = Math.PI / 2
    w.position.set(sx * 1.23, 0.42, sz)
    w.castShadow = true
    car.add(w)
}
car.position.z = 0
scene.add(car)

// ── Timeline stones (folio career mechanic: rise + slide + glowing label) ──
function labelTexture(stop) {
    const c = document.createElement('canvas')
    c.width = 1024; c.height = 320
    const g = c.getContext('2d')
    g.clearRect(0, 0, c.width, c.height)
    g.fillStyle = '#c7f27a'
    g.font = '900 108px system-ui, sans-serif'
    g.textAlign = 'center'
    g.fillText((stop.title || '').slice(0, 30), 512, 140)
    g.fillStyle = '#ffb86b'
    g.font = '800 56px system-ui, sans-serif'
    g.fillText((stop.kicker || '').slice(0, 52), 512, 232)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
}

const stones = []
function buildStones() {
    for (const s of stones) { scene.remove(s.group) }
    stones.length = 0
    content.stops.forEach((stop, i) => {
        const side = i % 2 ? 1 : -1
        const group = new THREE.Group()
        const slab = new THREE.Mesh(new THREE.BoxGeometry(8.2, 5, 1.2), new THREE.MeshLambertMaterial({ color: 0x2b3138 }))
        slab.position.y = 2.5; slab.castShadow = slab.receiveShadow = true
        const label = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 2.35), new THREE.MeshBasicMaterial({ map: labelTexture(stop), transparent: true }))
        label.position.set(0, 2.9, 0.62)
        group.add(slab, label)
        group.position.set(side * 14, -6, -stopDistance(i))
        scene.add(group)
        stones.push({ group, label, base: stopDistance(i), stop, index: i })
    })
}

// Year sign that slides along with the driver (folio career corridor)
const yearCanvas = document.createElement('canvas')
yearCanvas.width = 512; yearCanvas.height = 256
const yearTexture = new THREE.CanvasTexture(yearCanvas)
yearTexture.colorSpace = THREE.SRGBColorSpace
const yearSign = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), new THREE.MeshBasicMaterial({ map: yearTexture, transparent: true }))
yearSign.position.set(-14, 6.5, -20)
scene.add(yearSign)
function drawYear(year) {
    const g = yearCanvas.getContext('2d')
    g.clearRect(0, 0, 512, 256)
    g.fillStyle = 'rgba(7,27,32,0.72)'
    g.fillRect(20, 30, 472, 196)
    g.strokeStyle = '#c7f27a'; g.lineWidth = 6; g.strokeRect(20, 30, 472, 196)
    g.fillStyle = '#c7f27a'
    g.font = '900 132px ui-monospace, Menlo, monospace'
    g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(String(year), 256, 132)
    yearTexture.needsUpdate = true
}
drawYear(1991)

// ── Input ──────────────────────────────────────────────────────────────────
const pressed = new Set()
const KEYMAP = { w: 'ArrowUp', a: 'ArrowLeft', s: 'ArrowDown', d: 'ArrowRight' }
window.addEventListener('keydown', e => {
    const key = KEYMAP[e.key.toLowerCase()] || e.key
    if (e.target.closest?.('input,textarea,select')) { if (key === 'Escape') closePanels(); return }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) e.preventDefault()
    if (key === 'Escape') { closePanels(); return }
    if (key === 'Enter' && nearIndex >= 0) { openStory(nearIndex); return }
    pressed.add(key)
})
window.addEventListener('keyup', e => pressed.delete(KEYMAP[e.key.toLowerCase()] || e.key))
window.addEventListener('blur', () => pressed.clear())

document.querySelectorAll('.touch-controls button').forEach(btn => {
    const key = btn.dataset.key
    const down = e => { e.preventDefault(); pressed.add(key); btn.classList.add('is-down'); btn.setPointerCapture?.(e.pointerId) }
    const up = e => { e.preventDefault(); pressed.delete(key); btn.classList.remove('is-down') }
    btn.addEventListener('pointerdown', down)
    btn.addEventListener('pointerup', up)
    btn.addEventListener('pointercancel', up)
    btn.addEventListener('lostpointercapture', up)
})

// ── Game loop ──────────────────────────────────────────────────────────────
const player = { distance: 0, speed: 0, x: 0, steer: 0 }
let nearIndex = -1
const visited = new Set()
let last = 0

function toast(text) {
    const t = $('toast')
    t.textContent = text
    t.classList.add('visible')
    clearTimeout(toast.t)
    toast.t = setTimeout(() => t.classList.remove('visible'), 1800)
}

function openStory(index) {
    const stop = content.stops[index]
    if (!stop) return
    $('storyKicker').textContent = stop.kicker || ''
    $('storyTitle').textContent = stop.title || ''
    $('storyText').textContent = stop.text || ''
    const photo = $('storyPhoto')
    if (stop.photo) { photo.src = stop.photo; photo.hidden = false }
    else { photo.removeAttribute('src'); photo.hidden = true }
    closePanels()
    $('storyPanel').hidden = false
    paused = true
    if (!visited.has(stop.id)) {
        visited.add(stop.id)
        updateProgress()
        toast(`${stop.short || stop.title} · visited`)
    }
}

let paused = false
function closePanels() {
    document.querySelectorAll('.panel').forEach(p => (p.hidden = true))
    paused = false
}
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closePanels))

function updateProgress() {
    $('progressBar').style.width = `${(visited.size / Math.max(1, content.stops.length)) * 100}%`
    const next = content.stops.find(s => !visited.has(s.id))
    $('missionTitle').textContent = next ? next.title : 'The whole journey'
    $('missionText').textContent = next ? `Next stop: ${next.short}. ↑ accelerate · A/D change lanes · SHIFT boost.` : "That's the whole timeline. Take the drive again?"
}

function move(dt) {
    const steer = (pressed.has('ArrowRight') ? 1 : 0) - (pressed.has('ArrowLeft') ? 1 : 0)
    const accelerating = pressed.has('ArrowUp')
    const braking = pressed.has('ArrowDown')
    const top = pressed.has('Shift') ? 1000 : 650
    if (accelerating) player.speed = Math.min(top, player.speed + 800 * dt)
    else player.speed = Math.max(0, player.speed - (braking ? 1600 : 70) * dt)
    player.distance += (player.speed * dt) / 3.6
    player.x = Math.max(-7, Math.min(7, player.x + steer * 9 * dt))
    player.steer += (steer - player.steer) * Math.min(1, dt * 8)

    // stones: rise and glide alongside while passing (folio career mechanic)
    for (const s of stones) {
        const delta = player.distance - s.base // + = passed
        const inRange = delta > -120 && delta < 60
        const targetY = inRange ? 0 : -6
        s.group.position.y += (targetY - s.group.position.y) * Math.min(1, dt * 4)
        const targetZ = inRange ? -player.distance - 30 : -s.base
        s.group.position.z += (targetZ - s.group.position.z) * Math.min(1, dt * 5)
        s.label.material.opacity += ((inRange ? 1 : 0) - s.label.material.opacity) * Math.min(1, dt * 5)
    }

    // triggers
    const next = content.stops.findIndex((s, i) => !visited.has(s.id) && player.distance >= stopDistance(i))
    nearIndex = content.stops.findIndex((s, i) => {
        const rem = stopDistance(i) - player.distance
        return rem >= 0 && rem < 160
    })
    if (next >= 0 && !paused) openStory(next)

    // year counter: exactly each stone's year at every stop, in between interpolated
    const year = yearAt(player.distance, move.years)
    if (year !== move.year) { move.year = year; drawYear(year); $('yearValue').textContent = year }
    $('speedValue').textContent = Math.round(player.speed)
}

function render(time) {
    const dt = Math.min((time - last) / 1000 || 0, 0.04)
    last = time
    if (!paused) move(dt)

    const speedRatio = Math.min(1, player.speed / 1000)
    camera.fov = 58 + speedRatio * 28
    camera.position.lerp(new THREE.Vector3(player.x * 0.7, 5.4, -player.distance + 12), 0.12)
    camera.lookAt(player.x * 0.85, 1, -player.distance - 24)
    car.position.set(player.x, 0, -player.distance)
    car.rotation.y = -player.steer * 0.12

    sun.position.set(-60 + player.x, 120, 40 - player.distance)
    sun.target.position.set(0, 0, -player.distance)
    sun.target.updateMatrixWorld()
    yearSign.position.z = -player.distance - 34
    yearSign.position.x = -15

    const streakOpacity = player.speed > 250 ? Math.min(0.8, (player.speed - 250) / 700) : 0
    streakMat.opacity = streakOpacity
    for (const s of streaks) {
        const rel = (s.userData.o + player.distance * 1.5) % 620
        s.position.z = -player.distance + 310 - rel
    }

    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

function resize() {
    const w = window.innerWidth, h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / Math.max(1, h)
    camera.updateProjectionMatrix()
}
window.addEventListener('resize', resize)

// ── Panels / HUD wiring ────────────────────────────────────────────────────
function renderStopList() {
    const list = $('stopList')
    list.replaceChildren()
    content.stops.forEach((stop, i) => {
        const b = document.createElement('button')
        b.className = 'stop-item'
        b.innerHTML = `<span class="stop-num">${stop.code}</span><span><strong></strong><small></small></span>`
        b.querySelector('strong').textContent = stop.title
        b.querySelector('small').textContent = stop.kicker
        b.addEventListener('click', () => openStory(i))
        list.append(b)
    })
}
function renderAbout() {
    $('aboutTitle').textContent = content.profile?.title || 'Don Lee'
    const facts = $('aboutFacts')
    facts.replaceChildren()
    for (const [k, v] of content.profile?.facts || []) {
        const f = document.createElement('div')
        f.className = 'fact'
        f.innerHTML = '<b></b><span></span>'
        f.querySelector('b').textContent = k
        f.querySelector('span').textContent = v
        facts.append(f)
    }
}
$('listButton').addEventListener('click', () => { closePanels(); renderStopList(); $('listPanel').hidden = false; paused = true })
$('aboutButton').addEventListener('click', () => { closePanels(); renderAbout(); $('aboutPanel').hidden = false; paused = true })

// ── Editor + persistence ───────────────────────────────────────────────────
function buildEditor() {
    const fields = $('editFields')
    fields.replaceChildren()
    const addField = (labelText, value, onInput, multiline = false) => {
        const label = document.createElement('label')
        label.className = 'edit-field'
        const span = document.createElement('span')
        span.textContent = labelText
        const input = document.createElement(multiline ? 'textarea' : 'input')
        if (!multiline) input.type = 'text'
        input.value = value || ''
        input.addEventListener('input', () => onInput(input.value))
        label.append(span, input)
        fields.append(label)
    }
    addField('Intro title', content.intro.title, v => (content.intro.title = v))
    addField('Intro text', content.intro.text, v => (content.intro.text = v), true)
    content.stops.forEach((stop, i) => {
        const details = document.createElement('details')
        details.className = 'edit-chapter'
        const summary = document.createElement('summary')
        summary.textContent = `${stop.code} · ${stop.title}`
        details.append(summary)
        const inner = document.createElement('div')
        const add = (labelText, key, multiline = false) => {
            const label = document.createElement('label')
            label.className = 'edit-field'
            const span = document.createElement('span')
            span.textContent = labelText
            const input = document.createElement(multiline ? 'textarea' : 'input')
            if (!multiline) input.type = 'text'
            input.value = stop[key] || ''
            input.addEventListener('input', () => (stop[key] = input.value))
            label.append(span, input)
            inner.append(label)
        }
        add('Title', 'title')
        add('Date and place', 'kicker')
        add('Story', 'text', true)
        const photoLabel = document.createElement('label')
        photoLabel.className = 'edit-field'
        const photoSpan = document.createElement('span')
        photoSpan.textContent = 'Photo (stored with the story)'
        const photoInput = document.createElement('input')
        photoInput.type = 'file'
        photoInput.accept = 'image/*'
        photoInput.addEventListener('change', async () => {
            const file = photoInput.files?.[0]
            if (!file) return
            stop.photo = await fileToDataUrl(file)
            $('editStatus').textContent = `Photo ready for ${stop.title}. Save, then Publish.`
        })
        photoLabel.append(photoSpan, photoInput)
        inner.append(photoLabel)
        details.append(inner)
        fields.append(details)
    })
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(reader.error)
        reader.onload = () => {
            const img = new Image()
            img.onerror = () => reject(new Error('Invalid image'))
            img.onload = () => {
                const max = 1280
                const scale = Math.min(1, max / Math.max(img.width, img.height))
                const c = document.createElement('canvas')
                c.width = Math.round(img.width * scale)
                c.height = Math.round(img.height * scale)
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
                resolve(c.toDataURL('image/jpeg', 0.82))
            }
            img.src = reader.result
        }
        reader.readAsDataURL(file)
    })
}

function applyContent() {
    move.years = parseStopYears(content.stops)
    renderStopList()
    renderAbout()
    buildStones()
    updateProgress()
}

function saveLocal() {
    localStorage.setItem(CACHE_KEY, JSON.stringify(content))
    localStorage.setItem(TOKEN_KEY, $('tokenInput').value)
    applyContent()
    $('editStatus').textContent = 'Saved in this browser. Publish to share it with every visitor.'
}

function b64utf8(str) {
    const bytes = new TextEncoder().encode(str)
    let bin = ''
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    return btoa(bin)
}

function gitMessage(status) {
    if (status === 401) return 'GitHub 401: invalid token.'
    if (status === 403) return 'GitHub 403: token is read-only here — edit the token permissions and set Contents to "Read and write".'
    if (status === 404) return 'GitHub 404: token cannot see this repo.'
    if (status === 409) return 'GitHub 409: the file changed elsewhere — try Publish again.'
    return `GitHub ${status}`
}

async function publish() {
    const token = $('tokenInput').value.trim()
    if (!token) { $('editStatus').textContent = 'Paste a GitHub token first (fine-grained, this repo, Contents: Read and write).'; return }
    $('editStatus').textContent = 'Publishing…'
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    const path = 'contents/public/content.json' // the file the site actually serves
    try {
        let sha = publishedSha
        if (!sha) {
            const res = await fetch(`https://api.github.com/repos/${REPO}/${path}`, { headers })
            if (res.ok) sha = (await res.json()).sha
            else if (res.status !== 404) throw new Error(gitMessage(res.status))
        }
        const body = { message: 'Update story content', content: b64utf8(JSON.stringify(content, null, 1)) }
        if (sha) body.sha = sha
        const res = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
            method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(gitMessage(res.status))
        publishedSha = (await res.json()).content?.sha || null
        $('editStatus').textContent = 'Published. The live site updates in about a minute.'
        toast('Published to the site')
    } catch (err) {
        $('editStatus').textContent = `${err.message} Edits are kept in this browser.`
    }
}

$('editButton').addEventListener('click', () => {
    closePanels()
    buildEditor()
    $('tokenInput').value = localStorage.getItem(TOKEN_KEY) || ''
    $('editPanel').hidden = false
    paused = true
})
$('editForm').addEventListener('submit', e => { e.preventDefault(); saveLocal() })
$('publishButton').addEventListener('click', publish)
$('resetButton').addEventListener('click', async () => {
    if (!confirm('Restore the original story text?')) return
    localStorage.removeItem(CACHE_KEY)
    location.reload()
})

// ── Boot ───────────────────────────────────────────────────────────────────
applyContent()
resize()
requestAnimationFrame(render)
