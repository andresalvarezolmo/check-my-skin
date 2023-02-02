import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Spin } from 'antd';


const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";
const BACKEND_IP = "127.0.0.1";
function WebcamCapture() {

    const webcamRef = useRef(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
    const [statusCode, setStatusCode] = useState(null);

    const capture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setLoading(true);  // Set loading to true

        const payload = new FormData();
        payload.append('uploadedFile',
            new File([imageSrc], 'image.jpg',
                { type: 'image/jpeg' })
        );
        try {
            const response = await fetch(`${BACKEND_IP}`, {
                method: 'POST',
                body: payload,
                contentType: 'application/octet-stream'
            });
            if (!response.ok) {
                setStatusCode(response.status);
            }
            const data = await response.json();
            setResponse(data);
            setStatusCode(null);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    // Use the useEffect hook to request camera permission
    useEffect(() => {
        const requestPermission = async () => {
            try {
                // Request camera permission
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });

                // Set the permission status to true
                setHasPermission(true);

                // Release the stream when the component unmounts
                return () => stream.getTracks().forEach((track) => track.stop());
            } catch (error) {
                console.error(error);
            }
        }

        requestPermission();
    }, []);


    const Loading = () => {
        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Spin size="large" />
            </div>
        );
    };
    const handleClick = React.useCallback(() => {
        setFacingMode((prevState) =>
            prevState === FACING_MODE_USER
                ? FACING_MODE_ENVIRONMENT
                : FACING_MODE_USER
        );
    }, []);

    let videoConstraints = {
        facingMode: facingMode
    };

    return (
        <div>
            <Webcam
                ref={webcamRef}
                videoConstraints={videoConstraints}
            />
            <br></br>
            <Button
                onClick={handleClick}
            >
                Change Camera
            </Button>
            {loading ? <Loading /> :
                <Button onClick={capture} variant="primary">Capture</Button>}

            {!loading && response && (
                <ListGroup>
                    {Object.entries(response).map(([key, value]) => (
                        <ListGroupItem key={key}>
                            <span className="key">{key}:</span>
                            <span className="value">{JSON.stringify(value)}</span>
                        </ListGroupItem>
                    ))}
                </ListGroup>
            )}

            {statusCode && ( // check if statusCode is not null
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <h2>Error with HTTP Code {statusCode}</h2>
                </div>
            )}
            
        </div>
    );
}

export default WebcamCapture;