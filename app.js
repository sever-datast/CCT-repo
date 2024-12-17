const csvUrls = [
  'https://raw.githubusercontent.com/sever-datast/CCT-repo/refs/heads/main/semester1_results.csv',
  'https://raw.githubusercontent.com/sever-datast/CCT-repo/refs/heads/main/semester2_results.csv',
  'https://raw.githubusercontent.com/sever-datast/CCT-repo/refs/heads/main/semester3_results.csv',
  'https://raw.githubusercontent.com/sever-datast/CCT-repo/refs/heads/main/semester4_results.csv',
  'https://raw.githubusercontent.com/sever-datast/CCT-repo/refs/heads/main/semester5_results.csv'
];

let currentSemesterIndex = 4;
let allCsvData = [];
let searchPerformed = false;
const gradeTypes = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

async function fetchAndParseCSVs() {
  try {
    for (const url of csvUrls) {
      const response = await fetch(url);
      const data = await response.text();
      const parsedData = parseCSV(data);
      allCsvData.push(parsedData);
    }
    displayCurrentSemester();
  } catch (error) {
    console.error('Error fetching CSV files:', error);
  }
}

function parseCSV(csvText) {
  return csvText.trim().split('\n').map(row => row.split(','));
}

function countGradesForStudent(studentNumber) {
  const counts = {};

  allCsvData.forEach(csvData => {
    const matchingRow = csvData.slice(1).find(row => row[0].trim() === studentNumber);

    if (matchingRow) {
      matchingRow.slice(1).forEach(cell => {
        const grade = cell.trim();
        if (gradeTypes.includes(grade)) {
          counts[grade] = (counts[grade] || 0) + 1;
        }
      });
    }
  });

  const sortedCounts = {};
  gradeTypes.forEach(grade => {
    if (counts[grade] !== undefined) {
      sortedCounts[grade] = counts[grade];
    }
  });

  return sortedCounts;
}

function countOverallGrades(studentNumber) {
  const overallCounts = {};

  allCsvData.forEach(csvData => {
    const matchingRow = csvData.slice(1).find(row => row[0].trim() === studentNumber);

    if (matchingRow) {
      matchingRow.slice(1).forEach(cell => {
        const grade = cell.trim();
        if (gradeTypes.includes(grade)) {
          overallCounts[grade] = (overallCounts[grade] || 0) + 1;
        }
      });
    }
  });

  const sortedCounts = {};
  gradeTypes.forEach(grade => {
    if (overallCounts[grade] !== undefined) {
      sortedCounts[grade] = overallCounts[grade];
    }
  });

  return sortedCounts;
}

function displayOverallResults() {
  const gradeCountsContainer = document.getElementById('gradeCounts');
  gradeCountsContainer.innerHTML = ''; 

  const tableTitleElements = document.getElementsByClassName('table-title');
  Array.from(tableTitleElements).forEach(element => {
    element.style.display = 'none';
  });

  const heading = document.createElement('h3');
  heading.textContent = 'Total Grade Counts';
  gradeCountsContainer.appendChild(heading);

  const gradeCountsRow = document.createElement('div');
  gradeCountsRow.style.display = 'flex'; 
  gradeCountsRow.style.flexWrap = 'wrap'; 
  gradeCountsRow.style.gap = '3px'; 

  const studentNumber = document.getElementById('searchInput').value.trim();
  const counts = countOverallGrades(studentNumber); 

  Object.keys(counts).forEach(grade => {
    const countParagraph = document.createElement('p');
    countParagraph.innerHTML = `${grade}: ${counts[grade]}`;
    countParagraph.style.margin = '0'; 
    countParagraph.style.padding = '5px'; 
    gradeCountsRow.appendChild(countParagraph);
  });

  gradeCountsContainer.appendChild(gradeCountsRow);

  updateSGPAChart(); 
}

