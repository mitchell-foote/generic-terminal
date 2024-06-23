/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useMemo, useState } from 'react'
import ImageToAscii from './ImageToAscii'

function ImageAsciiHolder({
    url,
    scale_override,
    font_override
}: {
    url: string
    scale_override?: number
    font_override?: number
}) {
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
    const scale = useMemo(() => {
        if (scale_override) {
            return scale_override
        }
        return 50
    }, [scale_override])
    const [fontSize, setFont] = useState(0.3)
    const [minimun, setMin] = useState(true)

    useEffect(() => {
        const getImageData = async () => {
            const response = await fetch(url)
            const blob = await response.blob()
            // Create a File object from the blob
            const file = new File([blob], 'img', { type: blob.type })
            sendImg(file, scale)
        }
        getImageData()
    }, [url])

    //In case we are using width old
    const setFontSize = (newDim, oldDim) => {
        if (newDim > oldDim) {
            newDim = oldDim
        }
        const scale = 30 * oldDim
        const newScale = 30 * newDim
        const newFontSize = ((scale / newScale) * 30) / 100

        return font_override ? font_override : newFontSize
    }

    const sendImg = (file, scaleWidth) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

                if (scaleWidth <= 9) {
                    setMin(false)
                } else {
                    setMin(true)
                }

                if (scaleWidth > 500) {
                    scaleWidth = 500
                }

                setFont(setFontSize(scaleWidth, 500))

                const maxWidth = scaleWidth // Desired maximum width
                const maxHeight = 200 // Desired maximum height

                let width = img.width
                let height = img.height

                // Rescale the image if it exceeds the maximum width and height
                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height
                    if (width > maxWidth) {
                        width = maxWidth
                        height = width / aspectRatio
                    }
                    if (height > maxHeight) {
                        height = maxHeight
                        width = height * aspectRatio
                    }
                }

                // Set the canvas dimensions
                canvas.width = width
                canvas.height = height

                // Draw the image on the canvas with the rescaled dimensions
                ctx.drawImage(img, 0, 0, width, height)

                // Get the URL of the rescaled image
                const scaledImageUrl = canvas.toDataURL('image/jpeg')

                // Set the URL of the rescaled image in the state
                setImagePreviewUrl(scaledImageUrl)
            }
            img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }

    return (
        <div>
            {minimun && imagePreviewUrl ? (
                <ImageToAscii imageUrl={imagePreviewUrl} fontSize={fontSize} />
            ) : (
                <div className="ASCII_IMG">Resolution error</div>
            )}
        </div>
    )
}

export default ImageAsciiHolder
