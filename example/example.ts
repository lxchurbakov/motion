import React from 'react';

import { Base, Container } from '/src/lib/atoms';

import { Capture } from './lib/capture';
import { Grid, Text, Circle, Hexagon } from './lib/nodes';
// import {  } from 'styled-icons/bootstrap';

const MotionCapture = ({ script, ...props }) => {
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
        const pixelRatio = window.devicePixelRatio || 1;
        const canvas = canvasRef.current;

        if (!canvas) {
            return; // TODO hack for redirect out
        }

        const rect = canvas.getBoundingClientRect();

        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        canvas.width = rect.width * pixelRatio;
        canvas.height = rect.height * pixelRatio;

        const context = canvas.getContext('2d');
        context.scale(pixelRatio, pixelRatio);

        // Собственно создаём КАПТУР
        const capture = new Capture(context, rect, script);
    }, []);

    return (
        <Base {...props}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </Base>
    );
};

function * SCRIPT (s) {
    // Init phase
    const rect = yield s.rect();
    const center = { x: rect.width / 2, y: rect.height / 2 };
    // const radius = 100;

    // Slides phase

    const hexagon = new Hexagon({ position: {...center}, radius: 0, lineWidth: 3 });

    yield s.add(hexagon);

    yield s.animate(1000, (t) => {
        hexagon.radius = t * 50;
    }, s.easing.ease);

    yield s.click();

    yield s.animate(1000, (t) => {
        hexagon.radius = 50 + t * 50;
        hexagon.rotate = t * Math.PI * .5;
    }, s.easing.ease);

    yield s.click();

    const text = new Text({ position: { x: center.x, y: center.y + 12 }, text: '1', font: '32px Rubik', opacity: 0 });

    yield s.add(text);

    yield s.animate(500, (t) => {
        text.opacity = t;
        text.transform.y = (1 - t) * 20;
    }, s.easing.ease);

    const hexagon1 = new Hexagon({ position: { x: center.x + 86.5, y: center.y + 149 }, radius: 100, rotate: Math.PI * .5, lineWidth: 3 });
    const hexagon2 = new Hexagon({ position: { x: center.x - 86.5, y: center.y + 149 }, radius: 100, rotate: Math.PI * .5, lineWidth: 3 });

    yield s.add(hexagon1);
    yield s.add(hexagon2);

    yield s.animate(500, (t) => {
        hexagon1.opacity = t;
        hexagon2.opacity = t;
    }, s.easing.ease);    

    yield s.click();

    const text1 = new Text({ position: { x: center.x - 86.5, y: center.y + 159 }, text: '1', font: '32px Rubik', opacity: 1 });
    const text2 = new Text({ position: { x: center.x + 86.5, y: center.y + 159 }, text: '1', font: '32px Rubik', opacity: 1 });

    yield s.add(text1);
    yield s.add(text2);
};

export const MotionCapturePage = () => {
    return (
        <MotionCapture script={SCRIPT} w="100vw" h="100vh" />
    );
};
