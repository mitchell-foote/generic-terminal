/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect } from 'react'
import ReactorOff from "./assets/reactor-off.png";
import Reactor1 from "./assets/reactor1.png";
import Reactor2 from "./assets/reactor2.png";
import Reactor3 from "./assets/reactor3.png";
import Reactor4 from "./assets/reactor4.png";
import ImageAsciiHolder from './ImageAsciiHolder';

export default function OverloadAsciiArt() {
    const [index, setIndex] = React.useState(0);
    const images = [ReactorOff, Reactor1, Reactor2, Reactor3, Reactor4];
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(Math.floor(Math.random() * images.length | 0));
        }, 100);
        return () => clearInterval(interval);
    })

    return (
        <div>
            <ImageAsciiHolder url={images[index]} scale_override={200} font_override={0.2} />
        </div>
    )
}