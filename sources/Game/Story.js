import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { InteractivePoints } from './InteractivePoints.js'
import donContent from '../data/donContent.js'

// Don's life story: drive-up stops, menu list, and the in-browser editor.
// Content defaults are baked in; edits come from the content API when configured.
export class Story
{
    constructor()
    {
        this.game = Game.getInstance()
        this.api = import.meta.env.VITE_CONTENT_API || ''
        this.storageKey = 'don-life-content-cache'
        this.tokenKey = 'don-life-edit-token'
        this.content = JSON.parse(JSON.stringify(donContent))
        this.points = []

        const cached = this.readCache()
        if(cached)
            this.content = cached

        this.setModal()
        this.setMenuList()
        this.setPoints()
        this.setEditor()
        this.loadServerContent()
    }

    readCache()
    {
        try
        {
            const raw = localStorage.getItem(this.storageKey)
            return raw ? JSON.parse(raw) : null
        }
        catch(error)
        {
            return null
        }
    }

    async loadServerContent()
    {
        if(!this.api)
            return

        try
        {
            const response = await fetch(`${this.api}/api/content`, { cache: 'no-store' })
            if(!response.ok)
                return

            const data = await response.json()
            if(data && Array.isArray(data.stops) && data.stops.length)
            {
                this.content = data
                this.setMenuList()
                this.setEditor()
                try{ localStorage.setItem(this.storageKey, JSON.stringify(data)) }catch(error){}
            }
        }
        catch(error)
        {
            // Server edits unavailable: defaults and local cache still work.
        }
    }

    setModal()
    {
        this.modal = {}
        this.modal.kicker = document.querySelector('.js-story-kicker')
        this.modal.title = document.querySelector('.js-story-title')
        this.modal.text = document.querySelector('.js-story-text')
        this.modal.photo = document.querySelector('.js-story-photo')
    }

    openStory(index)
    {
        const stop = this.content.stops[index]
        if(!stop)
            return

        this.game.inputs.interactiveButtons.clearItems()
        this.modal.kicker.textContent = stop.kicker || ''
        this.modal.title.textContent = stop.title || ''
        this.modal.text.textContent = stop.text || ''
        if(stop.photo)
        {
            this.modal.photo.src = stop.photo
            this.modal.photo.hidden = false
        }
        else
        {
            this.modal.photo.removeAttribute('src')
            this.modal.photo.hidden = true
        }
        this.game.modals.open('story')
    }

    setMenuList()
    {
        const list = document.querySelector('.js-story-list')
        if(!list)
            return

        list.replaceChildren()
        this.content.stops.forEach((stop, index) =>
        {
            const button = document.createElement('button')
            button.type = 'button'
            button.className = 'button is-small story-list-item'
            button.textContent = `${stop.code} · ${stop.title}`
            button.addEventListener('click', () =>
            {
                this.openStory(index)
            })
            list.append(button)
        })
    }

    setPoints()
    {
        const spawn = this.game.respawns.getByName('landing')
        const center = spawn ? spawn.position.clone() : new THREE.Vector3(0, 4, 0)
        const radius = 14

        this.content.stops.forEach((stop, index) =>
        {
            const angle = Math.PI * (index + 0.5) / this.content.stops.length
            const position = center.clone()
            position.x += Math.cos(angle) * radius
            position.z -= Math.sin(angle) * radius

            this.game.interactivePoints.create(
                position,
                `${stop.code} · ${stop.short}`,
                index % 2 ? InteractivePoints.ALIGN_LEFT : InteractivePoints.ALIGN_RIGHT,
                InteractivePoints.STATE_CONCEALED,
                () =>
                {
                    this.openStory(index)
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.addItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                }
            )
        })
    }

