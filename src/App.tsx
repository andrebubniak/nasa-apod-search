import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query"
import { Fragment, useEffect, useMemo, useRef } from "react"
import { ApodData } from "./types/apod-data"
import ApodImageCard from "./components/ApodImageCard"
import ApodImageCardSkeleton from "./components/ApodImageCardSkeleton"

// Initial (last possible) date that we can grab our data
const initialDate = new Date(1995, 5, 16)

// How many items will be fetched each time
const perPage = 16

// This is public because it is used as a query parameter (without proxy), so there is no point in hiding it
// Please don't copy mine, you can easily generate one at https://api.nasa.gov/#signUp
const API_KEY = "83xzE3Ur1sSE30ryCaO8bbfB4Zm8rI4SVqtrpFti"

const baseUrl = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`

export default function App() {
	const intersectionTargetRef = useRef<HTMLUListElement | null>(null)

	const {
		data,
		hasNextPage,
		fetchNextPage,
		isFetching,
		isFetchingNextPage,
		isError,
		error,
		isLoading,
	} = useInfiniteQuery<
		ApodData[],
		Error,
		InfiniteData<ApodData[], Date>,
		string[],
		Date
	>({
		queryKey: ["APOD"],
		queryFn: async ({ pageParam }) => {
			try {
				const startDate: Date = new Date(
					pageParam.getFullYear(),
					pageParam.getMonth(),
					pageParam.getDate()
				)
				startDate.setDate(startDate.getDate() - perPage + 1)
				const startDateQueryParam = `${startDate.getFullYear()}-${
					startDate.getMonth() + 1
				}-${startDate.getDate()}`
				const endDateQueryParam = `${pageParam.getFullYear()}-${
					pageParam.getMonth() + 1
				}-${pageParam.getDate()}`

				const response = await fetch(
					`${baseUrl}&start_date=${startDateQueryParam}&end_date=${endDateQueryParam}`
				)

				const data = await response.json()

				if (!response.ok) {
					// The API returns {code, msg, service_version} in case of error
					throw new Error(
						`Error trying to fetch data. ${data.msg ?? response.statusText}`
					)
				}
				return (data as ApodData[])
					.filter((val) => val.media_type == "image")
					.reverse()
			} catch (error) {
				console.error({ error })
				if (error instanceof Error) {
					alert(error.message)
				}
				throw error
			}
		},
		initialPageParam: new Date(),
		getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
			if (lastPageParam == initialDate) {
				return null
			}

			let currentDate = new Date(
				lastPageParam.getFullYear(),
				lastPageParam.getMonth(),
				lastPageParam.getDate()
			)

			currentDate.setDate(currentDate.getDate() - perPage)

			if (currentDate < initialDate) {
				currentDate = initialDate
			}
			return currentDate
		},
		retry: 1,
	})

	// Setup Intersection Observer for infinite scrolling
	useEffect(() => {
		if (
			!intersectionTargetRef.current ||
			isFetchingNextPage ||
			isFetching ||
			!hasNextPage
		) {
			return
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries
				if (entry.isIntersecting) {
					fetchNextPage()
				}
			},
			{ threshold: 0.05 }
		)

		observer.observe(intersectionTargetRef.current)

		return () => {
			observer.disconnect()
		}
	}, [
		intersectionTargetRef,
		isFetchingNextPage,
		isFetching,
		hasNextPage,
		fetchNextPage,
	])

	const skeletonRow = useMemo(
		() => (
			// Intersection observer target
			<ul
				ref={intersectionTargetRef}
				className="relative flex flex-col sm:flex-row flex-wrap justify-center items-center"
			>
				{Array.from({ length: 4 }).map((_, index) => (
					<ApodImageCardSkeleton key={index} />
				))}
			</ul>
		),
		[intersectionTargetRef]
	)

	return (
		<main>
			{data?.pages.length && (
				<>
					<ul className="relative flex flex-col sm:flex-row flex-wrap justify-center items-center ">
						{data?.pages.map((page, index) => (
							<Fragment key={index}>
								{page.map((val, innerIndex) => (
									<ApodImageCard key={innerIndex} apod={val} />
								))}
							</Fragment>
						))}
					</ul>
					{hasNextPage && skeletonRow}
				</>
			)}
			{/* Render the skeletons before the first data is loaded */}
			{isLoading && skeletonRow}

			{isError && (
				<div className="w-full p-2 text-lg font-semibold bg-red-500">
					{error.message}
				</div>
			)}
		</main>
	)
}
