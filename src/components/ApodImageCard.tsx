import { useRef } from "react"
import { ApodData } from "../types/apod-data"

export type ApodImageCardProps = {
	/**
	 * APOD data to display on the card and inside the <modal></modal>
	 */
	apod: ApodData
}

/**
 * A card component that displays an image from APOD
 *
 * Features:
 * - Displays a thumbnail image with its date
 * - Opens a modal dialog on click showing:
 *   - Full resolution image
 *   - Title and detailed explanation
 *   - Link to original APOD page
 *   - Date of the image
 * - Responsive layout with hover effects
 *
 * @param {ApodImageCardProps} props - Component props
 */
export default function ApodImageCard({ apod }: ApodImageCardProps) {
	const dialogRef = useRef<HTMLDialogElement | null>(null)

	const closeModal = () => {
		dialogRef.current?.close()
	}

	/**
	 * Picks a date of the format `YYYY-MM-DD` and turns into `YYMMDD`
	 * Appends this to the real apod url
	 */
	const getOriginalApodUrl = (date: string): string => {
		return `https://apod.nasa.gov/apod/ap${date
			.replaceAll("-", "")
			.slice(2)}.html`
	}

	return (
		<>
			{/* APOD image with the date it was taken */}
			<div className="flex flex-col items-center gap-2 overflow-hidden p-8 sm:p-4 h-100 w-full sm:w-1/2 md:w-1/3 xl:w-1/4">
				<div
					className="cursor-pointer w-full h-full rounded-lg overflow-hidden hover:scale-105 transition-all duration-200"
					onClick={() => {
						dialogRef.current?.showModal()
					}}
				>
					<img
						loading="eager"
						src={apod.url}
						alt={apod.title ?? "APOD"}
						className="w-full h-full object-center object-cover hover:scale-110 transition-all duration-200"
					/>
				</div>
				<span className="text-md font-semibold">{apod.date}</span>
			</div>

			{/* Dialog to render the high resolution image with the description */}
			<dialog
				ref={dialogRef}
				className="m-auto p-0 border rounded-md backdrop:bg-black/80 outline-none h-[90vh] w-[90vw]"
				onClick={(e) => {
					if (e.target instanceof HTMLDialogElement) {
						closeModal()
					}
				}}
			>
				<div className="relative h-full w-full flex flex-col p-4 justify-start items-center gap-2">
					<div className="flex flex-row justify-center">
						<span>{apod.date}</span>
						&emsp;-&emsp;
						<a
							target="_blank"
							className="underline text-blue-400 outline-none"
							href={getOriginalApodUrl(apod.date)}
						>
							See more
						</a>
					</div>

					<div className={`flex-1 min-h-0`}>
						<img
							src={apod.hdurl ?? apod.url}
							alt={apod.title ?? "APOD"}
							className={`h-full w-full object-contain`}
							loading="eager"
						/>
					</div>
					<h1 className="text-xl font-bold text-center max-w-full">
						{apod.title}
					</h1>
					<p className="border-t border-b border-zinc-300 indent-8 outline-none p-2 max-h-[30%] overflow-auto">
						{apod.explanation}
					</p>
					<button
						className="absolute right-2 top-2 cursor-pointer"
						onClick={closeModal}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				</div>
			</dialog>
		</>
	)
}
