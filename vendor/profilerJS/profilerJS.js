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

  function multMatrixNumber(a, A)  // a - число, A - матрица (двумерный массив)
  {
      var m = A.length, n = A[0].length, B = [];
      for (var i = 0; i < m; i++)
       { B[i] = [];
         for (var j = 0; j < n; j++) B[i][j] = a*A[i][j];
       }
      return B;
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
    let matrixPow2 = MultiplyMatrix(matrixForProfilerTest, matrixForProfilerTest);
    let matrixPow3 = MultiplyMatrix(matrixPow2, matrixForProfilerTest);
    multMatrixNumber(2, matrixPow3);
    let endTime = performance.now();
    let resultTime = endTime - beginTime;
    currentComputerFlops = resultTime;
    return resultTime;
  };

})();
