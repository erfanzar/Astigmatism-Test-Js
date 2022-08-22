import './App.css';
import Webcam from 'react-webcam';
import React, {useRef, useState, useEffect} from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import * as faceDetection from '@tensorflow-models/face-detection'
import * as tf from '@tensorflow/tfjs'


function App() {

    const iml = ['mid', 'to bottom left', 'to bottom right', 'top']
    let v = null
    const WebcamRef = useRef(null);
    const [test, setTest] = useState(0)
    const [color, setColor] = useState('white');
    const [started, setStarted] = useState(false);
    const [w, sw] = useState(0);
    const [h, sh] = useState(0);
    const [distance, setDistance] = useState(70);

    const [fx, fsx] = useState(0);
    const [fy, fsy] = useState(0);
    const [modelStatus, setModelStatus] = useState(false);
    const [fontSize, setFontSize] = useState(12);
    const [status, setStatus] = useState('Start');
    const [indexImages, setIndexImages] = useState(0)
    let route = 0;
    let Allowed_size = 430

    let t = 0;
    let cpa = 0

    const fully_width = window.innerWidth
    const run = async (detector, model_face) => {
        if (
            typeof WebcamRef.current !== "undefined" &&
            WebcamRef.current !== null &&
            typeof WebcamRef.current.video !== "undefined"
        ) {

            const hands = await detector.estimateHands(WebcamRef.current.video)

            if (hands?.[0]?.score !== undefined) {
                fsx(Math.abs(hands[0].keypoints[8].x / 640) * window.innerWidth)
                fsy(Math.abs((hands[0].keypoints[8].y + 100) / 640) * window.innerHeight)

                const ws = window.innerWidth / 9 + 100
                const hs = window.innerWidth / 9 - window.innerWidth / 12
                const lmx = Math.abs(window.innerWidth - ((hands[0].keypoints[8].x / 640) * window.innerWidth))
                const lmy = Math.floor((hands[0].keypoints[8].y / 640) * window.innerHeight)

                if (-500 < lmx &&
                    lmx < ws &&
                    -500 < lmy &&
                    lmy < hs) {

                    setStatus('Running')
                    setStarted(true)
                    cpa = 1
                }
                if (-500 < lmx &&
                    lmx < ws + 20 + (window.innerWidth / 9) &&
                    hs + 10 < lmy &&
                    lmy < hs + (window.innerWidth / 9)
                ) {
                    console.log('line Test')
                    setTimeout(() => {
                            if (test === 0) {
                            }
                            setTest(1)
                        }
                        , 1000
                    )
                }
                if (-500 < lmx &&
                    lmx < ws + 40 + ((window.innerWidth / 9)) &&
                    hs + 10 + (window.innerWidth / 9) < lmy &&
                    lmy < hs + ((window.innerWidth / 9) * 2)
                ) {
                    console.log('Dial Test')
                    setTimeout(() => {
                            if (test === 1) {
                            }
                            setTest(0)
                        }
                        , 1000
                    )
                }
            }
            const video = WebcamRef.current.video
            const faces = await model_face.estimateFaces(video, false)

            if (faces.length > 0) {
                sw(faces[0].box.width)
                sh(faces[0].box.height)

                const fw = WebcamRef.current.video.videoWidth
                let wa = (faces[0].box.width / fw) * 640
                console.log(faces)
                console.log(WebcamRef.current.video.videoWidth)

                if (wa * 10 < 15) {
                    setDistance("Nan");
                } else {
                    setDistance(Math.floor(((wa * 10) * 2.6) * 1.5));
                }


            }
        }

    }

    const LoadModel = async () => {
        if (route === 0) {
            route = 1

            console.log('Loading Face Model ...')
            const faceModel = faceDetection.SupportedModels.MediaPipeFaceDetector;
            const model_face = await faceDetection.createDetector(faceModel, {
                runtime: 'tfjs',
                maxFaces: 1,
                modelType: 'full'
            })
            console.log('Face Model Loaded Successfully')

            const model = handPoseDetection.SupportedModels.MediaPipeHands;

            const detectorConfig = {
                runtime: 'tfjs',
                modelType: 'full'
            }
            console.log('Loading Model ...')
            const detector = await handPoseDetection.createDetector(model, detectorConfig)
            console.log('Model Loaded Successfully')


            setModelStatus(true)
            setInterval(() => {
                run(detector, model_face)
                // setPassTime(t)
            }, 100)
        }
    }


    const changeImage = () => {

        setInterval(() => {
            const k = Math.random() * 4
            const l = Math.floor(k)
            if (test === 1) {

                setIndexImages(l)

            }
        }, 7000)

    }


    useEffect(() => {
        LoadModel().then()
        changeImage()
    }, [])

    if (modelStatus === true) {
        return (
            <div
                style={{
                    overflow: 'hidden',
                    width: '100vw',
                    height: '100vh',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: `${color}`,
                    padding: '10px',
                    position: 'relative'
                }}>

                <Webcam
                    ref={WebcamRef}
                    mirrored={true}
                    style={{
                        height: '0px',
                        width: '0px'
                    }}/>
                <div style={{
                    flexDirection: 'column',
                    justifyContent: "space-between",
                }}>
                    {test === 0 ?
                        <img
                            src={'./assets/images/Dg.jpg'} alt={'test'} style={
                            {
                                display: "flex",
                                width: `${50}px`,
                                height: `${50}px`,
                                alignItems: "center",
                                margin: "auto"
                            }
                        }/> : <img
                            src={`./assets/images/${iml[indexImages]}.png`} alt={'test'} style={
                            {
                                display: "flex",
                                width: `${distance}px`,
                                height: `${distance}px`,
                                alignItems: "center",
                                margin: "auto"
                            }
                        }/>}
                    <br/>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}><span>Steps To Do</span>
                        <span>Position yourself 2-10 feet away from the screen</span>
                        <span>Start by closing one eye and looking </span>
                        <span>carefully at the lines.</span>
                        <span>Repeat this with both eyes.</span>

                    </div>

                </div>


                <div
                    style={{
                        position: 'absolute',
                        height: `10px`,
                        width: `10px`,
                        top: `${fy}px`,
                        right: `${fx}px`,
                        backgroundColor: 'cyan',
                        borderRadius: '50%',
                        // transition: "all 0.3s"
                    }}/>
                <div onClick={() => {
                    setStatus('Running')
                    setStarted(true)
                    cpa = 1
                }}
                     style={started === true ? {
                         top: '50px',
                         left: `10px`,
                         borderColor: 'cyan',
                         borderInlineColor: 'cyan',
                         borderWidth: '20px',
                         borderInlineWidth: '60px',
                         border: '3px solid cyan',
                         backgroundColor: 'cyan',
                         position: 'absolute',
                         alignItems: 'center',
                         alignContent: 'center',
                         borderRadius: `${(window.innerWidth / 9) / 4}px`,
                         height: `${window.innerWidth / 9}px`,
                         width: `${window.innerWidth / 9}px`,
                         display: 'flex',
                         justifyContent: 'center',
                     } : {
                         top: '50px',
                         left: `10px`,
                         borderColor: 'cyan',
                         borderInlineColor: 'cyan',
                         borderWidth: '20px',
                         borderInlineWidth: '60px',
                         border: '3px solid cyan',
                         position: 'absolute',
                         alignItems: 'center',
                         alignContent: 'center',
                         borderRadius: `${(window.innerWidth / 9) / 4}px`,
                         height: `${window.innerWidth / 9}px`,
                         width: `${window.innerWidth / 9}px`,
                         display: 'flex',
                         justifyContent: 'center',
                     }}>
                    <a
                        style={started === true ? {
                            fontSize: `${fontSize}px`,
                            color: 'white',
                        } : {
                            fontSize: `${fontSize}px`,
                            color: 'cyan',
                        }}
                    >
                        {status}
                    </a>
                </div>


                <div
                    style={test === 1 ? {
                        top: `${window.innerWidth / 9 + 70}px`,
                        left: `10px`,
                        borderColor: 'cyan',
                        borderInlineColor: 'cyan',
                        borderWidth: '20px',
                        borderInlineWidth: '60px',
                        border: '3px solid cyan',
                        position: 'absolute',
                        backgroundColor: 'cyan',
                        alignItems: 'center',
                        alignContent: 'center',
                        borderRadius: `${(window.innerWidth / 9) / 4}px`,
                        height: `${window.innerWidth / 9}px`,
                        width: `${window.innerWidth / 9}px`,
                        display: 'flex',
                        justifyContent: 'center',

                    } : {
                        top: `${window.innerWidth / 9 + 70}px`,
                        left: `10px`,
                        borderColor: 'cyan',
                        borderInlineColor: 'cyan',
                        borderWidth: '20px',
                        borderInlineWidth: '60px',
                        border: '3px solid cyan',
                        position: 'absolute',

                        alignItems: 'center',
                        alignContent: 'center',
                        borderRadius: `${(window.innerWidth / 9) / 4}px`,
                        height: `${window.innerWidth / 9}px`,
                        width: `${window.innerWidth / 9}px`,
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                    <a
                        style={test === 1 ? {

                            fontSize: `${fontSize}px`,
                            color: 'white',

                        } : {

                            fontSize: `${fontSize}px`,
                            color: 'cyan',

                        }}
                    >
                        Line
                    </a>
                </div>


                <div
                    style={test === 0 ? {
                        top: `${(window.innerWidth / 9) * 2 + 90}px`,
                        left: `10px`,
                        borderColor: 'cyan',
                        borderInlineColor: 'cyan',
                        borderWidth: '20px',
                        borderInlineWidth: '60px',
                        border: '3px solid cyan',
                        position: 'absolute',
                        backgroundColor: 'cyan',
                        alignItems: 'center',
                        alignContent: 'center',
                        borderRadius: `${(window.innerWidth / 9) / 4}px`,
                        height: `${window.innerWidth / 9}px`,
                        width: `${window.innerWidth / 9}px`,
                        display: 'flex',
                        justifyContent: 'center',

                    } : {
                        top: `${(window.innerWidth / 9) * 2 + 90}px`,
                        left: `10px`,
                        borderColor: 'cyan',
                        borderInlineColor: 'cyan',
                        borderWidth: '20px',
                        borderInlineWidth: '60px',
                        border: '3px solid cyan',
                        position: 'absolute',

                        alignItems: 'center',
                        alignContent: 'center',
                        borderRadius: `${(window.innerWidth / 9) / 4}px`,
                        height: `${window.innerWidth / 9}px`,
                        width: `${window.innerWidth / 9}px`,
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                    <a
                        style={test === 0 ? {

                            fontSize: `${fontSize}px`,
                            color: 'white',

                        } : {

                            fontSize: `${fontSize}px`,
                            color: 'cyan',

                        }}
                    >
                        Dial
                    </a>
                </div>

                {started === true ?
                    <div style={{
                        backgroundColor: 'cyan',
                        border: '4px solid cyan',
                        position: 'absolute',
                        alignSelf: 'end',
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        alignContent: 'center',
                        borderRadius: `20px`,
                        height: `100px`,
                        width: `280px`,

                    }}>
                        <p
                            style={
                                {
                                    position: 'absolute',
                                    top: '5px',
                                    left: '15px',
                                    fontSize: `${fontSize}px`,
                                }
                            }>
                            Your current Distance is : {distance} cm
                        </p>
                        {Math.floor((640 * w) / 5000) > 60 ?
                            <p
                                style={
                                    {
                                        position: 'absolute',
                                        top: '30px',
                                        left: '15px',
                                        fontSize: `${fontSize}px`,
                                    }
                                }>
                                You Can Start Minimum Distance required is 60 cm
                            </p> : <p
                                style={
                                    {
                                        position: 'absolute',
                                        top: '30px',
                                        left: '15px',
                                        fontSize: `${fontSize}px`,
                                    }
                                }>
                                You Can't Start the test Minimum Distance required is 60 cm
                            </p>

                        }
                        <p
                            style={
                                {
                                    position: 'absolute',
                                    top: '70px',
                                    left: '15px',
                                    fontSize: `${fontSize}px`,
                                }
                            }>
                            Width f Person {w}
                        </p>

                    </div> : <div/>

                }
            </div>
        )
    } else {
        return (
            <div className='loading'>
                <p style={{
                    color: 'cyan'
                }}>
                    Loading Model From Server...
                </p>
                <p style={{
                    color: 'cyan'
                }}>
                    Please Be Patient
                </p>
                <div class="loader">Loading...</div>
            </div>
        )
    }
}


export default App;
