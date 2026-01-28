
'use client'

export default function LinkIcon(
    props: Readonly<React.SVGProps<SVGSVGElement>>
) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            {...props}
        >
            <g fill="currentColor" stroke="currentColor" strokeLinecap="round" >
                <path d="M14 12a6 6 0 1 1-6-6" />
                <path d="M10 12a6 6 0 1 1 6 6" />
            </g>
        </svg>
    );
}
