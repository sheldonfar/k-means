$(document).ready(function () {
    var kmeans = new KMeans($('#canvas')[0]);

    kmeans.createPoints($('#point-count').val());
    kmeans.createCentroids($('#centroids-count').val());


    $('#random-points').click(function () {
        kmeans.createPoints($('#point-count').val());
    });

    $('#random-centroids').click(function () {
        kmeans.createCentroids($('#centroids-count').val());
    });

    $('#step').click(function () {
        kmeans.step();
    })
});


function KMeans(canvas) {
    this.canvas = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.samples = [];
    this.centroids = [];
    this.assignments = [];

    this.createPoints = function (number) {
        this.samples = [];

        for (var i = 0; i < number; i++) {
            var x = getRandomInt(10, this.width - 10);
            var y = getRandomInt(10, this.height - 10);
            this.samples.push({
                x: x,
                y: y,
                size: 5,
                stroke: 'black',
                fill: 'rgba(255, 0, 0, 0.0)'
            });
        }

        this.repaint();
    };

    this.createCentroids = function (number) {
        this.centroids = [];

        for (var i = 0; i < number; i++) {
            var x = getRandomInt(10, this.width - 10);
            var y = getRandomInt(10, this.height - 10);
            var color = rainbow(number, i);
            this.centroids.push({
                x: x,
                y: y,
                size: 7,
                stroke: color,
                fill: color
            });
        }

        this.repaint();
    };

    this.step = function () {
        $.each(this.samples, function (index, sample) {
            var dists = $.map(this.centroids, function (centroid) {
                return Math.sqrt(Math.pow(sample.x - centroid.x, 2) + Math.pow(sample.y - centroid.y, 2));
            });
            this.assignments[index] = dists.indexOf(Math.min.apply(null, dists));
        }.bind(this));

        this.updateCentroids();
    };

    this.updateCentroids = function () {
        $.each(this.centroids, function (centroidIndex) {
            var cluster = $.grep(this.samples, function (sample, i_sample) {
                return (this.assignments[i_sample] === centroidIndex);
            }.bind(this));


            if (cluster.length > 0) {
                this.centroids[centroidIndex].x = 0;
                this.centroids[centroidIndex].y = 0;
                $.each(cluster, function (i, sample) {
                    this.centroids[centroidIndex].x += sample.x / cluster.length;
                    this.centroids[centroidIndex].y += sample.y / cluster.length;
                }.bind(this));
            }
        }.bind(this));

        this.repaint();
    };

    this.repaint = function () {
        this.reset();

        $.each([this.samples, this.centroids], function (index, array) {
            $.each(array, function (index, point) {
                this.canvas.beginPath();
                this.canvas.arc(point.x, point.y, point.size, 0, Math.PI * 2, true);
                this.canvas.closePath();
                this.canvas.fillStyle = point.fill;
                this.canvas.fill();
                this.canvas.strokeStyle = point.stroke;
                this.canvas.stroke();
            }.bind(this));
        }.bind(this));

        $.each(this.assignments, function (sample_num, mean_num) {
            var mean = this.centroids[mean_num];
            var sample = this.samples[sample_num];

            this.canvas.beginPath();
            this.canvas.moveTo(mean.x, mean.y);
            this.canvas.lineTo(sample.x, sample.y);
            this.canvas.strokeStyle = 'magenta';
            this.canvas.stroke();
        }.bind(this));
    };

    this.reset = function () {
        this.canvas.clearRect(0, 0, this.width, this.height);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rainbow(numOfSteps, step) {
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6) {
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}
