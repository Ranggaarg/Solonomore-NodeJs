
const euclideanDistance = (point1, point2) => {
    return Math.sqrt(point1.reduce((sum, val, index) => sum + Math.pow(val - point2[index], 2), 0));
};

const calculateCentroid = (points) => {
    const numPoints = points.length;
    const numDimensions = points[0].length;

    const centroid = new Array(numDimensions).fill(0);
    points.forEach(point => {
        point.forEach((val, index) => {
            centroid[index] += val;
        });
    });

    return centroid.map(val => val / numPoints);
};


const kMeans = (data, k, maxIterations = 100) => {
    const centroids = data.slice(0, k);

    let iterations = 0;
    let oldCentroids = [];
    let clusters = new Array(k).fill().map(() => []);

    while (iterations < maxIterations && JSON.stringify(oldCentroids) !== JSON.stringify(centroids)) {
        oldCentroids = JSON.parse(JSON.stringify(centroids));

        clusters = new Array(k).fill().map(() => []);
        data.forEach(point => {
            let minDistance = Infinity;
            let closestCentroid = 0;

            centroids.forEach((centroid, index) => {
                const distance = euclideanDistance(point, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroid = index;
                }
            });

            clusters[closestCentroid].push(point);
        });

        clusters.forEach((cluster, index) => {
            if (cluster.length > 0) {
                centroids[index] = calculateCentroid(cluster);
            }
        });

        iterations++;
    }

    return { clusters, centroids };
};

module.exports = kMeans;
