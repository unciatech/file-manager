'use client'
export default function PlusIcon(
    props: Readonly<React.SVGProps<SVGSVGElement>>
) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path fill="currentColor" d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"></path>
        </svg>
    )
}