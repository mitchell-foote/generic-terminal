/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import ReactorOff from "./assets/reactor-off.png";
import ImageAsciiHolder from './ImageAsciiHolder';


export default function ResetAsciiArt() {

    return (
        <div>
            <ImageAsciiHolder scale_override={200} font_override={.2} url={ReactorOff} />
        </div>
    )
}