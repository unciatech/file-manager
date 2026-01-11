'use client'

export default function VideoIcon(
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
            viewBox="0 0 29.93 40.02"
            width="100"
            height="100"
            {...props}
        >
            <path fill="#fa0000" d="M5.21 0l13.38 0 11.34 11.82 0 22.99c0,2.88 -2.33,5.21 -5.2,5.21l-19.52 0c-2.88,0 -5.21,-2.33 -5.21,-5.21l0 -29.6c0,-2.88 2.33,-5.21 5.21,-5.21z" ></path>
            <polygon fill="#fff" fillOpacity=".302" points="18.58 0 18.58 11.73 29.93 11.73"></polygon>
            <path fill="#fff" fillRule="nonzero" d="M14.97 18.16c-3.57,0 -6.47,2.9 -6.47,6.47 0,3.57 2.9,6.46 6.47,6.46 3.57,0 6.46,-2.89 6.46,-6.46 0,-3.57 -2.9,-6.46 -6.46,-6.47zm2.72 6.67c-0.05,0.09 -0.12,0.16 -0.21,0.21l0 0 -3.69 1.85c-0.23,0.11 -0.51,0.02 -0.62,-0.21 -0.04,-0.06 -0.05,-0.13 -0.05,-0.21l0 -3.69c0,-0.26 0.21,-0.46 0.46,-0.46 0.07,0 0.14,0.01 0.21,0.05l3.69 1.84c0.23,0.12 0.32,0.39 0.21,0.62z" ></path>
        </svg>
    );
}
