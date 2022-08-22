import './App.css';
import Webcam from 'react-webcam';
import React, {useRef, useState, useEffect} from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import * as face from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import {log, math} from "@tensorflow/tfjs";
import {type} from "@testing-library/user-event/dist/type";
import {useMediaQuery} from "react-responsive";


function App() {


    const iml = ['mid', 'to bottom left', 'to bottom right', 'top']

    const WebcamRef = useRef(null);
    const [test, setTest] = useState(0)
    const [color, setColor] = useState('white');
    const [started, setStarted] = useState(false);
    const [w, sw] = useState(0);
    const [h, sh] = useState(0);
    const [distance, setDistance] = useState(150);
    const [x0, sx0] = useState(0);
    const [y0, sy0] = useState(0);
    const [x1, sx1] = useState(0);
    const [y1, sy1] = useState(0);
    const [fx, fsx] = useState(0);
    const [fy, fsy] = useState(0);
    const [modelStatus, setModelStatus] = useState(false);
    const [fontSize, setFontSize] = useState(12);
    const [status, setStatus] = useState('Start');
    const [indexImages, setIndexImages] = useState(0)
    const [passTime, setPassTime] = useState(null)
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    let route = 0;
    let route_time = 0;

    let df = null;
    let t = 0;
    let cpa = 0
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

                // console.log(`should go from : ${hs + 10} current : ${lmy} end :${hs + (window.innerWidth / 9)}`)
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
            const faces = await model_face.estimateFaces(WebcamRef.current.video)
            if (faces[0]?.probability !== undefined) {
                sx0(Math.abs(((faces[0].topLeft[0]) / 640) * window.innerWidth))
                sy0(Math.abs(((faces[0].topLeft[1]) / 640) * window.innerHeight))

                sx1(Math.abs(((faces[0].bottomRight[0]) / 640) * window.innerWidth))
                sy1(Math.abs(((faces[0].bottomRight[1]) / 640) * window.innerHeight))

                sw(Math.abs(((faces[0].topLeft[0] - faces[0].bottomRight[0]))))
                sh(Math.abs(((faces[0].topLeft[1] - faces[0].bottomRight[1]))))

                if (cpa === 1) {
                    setDistance(Math.floor(((640 - w) / (w / 640)) / 10))
                }

            }
        }

    }

    const LoadModel = async () => {
        if (route === 0) {
            route = 1
            console.log('Loading Face Model ...')
            const model_face = await face.load(1, 640, 640, 0.4, 0.4)
            console.log('Face Model Loaded Successfully')

            const model = handPoseDetection.SupportedModels.MediaPipeHands;

            const detectorConfig = {
                runtime: 'tfjs',
                modelType: 'lite'
            }
            console.log('Loading Model ...')
            const detector = await handPoseDetection.createDetector(model, detectorConfig)
            console.log('Model Loaded Successfully')


            setModelStatus(true)
            setInterval(() => {
                run(detector, model_face)
                setPassTime(t)
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
                    height={640}
                    width={640}
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
                                width: `${distance}px`,
                                height: `${distance}px`,
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


                {/*<div*/}
                {/*    style={{*/}
                {/*        position: 'absolute',*/}
                {/*        position: 'absolute',*/}
                {/*        height: `${h}px`,*/}
                {/*        width: `${w}px`,*/}
                {/*        top: `${y0}px`,*/}
                {/*        right: `${x0}px`,*/}
                {/*        borderColor: 'cyan',*/}
                {/*        backgroundColor:'cyan',*/}
                {/*        // borderRadius: '50%',*/}
                {/*        transition: "all 0.3s"*/}
                {/*    }}/>*/}

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
                            Your current Distance is : {Math.floor(((640 - w) / (w / 640)) / 10)} cm
                        </p>
                        {Math.floor((350 - (w / 3)) / 1.6) > 60 ?
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
                                        top: '40px',
                                        left: '15px',
                                        fontSize: `${fontSize}px`,
                                    }
                                }>
                                You Can't Start the test Minimum Distance required is 60 cm
                            </p>
                        }
                    </div> : <div/>

                }
                {/*{started === true ?*/}
                {/*    <div*/}
                {/*        style={{*/}
                {/*            height: `${window.innerHeight / 2}px`,*/}
                {/*            width: `${window.innerWidth / 8}px`,*/}
                {/*            backgroundColor: 'cyan',*/}
                {/*            borderRadius: '20px',*/}
                {/*            position: 'absolute',*/}

                {/*            right: `10px`*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        <p*/}
                {/*            style={{*/}
                {/*                // position:'relative',*/}
                {/*                fontSize: `${fontSize}px`,*/}
                {/*                padding: '10px',*/}
                {/*                color: 'black'*/}
                {/*            }}>*/}
                {/*            first of all you have to get away from the camera for al least 60 cm and from the screen and*/}
                {/*            then close your one of your eyes with your hands*/}
                {/*            repeat this process for both of your eyes for the point of this test is that you shouldn't*/}
                {/*            see the lines with different thickness and you shouldn't also see different shape for the*/}
                {/*            circle*/}
                {/*        </p>*/}

                {/*    </div> : <div></div>*/}
                {/*}*/}
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
