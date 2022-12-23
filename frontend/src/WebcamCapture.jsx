import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import { ListGroup, ListGroupItem } from 'react-bootstrap';


import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Spin } from 'antd';

function WebcamCapture() {
    const webcamRef = useRef(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const capture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setLoading(true);  // Set loading to true

        const payload = new FormData();
        payload.append('uploadedFile',
            new File([imageSrc], 'image.jpg',
                { type: 'image/jpeg' })
        );
        try {
            const response = await fetch('http://localhost:8000/?image', {
                method: 'POST',
                body: payload,
                contentType: 'application/octet-stream'
            });
            const data = await response.json();
            setResponse(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const Loading = () => {
        return (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Spin size="large" />
          </div>
        );
      };

    return (
        <div>
            <Webcam ref={webcamRef} />
            <br></br>
            { loading ? <Loading /> :
            <Button onClick={capture} variant="primary">Capture</Button>}
            
            { !loading && response && (
                <ListGroup>
                    {Object.entries(response).map(([key, value]) => (
                        <ListGroupItem key={key}>
                            <span className="key">{key}:</span>
                            <span className="value">{JSON.stringify(value)}</span>
                        </ListGroupItem>
                    ))}
                </ListGroup>
            )}
        </div>
    );
}

export default WebcamCapture;