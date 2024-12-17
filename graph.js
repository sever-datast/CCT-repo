let sgpaChart = null;

function updateSGPAChart(isOverall = false) {
  const ctx = document.getElementById('gradePointsChart').getContext('2d');

  if (sgpaChart) {
    sgpaChart.destroy();
  }

  let semesterSGPAs;
  let labels;

  if (isOverall) {
    semesterSGPAs = extractSGPAFromAllSemesters();
    labels = csvUrls.map((_, index) => `Sem${index + 1}`);
  } else {
    const studentNumber = document.getElementById('searchInput').value.trim();
    semesterSGPAs = csvUrls.map((_, index) => {
      const matchingRow = allCsvData[index].slice(1).find(row => row[0].trim() === studentNumber);

      if (matchingRow) {
        const sgpaIndex = allCsvData[index][0].findIndex(header => header.trim().toUpperCase() === 'SGPA');
        if (sgpaIndex !== -1) {
          const sgpa = parseFloat(matchingRow[sgpaIndex].trim());
          return !isNaN(sgpa) ? sgpa : 0;
        }
      }
      return 0;
    });
    labels = [`Sem1`, `Sem2`, `Sem3`, `Sem4`, `Sem5`, `Sem6`, `Sem7`, `Sem8`].slice(0, semesterSGPAs.length);
  }

  const totalSGPA = semesterSGPAs.reduce((sum, value) => sum + value, 0);
  const averageSGPA = totalSGPA / semesterSGPAs.length;

  sgpaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: semesterSGPAs,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: true,
        cubicInterpolationMode: 'monotone'
      }, {
        type: 'line',
        data: new Array(semesterSGPAs.length).fill(averageSGPA),
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 8
          }
        },
        y: {
          beginAtZero: true,
          min: 0,
          max: 4,
          stepSize: 0.5,
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              return `SGPA: ${tooltipItem.raw.toFixed(2)}`;
            }
          }
        },
        annotation: {
          annotations: {
            averageLine: {
              type: 'line',
              yMin: averageSGPA,
              yMax: averageSGPA,
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                enabled: true,
                content: `Average: ${averageSGPA.toFixed(2)}`,
                position: 'top'
              }
            }
          }
        }
      }
    }
  });

  document.getElementById('gradePointsChart').style.display = 'block';
}

function extractSGPAFromAllSemesters() {
  const sgpas = [];

  allCsvData.forEach(csvData => {
    csvData.slice(1).forEach(row => {
      const sgpaIndex = csvData[0].findIndex(header => header.trim().toUpperCase() === 'SGPA');
      if (sgpaIndex !== -1) {
        const sgpa = parseFloat(row[sgpaIndex].trim());
        if (!isNaN(sgpa)) {
          sgpas.push(sgpa);
        }
      }
    });
  });

  return sgpas;
}