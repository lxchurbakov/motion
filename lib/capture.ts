
// const now = () => new Date().getTime();


// const c = (() => {
//     let rect = null;

//     let objects = [];

//     const hexagon = (params) => {
//         let obj = { render: (context, rect) => {
//             context.beginPath();
//             context.rect(obj.x, obj.y, 50, 50);
//             context.fill();
//         }, ...params };

//         objects.push(obj);

//         return {
//             x: (v) => { obj.x = v },
//             // x: (v) => { obj.x = v },
//         };
//     };

//     const animate = (ms, predicate, cb = linear) => {
//         let resolved = false;
//         let start = now();

//         const render = () => {
//             if (resolved) {
//                 return
//             }

//             predicate(cb((now() - start) / ms));

//             requestAnimationFrame(render);
//         };

//         render();

//         return new Promise<void>((resolve) => {
//             setTimeout(() => {
//                 resolved = true;
//                 resolve();
//             }, ms);
//         });
//     };

//     return {
//         rect: () => rect,
//         hexagon,
//         animate,
//         render: (context, $) => {
//             rect = $;

//             objects.forEach((obj) => {
//                 obj.render(context, $);
//             });
//         },
//     };
// })();

// const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const now = () => new Date().getTime();

class CaptureHandbook {
    wait = (ms) => {
        return { type: 'promise', promise: new Promise((r) => setTimeout(r, ms)) };
    };

    click = () => {
        return { type: 'click' };
    };

    add = (object) => {
        return { type: 'add', object };
    };

    rect = () => {
        return { type: 'rect' };
    };

    animate = (duration, cb, easing = this.easing.linear) => {
        let out = false;
        let start = now();

        const update = () => {
            if (out) {
                return;
            }

            cb(easing((now() - start) / duration));

            requestAnimationFrame(update);
        };

        update();
        
        return { type: 'promise', promise: new Promise<void>((resolve) => setTimeout(() => {
            resolve();
            out = true;
        }, duration)) };
    };

    easing = {
        linear: (t) => t,
        cubic: (t) => t * t,
        ease: (t) => t > 0.5 ? 4*Math.pow((t-1),3)+1 : 4*Math.pow(t,3),
    };
};

export class Capture {
    private objects = [];
    private handbook = new CaptureHandbook();

    constructor (private context, private rect, private script) {
        // Init stuff

        this.start();
        this.render();
    }

    start = async () => {
        const it = this.script(this.handbook);
        let $ = null;

        while (true) {
            const { done, value } = it.next($);

            if (done) {
                break;
            }

            if (value.type === 'add') {
                this.objects.push(value.object);
            }

            if (value.type === 'click') {
                await new Promise<void>((resolve) => {
                    const handler = () => {
                        resolve();
                        document.removeEventListener('click', handler);
                    };

                    document.addEventListener('click', handler);
                });
            }

            if (value.type === 'rect') {
                $ = this.rect;
            }

            if (value.type === 'promise') {
                await value.promise;
            }
        }
    };

    render = () => {
        this.context.clearRect(0, 0, this.rect.width, this.rect.height);

        // render objects
        for (let object of this.objects) {
            object.render(this.context, this.rect);
        }

        requestAnimationFrame(this.render.bind(this));
    };
};
