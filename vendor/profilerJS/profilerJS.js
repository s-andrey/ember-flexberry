(function() {
  var profilerFunctions,
      currentComputerFlops,
      platformIndependentProfilingMetod,
      startTime,
      finishTime;

  profilerFunctions = {};

  window.profilerJS = profilerFunctions;

  function MultiplyMatrix(A, B)
  {
    var rowsA = A.length, colsA = A[0].length,
        rowsB = B.length, colsB = B[0].length,
        C = [];
    for (var i = 0; i < rowsA; i++) C[i] = [];
    for (var k = 0; k < colsB; k++)
     { for (var i = 0; i < rowsA; i++)
        { var t = 0;
          for (var j = 0; j < rowsB; j++) t += A[i][j]*B[j][k];
          C[i][k] = t;
        }
     }
    return C;
  }

  // Main functions
  // --------------

  profilerFunctions.start = function () {
    startTime = performance.now();
  };

  profilerFunctions.stop = function () {
    finishTime = performance.now();
  };

  profilerFunctions.result = function () {
    return finishTime - startTime;
  };

  profilerFunctions.currentComputerFlops = function () {
    let beginTime = performance.now();
    let matrixPow2 = MultiplyMatrix(matrixForProfilerTest1024, matrixForProfilerTest1024);
    let endTime = performance.now();
    let resultTime = (endTime - beginTime) / 1000;
    let m = 1024;
    let result = 2 * m * m * m / resultTime;
    currentComputerFlops = result;
    return result;
  };

})();
