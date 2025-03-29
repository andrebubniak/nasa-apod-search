/**
 * Returns the Apod skeleton placeholder, to use when getting the data from API
 */
export default function ApodImageCardSkeleton() {
	return (
		<div className="flex flex-col items-center gap-2 overflow-hidden p-8 sm:p-4 h-100 w-full sm:w-1/2 md:w-1/3 xl:w-1/4">
			<div className="w-full h-full rounded-lg animate-pulse bg-gray-300"></div>
			<div className="p-1 h-6 w-1/2">
				<div className="rounded-md animate-pulse bg-gray-300 h-full w-full"></div>
			</div>
		</div>
	)
}
