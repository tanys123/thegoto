'use server'

import { getJson } from "serpapi"
import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getReviews(placeId) {
    const response = await getJson({
        engine: "google_maps_reviews",
        api_key: process.env.SERPAPI_API_KEY,
        place_id: placeId,
    })

    const reviews = response["reviews"] || []
    return reviews.map(review => ({
        link: review['link'],
        rating: review['rating'],
        snippet: review['snippet'],
        likes: review['likes'],
        details: review['details'],
        response_from_owner: review['response']?.['snippet'],
    }))
}

export async function searchPlaces(query, coordinates) {
    const response = await getJson({
        engine: "google_maps",
        api_key: process.env.SERPAPI_API_KEY,
        q: query,
        ll: coordinates,
    })

    let places = response['local_results'] || []
    places = places.map(place => ({
        place_id: place['place_id'],
        title: place['title'],
        gps_coordinates: place['gps_coordinates'],
        rating: place['rating'],
        total_reviews: place['reviews'],
        types: place['types'],
        address: place['address'],
        description: place['description'],
        thumbnail: place['thumbnail'],
    }))
    
    for (let i = 0; i < places.length; i++) {
        places[i]['reviews'] = await getReviews(places[i]['place_id'])
    }

    return places
}

export async function getSummary(place, preference) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "system",
            "content": [
              {
                "type": "text",
                "text": `You’re an expert moderator. You are great at looking at the reviews for a given place and summarizing the good and bad aspects. It is also great to show a highlights section to the user. Take user preference (if present) into consideration when deciding if you recommend or not. When a JSON is provided by the user, look for the good and bad points, then return the result in JSON format with new keys ‘good’ and ‘bad’.
Response format:
{ good: [string], bad: [string], highlights: [string], recommended: true/false, reason: string }`
              }
            ]
          },
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": `${JSON.stringify(place)}
Preference:
${preference}`
              }
            ]
          },
        ],
        temperature: 1,
        max_tokens: 4095,
        response_format: { type: "json_object" }
    });

    return JSON.parse(response['choices'][0]['message']['content'])
}