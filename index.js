function getRealSize(src) {
	return new Promise((resolve, reject) => {
		var img = new Image();
		img.onload = function () {
			resolve({width: this.width, height: this.height})
		}
		img.src = src
	})
}

document.addEventListener('DOMContentLoaded', async () => {
	console.log('Hi!')

	const c = document.querySelector('#canvas')
	const ctx = c.getContext('2d')
	ctx.globalCompositeOperation = "source-over";

	const original = document.querySelector('#resized')
	const resized_container = document.querySelector('#resized_container')
	const cropper = document.querySelector('#cropper')
	const cropper_background = document.querySelector('#cropper_background')
	const input = document.querySelector('#file_select')
	const sizer1 = document.querySelector('#sizer-1')
	const sizer2 = document.querySelector('#sizer-2')
	const sizer3 = document.querySelector('#sizer-3')
	const sizer4 = document.querySelector('#sizer-4')

	async function setImage(src) {
		const originalSize = await getRealSize(src)

		let height = originalSize.height>originalSize.width? 500 : originalSize.height/(originalSize.width/500)
		let width = originalSize.width>originalSize.height? 500 : originalSize.width/(originalSize.height/500)

		c.height = height
		c.width =  width

		console.log(originalSize)

		let source = document.querySelector('#source')
		source.src = src
		ctx.drawImage(source, 0, 0, width, height)
		original.src = c.toDataURL("image/png")

		cropper.style.left = "0px"
		cropper.style.top = "0px"

		let cropperSize = width<height? width/2 : height/2
		cropper.style.width = cropperSize+'px'
		cropper.style.height = cropperSize+'px'

		cropper_background.style.marginLeft = "-"+cropper.offsetLeft+"px"
		cropper_background.style.marginTop = "-"+cropper.offsetTop+"px"
		cropper_background.style.width = c.width + "px"
		cropper_background.style.height = c.height + "px"
		cropper_background.src = original.src

		updateCanvas()

		return
	}

	await setImage('example.png')	

	input.addEventListener('change', e => {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
	
			reader.onload = function (e) {
				setImage(e.target.result);
			}
	
			reader.readAsDataURL(input.files[0])
		}
	})

	function updateCanvas(left, top) {
		const cropper = document.querySelector('#cropper')
		window.cropper = cropper
		const box = cropper.getBoundingClientRect()
		console.log(box)
		let width = box.width
		let height = box.height
		c.width = width
		c.height = height
		ctx.drawImage(original, cropper.offsetLeft, cropper.offsetTop, box.width, box.height, 0, 0, box.width, box.height)
	}

	function updateAvatars() {
		const src = c.toDataURL("image/png")
		const avatars = document.querySelectorAll('.avatar')
		avatars.forEach(avatar => {
			avatar.src = src
		})
	}

	updateCanvas()
	updateAvatars()
	
	cropper_background.addEventListener('mousedown', event_down => {
		const containerBox = resized_container.getBoundingClientRect()
		const cropperBox = cropper.getBoundingClientRect()
		const onMove = event_move => {
			let newLeft = cropper.offsetLeft+event_move.movementX
			let newTop = cropper.offsetTop+event_move.movementY

			if (newLeft < 0 || newTop < 0) return
			if (newLeft > containerBox.width-cropperBox.width) return
			if (newTop > containerBox.height-cropperBox.height) return

			cropper.style.left = newLeft+"px"
			cropper.style.top = newTop+"px"

			cropper_background.style.marginLeft = "-"+newLeft+"px"
			cropper_background.style.marginTop = "-"+newTop+"px"
			updateCanvas()
		}

		const onUp = event_up => {
			console.log('event_up', event_up)
			updateAvatars()
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseup', onUp)
		}

		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onUp)
	})

	sizer1.addEventListener('mousedown', event_down => {
		console.log("MOUSEDOWN", event_down)
		const containerBox = resized_container.getBoundingClientRect()
		const cropperBox = cropper.getBoundingClientRect()
		const sizerBox = sizer3.getBoundingClientRect()
		let oldLeft = parseInt(cropper.style.left)
		let oldTop = parseInt(cropper.style.top)
		document.body.classList.add('nwse')
		const onMove = event_move => {
			let newWidth = cropperBox.x - event_move.x + cropperBox.width
			let newHeight = cropperBox.y - event_move.y + cropperBox.height

			let newSize = newWidth<newHeight? newWidth : newHeight

			if ((oldLeft - (newSize - cropperBox.width)) < 0) return
			if ((oldTop - (newSize - cropperBox.height)) < 0) return

			cropper.style.width = newSize+"px"
			cropper.style.height = newSize+"px"
			cropper.style.left = oldLeft - (newSize - cropperBox.width) + 'px'
			cropper.style.top = oldTop - (newSize - cropperBox.height) + 'px'
			cropper_background.style.marginLeft = '-' + (oldLeft - (newSize - cropperBox.width)) + 'px'
			cropper_background.style.marginTop = '-' + (oldTop - (newSize - cropperBox.height)) + 'px'
			
			updateCanvas()
		}

		const onUp = event_up => {
			console.log('event_up', event_up)
			updateAvatars()
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseup', onUp)
			document.body.classList.remove('nwse')
		}

		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onUp)
	})

	sizer2.addEventListener('mousedown', event_down => {
		console.log("MOUSEDOWN", event_down)
		const containerBox = resized_container.getBoundingClientRect()
		const cropperBox = cropper.getBoundingClientRect()
		const sizerBox = sizer3.getBoundingClientRect()
		let oldLeft = parseInt(cropper.style.left)
		let oldTop = parseInt(cropper.style.top)
		document.body.classList.add('nesw')
		const onMove = event_move => {
			let newWidth = event_move.x - cropperBox.x
			let newHeight = cropperBox.y - event_move.y + cropperBox.height

			let newSize = newWidth<newHeight? newWidth : newHeight

			if (newSize+parseInt(cropper.style.left) > containerBox.width) return
			if ((oldTop - (newSize - cropperBox.height)) < 0) return

			cropper.style.width = newSize+"px"
			cropper.style.height = newSize+"px"
			cropper.style.top = oldTop - (newSize - cropperBox.height) + 'px'
			cropper_background.style.marginTop = '-' + (oldTop - (newSize - cropperBox.height)) + 'px'
			
			updateCanvas()
		}

		const onUp = event_up => {
			console.log('event_up', event_up)
			updateAvatars()
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseup', onUp)
			document.body.classList.remove('nesw')
		}

		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onUp)
	})

	sizer3.addEventListener('mousedown', event_down => {
		console.log("MOUSEDOWN", event_down)
		const containerBox = resized_container.getBoundingClientRect()
		const cropperBox = cropper.getBoundingClientRect()
		const sizerBox = sizer3.getBoundingClientRect()
		document.body.classList.add('nwse')
		const onMove = event_move => {
			let newWidth = event_move.x - cropperBox.x
			let newHeight = event_move.y - cropperBox.y

			let newSize = newWidth<newHeight? newWidth : newHeight

			if (newSize+parseInt(cropper.style.left) > containerBox.width) return
			if (newSize+parseInt(cropper.style.top) > containerBox.height) return

			cropper.style.width = newSize+"px"
			cropper.style.height = newSize+"px"
			
			updateCanvas()
		}

		const onUp = event_up => {
			console.log('event_up', event_up)
			updateAvatars()
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseup', onUp)
			document.body.classList.remove('nwse')
		}

		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onUp)
	})

	sizer4.addEventListener('mousedown', event_down => {
		console.log("MOUSEDOWN", event_down)
		const containerBox = resized_container.getBoundingClientRect()
		const cropperBox = cropper.getBoundingClientRect()
		const sizerBox = sizer3.getBoundingClientRect()
		let oldLeft = parseInt(cropper.style.left)
		let oldTop = parseInt(cropper.style.top)
		document.body.classList.add('nesw')
		const onMove = event_move => {
			let newWidth = cropperBox.x - event_move.x + cropperBox.width
			let newHeight = event_move.y - cropperBox.y

			let newSize = newWidth<newHeight? newWidth : newHeight

			if ((oldLeft - (newSize - cropperBox.width)) < 0) return
			if (newSize+parseInt(cropper.style.top) > containerBox.height) return

			cropper.style.width = newSize+"px"
			cropper.style.height = newSize+"px"
			cropper.style.left = oldLeft - (newSize - cropperBox.width) + 'px'
			cropper_background.style.marginLeft = '-' + (oldLeft - (newSize - cropperBox.width)) + 'px'
			
			updateCanvas()
		}

		const onUp = event_up => {
			console.log('event_up', event_up)
			updateAvatars()
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseup', onUp)
			document.body.classList.remove('nesw')
		}

		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onUp)
	})

	
})