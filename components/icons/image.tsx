

'use client'

export default function ImageIcon(
    props: Readonly<React.SVGProps<SVGSVGElement>>
) {
    return (

        <svg
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            imageRendering="optimizeQuality"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            viewBox="0 0 17.69 23.65"
            width="100"
            height="100"
            {...props}
        >
            <path fill="#0ac963" d="M3.08 0l7.91 0 6.7 6.99 0 13.58c0,1.7 -1.38,3.08 -3.08,3.08l-11.53 0c-1.7,0 -3.08,-1.38 -3.08,-3.08l0 -17.49c0,-1.7 1.38,-3.08 3.08,-3.08z">
            </path>
            <polygon fill="#fff" fillOpacity=".302" points="10.98 0 10.98 6.93 17.69 6.93"></polygon>
            <path fill="#fff" d="M11.85 11.82l-6.01 0c-0.45,0 -0.82,0.37 -0.82,0.82l0 3.82c0,0.45 0.37,0.82 0.82,0.82l6.01 0c0.45,0 0.81,-0.37 0.81,-0.82l0 -3.82c0,-0.45 -0.36,-0.82 -0.81,-0.82zm-4.37 1.03c0.49,0 0.88,0.4 0.88,0.88 0,0.49 -0.39,0.89 -0.88,0.89 -0.49,0 -0.89,-0.4 -0.89,-0.89 0,-0.48 0.4,-0.88 0.89,-0.88zm4.64 3.61c0,0.15 -0.12,0.28 -0.27,0.28l-6.01 0c-0.15,0 -0.27,-0.13 -0.27,-0.28l0 -0.16 1.09 -1.09 0.9 0.9c0.11,0.11 0.28,0.11 0.39,0l2.26 -2.26 1.91 1.91 0 0.7 0 0z">
            </path>
        </svg>
    );
}