function displayCurrentSemester() {
  const tableTitle = document.querySelector('.table-title');
  const resultTables = document.getElementById('resultTables');
  const graphContainer = document.getElementById('graph'); 

  resultTables.innerHTML = '';
  if (graphContainer) {
    graphContainer.style.display = 'none'; 
  }

  if (document.getElementById('overall').classList.contains('active')) {

    tableTitle.style.display = 'none';
    document.getElementById('resultTables').style.display = 'none';
    document.getElementById('gradeCounts').style.display = 'block';
    return;
  }

  const studentNumber = document.getElementById('searchInput').value.trim();
  const csvData = allCsvData[currentSemesterIndex];

  if (csvData) {
    let found = false;
    const matchingRow = csvData.slice(1).find(row => row[0].trim() === studentNumber);

    if (matchingRow) {
      found = true;
      const table = document.createElement('table');
      const tableBody = document.createElement('tbody');

      const headerRow = csvData[0].slice(1);
      const dataRow = matchingRow.slice(1);

      headerRow.forEach((subject, i) => {
        const tr = document.createElement('tr');

        const tdSubject = document.createElement('td');
        tdSubject.textContent = subject.trim();

        const tdGrade = document.createElement('td');
        tdGrade.textContent = dataRow[i].trim();

        if (subject.trim().toUpperCase() === 'SGPA') {
          const sgpaValue = parseFloat(tdGrade.textContent);

          if (sgpaValue >= 3.0) {
            tdGrade.style.color = 'green';
          } else {
            tdGrade.style.color = 'red';
          }

          if (isNaN(sgpaValue) || tdGrade.textContent.trim() === '-') {
            tdGrade.style.color = 'red';
          }
        }

        tr.appendChild(tdSubject);
        tr.appendChild(tdGrade);

        tableBody.appendChild(tr);
      });

      table.appendChild(tableBody);
      resultTables.appendChild(table);

      tableTitle.textContent = `Sem ${currentSemesterIndex + 1}`;
      tableTitle.style.display = 'block';
      document.getElementById('resultTables').style.display = 'block';
      document.getElementById('gradeCounts').style.display = 'none';

    } else if (searchPerformed) {
      const noResultsMessage = document.createElement('p');
      noResultsMessage.innerHTML = 'No results found.';
      resultTables.appendChild(noResultsMessage);

      tableTitle.style.display = 'none';
    } else {
      tableTitle.style.display = 'none';
    }
  } else {
    tableTitle.style.display = 'none';
  }

  document.getElementById('previousButton').disabled = currentSemesterIndex === 0;
  document.getElementById('nextButton').disabled = currentSemesterIndex === csvUrls.length - 1;
}

document.getElementById('searchButton').addEventListener('click', () => {
  searchPerformed = true;
  const studentNumber = document.getElementById('searchInput').value.trim();
  if (studentNumber) {
    displayCurrentSemester();
    document.getElementById('gradePointsChart').style.display='none';
    document.getElementById('gradeCounts').style.display='none';
  } else {
    document.getElementById('resultTables').innerHTML = '';
    document.querySelector('.table-title').style.display = 'none';
  }
});

document.getElementById('overall').addEventListener('click', () => {
  searchPerformed = true;
  document.getElementById('resultTables').style.display = 'none';
  displayOverallResults(); 
  document.getElementById('gradeCounts').style.display = 'block';
});

document.getElementById('previousButton').addEventListener('click', () => {
  if (currentSemesterIndex > 0) {
    currentSemesterIndex--;
    displayCurrentSemester();
    document.getElementById('gradePointsChart').style.display='none';
    document.getElementById('gradeCounts').style.display='none';
  }
});

document.getElementById('nextButton').addEventListener('click', () => {
  if (currentSemesterIndex < csvUrls.length - 1) {
    currentSemesterIndex++;
    displayCurrentSemester();
    document.getElementById('gradePointsChart').style.display='none';
    document.getElementById('gradeCounts').style.display='none';
  }
});

fetchAndParseCSVs();
