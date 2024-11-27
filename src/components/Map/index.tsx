import { HeatLatLngTuple, LatLng, latLng, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Polygon, TileLayer, useMapEvents } from 'react-leaflet';
import HeatmapLayer from "react-leaflet-heat-layer";

type ApiData = {
	bpm: number;
	lat: number, 
	log: number, 
	speed: number, 
	time: Date, 
	distance: number,
}

export default function Map({className} : {className: string}) {

	const zoom = 18;
	const center = latLng(-7.117869, -38.497612);

	const [heatPoints, setHeatPoints] = useState<HeatLatLngTuple[]>([]);
  const [apiData, setApiData] = useState<ApiData[]>([]);
	const boxShape = {
		"first": latLng(-7.117502, -38.497805),
		"second": latLng(-7.117470, -38.497360),
		"third": latLng(-7.118337, -38.497338),
		"fourth": latLng(-7.118353, -38.497859)
	};

	useEffect(() => {
		fetch('http://localhost:3000/set-bound', {
			body: JSON.stringify({
				"first": latLngToArray(boxShape.first),
				"second": latLngToArray(boxShape.second),
				"third": latLngToArray(boxShape.third),
				"fourth": latLngToArray(boxShape.fourth)
			}),
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			}
		});
	}, []);

	const handleMapClick = async (e:LeafletMouseEvent) => {
    try {
      const response = await fetch('http://localhost:3000/new-data', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
      const data = await response.json();
      setApiData([...apiData, data]);
      setHeatPoints([...heatPoints, [e.latlng.lat, e.latlng.lng, 1]]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


	return (
		<>
		<span>Mapa</span>
		<MapContainer center={center} zoom={zoom} className={className} maxZoom={25} >
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxNativeZoom={18} maxZoom={25} />
			
			<HeatLayer heatPoints={heatPoints} handleMapClick={handleMapClick} />
			<Polygon pathOptions={{color: 'blue'}} positions={[ boxShape.first, boxShape.second, boxShape.third, boxShape.fourth]} />
		</MapContainer>
		</>
	)
}

function latLngToArray(value: LatLng) : number[] {
	return [value.lat, value.lng];
}

function HeatLayer({heatPoints, handleMapClick} : {heatPoints: HeatLatLngTuple[], handleMapClick: (e:LeafletMouseEvent) => void }) {
	useMapEvents({
		click: (e) => {
			handleMapClick(e);
		},
	});

	return <HeatmapLayer latlngs={heatPoints} />

}