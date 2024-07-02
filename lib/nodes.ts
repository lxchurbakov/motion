type Point = { x: number, y: number };

const fill = (n, p) => new Array(n).fill(0).map((_, i) => p(i));

export class Node {
    public transform: Point;
    public scale: number;
    public rotate: number;
    public opacity: number;

    constructor ({ scale = 1, transform = { x: 0, y: 0 }, rotate = 0, opacity = 1 }) {
        this.scale = scale;
        this.transform = transform;
        this.rotate = rotate;
        this.opacity = opacity;
    }

    public render (context, rect, inner) {
        context.save();

        context.globalAlpha = this.opacity;
        context.translate(this.transform.x, this.transform.y);
        context.rotate(this.rotate);
        

        inner();

        context.restore();
    };
}

export class Text extends Node {
    public position: Point;
    public text: string;
    public font: string;
    public align: string;

    constructor ({ position = { x: 0, y: 0 }, text, font = '18px Rubik', align = 'center', ...options }) {
        super(options);

        this.position = position;
        this.text = text;
        this.font = font;
        this.align = align;
    }

    public render (context, rect, inner) {
        super.render(context, rect, () => {
            context.font = this.font;
            context.textAlign = this.align;

            context.beginPath();
            context.fillText(this.text, this.position.x, this.position.y);
        });
    };
}

export class Circle extends Node {
    public position: Point;
    public fill: string;
    public stroke: string;
    public radius: number;
    public lineWidth: number;

    constructor ({ position, fill = 'transparent', stroke = '#222222', lineWidth = 1, radius, ...options }) {
        super(options);

        this.radius = radius;
        this.position = position;
        this.fill = fill;
        this.stroke = stroke;
        this.lineWidth = lineWidth;
    }   

    public render (context, rect) {
        super.render(context, rect, () => {
            context.fillStyle = this.fill;
            context.strokeStyle = this.stroke;
            context.lineWidth = this.lineWidth;

            context.beginPath();
            context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

            context.fill();
            context.stroke();
        });
    }
};


export class Polygon extends Node {
    public points: Point[];
    public fill: string;
    public stroke: string;
    public lineWidth: number;

    constructor ({ points, fill = 'transparent', stroke = '#222222', lineWidth = 1, ...options }) {
        super(options);

        this.points = points;
        this.fill = fill;
        this.stroke = stroke;
        this.lineWidth = lineWidth;
    }   

    // public morph

    public render (context, rect) {
        super.render(context, rect, () => {
            context.fillStyle = this.fill;
            context.strokeStyle = this.stroke;
            context.lineWidth = this.lineWidth;

            context.beginPath();

            context.moveTo(this.points[0].x, this.points[0].y);

            for (let point of this.points) {
                context.lineTo(point.x, point.y);
            }

            // context.lineTo(this.points[0].x, this.points[0].y);
            context.closePath();

            // context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

            context.fill();
            context.stroke();
        });
    }
};

export class Hexagon extends Polygon {
    public position: Point;
    public radius: number;

    constructor ({ position, radius, ...options }) {
        super({ points: [], ...options });

        this.transform = position;
        this.radius = radius;
        // this.points = points;
        // this.fill = fill;
        // this.stroke = stroke;
        // this.lineWidth = lineWidth;
    }   

    public render (context, rect) {
        this.points = fill(6, (index) => {
            return {
                x: Math.cos(Math.PI * 2 * index / 6) * this.radius,
                y: Math.sin(Math.PI * 2 * index / 6) * this.radius,
            };
        });

        super.render(context, rect)
    }
};

export class Grid extends Node {
    public node: Node;
    public size: Point;
    public dimensions: Point;

    constructor ({ node, size, dimensions, ...options }) {
        super(options);

        this.node = node;
        this.size = size;
        this.dimensions = dimensions;
    }

    render (context, rect) {
        for (let x = 0; x < this.dimensions.x; ++x) {
            for (let y = 0; y < this.dimensions.y; ++y) {

                context.save();
                context.translate(x * this.size.x, y * this.size.y);
                this.node.render(context, rect, () => {});
                context.restore();
            }
        }
    }
};
