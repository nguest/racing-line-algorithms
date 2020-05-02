/*
For each node Prev on Line 5
{
    For each node Next on Line 7
    {
        This Route Value = SegmentValue( Prev to Cur to Nex) + Next’s RVM[1].m_routeValue;

        If (This Route Value &gt; Best Route Value So Far)
        {
            Best Route Value So Far = This Route Value;
            Best Next Node So Far = Next ;
        }
    }
    Cur’s RVM [ Prev ].m_routeValue = Best Route Value So Far;
    Cur’s RVM [ Prev ].m_routeNextNode = Best Next Node So Far;
}
*/

export const recursionMethod = (matrix, cpCount, wpCount) => {
  let brv = 0;
  let bnn = 0;
  let nodes = [];

  for (let i = cpCount - 2; i > 0; i--) {
    nodes[i] = []
    for (let cur = 0; cur < wpCount; cur++) { // cur
      nodes[i][cur] = []
      for (let prev = 0; prev < wpCount; prev++) { // prev
        for (let next = 0; next < wpCount; next++) { // next
          let trv;
          if (nodes[i][next]) {
            trv = segmentWeight(matrix[i - 1][prev], matrix[i][cur], matrix[i + 1][next]) + nodes[i][next].routeValue;
          } else {
            trv = segmentWeight(matrix[i - 1][prev], matrix[i][cur], matrix[i + 1][next]);
          }

          if (trv > brv) {
            brv = trv;
            bnn = next;
          }
        }
        console.log({ cur, prev, brv, bnn });
        ///console.log({ i: nodes[cur] });
        nodes[i][cur].push({ routeValue: brv, nextNode: bnn });
        //console.log({ XXX: nodes });
        
      }
    }
  }
  console.log({ nodes });
  
}

const segmentWeight = (vPrev, vCur, vNext) => {
  const alpha = 0.1;
  const beta = 10;
  // const theta = v2.angleTo(binormal);
  // return alpha * v1.distanceTo(v2) + beta * Math.sin(theta);

  // Beta * Cos( P ) – Alpha * ( A + B );
  const v1 = vCur.clone().sub(vPrev.clone());
  const v2 = vNext.clone().sub(vCur.clone());
  
  const theta = v1.angleTo(v2);
  // debugger;
  // console.log(beta * Math.cos(theta));
  // console.log('1::', pMinus1, p, pPlus1)
  //console.log('2::', (theta / (2 * Math.PI)) * 360);
  //return beta * Math.cos(theta);


  return beta * Math.cos(theta);// - alpha * (v1.length() + v2.length());
};