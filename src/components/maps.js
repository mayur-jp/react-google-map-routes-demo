import React from 'react';
import { withGoogleMap, withScriptjs, GoogleMap, Polyline, Marker } from 'react-google-maps'

class Map extends React.Component {
    state = {
        progress: [],
    }

    path = [
        { lat: 21.183183, lng: 72.830836 },
        { lat: 21.182139, lng: 72.831630 },
        { lat: 21.181264, lng: 72.832136 },
        { lat: 21.179850, lng: 72.832930 },
        { lat: 21.178402, lng: 72.833941 },
        { lat: 21.177190, lng: 72.834916 },
        { lat: 21.175751, lng: 72.836232 },
        { lat: 21.174323, lng: 72.837584 },
        { lat: 21.173573, lng: 72.838228 },
        { lat: 21.172891, lng: 72.838753 },
        { lat: 21.172448, lng: 72.839094 },
    ]

    velocity = 5
    initialDate = new Date()

    getDistance = () => {
        const differentInTime = (new Date() - this.initialDate) / 100;
        return differentInTime * this.velocity
    }

    componentDidMount = () => {
        this.interval = window.setInterval(this.moveObject, 100)
    }

    componentWillUnmount = () => {
        window.clearInterval(this.interval)
    }

    moveObject = () => {
        const distance = this.getDistance()
        if (!distance) {
            return;
        }

        let progress = this.path.filter(coordinates => coordinates.distance < distance);

        const nextLine = this.path.find(coordinates => coordinates.distance > distance);
        if (!nextLine) {
            this.setState({ progress });
            return;
        }
        const lastLine = progress[progress.length - 1];

        const lastLineLatLng = new window.google.maps.LatLng(
            lastLine.lat,
            lastLine.lng
        );

        const nextLineLatLng = new window.google.maps.LatLng(
            nextLine.lat,
            nextLine.lng
        );

        // distance of this line 
        const totalDistance = nextLine.distance - lastLine.distance;
        const percentage = (distance - lastLine.distance) / totalDistance;

        const position = window.google.maps.geometry.spherical.interpolate(
            lastLineLatLng,
            nextLineLatLng,
            percentage
        );

        progress = progress.concat(position);
        this.setState({ progress })
    }

    componentWillMount = () => {
        this.path = this.path.map((coordinates, i, array) => {
            if (i === 0) {
                return { ...coordinates, distance: 0 }
            }
            const { lat: lat1, lng: lng1 } = coordinates;
            const latLong1 = new window.google.maps.LatLng(lat1, lng1);

            const { lat: lat2, lng: lng2 } = array[0];
            const latLong2 = new window.google.maps.LatLng(lat2, lng2);

            // in meters:
            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                latLong1,
                latLong2
            );

            return { ...coordinates, distance };
        })

    }

    render = () => {
        return (
            <GoogleMap
                defaultZoom={16}
                defaultCenter={{ lat: 21.183183, lng: 72.830836 }}
            >
                { this.state.progress && (
                    <>
                        <Polyline path={this.state.progress} options={{ strokeColor: "#FF0000" }} />
                        <Marker position={this.state.progress[this.state.progress.length - 1]} />
                    </>
                )}
            </GoogleMap>
        )
    }
}

const MapComponent = withScriptjs(withGoogleMap(Map))

export default () => (
    <MapComponent
        googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `100vh`, width: '100wh' }} />}
        mapElement={<div style={{ height: `100%` }} />}
    />
)