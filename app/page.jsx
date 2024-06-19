"use client"

import { useEffect, useState } from "react"
import { searchPlaces } from "./actions"
import PlaceSummary from "./components/PlaceSummary"

export default function Home() {
  const [query, setQuery] = useState('')
  const [coordinates, setCoordinates] = useState('')
  const [places, setPlaces] = useState([])
  const [error, setError] = useState(null)

  const setCurrentLocationCoordinates = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCoordinates(`@${position.coords.latitude},${position.coords.longitude},14z`),
        (err) => {
          setError(err.message)
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  useEffect(setCurrentLocationCoordinates, [])

  const performSearch = async () => {
    if (!query) return
    if (!coordinates) return

    const places = await searchPlaces(query, coordinates)
    setPlaces(places)
  }

  return (
    <main className="px-4 py-16 max-w-[1200px] mx-auto">
      <div className="flex gap-4">
        <div>
          <input 
            className="bg-gray-100 px-4 py-2 rounded text-xl w-[300px]" 
            type="text" 
            placeholder="Best sushi restaurant"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center gap-2 bg-gray-100 px-4 rounded  py-2">
            <input 
              className="bg-transparent text-xl w-[300px]" 
              type="text" 
              placeholder="Coordinates"
              value={coordinates}
              onChange={(e) => setCoordinates(e.target.value)}
            />
            <button onClick={setCurrentLocationCoordinates}>
              <svg className="text-gray-500" width={20} height={20} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 0c13.3 0 24 10.7 24 24V65.5C366.8 76.3 435.7 145.2 446.5 232H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H446.5C435.7 366.8 366.8 435.7 280 446.5V488c0 13.3-10.7 24-24 24s-24-10.7-24-24V446.5C145.2 435.7 76.3 366.8 65.5 280H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H65.5C76.3 145.2 145.2 76.3 232 65.5V24c0-13.3 10.7-24 24-24zM112 256a144 144 0 1 0 288 0 144 144 0 1 0 -288 0zm192 0a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm-144 0a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z"/></svg>
            </button>
          </div>
          <div className="absolute text-red-500 text-xs mt-1.5">{error}</div>
        </div>
        <button onClick={performSearch} className="bg-purple-600 hover:bg-purple-700 transition-colors text-white text-xl w-[100px] rounded">Find</button>
      </div>

      <div className="mt-16 flex flex-col gap-4">
        {places.map(place => (
          <div key={place.place_id} className="bg-gray-50 rounded p-4 flex gap-8">
            <div className="w-1/3 flex-shrink-0">
              <img className="rounded w-[200px] h-[150px] object-cover object-center" src={place.thumbnail} alt={place.title} />
              <div className="text-lg mt-2">{place.title}</div>
              <div className="text-gray-500 text-sm mt-1">{place.address}</div>
              <div className="flex items-center gap-1 mt-1">
                <svg className="text-yellow-400" width={14} height={14} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
                <div className="text-sm">{place.rating} ({place.total_reviews})</div>
              </div>
            </div>
            <PlaceSummary place={place} />
          </div>
        ))}
      </div>
    </main>
  );
}