    setEditor()
    {
        const form = document.querySelector('.js-story-editor')
        if(!form)
            return

        this.editor = {}
        this.editor.status = form.querySelector('.js-edit-status')
        this.editor.token = form.querySelector('.js-edit-token')
        this.editor.token.value = localStorage.getItem(this.tokenKey) || ''
        this.editor.fields = form.querySelector('.js-edit-fields')
        this.editor.fields.replaceChildren()

        const addField = (labelText, value, onInput, multiline = false) =>
        {
            const label = document.createElement('label')
            label.className = 'edit-field'
            const span = document.createElement('span')
            span.textContent = labelText
            const input = document.createElement(multiline ? 'textarea' : 'input')
            if(!multiline)
                input.type = 'text'
            input.value = value || ''
            input.addEventListener('input', () => onInput(input.value))
            label.append(span, input)
            this.editor.fields.append(label)
            return input
        }

        addField('Intro title', this.content.intro.title, value => (this.content.intro.title = value))
        addField('Intro text', this.content.intro.text, value => (this.content.intro.text = value), true)

        this.content.stops.forEach((stop, index) =>
        {
            const details = document.createElement('details')
            details.className = 'edit-chapter'
            const summary = document.createElement('summary')
            summary.textContent = `${stop.code} · ${stop.title}`
            details.append(summary)
            const fields = document.createElement('div')
            fields.className = 'edit-fields'

            const inner = (labelText, key, multiline = false) =>
            {
                const label = document.createElement('label')
                label.className = 'edit-field'
                const span = document.createElement('span')
                span.textContent = labelText
                const input = document.createElement(multiline ? 'textarea' : 'input')
                if(!multiline)
                    input.type = 'text'
                input.value = stop[key] || ''
                input.addEventListener('input', () => (stop[key] = input.value))
                label.append(span, input)
                fields.append(label)
            }
            inner('Title', 'title')
            inner('Date and place', 'kicker')
            inner('Story', 'text', true)

            const photoLabel = document.createElement('label')
            photoLabel.className = 'edit-field'
            const photoSpan = document.createElement('span')
            photoSpan.textContent = 'Photo (saves with the story)'
            const photoInput = document.createElement('input')
            photoInput.type = 'file'
            photoInput.accept = 'image/*'
            photoInput.addEventListener('change', async () =>
            {
                const file = photoInput.files && photoInput.files[0]
                if(!file)
                    return
                stop.photo = await this.fileToDataUrl(file)
                this.editor.status.textContent = `Photo ready for ${stop.title}. Save to publish.`
            })
            photoLabel.append(photoSpan, photoInput)
            fields.append(photoLabel)

            details.append(fields)
            this.editor.fields.append(details)
        })

        form.addEventListener('submit', event =>
        {
            event.preventDefault()
            this.save()
        })
    }

    fileToDataUrl(file)
    {
        return new Promise((resolve, reject) =>
        {
            const reader = new FileReader()
            reader.onerror = () => reject(reader.error)
            reader.onload = () =>
            {
                const image = new Image()
                image.onerror = () => reject(new Error('Invalid image'))
                image.onload = () =>
                {
                    const max = 1280
                    const scale = Math.min(1, max / Math.max(image.width, image.height))
                    const canvas = document.createElement('canvas')
                    canvas.width = Math.round(image.width * scale)
                    canvas.height = Math.round(image.height * scale)
                    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
                    resolve(canvas.toDataURL('image/jpeg', 0.82))
                }
                image.src = reader.result
            }
            reader.readAsDataURL(file)
        })
    }

    async save()
    {
        localStorage.setItem(this.tokenKey, this.editor.token.value)
        try{ localStorage.setItem(this.storageKey, JSON.stringify(this.content)) }catch(error){}

        this.setMenuList()

        if(!this.api)
        {
            this.editor.status.textContent = 'Saved in this browser. Server sync is not configured yet.'
            return
        }

        this.editor.status.textContent = 'Saving to the server…'
        try
        {
            const response = await fetch(`${this.api}/api/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.editor.token.value}`,
                },
                body: JSON.stringify(this.content),
            })
            if(response.ok)
                this.editor.status.textContent = 'Saved to the server. Every visitor sees your edits.'
            else if(response.status === 401)
                this.editor.status.textContent = 'Wrong edit token. Edits are kept in this browser only.'
            else
                this.editor.status.textContent = `Server refused the save (${response.status}).`
        }
        catch(error)
        {
            this.editor.status.textContent = 'Server unreachable. Edits are kept in this browser only.'
        }
    }
}
