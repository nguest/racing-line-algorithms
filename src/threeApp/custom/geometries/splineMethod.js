// https://www.youtube.com/watch?v=FlieT66N9OM
// https://github.com/OneLoneCoder/videos/blob/master/OneLoneCoder_RacingLines.cpp

export const splineMethod = (cpPoints, binormals, tangents, trackHalfWidth) => {
  const displacement = new Array(cpPoints.length).fill(0);
  const racingLineSpline = cpPoints.map((p) => p.clone());
  const nIterations = 5;
  const edgeTouches = {};
  const tolerance = 0.5;

  const alpha = 7; // shortest
  const beta = 0.3; // curvature

  for (let i = 0; i < nIterations; i++) {
    for (let j = 0; j < racingLineSpline.length; j++) {
      // Get locations of neighbour nodes
      const pointRight = racingLineSpline[(j + 1) % racingLineSpline.length].clone();
      const pointLeft = racingLineSpline[(j + racingLineSpline.length - 1) % racingLineSpline.length].clone();
      const pointMiddle = racingLineSpline[j].clone();

      // Create vectors to neighbours & normalize
      const vectorLeft = pointLeft.sub(pointMiddle).normalize();
      const vectorRight = pointRight.sub(pointMiddle).normalize();

      // Add together to create bisector vector
      const vectorSum = vectorLeft.add(vectorRight);

      // Get point gradient and normalise
      const g = binormals[j].clone();

      // Project required correction onto point tangent to give displacement
      const dotProduct = g.dot(vectorSum);

      // Shortest path
      displacement[j] += (dotProduct * alpha);

      // Curvature
      displacement[(j + 1) % racingLineSpline.length] += dotProduct * -beta;
      displacement[(j - 1 + racingLineSpline.length) % racingLineSpline.length] += dotProduct * -beta;
      if (
        (displacement[j] > trackHalfWidth - tolerance
        || displacement[j] < -trackHalfWidth + tolerance)
        && !Object.keys(edgeTouches).includes(j)) {
        edgeTouches[j] = { idx: j, side: Math.sign(displacement[j]) };
      }
    }

    // Clamp displaced points to track width
    for (let j = 0; j < cpPoints.length - 1; j++) {
      if (displacement[j] >= trackHalfWidth) displacement[j] = trackHalfWidth;
      if (displacement[j] <= -trackHalfWidth) displacement[j] = -trackHalfWidth;

      racingLineSpline[j] = cpPoints[j].clone().add(binormals[j].clone().multiplyScalar(displacement[j]));
      if (j === 20) console.log({ a: displacement[j], b: racingLineSpline[j] });
    }
  }

  console.log({ displacement, racingLineSpline, edgeTouches });
  return { racingLineSpline, edgeTouches };

}
