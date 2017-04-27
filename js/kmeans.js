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

    $('#csv-file-selector').on('change', function (e) {
        readFile(e, function (contents) {
            console.warn("CRRR");
            kmeans.createPoints(null, contents);
        });
    });

    $('#step').click(function () {
        kmeans.step();
    });
});

function Point(canvas, x, y, size, stroke, fill) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;
    this.size = size;
    this.stroke = stroke;
    this.fill = fill;

    this.paint = function () {
        this.canvas.beginPath();
        this.canvas.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
        this.canvas.closePath();
        this.canvas.fillStyle = this.fill;
        this.canvas.fill();
        this.canvas.strokeStyle = this.stroke;
        this.canvas.stroke();
    }
}


function KMeans(canvas) {
    this.canvas = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.samples = [];
    this.centroids = [];
    this.assignments = [];

    canvas.addEventListener('mousemove', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var BB = canvas.getBoundingClientRect();
        var offsetX = BB.left;
        var offsetY = BB.top;

        var mouseX = parseInt(e.clientX - offsetX);
        var mouseY = parseInt(e.clientY - offsetY);
        this.repaint();
        $.each([this.samples, this.centroids], function (index, array) {
            $.each(array, function (index, point) {
                var dx = mouseX - point.x;
                var dy = mouseY - point.y;
                if (dx * dx + dy * dy < point.size * point.size) {
                    this.canvas.font = 'bold 16px Arial';
                    this.canvas.fillStyle = 'black';
                    console.warn(point.x, point.y);
                    this.canvas.fillText('(' + point.x + ', ' + point.y + ')', point.x + 10, point.y + 10);
                }
            }.bind(this));
        }.bind(this));
    }.bind(this));

    this.createPoints = function (number, data) {
        this.samples = [];
        this.assignments = [];

        var size = 5;
        var stroke = 'black';
        var fill = 'rgba(255, 0, 0, 0.0)';

        if (data) {
            this.centroids = [];
            var lines = data.split('\n');
            for (var j = 0; j < lines.length; j++) {
                if (lines[j].length) {
                    var coordinates = lines[j].split(',');
                    this.samples.push(new Point(this.canvas, +coordinates[0], +coordinates[1], size, stroke, fill));
                    if (coordinates[2] && coordinates[3]) {
                        var color = rainbow(lines.length, j);
                        this.centroids.push(new Point(this.canvas, +coordinates[2], +coordinates[3], 7, color, color));
                    }
                }
            }
        } else {
            for (var i = 0; i < number; i++) {
                var x = getRandomInt(10, this.width - 10);
                var y = getRandomInt(10, this.height - 10);
                this.samples.push(new Point(this.canvas, x, y, size, stroke, fill));
            }
        }

        this.repaint();
    };

    this.createCentroids = function (number) {
        this.centroids = [];
        this.assignments = [];

        for (var i = 0; i < number; i++) {
            var x = getRandomInt(10, this.width - 10);
            var y = getRandomInt(10, this.height - 10);
            var color = rainbow(number, i);
            this.centroids.push(new Point(this.canvas, x, y, 7, color, color));
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
                point.paint();
            }.bind(this));
        }.bind(this));

        $.each(this.assignments, function (sample_num, mean_num) {
            var centroid = this.centroids[mean_num];
            var sample = this.samples[sample_num];

            this.canvas.beginPath();
            this.canvas.moveTo(centroid.x, centroid.y);
            this.canvas.lineTo(sample.x, sample.y);
            this.canvas.strokeStyle = centroid.fill;
            this.canvas.stroke();
        }.bind(this));
    };

    this.reset = function () {
        this.canvas.clearRect(0, 0, this.width, this.height);
    }
}

function readFile(e, cb) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        cb(e.target.result);
    };
    reader.readAsText(file);
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
